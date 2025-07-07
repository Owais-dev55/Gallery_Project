import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



const Form = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    tags: [] as string[]
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleTagInput = (e:React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const value = input.value.trim()

    if((e.key === "Enter" || e.key === ',') && value){
       e.preventDefault();
       if (!formData.tags.includes(value)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
    }
    input.value = "";
    }
  }
  const handleTagRemove = (tag:string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }))
  }
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const id = uuidv4();
    const form = new FormData();
    form.append("id", id);
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("tags", JSON.stringify(formData.tags));
    if (formData.image) {
      form.append("image", formData.image);
    }

    const response = await fetch("https://galleryproject-production.up.railway.app/api/submit", {
      method: "POST",
      body: form,
    });

    const data = await response.json();
    console.log(data);
    toast.success("Form submitted successfully");

   
    setFormData({ title: "", description: "", image: null  , tags:[]});
    (document.getElementById("image") as HTMLInputElement).value = "";

    navigate("/Gallery");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-100 flex justify-center items-center px-4 py-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg"
        encType="multipart/form-data"
      >
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">
          Submit Your Gallery
        </h1>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700 text-left">
            Title
          </label>
          <input
            name="title"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700 text-left">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700 text-left">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {formData.image && (
          <div className="mb-6 h-64 w-full overflow-hidden rounded-xl border border-gray-300">
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
      <div className="mb-5">
        <label className="block mb-2 font-medium text-gray-700 text-left">
          Tags <span className="text-sm text-gray-400">(Press enter or comma to add)</span>
        </label>
        <input
    type="text"
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    onKeyDown={handleTagInput}
    placeholder="e.g. art, landscape"
  />
    <div className="flex flex-wrap mt-3 gap-2">
      {formData.tags.map((tag ,index)=> {
        return (
          <span
        key={index}
        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center"
      >
        {tag}
        <button
          type="button"
          onClick={() => handleTagRemove(tag)}
          className="ml-2 text-indigo-500 hover:text-red-500"
        >
          &times;
        </button>
      </span>
        )
      })}
    </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white text-lg font-semibold py-3 rounded-xl hover:bg-indigo-700 transition duration-200"
        >
          Submit Gallery
        </button>
      </form>
    </div>
  );
};

export default Form;
