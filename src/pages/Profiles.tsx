
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  const [profiles, setProfiles] = useState(sampleProfiles);

  // Filter profiles based on search query (simple implementation for now)
  const filteredProfiles = searchQuery
    ? profiles.filter((profile) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          profile.name.toLowerCase().includes(searchLower) ||
          profile.skills.some((skill) => skill.toLowerCase().includes(searchLower)) ||
          (profile.topEducation?.institution.toLowerCase().includes(searchLower)) ||
          (profile.topExperience?.company.toLowerCase().includes(searchLower)) ||
          (profile.topExperience?.position.toLowerCase().includes(searchLower))
        );
      })
    : profiles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch data from an API with the search query
    console.log("Searching for:", searchQuery);
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
            </form>
            <p className="text-sm text-gray-500 mt-2">
              Try searching for a skill like "JavaScript" or "UX Design"
            </p>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} {...profile} />
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No profiles found matching your search criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profiles;
