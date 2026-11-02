import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { BEAR_PHOTOS, getBearPhoto } from "../lib/bearPhotos";

function CreatePost() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Wildlife",
    image: getBearPhoto(1).src,
    author: "Ratan Mahal Team",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post(
        "/api/posts",
        formData
      );

      setMessage(response.data.message || "Post created successfully!");

      setFormData({
        title: "",
        description: "",
        category: "Wildlife",
        image: getBearPhoto(1).src,
        author: "Ratan Mahal Team",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not create post. Please check that backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061a17] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-400">
              Ratan Mahal Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Create New <span className="text-green-400">Post</span>
            </h1>

            <p className="mt-3 text-gray-300">
              Add wildlife stories, sanctuary news and conservation updates.
            </p>
          </div>

          <Link
            to="/posts"
            className="w-fit rounded-md border border-white/30 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-[#061a17]"
          >
            View Posts →
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 text-[#10231e] shadow-xl md:p-8">
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-bold">
                Post Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Example: Wildlife Awareness Day"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold"
              >
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Write complete post description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600"
                >
                  <option value="Wildlife">Wildlife</option>
                  <option value="Conservation">Conservation</option>
                  <option value="Nature">Nature</option>
                  <option value="Travel Guide">Travel Guide</option>
                  <option value="Awareness">Awareness</option>
                  <option value="News">News</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block text-sm font-bold"
                >
                  Author
                </label>

                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Ratan Mahal Team"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-bold">
                Sloth Bear Photograph
              </label>

              <select
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              >
                {BEAR_PHOTOS.map((photo) => (
                  <option key={photo.id} value={photo.src}>{photo.alt}</option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Select a real Indian sloth bear photo from the sanctuary image collection.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {loading ? "Publishing Post..." : "Publish Post"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreatePost;
