
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { supabase, extractSkillsFromHeadline } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Profile type definition
interface Profile {
  id: string;
  name?: string;
  full_name?: string;
  username?: string;
  headline?: string;
  avatar_url?: string;
  skills?: string[];
  topEducation?: { institution: string; degree: string };
  topExperience?: { company: string; position: string };
  linkedin?: string;
}

// Sample data for demonstration
const sampleProfiles = [
  {
    id: "1",
    name: "Alex Johnson",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "Express"],
    topEducation: { institution: "Stanford University", degree: "B.S. Computer Science" },
    topExperience: { company: "Google", position: "Frontend Developer" },
    linkedin: "https://linkedin.com/in/alexjohnson",
  },
  {
    id: "2",
    name: "Sarah Chen",
    skills: ["Python", "Data Science", "Machine Learning", "SQL", "TensorFlow"],
    topEducation: { institution: "MIT", degree: "M.S. Artificial Intelligence" },
    topExperience: { company: "Amazon", position: "Data Scientist" },
    linkedin: "https://linkedin.com/in/sarahchen",
  },
  {
    id: "3",
    name: "Michael Rodriguez",
    skills: ["Java", "Spring Boot", "Microservices", "AWS", "Docker", "Kubernetes"],
    topEducation: { institution: "UC Berkeley", degree: "B.S. Computer Engineering" },
    topExperience: { company: "Microsoft", position: "Software Engineer" },
    linkedin: "https://linkedin.com/in/michaelrodriguez",
  },
  {
    id: "4",
    name: "Emily Taylor",
    skills: ["UX/UI Design", "Figma", "Adobe XD", "HTML/CSS", "User Research"],
    topEducation: { institution: "Rhode Island School of Design", degree: "BFA Graphic Design" },
    topExperience: { company: "Apple", position: "UX Designer" },
    linkedin: "https://linkedin.com/in/emilytaylor",
  },
  {
    id: "5",
    name: "David Kim",
    skills: ["iOS Development", "Swift", "SwiftUI", "Objective-C", "Firebase"],
    topEducation: { institution: "UCLA", degree: "B.S. Computer Science" },
    topExperience: { company: "Uber", position: "iOS Developer" },
    linkedin: "https://linkedin.com/in/davidkim",
  },
  {
    id: "6",
    name: "Jessica Martinez",
    skills: ["Product Management", "Agile", "Scrum", "User Stories", "Roadmapping"],
    topEducation: { institution: "Columbia University", degree: "MBA" },
    topExperience: { company: "Netflix", position: "Senior Product Manager" },
    linkedin: "https://linkedin.com/in/jessicamartinez",
  },
];

const Profiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Profile[]>([]);
  const [aiReasoning, setAiReasoning] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>(sampleProfiles);
  const [useRealData, setUseRealData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch profiles from Supabase on load
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from("profiles").select("*");
        
        if (error) {
          console.error("Error fetching profiles:", error);
          toast({
            title: "Error",
            description: "Failed to fetch profiles. Using sample data instead.",
            variant: "destructive",
          });
        } else if (data && data.length > 0) {
          // Transform Supabase profiles to match our format
          const transformedProfiles = data.map(profile => {
            // Extract skills from headline using the helper function
            const extractedSkills = extractSkillsFromHeadline(profile.headline);
            
            return {
              id: profile.id,
              name: profile.full_name || profile.username || "Unknown User", // Ensure name is always set
              full_name: profile.full_name,
              username: profile.username,
              headline: profile.headline,
              avatar_url: profile.avatar_url,
              // Use extracted skills or provide fallbacks
              skills: extractedSkills.length > 0 ? extractedSkills : ["Profile Management", "Networking", "Professional Development"],
              topEducation: { institution: "Add your education", degree: "Your degree" },
              topExperience: { company: "Add your experience", position: "Your position" },
              linkedin: "Add your LinkedIn",
            };
          });
          
          setProfiles(transformedProfiles);
          setUseRealData(true);
        }
      } catch (err) {
        console.error("Error in profile fetch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  // Filter profiles based on search query (simple implementation)
  const filteredProfiles = searchQuery && !isSearching
    ? profiles.filter((profile) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (profile.name?.toLowerCase().includes(searchLower)) ||
          (profile.full_name?.toLowerCase().includes(searchLower)) ||
          (profile.username?.toLowerCase().includes(searchLower)) ||
          (profile.headline?.toLowerCase().includes(searchLower)) ||
          (profile.skills?.some((skill) => skill.toLowerCase().includes(searchLower))) ||
          (profile.topEducation?.institution.toLowerCase().includes(searchLower)) ||
          (profile.topExperience?.company.toLowerCase().includes(searchLower)) ||
          (profile.topExperience?.position.toLowerCase().includes(searchLower))
        );
      })
    : profiles;

  // Display AI search results if available
  const displayProfiles = aiSearchResults.length > 0 ? aiSearchResults : filteredProfiles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset AI search results when doing a regular search
    setAiSearchResults([]);
    setAiReasoning("");
    console.log("Searching for:", searchQuery);
  };

  const handleAiSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setAiSearchResults([]);
      
      toast({
        title: "AI Search",
        description: "Searching for " + query + " using AI...",
      });

      const response = await supabase.functions.invoke("smart-search", {
        body: { query },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log("AI search response:", response.data);
      
      if (response.data.profiles && Array.isArray(response.data.profiles)) {
        // Transform returned profiles to match our format
        const transformedResults = response.data.profiles.map((profile: any) => {
          return {
            id: profile.id,
            name: profile.full_name || profile.username || "Unknown User", // Ensure name is always set
            full_name: profile.full_name,
            username: profile.username,
            headline: profile.headline,
            avatar_url: profile.avatar_url,
            // Generate sample skills until we have real data
            skills: ["Profile Management", "Networking", "Professional Development"],
            topEducation: { institution: "Add your education", degree: "Your degree" },
            topExperience: { company: "Add your experience", position: "Your position" },
            linkedin: "Add your LinkedIn",
          };
        });
        
        setAiSearchResults(transformedResults);
        setAiReasoning(response.data.reasoning || "");
        
        toast({
          title: "AI Search Complete",
          description: `Found ${transformedResults.length} profiles for "${query}"`,
        });
      } else {
        setAiSearchResults([]);
        toast({
          title: "No Results",
          description: `No profiles found for "${query}"`,
        });
      }

      // Close the AI search dialog
      setIsAiSearchOpen(false);
    } catch (error) {
      console.error("AI search error:", error);
      toast({
        title: "AI Search Failed",
        description: error.message || "An error occurred during AI search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Discover Talent</h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Browse through profiles of talented professionals or use our search to find specific skills and expertise.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by name, skills, or experience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setIsAiSearchOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> AI Search
                </Button>
              </form>
              
              {/* AI reasoning display */}
              {aiReasoning && (
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">AI Search Results</span>
                  </div>
                  <p className="text-xs text-gray-600">Showing profiles based on AI-powered search. Found {aiSearchResults.length} profiles.</p>
                  <Badge 
                    variant="outline" 
                    className="mt-2 cursor-pointer"
                    onClick={() => {
                      setAiSearchResults([]);
                      setAiReasoning("");
                    }}
                  >
                    Clear AI Results
                  </Badge>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Try searching for a skill like "JavaScript" or "UX Design", or use AI Search for more advanced queries like "backend developers with cloud experience"
              </p>
            </div>
          </div>

          {/* Profiles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex flex-wrap gap-1 mt-4">
                      {[1, 2, 3].map((_, j) => (
                        <Skeleton key={j} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProfiles.map((profile) => {
                // Ensure name is always defined, using fallbacks if needed
                const profileWithRequiredProps = {
                  ...profile,
                  name: profile.name || profile.full_name || profile.username || "Unknown User"
                };
                return <ProfileCard key={profile.id} {...profileWithRequiredProps} />;
              })}
            </div>
          )}

          {/* No Results Message */}
          {displayProfiles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No profiles found matching your search criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* AI Search Command Dialog */}
      <CommandDialog open={isAiSearchOpen} onOpenChange={setIsAiSearchOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Describe what you're looking for... (e.g., 'UX designers with e-commerce experience')" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget as HTMLInputElement;
                handleAiSearch(input.value);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>Type your search and press Enter</CommandEmpty>
            <CommandGroup heading="Examples">
              <CommandItem 
                onSelect={() => handleAiSearch("Frontend developers with React experience")}
                className="cursor-pointer"
              >
                Frontend developers with React experience
              </CommandItem>
              <CommandItem 
                onSelect={() => handleAiSearch("UX designers who worked at tech companies")}
                className="cursor-pointer"
              >
                UX designers who worked at tech companies
              </CommandItem>
              <CommandItem 
                onSelect={() => handleAiSearch("Product managers with leadership experience")}
                className="cursor-pointer"
              >
                Product managers with leadership experience
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};

export default Profiles;
