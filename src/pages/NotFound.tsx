
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] font-inter">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#FFFFFF] font-inter">404</h1>
        <p className="text-xl text-[#E0E0E0]/80 mb-4">Oops! Page not found</p>
        <a href="/" className="text-[#FF7A00] hover:text-[#ff9100] underline font-inter">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

