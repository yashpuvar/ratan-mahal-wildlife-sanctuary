import { useEffect, useState } from "react";
import api from "../lib/api";
import { StatusIndicator } from "../components/SanctuaryStatus";

const hotelImage = (name) => `/images/hotel/${name}.jpg`;

const stayPhotos = [
  { src: hotelImage("premium-bedroom"), alt: "King bed in a warmly lit hotel bedroom", caption: "A restful night, thoughtfully appointed", credit: "Max Vakhtbovych · Pexels", source: "https://www.pexels.com/photo/interior-of-a-hotel-room-8082564/" },
  { src: hotelImage("luxury-room"), alt: "Bright hotel room with natural light and a wooden floor", caption: "Natural light and considered details", credit: "Julia C · Pexels", source: "https://www.pexels.com/photo/interior-of-hotel-room-18801062/" },
  { src: hotelImage("forest-view-room"), alt: "Cozy bedroom with a balcony overlooking greenery", caption: "A green view to wake up to", credit: "Ankit · Pexels", source: "https://www.pexels.com/photo/clean-and-cozy-bedroom-10973940/" },
  { src: hotelImage("deluxe-room"), alt: "Modern hotel bedroom with clean white bedding and warm wood accents", caption: "Comfort, with a little extra calm", credit: "Magda Ehlers · Pexels", source: "https://www.pexels.com/photo/modern-and-simple-hotel-room-interior-15273732/" },
  { src: hotelImage("modern-bathroom"), alt: "Contemporary bathroom with modern fittings", caption: "Fresh, clean and carefully finished", credit: "Quang Nguyen Vinh · Pexels", source: "https://www.pexels.com/photo/a-bathroom-area-in-a-hotel-room-14036240/" },
  { src: hotelImage("wooden-cottage"), alt: "Wooden cottage nestled among green trees", caption: "A cabin tucked into the trees", credit: "Dmitry Alexandrovich · Pexels", source: "https://www.pexels.com/photo/cozy-wooden-cabin-in-forest-setting-33658138/" },
  { src: hotelImage("hotel-reception"), alt: "Welcoming resort reception with timber beams", caption: "A warm welcome on arrival", credit: "Quang Nguyen Vinh · Pexels", source: "https://www.pexels.com/photo/reception-desk-in-hotel-lobby-14025913/" },
  { src: hotelImage("dining-area"), alt: "Inviting dining room with comfortable seating", caption: "A comfortable place to gather", credit: "Jonathan Borba · Pexels", source: "https://www.pexels.com/photo/dining-area-3144581/" },
  { src: hotelImage("outdoor-seating"), alt: "Outdoor bench seating beneath leafy trees", caption: "Take a quiet moment outdoors", credit: "Didi Lecatompessy · Pexels", source: "https://www.pexels.com/photo/outdoor-seating-with-green-cushions-under-trees-32308437/" },
  { src: hotelImage("forest-balcony"), alt: "Wooden balcony looking out over a green garden", caption: "Step outside into the green", credit: "Matheus Bertelli · Pexels", source: "https://www.pexels.com/photo/hotel-garden-view-from-the-balcony-13871337/" },
];

const stayOptions = [
  {
    type: "Hotel Room",
    title: "Hotel Room",
    image: stayPhotos[0].src,
    imageAlt: stayPhotos[0].alt,
    summary: "Ask the sanctuary team about current room details and arrangements.",
  },
  {
    type: "Rest House",
    title: "Forest Rest House",
    image: stayPhotos[5].src,
    imageAlt: stayPhotos[5].alt,
    summary: "Enquire about the Rest House and confirm current details directly.",
  },
  {
    type: "Group Booking",
    title: "Group Enquiry",
    image: stayPhotos[8].src,
    imageAlt: stayPhotos[8].alt,
    summary: "Share your group’s dates and requirements for a response from the team.",
  },
];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  checkIn: "",
  checkOut: "",
  guests: "",
  stayType: "",
  message: "",
};

const fieldClass = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-[#17281f] outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15";

function Stay() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [hotelOpen, setHotelOpen] = useState(false);
  const [hotelStatusLoaded, setHotelStatusLoaded] = useState(false);
  const [hotelStatusUnavailable, setHotelStatusUnavailable] = useState(false);

  useEffect(() => {
    api.get("/api/sanctuary/hotel-status").then(({ data }) => setHotelOpen(data?.data?.open === true)).catch((error) => { console.error("Could not load hotel status", error); setHotelStatusUnavailable(true); }).finally(() => setHotelStatusLoaded(true));
  }, []);

  useEffect(() => {
    if (!selectedPhoto) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedPhoto(null);
      if (event.key === "ArrowRight") setSelectedPhoto((index) => (index + 1) % stayPhotos.length);
      if (event.key === "ArrowLeft") setSelectedPhoto((index) => (index - 1 + stayPhotos.length) % stayPhotos.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPhoto]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSubmitted(false);
    setError("");
  };

  const chooseStay = (type) => {
    setFormData((previous) => ({ ...previous, stayType: type }));
    setSelectedStay(null);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.getElementById("stayType")?.focus(), 350);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hotelOpen) { setError("Accommodation booking services are temporarily unavailable."); return; }
    setError("");
    setSubmitted(false);

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/bookings", formData, { timeout: 10000 });
      if (response.data?.success) {
        setSubmitted(true);
        setFormData(initialForm);
      } else {
        setError(response.data?.message || "Your enquiry could not be submitted. Please try again.");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We could not reach the booking service. Please try again or contact the sanctuary team.");
    } finally {
      setLoading(false);
    }
  };

  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  const today = localDate.toISOString().slice(0, 10);

  return (
    <main className="stay-page min-h-screen bg-white text-[#333333]">
      <section className="relative isolate flex min-h-[540px] items-end overflow-hidden sm:min-h-[620px]">
        <img src={stayPhotos[0].src} alt={stayPhotos[0].alt} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/85 via-white/65 to-white/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/60 via-transparent to-white/10" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:pb-20 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#287A4B] sm:text-sm">A quieter kind of escape</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-[#183D2B] sm:text-6xl md:text-7xl">Stay Close <span className="text-[#287A4B]">to Nature</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#333333] sm:text-lg">Experience the Peace of the Forest. Send an enquiry and the team can confirm current stay details, rates and availability.</p>
          <a href="#stay-options" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#245C3B] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#347A50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">Explore Our Stay <span aria-hidden="true">↓</span></a>
          <p className="mt-5 text-xs text-[#46564b]">Illustrative accommodation photography; photos do not document the actual sanctuary property.</p>
          <StatusIndicator className="mt-5 border-[#E3EAE4] bg-white/90" />
          <div role="status" className={`mt-4 max-w-xl rounded-2xl border p-4 ${!hotelStatusLoaded ? "border-stone-200 bg-white/90 text-stone-700" : hotelOpen ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            {!hotelStatusLoaded ? <p className="text-sm font-semibold">Checking accommodation status…</p> : hotelStatusUnavailable ? <><p className="text-sm font-extrabold">STATUS UNAVAILABLE</p><p className="mt-1 text-sm">We can’t verify the accommodation status right now. Please check back later.</p></> : hotelOpen ? <><p className="text-sm font-extrabold">🟢 ACCOMMODATION ENQUIRIES OPEN</p><p className="mt-1 text-sm">The team will confirm details and availability. Enquiries do not confirm a booking.</p></> : <><p className="text-sm font-extrabold">🔴 TEMPORARILY CLOSED</p><p className="mt-1 text-sm">Accommodation booking services are temporarily unavailable. Please check back for future updates.</p></>}
          </div>
          <p className="mt-3 text-xs text-[#46564b]">Accommodation images are illustrative and do not represent currently available bookings.</p>
        </div>
      </section>

      <section className="bg-[#f3f5ef] py-16 text-[#17281f] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">A stay enquiry, made simple</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Let the forest set the pace.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#56645a]">Ratan Mahal’s website accepts enquiries for Hotel Room, Rest House and Group Booking requests. Choose an option to start; the team will confirm the current arrangements with you.</p>
            <p className="mt-4 text-sm leading-6 text-[#6a756c]">Photos and descriptions here are illustrative. No room capacity, facility, price or live availability is stated because those details are not configured in the booking data.</p>
          </div>
          <button type="button" onClick={() => setSelectedPhoto(1)} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-stone-200 text-left shadow-xl">
            <img src={stayPhotos[2].src} alt={stayPhotos[2].alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/35 bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur">{stayPhotos[2].caption}</span>
          </button>
        </div>
      </section>

      <section id="stay-options" className="bg-[#F7F9F6] py-16 text-[#333333] md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#287A4B]">Choose an enquiry type</p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-[#183D2B] sm:text-4xl md:text-5xl">A few ways to plan your stay</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#4E5B52]">These options match the existing booking system. Current details are confirmed by the team after your enquiry.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {stayOptions.map((option, index) => (
              <article key={option.type} className="group overflow-hidden rounded-2xl border border-[#E3EAE4] bg-white shadow-lg shadow-[#183D2B]/[0.08] transition duration-300 hover:-translate-y-1 hover:border-[#9CBBA4]">
                <button type="button" onClick={() => setSelectedPhoto(stayPhotos.findIndex((photo) => photo.src === option.image))} className="block aspect-[1.35/1] w-full overflow-hidden bg-[#142c23] text-left" aria-label={`View photo for ${option.title}`}>
                  <img src={option.image} alt={option.imageAlt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </button>
                <div className="p-6 sm:p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#287A4B]">Enquiry option 0{index + 1}</p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[#183D2B]">{option.title}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#4E5B52]">{option.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setSelectedStay(option)} className="rounded-full border border-[#245C3B] px-4 py-2.5 text-xs font-semibold text-[#245C3B] transition hover:bg-[#F7F9F6]">View Details</button>
                    <button type="button" disabled={!hotelOpen || !hotelStatusLoaded} onClick={() => chooseStay(option.type)} className="rounded-full bg-[#245C3B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#347A50] disabled:cursor-not-allowed disabled:opacity-50">Ask a question</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f5ef] py-16 text-[#17281f] md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">The surroundings</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">A little more green around your stay.</h2>
              <p className="mt-4 text-sm leading-6 text-[#56645a]">Browse the illustrative accommodation photographs. These stock images offer a sense of the stay; they do not depict the sanctuary property.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {stayPhotos.map((photo, index) => (
                <button key={photo.src} type="button" onClick={() => setSelectedPhoto(index)} className={`group relative overflow-hidden rounded-2xl bg-stone-200 text-left ${index === 0 ? "col-span-2 row-span-2 aspect-[2/1] lg:aspect-auto" : "aspect-[4/3]"}`} aria-label={`Open photo: ${photo.caption}`}>
                  <img src={photo.src} alt={photo.alt} loading={index < 4 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-left"><span className="block text-sm font-semibold text-white">{photo.caption}</span><span className="mt-1 block text-[11px] text-white/80">Illustrative stock photo</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="bg-white py-16 text-[#333333] md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#287A4B]">Booking enquiry</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#183D2B] sm:text-4xl md:text-5xl">Start planning your visit.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#4E5B52]">Send your preferred dates and stay type. This form submits an enquiry only; it does not check live availability or confirm a booking.</p>
            <div className="mt-8 space-y-3 border-l border-[#9CBBA4] pl-5 text-sm text-[#4E5B52]">
              <p>Ratan Mahal Wildlife Sanctuary, Gujarat, India</p>
              <a href="tel:+919510109200" className="block text-[#245C3B] hover:text-[#347A50]">+91 9510109200</a>
              <a href="mailto:yashrajpuvar442@gmail.com" className="block break-all text-[#245C3B] hover:text-[#347A50]">yashrajpuvar442@gmail.com</a>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ colorScheme: "light" }} className="rounded-3xl bg-[#f4f5f0] p-5 text-[#17281f] shadow-2xl sm:p-8 md:p-10">
            {(!hotelOpen || hotelStatusUnavailable) && hotelStatusLoaded && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">{hotelStatusUnavailable ? "The accommodation status could not be verified, so enquiries are paused for now." : "Accommodation enquiry submissions are paused while the stay is temporarily closed."}</div>}
            {submitted && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900" role="status">Your enquiry was received by the booking service. The team can follow up with current details.</div>}
            {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{error}</div>}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Full name <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="name" required autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Your name" /></label>
              <label className="text-sm font-semibold">Phone number <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="phone" type="tel" required autoComplete="tel" value={formData.phone} onChange={handleChange} placeholder="Your contact number" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Email address <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="email" type="email" required autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" /></label>
              <label className="text-sm font-semibold">Check-in <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="checkIn" type="date" min={today} required value={formData.checkIn} onChange={handleChange} /></label>
              <label className="text-sm font-semibold">Check-out <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="checkOut" type="date" min={formData.checkIn || today} required value={formData.checkOut} onChange={handleChange} /></label>
              <label className="text-sm font-semibold">Number of guests <span className="text-emerald-800">*</span><input className={`${fieldClass} mt-2`} name="guests" type="number" min="1" step="1" required value={formData.guests} onChange={handleChange} placeholder="Enter guest count" /></label>
              <label className="text-sm font-semibold">Stay type <span className="text-emerald-800">*</span><select id="stayType" className={`${fieldClass} mt-2`} name="stayType" required value={formData.stayType} onChange={handleChange}><option value="" disabled>Select a request type</option>{stayOptions.map((option) => <option key={option.type} value={option.type}>{option.type}</option>)}</select></label>
              <label className="text-sm font-semibold sm:col-span-2">Anything else the team should know?<textarea className={`${fieldClass} mt-2 min-h-32 resize-y`} name="message" rows="4" value={formData.message} onChange={handleChange} placeholder="Optional details for your enquiry" /></label>
            </div>
            <button type="submit" disabled={loading || !hotelStatusLoaded || !hotelOpen} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{!hotelStatusLoaded ? "Checking accommodation status…" : loading ? "Sending enquiry…" : hotelOpen ? "Send booking enquiry" : "Enquiries temporarily unavailable"}</button>
            <p className="mt-4 text-xs leading-5 text-[#68746a]">Your dates, guest count and preferred request type will be sent to the existing booking service. A response from the sanctuary team is needed to confirm arrangements.</p>
          </form>
        </div>
      </section>

      {selectedStay && <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedStay(null)} role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="stay-dialog-title" className="w-full max-w-xl overflow-hidden rounded-3xl bg-[#f3f5ef] text-[#17281f] shadow-2xl" onClick={(event) => event.stopPropagation()}><img src={selectedStay.image} alt={selectedStay.imageAlt} className="h-56 w-full object-cover sm:h-72" /><div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Enquiry option</p><h2 id="stay-dialog-title" className="mt-2 font-serif text-3xl font-semibold">{selectedStay.title}</h2><p className="mt-4 text-sm leading-6 text-[#56645a]">{selectedStay.summary} Current facilities, pricing, occupancy and availability should be confirmed directly with the team.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => chooseStay(selectedStay.type)} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">Enquire about this option</button><button type="button" onClick={() => setSelectedStay(null)} className="rounded-full border border-stone-400 px-5 py-3 text-sm font-semibold">Close</button></div></div></section></div>}

      {selectedPhoto !== null && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)} role="dialog" aria-modal="true" aria-label="Stay photo gallery"><button type="button" className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-sm text-white" onClick={() => setSelectedPhoto(null)} aria-label="Close photo">Close ×</button><button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-3xl text-white sm:left-6" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto - 1 + stayPhotos.length) % stayPhotos.length); }} aria-label="Previous photo">‹</button><figure className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}><img src={stayPhotos[selectedPhoto].src} alt={stayPhotos[selectedPhoto].alt} className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl object-contain" /><figcaption className="mt-3 text-center"><span className="block text-sm font-medium text-white">{stayPhotos[selectedPhoto].caption}</span><span className="mt-1 block text-xs text-white/80">Illustrative stock photo · <a href={stayPhotos[selectedPhoto].source} target="_blank" rel="noreferrer" className="underline underline-offset-4">{stayPhotos[selectedPhoto].credit}</a></span></figcaption></figure><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-3xl text-white sm:right-6" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % stayPhotos.length); }} aria-label="Next photo">›</button></div>}
    </main>
  );
}

export default Stay;
