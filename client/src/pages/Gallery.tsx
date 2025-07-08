"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import GalleryCard from "../components/Card"
import { toast } from "react-toastify"

interface ImageEntry {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
}

const Gallery = () => {
  const [allImages, setAllImages] = useState<ImageEntry[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageEntry[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("https://galleryproject-production.up.railway.app/")
        if (!response.ok) throw new Error("Failed to fetch")
        const data: ImageEntry[] = await response.json()
        setAllImages(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchImages()
  }, [])

  const titles = [...new Set(allImages.map((img) => img.title))]

  const handleTitleClick = (title: string) => {
    setSelectedTitle(title)
    setFilteredImages(allImages.filter((img) => img.title === title))
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return
    const res = await fetch(`https://galleryproject-production.up.railway.app/api/entry/${id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setAllImages((prev) => prev.filter((img) => img.id !== id))
      setFilteredImages((prev) => prev.filter((img) => img.id !== id))
      toast.success("Deleted!")
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
        <button
          onClick={() => navigate("/")}
          className="mb-8 w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          ← Back to Home
        </button>

        <h2 className="text-lg font-medium text-gray-900 mb-4">Artists</h2>

        {titles.length > 0 ? (
          <ul className="space-y-1">
            {titles.map((title) => (
              <li key={title}>
                <button
                  onClick={() => handleTitleClick(title)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedTitle === title
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No uploads found.</p>
        )}
      </aside>

      <main className="flex-1 p-8">
        {!selectedTitle ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-normal text-gray-900 mb-2">Gallery</h1>
              <p className="text-gray-600">Select an artist to view their work</p>
            </div>
          </div>
        ) : filteredImages.length ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-normal text-gray-900">Work by {selectedTitle}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((item) => (
                <GalleryCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  tags={item.tags}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-600">No images found for {selectedTitle}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Gallery
