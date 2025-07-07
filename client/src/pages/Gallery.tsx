import { useEffect, useState } from "react";
import GalleryCard from "../components/Card";
import { toast } from "react-toastify";
interface ImageEntry {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[]
}

const Gallery = () => {
  const [allImages, setAllImages] = useState<ImageEntry[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageEntry[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:5000/");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: ImageEntry[] = await response.json();
        setAllImages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchImages();
  }, []);

  const titles = [...new Set(allImages.map((img) => img.title))];

  const handleTitleClick = (title: string) => {
    setSelectedTitle(title);
    setFilteredImages(allImages.filter((img) => img.title === title));
  };
  
  const handleDelete = async (id:string) => {
    if(!window.confirm('Delete this post ? ')) return;

     const res = await fetch(`http://localhost:5000/api/entry/${id}`, {
    method: "DELETE",
  });
  if (res.ok) {
    setAllImages((prev) => prev.filter((img) => img.id !== id));
    // also refresh filteredImages if needed
    setFilteredImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Deleted!");
  } else {
    toast.error("Failed to delete");
  }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-72 bg-white border-r shadow-md px-6 py-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-6">Uploaded By</h2>

        {titles.length > 0 ? (
          <ul className="space-y-3">
            {titles.map((title) => (
              <li key={title}>
                <button
                  onClick={() => handleTitleClick(title)}
                  className={`w-full text-left px-4 py-2 rounded-lg hover:bg-indigo-50 transition ${
                    selectedTitle === title
                      ? "bg-indigo-100 text-indigo-700 shadow"
                      : "bg-gray-50"
                  }`}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No uploads found.</p>
        )}
      </aside>
      <main className="flex-1 p-6">
        {!selectedTitle ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <p className="text-gray-600 text-2xl text-center">
              Select a title on the left to view images.
            </p>
          </div>
        ) : filteredImages.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        ) : (
          <p className="text-gray-600">
            No images found for{" "}
            <span className="font-semibold">{selectedTitle}</span>.
          </p>
        )}
      </main>
    </div>
  );
};

export default Gallery;
