import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";

function AdminManage() {
  const [activeTab, setActiveTab] = useState("posts");

  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [videos, setVideos] = useState([]);



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: "📝",
      count: posts.length,
    },

    {
  id: "gallery",
  label: "Gallery",
  icon: "🖼️",
  count: galleryItems.length,
},

{
  id: "videos",
  label: "Videos",
  icon: "🎥",
  count: videos.length,
},


    {
      id: "contacts",
      label: "Contacts",
      icon: "✉️",
      count: contacts.length,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "🏨",
      count: bookings.length,
    },
  ];

  useEffect(() => {
    const loadAdminData = async () => {
      try {
       const [
  postsResponse,
  galleryResponse,
  videosResponse,
  contactsResponse,
  bookingsResponse,
] = await Promise.all([
  api.get("/api/posts"),
  api.get("/api/gallery"),
  api.get("/api/videos"),
  api.get("/api/contacts"),
  api.get("/api/bookings"),
]);



       setPosts(postsResponse.data.data || []);
setGalleryItems(galleryResponse.data.data || []);
setVideos(videosResponse.data.data || []);
setContacts(contactsResponse.data.data || []);
setBookings(bookingsResponse.data.data || []);

      } catch (err) {
        console.error(err);

        setError(
          "Data could not be loaded. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [postsResponse, contactsResponse, bookingsResponse] =
        await Promise.all([
          api.get("/api/posts"),
          api.get("/api/contacts"),
          api.get("/api/bookings"),
        ]);

      setPosts(postsResponse.data.data || []);
      setContacts(contactsResponse.data.data || []);
      setBookings(bookingsResponse.data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        "Data could not be loaded. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message) => {
    setActionMessage(message);

    setTimeout(() => {
      setActionMessage("");
    }, 4000);
  };

  const handleDeletePost = async (postId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this post?\n\n${title}`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/posts/${postId}`);

      setPosts((previousPosts) =>
        previousPosts.filter((post) => post._id !== postId)
      );

      showMessage("Post deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not delete post.");
    }
  };
  const handleDeleteGalleryImage = async (imageId, title) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete this gallery photo?\n\n${title}`
  );

  if (!confirmed) return;

  try {
    await api.delete(`/api/gallery/${imageId}`);

    setGalleryItems((previousItems) =>
      previousItems.filter((item) => item._id !== imageId)
    );

    showMessage("Gallery photo deleted successfully.");
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message || "Could not delete gallery photo."
    );
  }
};

const handleDeleteVideo = async (videoId, title) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete this video?\n\n${title}`
  );

  if (!confirmed) return;

  try {
    await api.delete(`/api/videos/${videoId}`);

    setVideos((previousVideos) =>
      previousVideos.filter((video) => video._id !== videoId)
    );

    showMessage("Video deleted successfully.");
  } catch (err) {
    console.error(err);

    setError(err.response?.data?.message || "Could not delete video.");
  }
};



  const handleDeleteContact = async (contactId, name) => {
    const confirmed = window.confirm(`Delete message from ${name}?`);

    if (!confirmed) return;

    try {
      await api.delete(`/api/contacts/${contactId}`);

      setContacts((previousContacts) =>
        previousContacts.filter((contact) => contact._id !== contactId)
      );

      showMessage("Contact message deleted successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Could not delete contact message."
      );
    }
  };

  const handleDeleteBooking = async (bookingId, name) => {
    const confirmed = window.confirm(`Delete booking enquiry from ${name}?`);

    if (!confirmed) return;

    try {
      await api.delete(`/api/bookings/${bookingId}`);

      setBookings((previousBookings) =>
        previousBookings.filter((booking) => booking._id !== bookingId)
      );

      showMessage("Booking enquiry deleted successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Could not delete booking enquiry."
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#061a17] px-5 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-400">
              Ratan Mahal Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Manage <span className="text-green-400">Content</span>
            </h1>

            <p className="mt-3 text-gray-300">
              Manage posts, contact messages and hotel booking enquiries.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchAllData}
              disabled={loading}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-[#061a17] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>

            <Link
              to="/admin"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-[#061a17]"
            >
              ← Dashboard
            </Link>

            <Link
              to="/admin/gallery"
              className="rounded-lg border border-emerald-400/50 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
            >
              + Add Gallery Photo
            </Link>

            <Link
              to="/admin/posts"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
            >
              + Create Post
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {actionMessage && (
          <div className="mt-7 rounded-lg border border-green-400/30 bg-green-500/10 p-4 text-sm font-semibold text-green-300">
            ✅ {actionMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-7 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-3 border-b border-white/10 pb-5">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-5 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-green-600 text-white"
                  : "bg-[#08231e] text-gray-300 hover:bg-[#0d332a]"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
            <p className="font-bold text-green-700">Loading admin data...</p>
          </div>
        )}

        {/* GALLERY TAB */}
{!loading && activeTab === "gallery" && (
  <section className="mt-8">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Manage Gallery Photos</h2>
        <p className="mt-2 text-sm text-gray-300">
          Total gallery photos: {galleryItems.length}
        </p>
      </div>

      <Link
        to="/admin/gallery"
        className="w-fit rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
      >
        + Add New Photo
      </Link>
    </div>

    {galleryItems.length === 0 ? (
      <div className="rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
        <p className="font-bold">No gallery photos available.</p>

        <Link
          to="/admin/gallery"
          className="mt-4 inline-block font-bold text-green-700 hover:text-green-900"
        >
          Add your first gallery photo →
        </Link>
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <article
            key={item._id}
            className="overflow-hidden rounded-2xl bg-white text-[#10231e] shadow-xl"
          >
            <img
              src={getBearPhoto(index).src}
              alt={getBearPhoto(index).alt}
              className="h-52 w-full object-cover"
            />

            <div className="p-5">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                {item.category || "Wildlife"}
              </span>

              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>

              {item.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {item.description}
                </p>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Added: {formatDate(item.createdAt)}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleDeleteGalleryImage(item._id, item.title)
                }
                className="mt-5 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete Photo
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)}


        {/* POSTS TAB */}
        {!loading && activeTab === "posts" && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Manage Posts</h2>
              <p className="mt-2 text-sm text-gray-300">
                Total posts: {posts.length}
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
                <p className="font-bold">No posts available.</p>

                <Link
                  to="/admin/posts"
                  className="mt-4 inline-block font-bold text-green-700 hover:text-green-900"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {posts.map((post, index) => (
                  <article
                    key={post._id}
                    className="overflow-hidden rounded-2xl bg-white text-[#10231e] shadow-xl"
                  >
                    <div className="flex gap-4 p-5">
                      <img
                        src={getBearPhoto(index).src}
                        alt={getBearPhoto(index).alt}
                        className="h-24 w-24 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-green-700">
                          {post.category || "Wildlife"}
                        </p>

                        <h3 className="mt-1 truncate text-lg font-bold">
                          {post.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {post.description}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          {formatDate(post.createdAt)} · By{" "}
                          {post.author || "Ratan Mahal Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-100 p-4">
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post._id, post.title)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        Delete Post
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIDEOS TAB */}
{!loading && activeTab === "videos" && (
  <section className="mt-8">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Manage Wildlife Videos</h2>
        <p className="mt-2 text-sm text-gray-300">
          Total videos: {videos.length}
        </p>
      </div>

      <Link
        to="/admin/videos"
        className="w-fit rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
      >
        + Add New Video
      </Link>
    </div>

    {videos.length === 0 ? (
      <div className="rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
        <p className="font-bold">No videos available.</p>

        <Link
          to="/admin/videos"
          className="mt-4 inline-block font-bold text-green-700 hover:text-green-900"
        >
          Add your first video →
        </Link>
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => (
          <article
            key={video._id}
            className="overflow-hidden rounded-2xl bg-white text-[#10231e] shadow-xl"
          >
            <div className="relative h-48">
              <img
                src={getBearPhoto(index).src}
                alt={getBearPhoto(index).alt}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 pl-1 text-xl text-white shadow-lg">
                  ▶
                </span>
              </div>

              <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                {video.category || "Wildlife"}
              </span>

              {video.duration && (
                <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white">
                  {video.duration}
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="line-clamp-2 text-lg font-bold">
                {video.title}
              </h3>

              {video.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {video.description}
                </p>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Added: {formatDate(video.createdAt)}
              </p>

              <button
                type="button"
                onClick={() => handleDeleteVideo(video._id, video.title)}
                className="mt-5 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete Video
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)}


        {/* CONTACTS TAB */}
        {!loading && activeTab === "contacts" && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Contact Messages</h2>
              <p className="mt-2 text-sm text-gray-300">
                Total messages: {contacts.length}
              </p>
            </div>

            {contacts.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
                No contact messages available.
              </div>
            ) : (
              <div className="space-y-5">
                {contacts.map((contact) => (
                  <article
                    key={contact._id}
                    className="rounded-2xl bg-white p-6 text-[#10231e] shadow-xl"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{contact.name}</h3>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            {contact.subject}
                          </span>

                          {!contact.isRead && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                              Unread
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                          <p>📞 {contact.phone}</p>
                          <p>✉️ {contact.email}</p>
                        </div>

                        <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                          {contact.message}
                        </p>

                        <p className="mt-3 text-xs text-gray-500">
                          Received: {formatDate(contact.createdAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteContact(contact._id, contact.name)
                        }
                        className="h-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* BOOKINGS TAB */}
        {!loading && activeTab === "bookings" && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Hotel Booking Enquiries</h2>
              <p className="mt-2 text-sm text-gray-300">
                Total bookings: {bookings.length}
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-[#10231e] shadow-xl">
                No booking enquiries available.
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => (
                  <article
                    key={booking._id}
                    className="rounded-2xl bg-white p-6 text-[#10231e] shadow-xl"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{booking.name}</h3>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            {booking.stayType}
                          </span>

                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                            {booking.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                          <p>📞 {booking.phone}</p>
                          <p>✉️ {booking.email}</p>
                          <p>👥 Guests: {booking.guests}</p>
                          <p>📅 Check-in: {formatDate(booking.checkIn)}</p>
                          <p>📅 Check-out: {formatDate(booking.checkOut)}</p>
                        </div>

                        {booking.message && (
                          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                            <strong>Message:</strong> {booking.message}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-gray-500">
                          Requested: {formatDate(booking.createdAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteBooking(booking._id, booking.name)
                        }
                        className="h-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminManage;
