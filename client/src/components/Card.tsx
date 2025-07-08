"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom";

export interface GalleryCardProps {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  onDelete: (id: string) => void
}

const GalleryCard: React.FC<GalleryCardProps> = ({ id, title, description, image, tags, onDelete }) => {
  const [open, setOpen] = useState(false)

  // In your React Router app, you would import and use:
  const navigate = useNavigate();

  const handleEdit = () => {
    // This is what you have in your original code:
    navigate(`/edit/${id}`);

    // For demo purposes, I'll simulate it:
    console.log(`Navigate to /edit/${id}`)
    // In your actual app, uncomment the navigate line above
  }

  return (
    <div>
      <div
        onClick={() => setOpen(true)}
        className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all overflow-hidden cursor-pointer group"
      >
        <div className="w-full h-56 overflow-hidden bg-gray-50">
          <img
            src={image || "/placeholder.svg?height=224&width=400"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            <img
              src={image || "/placeholder.svg?height=400&width=600"}
              alt={title}
              className="w-full max-h-[60vh] object-contain rounded-md"
            />
            <h2 className="text-xl font-medium text-gray-900 mt-4">{title}</h2>
            <p className="text-gray-600 mt-2">{description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => onDelete(id)}
                className="bg-red-500 text-white px-6 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleEdit}
                className="bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryCard
