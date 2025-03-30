
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileForm from "@/components/ProfileForm";

const CreateProfile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to create your professional profile. Showcase your skills, experience, and projects to stand out to recruiters.
            </p>
          </div>
          
          <ProfileForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateProfile;
