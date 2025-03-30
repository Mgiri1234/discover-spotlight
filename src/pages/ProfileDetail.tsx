
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, GraduationCap, Link as LinkIcon, Phone, Mail, Linkedin, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      
      try {
        // Fetch the basic profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (!profileData) {
          console.log("No profile found for ID:", id);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // For now, create a basic profile structure with the data we have
        // This will be expanded when we implement the full profile data model
        const userProfile = {
          id: profileData.id,
          name: profileData.full_name || "No Name",
          email: user?.email || "",
          phone: "",
          linkedin: "",
          avatar_url: profileData.avatar_url,
          headline: profileData.headline || (profileData.username ? `@${profileData.username}` : ""),
          skills: [],
          education: [],
          workExperience: [],
          projects: []
        };
        
        // Temporary placeholders for demo purposes - will be replaced with real data later
        if (userProfile.skills.length === 0) {
          userProfile.skills = ["Add your skills"];
        }
        
        if (userProfile.education.length === 0) {
          userProfile.education = [{
            institution: "Add your education",
            degree: "",
            year: ""
          }];
        }
        
        if (userProfile.workExperience.length === 0) {
          userProfile.workExperience = [{
            company: "Add your work experience",
            position: "",
            duration: "",
            description: ""
          }];
        }
        
        if (userProfile.projects.length === 0) {
          userProfile.projects = [{
            name: "Add your projects",
            description: "",
            link: ""
          }];
        }

        setProfile(userProfile);
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading the profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, user, toast]);

  const handleEditProfile = () => {
    navigate("/create-profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="animate-pulse text-brand-600">Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-8">
              {isOwnProfile 
                ? "You haven't created your profile yet." 
                : "The profile you are looking for does not exist."}
            </p>
            {isOwnProfile && (
              <Button onClick={handleEditProfile} className="bg-brand-600 hover:bg-brand-700">
                Create Your Profile
              </Button>
            )}
            {!isOwnProfile && (
              <Button asChild>
                <a href="/profiles">Browse All Profiles</a>
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                {profile.headline && (
                  <p className="text-gray-600 mt-2">{profile.headline}</p>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                {isOwnProfile && (
                  <Button onClick={handleEditProfile} className="bg-brand-600 hover:bg-brand-700">
                    Edit Profile
                  </Button>
                )}
                {profile.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${profile.phone}`} className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {profile.phone}
                    </a>
                  </Button>
                )}
                {profile.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${profile.email}`} className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {profile.linkedin && (
                  <Button className="bg-[#0A66C2] hover:bg-[#084482]" asChild>
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Skills and Education */}
            <div className="space-y-8">
              {/* Skills */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Skills</CardTitle>
                  {isOwnProfile && (
                    <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <Badge key={index} className="bg-brand-50 text-brand-700 hover:bg-brand-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  {isOwnProfile && (
                    <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-brand-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium">{edu.institution}</h3>
                          {edu.degree && <p className="text-sm text-gray-600">{edu.degree}</p>}
                          {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                        </div>
                      </div>
                      {index < profile.education.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Middle and Right Columns - Experience and Projects */}
            <div className="md:col-span-2 space-y-8">
              {/* Work Experience */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Work Experience</CardTitle>
                  {isOwnProfile && (
                    <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.workExperience.map((exp: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-brand-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium">{exp.company}</h3>
                          {exp.position && <p className="text-sm text-gray-600">{exp.position}</p>}
                          {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
                          {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
                        </div>
                      </div>
                      {index < profile.workExperience.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  {isOwnProfile && (
                    <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.projects.map((project: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start">
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{project.name}</h3>
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-brand-600 hover:text-brand-700"
                              >
                                <LinkIcon className="h-4 w-4 mr-1" />
                                View Project
                              </a>
                            )}
                          </div>
                          {project.description && <p className="mt-2 text-gray-700">{project.description}</p>}
                        </div>
                      </div>
                      {index < profile.projects.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileDetail;
