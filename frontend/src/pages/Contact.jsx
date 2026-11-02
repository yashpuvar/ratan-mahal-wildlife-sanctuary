import { useState } from "react";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";
import { SanctuaryStatusPanel } from "../components/SanctuaryStatus";


function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");


const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
});


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
  setError("");
  setSubmitted(false);

  try {
    await api.post("/api/contacts", formData);

    setSubmitted(true);

    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    });
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
        "Message could not be sent. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-[#061a17] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24">
        <img
          src={getBearPhoto(6).src}
          alt={getBearPhoto(6).alt}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#041411]/85" />

        <div className="photo-copy relative mx-auto max-w-7xl px-5 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-400">
            We Would Love To Hear From You
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Contact <span className="text-green-400">Us</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-200">
            Contact us for sanctuary information, visiting guidance, wildlife
            queries, hotel booking enquiries and more.
          </p>
        </div>
      </section>

      <section className="bg-[#061a17] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl"><SanctuaryStatusPanel /></div>
      </section>

      {/* CONTACT CARDS */}
      <section className="bg-[#edf5f1] py-16 text-[#10231e]">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Phone */}
            <article className="rounded-2xl bg-white p-7 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                📞
              </div>

              <h2 className="mt-5 text-xl font-bold">Call Us</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Contact us for visitor information and hotel enquiries.
              </p>

              <a
                href="tel:+919510109200"
                className="mt-5 inline-block font-bold text-green-700 hover:text-green-900"
              >
                +91 9510109200
              </a>
            </article>

            {/* Email */}
            <article className="rounded-2xl bg-white p-7 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✉️
              </div>

              <h2 className="mt-5 text-xl font-bold">Email Us</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Send your questions, suggestions or booking requirements.
              </p>

              <a
                href="mailto:yashrajpuvar442@gmail.com"
                className="mt-5 inline-block break-all font-bold text-green-700 hover:text-green-900"
              >
                yashrajpuvar442@gmail.com
              </a>
            </article>

            {/* Location */}
            <article className="rounded-2xl bg-white p-7 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                📍
              </div>

              <h2 className="mt-5 text-xl font-bold">Visit Us</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Ratan Mahal Wildlife Bear Sanctuary, Gujarat, India.
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Ratan+Mahal+Wildlife+Sanctuary+Gujarat"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block font-bold text-green-700 hover:text-green-900"
              >
                Open Map →
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="bg-[#08231e] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          {/* Form */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-400">
              Send Us A Message
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Get In Touch With Our Team
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-300">
              Fill out the form and we will get back to you as soon as
              possible. Please provide correct contact details.
            </p>

            <div className="mt-8 rounded-2xl bg-white p-6 text-[#10231e] shadow-xl md:p-8">
              {submitted && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                  ✅ Thank you! Your message has been sent successfully.
                </div>
              )}

              {error && (
  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
    ❌ {error}
  </div>
)}


              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold"
                    >
                      Full Name *
                    </label>

                    <input
  id="name"
  name="name"
  type="text"
  required
  value={formData.name}
  onChange={handleChange}
  placeholder="Enter your name"
  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
/>

                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold"
                    >
                      Phone Number *
                    </label>

                    <input
  id="phone"
  name="phone"
  type="tel"
  required
  value={formData.phone}
  onChange={handleChange}
  placeholder="+91 00000 00000"
  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
/>

                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold"
                  >
                    Email Address *
                  </label>

                <input
  id="email"
  name="email"
  type="email"
  required
  value={formData.email}
  onChange={handleChange}
  placeholder="Enter your email"
  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
/>

                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-bold"
                  >
                    Subject *
                  </label>

                 <select
  id="subject"
  name="subject"
  required
  value={formData.subject}
  onChange={handleChange}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600"
>
  <option value="" disabled>
    Select a subject
  </option>
  <option value="Sanctuary Visit">Sanctuary Visit</option>
  <option value="Hotel Booking">Hotel Booking</option>
  <option value="Wildlife Information">
    Wildlife Information
  </option>
  <option value="Suggestion">Suggestion</option>
  <option value="Other">Other</option>
</select>

                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-bold"
                  >
                    Your Message *
                  </label>

                  <textarea
  id="message"
  name="message"
  rows="5"
  required
  value={formData.message}
  onChange={handleChange}
  placeholder="Write your message here..."
  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
/>

                </div>

               <button
  type="submit"
  disabled={loading}
  className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
>
  {loading ? "Sending Message..." : "Send Message"}
</button>

              </form>
            </div>
          </div>

          {/* Right Side Info + Map */}
          <div className="flex flex-col">
            <div className="rounded-2xl border border-white/10 bg-[#061a17] p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-green-400">
                Visitor Information
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                Plan Your Visit Responsibly
              </h2>

              <div className="mt-6 space-y-5 text-sm leading-6 text-gray-300">
                <p>
                  🕘 <strong className="text-white">Visiting Hours:</strong>{" "}
                  Please contact us before planning your visit.
                </p>

                <p>
                  🌿 <strong className="text-white">Respect Nature:</strong>{" "}
                  Do not disturb wildlife or throw plastic in forest areas.
                </p>

                <p>
                  🐻 <strong className="text-white">Wildlife Safety:</strong>{" "}
                  Always follow sanctuary rules and local guidelines.
                </p>

                <p>
                  🏨 <strong className="text-white">Hotel Booking:</strong>{" "}
                  Send an enquiry before arriving for room availability.
                </p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative mt-6 flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0d332a]">
              <img
                src="https://images.unsplash.com/photo-1524666041070-9d87656c25bb?auto=format&fit=crop&w=1200&q=85"
                alt="Map location placeholder"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />

              <div className="relative px-6 text-center">
                <p className="text-5xl">📍</p>

                <h3 className="mt-4 text-xl font-bold">
                  Ratan Mahal Wildlife Sanctuary
                </h3>

                <p className="mt-2 text-sm text-gray-200">
                  Gujarat, India
                </p>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ratan+Mahal+Wildlife+Sanctuary+Gujarat"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-md bg-green-500 px-5 py-3 text-sm font-bold transition hover:bg-green-600"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
