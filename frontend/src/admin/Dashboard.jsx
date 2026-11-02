import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearAdminSession } from "../lib/adminSession";
import HotelStatusToggle from "./HotelStatusToggle";
import { Link as RouterLink } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [postsResponse, contactsResponse, bookingsResponse] =
          await Promise.all([
            api.get("/api/posts"),
            api.get("/api/contacts"),
            api.get("/api/bookings"),
          ]);

        setPosts(postsResponse.data.data);
        setContacts(contactsResponse.data.data);
        setBookings(bookingsResponse.data.data);
      } catch (err) {
        console.error(err);

        setError(
          "Dashboard data could not be loaded. Please check that backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        {/* Heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-400">
              Ratan Mahal Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Admin <span className="text-green-400">Dashboard</span>
            </h1>

            <p className="mt-3 text-gray-300">
              Manage sanctuary posts, contact messages and hotel booking
              enquiries.
            </p>
          </div>

         <div className="flex flex-wrap gap-3">
  <button type="button" onClick={() => { clearAdminSession(localStorage, () => window.dispatchEvent(new Event("authChanged"))); navigate("/admin/login"); }} className="w-fit rounded-lg border border-red-400/60 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500 hover:text-white">Admin Logout</button>
  <Link
    to="/admin/manage"
    className="w-fit rounded-lg border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#061a17]"
  >
    Manage Content
  </Link>

  <Link
    to="/admin/posts"
    className="w-fit rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
  >
    + Create New Post
  </Link>
  <Link to="/admin/sanctuary-hours" className="w-fit rounded-lg border border-emerald-300/40 px-5 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/10">Sanctuary Hours &amp; Status</Link>
</div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 rounded-xl bg-white p-8 text-center text-[#10231e]">
            <p className="font-bold text-green-700">Loading dashboard...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
            ❌ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-green-400/20 bg-[#08231e] p-6">
                <p className="text-3xl">📝</p>
                <p className="mt-4 text-4xl font-bold text-green-400">
                  {posts.length}
                </p>
                <h2 className="mt-2 text-lg font-bold">Total Posts</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Wildlife stories and updates
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-[#08231e] p-6">
                <p className="text-3xl">✉️</p>
                <p className="mt-4 text-4xl font-bold text-green-400">
                  {contacts.length}
                </p>
                <h2 className="mt-2 text-lg font-bold">Contact Messages</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Visitor questions and suggestions
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-[#08231e] p-6">
                <p className="text-3xl">🏨</p>
                <p className="mt-4 text-4xl font-bold text-green-400">
                  {bookings.length}
                </p>
                <h2 className="mt-2 text-lg font-bold">Booking Enquiries</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Hotel and Rest House requests
                </p>
              </div>
            </section>

          <HotelStatusToggle />
          <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-300/20 bg-[#08231e] p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Visitor Photo Management</h2><p className="mt-1 text-sm text-gray-300">Approve, reject or remove visitor submissions before they appear publicly.</p></div><RouterLink to="/admin/visitor-photos" className="rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white">Review Photos</RouterLink></section>

            {/* Latest Booking + Contact */}
            <section className="mt-10 grid gap-7 lg:grid-cols-2">
              {/* Latest Booking */}
              <div className="rounded-2xl bg-white p-6 text-[#10231e] shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                      Latest Booking
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Hotel Enquiry
                    </h2>
                  </div>

                  <span className="text-3xl">🏨</span>
                </div>

                {bookings.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-600">
                    No booking enquiries available yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-3 text-sm">
                    <p>
                      <strong>Name:</strong> {bookings[0].name}
                    </p>

                    <p>
                      <strong>Phone:</strong> {bookings[0].phone}
                    </p>

                    <p>
                      <strong>Email:</strong> {bookings[0].email}
                    </p>

                    <p>
                      <strong>Stay Type:</strong> {bookings[0].stayType}
                    </p>

                    <p>
                      <strong>Guests:</strong> {bookings[0].guests}
                    </p>

                    <p>
                      <strong>Check-in:</strong>{" "}
                      {formatDate(bookings[0].checkIn)}
                    </p>

                    <p>
                      <strong>Check-out:</strong>{" "}
                      {formatDate(bookings[0].checkOut)}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        {bookings[0].status}
                      </span>
                    </p>

                    {bookings[0].message && (
                      <p className="border-t border-gray-200 pt-3 text-gray-600">
                        <strong>Message:</strong> {bookings[0].message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Latest Contact */}
              <div className="rounded-2xl bg-white p-6 text-[#10231e] shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                      Latest Message
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Contact Enquiry
                    </h2>
                  </div>

                  <span className="text-3xl">✉️</span>
                </div>

                {contacts.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-600">
                    No contact messages available yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-3 text-sm">
                    <p>
                      <strong>Name:</strong> {contacts[0].name}
                    </p>

                    <p>
                      <strong>Phone:</strong> {contacts[0].phone}
                    </p>

                    <p>
                      <strong>Email:</strong> {contacts[0].email}
                    </p>

                    <p>
                      <strong>Subject:</strong> {contacts[0].subject}
                    </p>

                    <p className="border-t border-gray-200 pt-3 text-gray-600">
                      <strong>Message:</strong> {contacts[0].message}
                    </p>

                    <p className="text-xs text-gray-500">
                      Received: {formatDate(contacts[0].createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
