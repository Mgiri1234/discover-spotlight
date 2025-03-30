
import { User, Search, Briefcase, Globe } from "lucide-react";

const features = [
  {
    icon: <User className="h-8 w-8 text-brand-500" />,
    title: "Create Your Profile",
    description: "Showcase your skills, experience, and projects in a clean, professional format that gets noticed."
  },
  {
    icon: <Search className="h-8 w-8 text-brand-500" />,
    title: "AI-Powered Search",
    description: "Our natural language search helps recruiters find the perfect candidates based on specific skills and requirements."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-brand-500" />,
    title: "Connect with Opportunities",
    description: "Get discovered by companies looking for your unique skill set and experience level."
  },
  {
    icon: <Globe className="h-8 w-8 text-brand-500" />,
    title: "Public Profiles",
    description: "Your profile is publicly accessible, increasing your visibility to potential employers worldwide."
  }
];

const FeatureSection = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How TalentSpot Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-brand-50 p-3 rounded-full w-fit mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
