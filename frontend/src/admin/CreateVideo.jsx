import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { BEAR_PHOTOS, getBearPhoto } from "../lib/bearPhotos";

function CreateVideo() {
  const [formData, setFormData] = useState({
    title: "",
    youtubeId: "",
    thumbnail: getBearPhoto(2).src,
    category: "Wildlife",
    description: "",
    duration: "",
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
        "/api/videos",
        formData
      );

      setMessage(response.data.message || "Video added successfully!");

      setFormData({
        title: "",
        youtubeId: "",
        thumbnail: getBearPhoto(2).src,
        category: "Wildlife",
        description: "",
        duration: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not add video. Please check backend server."
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
              Add Wildlife <span className="text-green-400">Video</span>
            </h1>

            <p className="mt-3 text-gray-300">
              Add YouTube wildlife, sanctuary and conservation videos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/manage"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-[#061a17]"
            >
              Manage Videos
            </Link>

            <Link
              to="/videos"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
            >
              View Videos →
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
                Video Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Ratan Mahal Forest Journey"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <div>
              <label
                htmlFor="youtubeId"
                className="mb-2 block text-sm font-bold"
              >
                YouTube Video ID *
              </label>

              <input
                id="youtubeId"
                name="youtubeId"
                type="text"
                required
                value={formData.youtubeId}
                onChange={handleChange}
                placeholder="Example: Scxs7L0vhZ4"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />

              <p className="mt-2 text-xs text-gray-500">
                Example YouTube URL:
                <br />
                https://www.youtube.com/watch?v=Scxs7L0vhZ4
                <br />
                Video ID is: <strong>Scxs7L0vhZ4</strong>
              </p>
            </div>

            <div>
              <label
                htmlFor="thumbnail"
                className="mb-2 block text-sm font-bold"
              >
                Sloth Bear Thumbnail
              </label>

              <select
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              >
                {BEAR_PHOTOS.map((photo) => (
                  <option key={photo.id} value={photo.src}>{photo.alt}</option>
                ))}
              </select>
            </div>

            {formData.thumbnail && (
              <img
                src={formData.thumbnail}
                alt="Selected Indian sloth bear video thumbnail"
                className="h-60 w-full rounded-xl object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}

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
                  <option value="Sanctuary">Sanctuary</option>
                  <option value="Conservation">Conservation</option>
                  <option value="Nature">Nature</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-bold"
                >
                  Video Duration
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Example: 04:25"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold"
              >
                Video Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {loading ? "Adding Video..." : "Add Video"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateVideo;
