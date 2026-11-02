import SiteImage from "../components/SiteImage";
import { Link } from "react-router-dom";
import { getBearPhoto } from "../lib/bearPhotos";

const values = [
  { number: "01", title: "Sloth bear awareness", description: "Make space for the Indian sloth bear’s story through clear, respectful wildlife information." },
  { number: "02", title: "Forest care", description: "Encourage respect for the forests, hills and natural habitats that sustain wildlife." },
  { number: "03", title: "Responsible visits", description: "Help visitors seek current guidance and follow local sanctuary rules when planning a visit." },
];

function About() {
  const hero = getBearPhoto(0);
  const forestPhoto = getBearPhoto(3);

  return (
    <main className="bg-[#071b16] text-white">
      <section className="relative isolate flex min-h-[430px] items-end overflow-hidden md:min-h-[540px]">
        <SiteImage src={hero.src} alt={hero.alt} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061711]/90 via-[#061711]/55 to-[#061711]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061711]/80 to-transparent" />
        <div className="photo-copy mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-8 md:pb-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">The sanctuary and its story</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight md:text-6xl">About Ratan Mahal <span className="text-emerald-300">Wildlife Sanctuary</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 md:text-lg">A forest and hill landscape in Gujarat, with the Indian sloth bear at the heart of this website’s wildlife focus.</p>
          <p className="mt-4 text-xs text-white/70">Illustrative wildlife photography; this image was not taken at Ratan Mahal.</p>
        </div>
      </section>

      <section className="bg-[#f3f5ef] py-16 text-[#17281f] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <SiteImage src={forestPhoto.src} alt={forestPhoto.alt} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
            <p className="photo-copy absolute bottom-4 left-4 rounded-full bg-black/55 px-4 py-2 text-xs text-white backdrop-blur">Illustrative sloth bear photograph</p>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Our focus</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">Protecting wildlife begins with understanding it.</h2>
            <p className="mt-5 text-base leading-7 text-[#56645a]">Ratan Mahal Wildlife Sanctuary is in Gujarat. This website brings together information about the sanctuary, the surrounding forest landscape and the Indian sloth bear.</p>
            <p className="mt-4 text-base leading-7 text-[#56645a]">We aim to encourage curiosity, care for wildlife habitats and responsible planning. For current visiting arrangements and guidance, please contact the local team before travelling.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/gallery" className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900">Explore the gallery</Link>
              <Link to="/contact" className="rounded-full border border-[#aeb9ad] px-6 py-3 text-sm font-bold text-[#17281f] transition hover:bg-white">Contact the team</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a211a] py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 text-center md:grid-cols-4 md:px-8">
          {["Gujarat", "Wildlife sanctuary", "Indian sloth bear", "Forest landscape"].map((item, index) => <div key={item} className="rounded-2xl border border-[#E3EAE4] bg-white px-3 py-5 shadow-sm"><span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">0{index + 1}</span><p className="mt-2 text-sm font-semibold text-[#183D2B] sm:text-base">{item}</p></div>)}
        </div>
      </section>

      <section className="bg-[#f3f5ef] py-16 text-[#17281f] md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">What guides us</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Care, context and respect.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {values.map((value) => <article key={value.number} className="rounded-2xl border border-[#dfe5dc] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"><p className="text-xs font-bold tracking-[0.2em] text-emerald-800">{value.number}</p><h3 className="mt-5 font-serif text-2xl font-semibold">{value.title}</h3><p className="mt-3 text-sm leading-6 text-[#56645a]">{value.description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#071b16] px-5 py-16 text-center md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Explore responsibly</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-serif text-3xl font-semibold md:text-5xl">Learn about the bears. Plan with care.</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-300">Browse wildlife stories and photographs, or contact the team for current visitor information.</p>
        <Link to="/contact" className="mt-8 inline-flex rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-[#092019] transition hover:bg-emerald-300">Get in touch</Link>
      </section>
    </main>
  );
}

export default About;
