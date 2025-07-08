"use client";

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-4">
          Welcome to <span className="font-medium">GalleryArt</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
          GalleryArt is a platform where you can showcase your images to the
          world with one click.
        </p>
       <div className="flex flex-col sm:flex-row gap-4 justify-center">
         <Link to={'/Gallery'}> <button className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-base font-medium">
            Watch others' Gallery
          </button>
          </Link> 

        <Link to={'/Form'}> <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors text-base font-medium">
            Create one
          </button>
          </Link> 
        </div>
      </div>
    </div>
  );
};

export default Home;
