import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface GalleryCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  onDelete: (id: string) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  id,
  title,
  description,
  image,
  tags,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  return (
    <div>
      <div
        onClick={() => setOpen(true)}
        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden transform hover:scale-[1.02] cursor-pointer"
      >
        <div className="w-full h-56 overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="p-5">
          <h3 className="text-xl font-semibold text-indigo-700 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-red-500"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>

            <img
              src={image}
              alt={title}
              className="w-full max-h-[60vh] object-contain rounded-lg"
            />
            <h2 className="text-2xl font-bold text-indigo-700 mt-4">{title}</h2>
            <p className="text-gray-600 mt-2">{description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => onDelete(id)}
                className="bg-red-500 text-white px-6 py-2 rounded-full text-sm hover:bg-red-600"
              >
                Delete
              </button>

              <button
                onClick={handleEdit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm hover:bg-indigo-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryCard;
