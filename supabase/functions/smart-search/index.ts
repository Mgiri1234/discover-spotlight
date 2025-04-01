import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  const url = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const geminiKey = Deno.env.get("GEMINI_API_KEY")

  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase URL or service key" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }

  try {
    const supabase = createClient(url, serviceKey);

    // Parse the request body
    const { query } = await req.json();
    console.log("Received search query:", query);

    // Fetch all profiles to work with
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          profiles: [],
          reasoning: "No profiles found in the database." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Enhanced keyword-based search function as a fallback
    const keywordSearch = (query: string) => {
      const searchTerms = query.toLowerCase().split(/\s+/);
      
      const matchedProfiles = profiles.filter(profile => {
        const headline = profile.headline?.toLowerCase() || "";
        const fullName = profile.full_name?.toLowerCase() || "";
        const username = profile.username?.toLowerCase() || "";
        
        // Extract skills from the headline
        const skills = extractSkillsFromHeadline(profile.headline);
        const skillsText = skills.join(" ").toLowerCase();
        
        // Check if any search term is found in any of the fields
        return searchTerms.some(term => 
          headline.includes(term) || 
          fullName.includes(term) || 
          username.includes(term) ||
          skillsText.includes(term)
        );
      });
      
      return {
        profiles: matchedProfiles,
        reasoning: `Matched ${matchedProfiles.length} profiles using keyword search for "${query}".`
      };
    };

    // Helper function to extract skills from headline
    function extractSkillsFromHeadline(headline?: string): string[] {
      if (!headline) return [];
      
      // Look for common tech keywords
      const techKeywords = [
        'JavaScript', 'React', 'TypeScript', 'Angular', 'Vue', 'Node', 'Python', 
        'Java', 'Spring', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 
        'Kotlin', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'DevOps', 'Docker', 
        'Kubernetes', 'AWS', 'Azure', 'GCP', 'HTML', 'CSS', 'Sass', 'LESS',
        'Next.js', 'Frontend', 'Backend', 'Full Stack', 'Developer', 'Engineer',
        'UI/UX', 'Design', 'Product', 'Manager', 'Agile', 'Scrum'
      ];
      
      // If headline has pipe characters, extract skills that way
      if (headline.includes('|')) {
        const parts = headline.split('|');
        if (parts.length > 1) {
          return parts.slice(1)
            .flatMap(section => section.split(','))
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        }
      }
      
      // Otherwise, look for tech keywords in the headline
      return techKeywords.filter(keyword => 
        headline.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Try to use Gemini AI if the API key exists
    if (geminiKey) {
      try {
        console.log("Calling Gemini API...");
        
        // Prepare profiles for the AI prompt
        const profilesData = profiles.map(p => ({
          id: p.id,
          name: p.full_name || p.username || "Unknown",
          headline: p.headline || "",
          skills: extractSkillsFromHeadline(p.headline)
        }));
        
        // Call Gemini API
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a smart search assistant for a professional networking platform.
                Given the following user search query: "${query}"
                
                And these profiles:
                ${JSON.stringify(profilesData)}
                
                Return ONLY the profile IDs that match the search query based on skills, experience, headline, or other relevant factors.
                The response should be in valid JSON format like this:
                {
                  "profileIds": ["id1", "id2", ...],
                  "reasoning": "brief explanation of why these profiles match"
                }
                
                Make sure to consider technical skills, job roles, and experience levels in your matching. Be thorough in finding relevant matches.`
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 1000
            }
          })
        });
        
        const geminiData = await response.json();
        console.log("Gemini API response received");
        
        if (!response.ok) {
          console.error("Gemini API error:", JSON.stringify(geminiData));
          throw new Error(`Gemini API returned status ${response.status}`);
        }
        
        try {
          // Extract the AI response text
          const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!aiResponseText) {
            throw new Error("No text in Gemini response");
          }
          
          // Find the JSON part in the response
          const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON found in Gemini response");
          }
          
          const aiResponse = JSON.parse(jsonMatch[0]);
          console.log("AI response parsed:", aiResponse);
          
          if (!aiResponse.profileIds || !Array.isArray(aiResponse.profileIds)) {
            throw new Error("Invalid AI response format, missing profileIds array");
          }
          
          // Filter profiles based on the IDs returned by AI
          const matchedProfiles = profiles.filter(p => 
            aiResponse.profileIds.includes(p.id)
          );
          
          return new Response(
            JSON.stringify({
              profiles: matchedProfiles,
              reasoning: aiResponse.reasoning || "AI-powered search results"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (parseError) {
          console.error("Error processing Gemini response:", parseError);
          console.log("Falling back to enhanced keyword-based search");
          return new Response(
            JSON.stringify(keywordSearch(query)),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (aiError) {
        console.error("Gemini API error:", aiError);
        console.log("Falling back to enhanced keyword-based search");
        return new Response(
          JSON.stringify(keywordSearch(query)),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log("No Gemini API key found, using keyword search");
      return new Response(
        JSON.stringify(keywordSearch(query)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
})
