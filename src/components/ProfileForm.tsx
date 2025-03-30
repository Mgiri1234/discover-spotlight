
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

// Initial empty profile data structure
const emptyProfile = {
  name: "",
  phone: "",
  email: "",
  linkedin: "",
  education: [{ institution: "", degree: "", year: "" }],
  skills: [""],
  workExperience: [{ company: "", position: "", duration: "", description: "" }],
  projects: [{ name: "", description: "", link: "" }],
};

const ProfileForm = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const { toast } = useToast();

  // Handler for text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for education fields
  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...profile.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setProfile((prev) => ({ ...prev, education: newEducation }));
  };

  // Add new education field
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", year: "" }],
    }));
  };

  // Remove education field
  const removeEducation = (index: number) => {
    if (profile.education.length > 1) {
      const newEducation = [...profile.education];
      newEducation.splice(index, 1);
      setProfile((prev) => ({ ...prev, education: newEducation }));
    }
  };

  // Handler for skill fields
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...profile.skills];
    newSkills[index] = value;
    setProfile((prev) => ({ ...prev, skills: newSkills }));
  };

  // Add new skill field
  const addSkill = () => {
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  // Remove skill field
  const removeSkill = (index: number) => {
    if (profile.skills.length > 1) {
      const newSkills = [...profile.skills];
      newSkills.splice(index, 1);
      setProfile((prev) => ({ ...prev, skills: newSkills }));
    }
  };

  // Handler for work experience fields
  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    const newWorkExperience = [...profile.workExperience];
    newWorkExperience[index] = { ...newWorkExperience[index], [field]: value };
    setProfile((prev) => ({ ...prev, workExperience: newWorkExperience }));
  };

  // Add new work experience field
  const addWorkExperience = () => {
    setProfile((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: "", position: "", duration: "", description: "" }],
    }));
  };

  // Remove work experience field
  const removeWorkExperience = (index: number) => {
    if (profile.workExperience.length > 1) {
      const newWorkExperience = [...profile.workExperience];
      newWorkExperience.splice(index, 1);
      setProfile((prev) => ({ ...prev, workExperience: newWorkExperience }));
    }
  };

  // Handler for project fields
  const handleProjectChange = (index: number, field: string, value: string) => {
    const newProjects = [...profile.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProfile((prev) => ({ ...prev, projects: newProjects }));
  };

  // Add new project field
  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: "", description: "", link: "" }],
    }));
  };

  // Remove project field
  const removeProject = (index: number) => {
    if (profile.projects.length > 1) {
      const newProjects = [...profile.projects];
      newProjects.splice(index, 1);
      setProfile((prev) => ({ ...prev, projects: newProjects }));
    }
  };

  // Submit the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would normally send the data to an API
    // For this phase, we'll just save it to localStorage
    localStorage.setItem("userProfile", JSON.stringify(profile));
    
    toast({
      title: "Profile Saved",
      description: "Your profile has been successfully saved.",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Add your basic contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  value={profile.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="+1 234 567 8900" 
                  value={profile.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="johndoe@example.com" 
                  value={profile.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input 
                  id="linkedin" 
                  name="linkedin" 
                  placeholder="https://linkedin.com/in/johndoe" 
                  value={profile.linkedin} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>
              Add your educational background.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                {profile.education.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`education-institution-${index}`}>Institution</Label>
                    <Input
                      id={`education-institution-${index}`}
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                      placeholder="University name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`education-degree-${index}`}>Degree</Label>
                    <Input
                      id={`education-degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`education-year-${index}`}>Year</Label>
                    <Input
                      id={`education-year-${index}`}
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                      placeholder="2019-2023"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addEducation}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              List your professional skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder="e.g., JavaScript, Project Management, Design"
                  className="flex-1"
                  required
                />
                {profile.skills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addSkill}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Skill
            </Button>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              Add your work history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.workExperience.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                {profile.workExperience.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeWorkExperience(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`work-company-${index}`}>Company</Label>
                      <Input
                        id={`work-company-${index}`}
                        value={exp.company}
                        onChange={(e) => handleWorkExperienceChange(index, "company", e.target.value)}
                        placeholder="Company name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`work-position-${index}`}>Position</Label>
                      <Input
                        id={`work-position-${index}`}
                        value={exp.position}
                        onChange={(e) => handleWorkExperienceChange(index, "position", e.target.value)}
                        placeholder="Job title"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`work-duration-${index}`}>Duration</Label>
                    <Input
                      id={`work-duration-${index}`}
                      value={exp.duration}
                      onChange={(e) => handleWorkExperienceChange(index, "duration", e.target.value)}
                      placeholder="Jan 2020 - Present"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`work-description-${index}`}>Description</Label>
                    <Textarea
                      id={`work-description-${index}`}
                      value={exp.description}
                      onChange={(e) => handleWorkExperienceChange(index, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addWorkExperience}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Work Experience
            </Button>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Showcase your notable projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.projects.map((project, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                {profile.projects.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeProject(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`project-name-${index}`}>Project Name</Label>
                      <Input
                        id={`project-name-${index}`}
                        value={project.name}
                        onChange={(e) => handleProjectChange(index, "name", e.target.value)}
                        placeholder="Project name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`project-link-${index}`}>Project Link</Label>
                      <Input
                        id={`project-link-${index}`}
                        value={project.link}
                        onChange={(e) => handleProjectChange(index, "link", e.target.value)}
                        placeholder="https://github.com/yourusername/project"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`project-description-${index}`}>Description</Label>
                    <Textarea
                      id={`project-description-${index}`}
                      value={project.description}
                      onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                      placeholder="Describe your project, technologies used, and your role"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={addProject}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end pt-6">
          <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
            Save Profile
          </Button>
        </CardFooter>
      </div>
    </form>
  );
};

export default ProfileForm;
