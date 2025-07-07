import { Link } from 'react-router-dom';
const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center font-sans">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
        Welcome to <span className="text-indigo-600">GalleryArt</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8">
        GalleryArt is a platform where you can showcase your images to the world with one click.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
     <Link to={'/Gallery'}>   <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition">
          Watch others' Gallery
        </button>
        </Link>
       <Link to={'/Form'}>
        <button className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-xl shadow-md hover:bg-indigo-50 transition">
          Create one
        </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
