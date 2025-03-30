
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, GraduationCap, Link as LinkIcon, Phone, Mail, Linkedin } from "lucide-react";

// Sample profile data (in a real app, this would come from an API)
const sampleProfiles = [
  {
    id: "1",
    name: "Alex Johnson",
    phone: "+1 (555) 123-4567",
    email: "alex.johnson@example.com",
    linkedin: "https://linkedin.com/in/alexjohnson",
    education: [
      { institution: "Stanford University", degree: "B.S. Computer Science", year: "2015-2019" },
      { institution: "San Francisco State University", degree: "Associate's in Web Development", year: "2013-2015" }
    ],
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "Express", "Git", "REST APIs", "GraphQL"],
    workExperience: [
      { 
        company: "Google", 
        position: "Frontend Developer", 
        duration: "2019 - Present",
        description: "Developing and maintaining web applications using React.js and TypeScript. Collaborating with cross-functional teams to implement new features and improve user experience."
      },
      { 
        company: "Dropbox", 
        position: "Software Engineering Intern", 
        duration: "Summer 2018",
        description: "Worked on the web platform team to improve performance and accessibility of the main Dropbox web application."
      }
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform using React, Node.js, Express, and MongoDB. Implemented features like user authentication, product catalog, shopping cart, and payment integration.",
        link: "https://github.com/alexjohnson/ecommerce-platform"
      },
      {
        name: "Weather App",
        description: "Created a weather application that displays current weather and forecasts based on user location or search. Used React and the OpenWeatherMap API.",
        link: "https://github.com/alexjohnson/weather-app"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    phone: "+1 (555) 987-6543",
    email: "sarah.chen@example.com",
    linkedin: "https://linkedin.com/in/sarahchen",
    education: [
      { institution: "MIT", degree: "M.S. Artificial Intelligence", year: "2018-2020" },
      { institution: "University of Washington", degree: "B.S. Computer Science", year: "2014-2018" }
    ],
    skills: ["Python", "Data Science", "Machine Learning", "SQL", "TensorFlow", "PyTorch", "Data Visualization", "Statistics", "R"],
    workExperience: [
      { 
        company: "Amazon", 
        position: "Data Scientist", 
        duration: "2020 - Present",
        description: "Developing machine learning models to improve product recommendations. Analyzing large datasets to derive insights and inform business decisions."
      },
      { 
        company: "IBM", 
        position: "Machine Learning Intern", 
        duration: "Summer 2019",
        description: "Researched and implemented natural language processing techniques to improve sentiment analysis models."
      }
    ],
    projects: [
      {
        name: "Customer Churn Prediction",
        description: "Built a machine learning model to predict customer churn for a telecom company. Achieved 87% accuracy using ensemble methods.",
        link: "https://github.com/sarahchen/churn-prediction"
      },
      {
        name: "Image Classification System",
        description: "Developed a convolutional neural network for classifying medical images. Implemented using PyTorch and achieved state-of-the-art results on public datasets.",
        link: "https://github.com/sarahchen/medical-image-classifier"
      }
    ]
  },
  // Add the rest of the sample profiles here...
];

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProfile = () => {
      setLoading(true);
      setTimeout(() => {
        const foundProfile = sampleProfiles.find(p => p.id === id);
        setProfile(foundProfile || null);
        setLoading(false);
      }, 500); // Simulate network delay
    };

    fetchProfile();
  }, [id]);

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
            <p className="text-gray-600 mb-8">The profile you are looking for does not exist.</p>
            <Button asChild>
              <a href="/profiles">Browse All Profiles</a>
            </Button>
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
                {profile.workExperience[0] && (
                  <p className="text-gray-600 mt-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {profile.workExperience[0].position} at {profile.workExperience[0].company}
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
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
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
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
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-brand-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium">{edu.institution}</h3>
                          <p className="text-sm text-gray-600">{edu.degree}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
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
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.workExperience.map((exp: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-brand-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium">{exp.position}</h3>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                          <p className="mt-2 text-gray-700">{exp.description}</p>
                        </div>
                      </div>
                      {index < profile.workExperience.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
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
                          <p className="mt-2 text-gray-700">{project.description}</p>
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
