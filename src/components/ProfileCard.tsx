
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCardProps {
  id: string;
  name: string;
  skills: string[];
  topEducation?: { institution: string; degree: string };
  topExperience?: { company: string; position: string };
  linkedin?: string;
}

const ProfileCard = ({
  id,
  name,
  skills,
  topEducation,
  topExperience,
  linkedin,
}: ProfileCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="pt-6 flex-grow">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{name}</h3>
            
            {topExperience && (
              <div className="flex items-center mt-2 text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {topExperience.position} at {topExperience.company}
                </span>
              </div>
            )}
            
            {topEducation && (
              <div className="flex items-center mt-2 text-gray-600">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {topEducation.degree}, {topEducation.institution}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-brand-50 text-brand-700 hover:bg-brand-100">
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline">+{skills.length - 5} more</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        
        <Button asChild className="ml-auto">
          <Link to={`/profile/${id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
