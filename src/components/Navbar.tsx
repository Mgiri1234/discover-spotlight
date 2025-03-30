
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-brand-700">
            TalentSpot
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-brand-600 transition-colors">
            Home
          </Link>
          <Link to="/profiles" className="text-gray-600 hover:text-brand-600 transition-colors">
            Profiles
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-brand-600 transition-colors">
            About
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="default" size="sm" className="bg-brand-600 hover:bg-brand-700">
            <Link to="/create-profile">Create Profile</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
