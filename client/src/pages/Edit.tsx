  import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface FormDataType {
  title: string;
  description: string;
  image: File | null;   
  preview: string;      
  tags: string[];
}

const EditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    image: null,
    preview: "",
    tags: [],
  });

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch("https://galleryproject-production.up.railway.app/");
        const data = await res.json();
        const post = data.find((d: any) => d.id === id);
        if (!post) {
          toast.error("Post not found");
          navigate("/Gallery");
          return;
        }
        setFormData({
          title: post.title,
          description: post.description,
          image: null,
          preview: post.image,
          tags: post.tags || [],
        });
      } catch (err) {
        toast.error("Could not load post");
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file, preview: URL.createObjectURL(file) }));
    }
  };

  /* Tag add on key‑down (Enter / ,) */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const inputEl = e.currentTarget;
    // Wait a micro‑tick so DOM reflects the typed character
    setTimeout(() => {
      const val = inputEl.value.trim();
      if (!val || formData.tags.includes(val)) return;
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      inputEl.value = "";
    }, 0);
  };

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("tags", JSON.stringify(formData.tags));
    if (formData.image) payload.append("image", formData.image);
    try {
      const res = await fetch(`https://galleryproject-production.up.railway.app/api/edit/${id}`, {
        method: "PUT",
        body: payload,
      });
      if (!res.ok) throw new Error();
      toast.success("Post updated");
      navigate("/Gallery");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg p-8 border border-gray-200 rounded-lg"
        encType="multipart/form-data"
      >
        <h2 className="text-3xl font-normal text-gray-900 text-center mb-6">Edit Gallery</h2>
        
        {/* Title */}
        <label className="block font-medium text-gray-700 mb-1">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          required
        />
        
        {/* Description */}
        <label className="block font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          required
        />
        
        {/* Image */}
        <label className="block font-medium text-gray-700 mb-1">Change Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mb-4 border border-gray-300 rounded-md p-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        
        {formData.preview && (
          <div className="mb-4 h-60 border border-gray-200 rounded-md overflow-hidden">
            <img src={formData.preview || "/placeholder.svg"} alt="preview" className="w-full h-full object-cover object-top" />
          </div>
        )}
        
        {/* Tags */}
        <label className="block font-medium text-gray-700 mb-1">
          Tags <span className="text-xs text-gray-500">(Enter or comma)</span>
        </label>
        <input
          type="text"
          onKeyDown={handleTagKeyDown}
          placeholder="e.g. portrait, travel"
          className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
        />
        <div className="flex flex-wrap gap-2 mb-5">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        
        {/* Submit */}
        <button type="submit" className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors">
          Update Post
        </button>
      </form>
    </div>
  );
};

export default EditForm;