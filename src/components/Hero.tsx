
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-brand-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-brand-600">Discover</span> and <span className="text-brand-600">Connect</span> with Exceptional Talent
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              A modern platform for showcasing skills and discovering opportunities across industries, powered by AI-driven search.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 text-lg">
                <Link to="/create-profile">Create Your Profile</Link>
              </Button>
              <Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-50 px-8 py-3 text-lg">
                <Link to="/profiles">Explore Profiles</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600" 
              alt="Person using laptop" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
