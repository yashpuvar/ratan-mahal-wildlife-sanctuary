import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { BEAR_PHOTOS, getBearPhoto } from "../lib/bearPhotos";

function CreateGallery() {
  const [formData, setFormData] = useState({
    title: "",
    image: getBearPhoto(0).src,
    category: "Wildlife",
    description: "",
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
        "/api/gallery",
        formData
      );

      setMessage(response.data.message || "Gallery photo added successfully!");

      setFormData({
        title: "",
        image: getBearPhoto(0).src,
        category: "Wildlife",
        description: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not add gallery photo. Please check backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061a17] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-400">
              Ratan Mahal Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Add Gallery <span className="text-green-400">Photo</span>
            </h1>

            <p className="mt-3 text-gray-300">
              Add wildlife, nature and sanctuary photos to the public gallery.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/manage"
              className="w-fit rounded-lg border border-white/30 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-[#061a17]"
            >
              Manage Gallery
            </Link>

            <Link
              to="/gallery"
              className="w-fit rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
            >
              View Gallery →
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 text-[#10231e] shadow-xl md:p-8">
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
                Photo Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Sloth Bear in Forest"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-bold">
                Sloth Bear Photograph *
              </label>

              <select
                id="image"
                name="image"
                required
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              >
                {BEAR_PHOTOS.map((photo) => (
                  <option key={photo.id} value={photo.src}>{photo.alt}</option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Choose from real Indian sloth bear photographs cleared for reuse.
              </p>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={formData.image}
                  alt="Selected Indian sloth bear photograph"
                  className="h-64 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

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
                <option value="Nature">Nature</option>
                <option value="Landscape">Landscape</option>
                <option value="Forest">Forest</option>
                <option value="Birds">Birds</option>
                <option value="Hotel & Stay">Hotel & Stay</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about this photo..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {loading ? "Adding Photo..." : "Add Gallery Photo"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateGallery;
