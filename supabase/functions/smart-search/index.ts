import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Parse the request body
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Received search query:", query);

    // First, get all profiles to provide context to Gemini
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in database");
      return new Response(
        JSON.stringify({ 
          profiles: [],
          query,
          reasoning: "No profiles found in database" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Format profiles data for Gemini prompt
    const profilesContext = profiles.map(profile => {
      // Extract skills from headline 
      const skills = extractSkillsFromHeadline(profile.headline);
      
      return `ID: ${profile.id}, Name: ${profile.full_name || "Unknown"}, Username: ${profile.username || "Unknown"}, Headline: ${profile.headline || "Unknown"}, Skills: ${skills.join(", ")}`;
    }).join("\n");

    // Construct the prompt for Gemini
    const prompt = `
You are a helpful assistant that finds relevant profiles based on search queries.
Here is the database of profiles:
${profilesContext}

The user is searching for: "${query}"

Based on the search query and the available profiles, return a JSON array of profile IDs that match the search criteria.
Only include profile IDs that are relevant to the search query. 
Pay special attention to skills mentioned in the query and match them against the skills listed for each profile.
Your response should be in this format: ["profile_id_1", "profile_id_2"]
`;

    console.log("Calling Gemini API...");

    try {
      // Call the Gemini API
      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + geminiApiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        console.error("Gemini API error:", errorData);
        
        // Fallback to enhanced keyword-based matching
        console.log("Falling back to enhanced keyword-based search");
        const matchedProfiles = findProfilesByKeywords(profiles, query);
        
        return new Response(
          JSON.stringify({ 
            profiles: matchedProfiles,
            query,
            reasoning: `Gemini API returned an error. Falling back to keyword matching. Found ${matchedProfiles.length} matches.` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const geminiData = await geminiResponse.json();
      console.log("Gemini API response received");
      
      // Check if we have a valid response from Gemini
      if (!geminiData || !geminiData.candidates || geminiData.candidates.length === 0) {
        console.error("Invalid Gemini API response structure:", JSON.stringify(geminiData));
        
        // Fallback to enhanced keyword-based matching
        console.log("Falling back to enhanced keyword-based search due to invalid response");
        const matchedProfiles = findProfilesByKeywords(profiles, query);
        
        return new Response(
          JSON.stringify({ 
            profiles: matchedProfiles,
            query,
            reasoning: `Received invalid response from Gemini API. Falling back to keyword matching. Found ${matchedProfiles.length} matches.` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Extract the response text from Gemini
      const candidate = geminiData.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error("Missing content in Gemini response:", JSON.stringify(geminiData));
        
        // Fallback to enhanced keyword-based matching
        console.log("Falling back to enhanced keyword-based search due to missing content");
        const matchedProfiles = findProfilesByKeywords(profiles, query);
        
        return new Response(
          JSON.stringify({ 
            profiles: matchedProfiles,
            query,
            reasoning: `Missing content in Gemini response. Falling back to keyword matching. Found ${matchedProfiles.length} matches.` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const responseText = candidate.content.parts[0].text;
      console.log("Gemini response text:", responseText);
        
      // Try to parse the JSON array from the response
      // It might be surrounded by backticks or other text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      let profileIds = [];
      
      if (jsonMatch) {
        try {
          profileIds = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing JSON from matched string:", e);
        }
      } 
      
      // Fallback: try to extract IDs individually if JSON parsing failed
      if (profileIds.length === 0) {
        const idMatches = responseText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g);
        profileIds = idMatches || [];
      }
      
      // If we found profile IDs, fetch the complete profiles
      if (profileIds.length > 0) {
        const { data: matchedProfiles, error: matchError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profileIds);
          
        if (matchError) {
          console.error("Error fetching matched profiles:", matchError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch matched profiles" }),
            { 
              status: 500, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            profiles: matchedProfiles,
            query,
            reasoning: responseText 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } else {
        // Fallback to enhanced keyword-based matching if no profiles matched
        console.log("No AI matches found, falling back to enhanced keyword-based search");
        const matchedProfiles = findProfilesByKeywords(profiles, query);
        
        return new Response(
          JSON.stringify({ 
            profiles: matchedProfiles,
            query,
            reasoning: `AI found no matches. Falling back to keyword matching. Found ${matchedProfiles.length} matches.` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError);
      
      // Fallback to enhanced keyword-based matching
      console.log("Falling back to enhanced keyword-based search due to API error");
      const matchedProfiles = findProfilesByKeywords(profiles, query);
      
      return new Response(
        JSON.stringify({ 
          profiles: matchedProfiles,
          query,
          reasoning: `Error calling Gemini API: ${geminiError.message}. Falling back to keyword matching. Found ${matchedProfiles.length} matches.` 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to extract skills from headline
function extractSkillsFromHeadline(headline?: string): string[] {
  if (!headline) return [];
  
  // Look for skills after a pipe character (common format in professional headlines)
  const pipeSplit = headline.split('|');
  
  if (pipeSplit.length > 1) {
    // If headline contains pipe characters, extract skills from after the first pipe
    return pipeSplit.slice(1)
      .flatMap(section => section.split(','))
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && !skill.includes('years') && !skill.includes('experience'));
  } else {
    // Otherwise, try to extract common tech keywords
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node', 'Python', 
      'Java', 'Spring', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 
      'Kotlin', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'DevOps', 'Docker', 
      'Kubernetes', 'AWS', 'Azure', 'GCP', 'HTML', 'CSS', 'Sass', 'LESS',
      'Next.js', 'Gatsby', 'GraphQL', 'REST', 'API', 'UI/UX', 'Design',
      'Testing', 'CI/CD', 'Git', 'Agile', 'Scrum', 'Frontend', 'Backend',
      'Full Stack', 'Mobile', 'iOS', 'Android', 'Xamarin', 'Flutter',
      'React Native', 'Unity', 'Unreal', 'Game', 'Blockchain', 'Solidity',
      'Ethereum', 'Web3', 'Machine Learning', 'AI', 'Data Science'
    ];
    
    const foundSkills = techKeywords.filter(keyword => 
      headline.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['Development'];
  }
}

// Enhanced keyword matching function that checks for skills in headlines and other profile data
function findProfilesByKeywords(profiles, query) {
  const searchTerms = query.toLowerCase().split(/\s+/);
  
  return profiles.filter(profile => {
    // Extract skills from the headline
    const skills = extractSkillsFromHeadline(profile.headline || "").map(skill => skill.toLowerCase());
    
    // Check if any search term matches with any skill
    const hasMatchingSkill = searchTerms.some(term => 
      skills.some(skill => skill.includes(term))
    );
    
    // Check if any search term matches with name, username, or headline
    const hasMatchingText = searchTerms.some(term => 
      (profile.full_name?.toLowerCase().includes(term)) ||
      (profile.username?.toLowerCase().includes(term)) ||
      (profile.headline?.toLowerCase().includes(term))
    );
    
    // Return true if either skills or text fields match
    return hasMatchingSkill || hasMatchingText;
  });
}
