
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-brand-700">
              TalentSpot
            </Link>
            <p className="mt-4 text-gray-600">
              Connecting exceptional talent with the right opportunities.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/profiles" className="text-gray-600 hover:text-brand-600">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link to="/create-profile" className="text-gray-600 hover:text-brand-600">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-600 hover:text-brand-600">
                  Search
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-brand-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-brand-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="mailto:info@talentspot.com" className="text-gray-600 hover:text-brand-600">
                  info@talentspot.com
                </a>
              </li>
              <li>
                <a href="https://twitter.com/talentspot" className="text-gray-600 hover:text-brand-600">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/talentspot" className="text-gray-600 hover:text-brand-600">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {year} TalentSpot. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-brand-600 text-sm">
              Privacy
            </a>
            <span className="mx-2 text-gray-500">·</span>
            <a href="#" className="text-gray-500 hover:text-brand-600 text-sm">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
