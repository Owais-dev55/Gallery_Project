"use client"

import type React from "react"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const Form = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    tags: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, image: file }))
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const value = input.value.trim()
    if ((e.key === "Enter" || e.key === ",") && value) {
      e.preventDefault()
      if (!formData.tags.includes(value)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }))
      }
      input.value = ""
    }
  }

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const id = uuidv4()
    const form = new FormData()
    form.append("id", id)
    form.append("title", formData.title)
    form.append("description", formData.description)
    form.append("tags", JSON.stringify(formData.tags))
    if (formData.image) {
      form.append("image", formData.image)
    }

    const response = await fetch("https://galleryproject-production.up.railway.app/api/submit", {
      method: "POST",
      body: form,
    })
    const data = await response.json()
    console.log(data)
    toast.success("Form submitted successfully")

    setFormData({ title: "", description: "", image: null, tags: [] })
    ;(document.getElementById("image") as HTMLInputElement).value = ""
    navigate("/Gallery")
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-normal text-gray-900 mb-2">Share Your Art</h1>
          <p className="text-gray-600">Upload your artwork to the gallery</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-8"
          encType="multipart/form-data"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                name="title"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            {formData.image && (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <img
                  src={URL.createObjectURL(formData.image) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags <span className="text-sm text-gray-500">(Press enter or comma to add)</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                onKeyDown={handleTagInput}
                placeholder="e.g. art, landscape"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap mt-3 gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Form
