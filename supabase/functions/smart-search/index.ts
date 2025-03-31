
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

    // Format profiles data for Gemini prompt
    const profilesContext = profiles.map(profile => 
      `ID: ${profile.id}, Name: ${profile.full_name || "Unknown"}, Username: ${profile.username || "Unknown"}, Headline: ${profile.headline || "Unknown"}`
    ).join("\n");

    // Construct the prompt for Gemini
    const prompt = `
You are a helpful assistant that finds relevant profiles based on search queries.
Here is the database of profiles:
${profilesContext}

The user is searching for: "${query}"

Based on the search query and the available profiles, return a JSON array of profile IDs that match the search criteria.
Only include profile IDs that are relevant to the search query. 
Your response should be in this format: ["profile_id_1", "profile_id_2"]
`;

    console.log("Calling Gemini API...");

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

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received");

    // Extract the response text from Gemini
    let responseText = "";
    try {
      responseText = geminiData.candidates[0].content.parts[0].text;
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
      } else {
        // Fallback: try to extract IDs individually
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
        // If no profiles matched, return an empty array
        return new Response(
          JSON.stringify({ 
            profiles: [],
            query, 
            reasoning: responseText 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    } catch (error) {
      console.error("Error processing Gemini response:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to process AI response",
          details: error.message 
        }),
        { 
          status: 500, 
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
