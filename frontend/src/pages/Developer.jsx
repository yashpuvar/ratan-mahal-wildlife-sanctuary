import { Link } from "react-router-dom";
import "./Developer.css";

const email = "yashrajpuvar442@gmail.com";
const linkedInUrl = "https://www.linkedin.com/in/yashraj-puvar-412a43362/";
const configuredLinks = {
  linkedin: linkedInUrl,
  github: import.meta.env.VITE_DEVELOPER_GITHUB_URL?.trim(),
  portfolio: import.meta.env.VITE_DEVELOPER_PORTFOLIO_URL?.trim(),
};
const whatsappPhone = (import.meta.env.VITE_DEVELOPER_WHATSAPP_PHONE || "").replace(/\D/g, "");

const skillGroups = [
  { title: "Frontend Development", skills: ["HTML", "CSS", "JavaScript", "React.js"] },
  { title: "Backend Development", skills: ["Node.js", "Express.js", "MongoDB", "MERN Stack"] },
  { title: "AI & Data", skills: ["AI-ML", "Data Analytics"] },
];

const contactOptions = [
  { label: "Connect on LinkedIn", key: "linkedin", detail: "Professional profile" },
  { label: "View GitHub", key: "github", detail: "Code and repositories" },
  { label: "View Portfolio", key: "portfolio", detail: "Selected work" },
];

function Developer() {
  const inquiry = `mailto:${email}?subject=${encodeURIComponent("Project inquiry")}`;

  return (
    <main className="developer-page">
      <section className="developer-hero" aria-labelledby="developer-heading">
        <div className="developer-hero__inner">
          <div className="developer-intro">
            <p className="developer-eyebrow"><span aria-hidden="true" className="developer-eyebrow__dot" />Technology <span>•</span> Creativity <span>•</span> Innovation</p>
            <h1 id="developer-heading" className="developer-heading">Meet the <span>Developer</span></h1>
            <p className="developer-name">Yashraj Puvar</p>
            <p className="developer-role">Full Stack Developer <span aria-hidden="true">|</span> AI-ML Enthusiast</p>
            <p className="developer-description">I am a passionate Full Stack Developer and AI-ML enthusiast interested in building modern, responsive and user-friendly web applications. I enjoy solving real-world problems through technology and continuously improving my development skills.</p>
            <div className="developer-education"><EducationIcon /><span>MCA – AI-ML Specialization</span></div>
            <div className="developer-actions">
              <a href={`mailto:${email}`} className="developer-button developer-button--primary">Contact Me <ArrowIcon /></a>
              <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" aria-label="Connect with Yashraj Puvar on LinkedIn (opens in a new tab)" className="developer-button developer-button--linkedin"><LinkedInIcon />Connect on LinkedIn</a>
              <a href={inquiry} className="developer-button developer-button--outline">Let’s Work Together <ArrowIcon /></a>
            </div>
          </div>

          <div className="developer-profile-wrap">
            <div className="developer-profile-card">
              <div className="developer-profile-card__top"><span className="developer-card-label">Developer profile</span><span className="developer-tag">MCA <i>•</i> AI-ML</span></div>
              <div className="developer-monogram" aria-label="YP monogram"><span>YP</span></div>
              <div className="developer-profile-card__identity"><h2>Yashraj Puvar</h2><p>Full Stack Developer <span>·</span> AI-ML Enthusiast</p></div>
              <div className="developer-profile-card__bottom"><span><WebIcon />Building for the web</span><span><LocationIcon />India</span></div>
            </div>
            <p className="developer-profile-note">YP monogram profile · No personal photograph provided</p>
          </div>
        </div>
      </section>

      <section className="developer-skills" aria-labelledby="skills-heading">
        <div className="developer-section-inner">
          <div className="developer-section-heading"><p className="developer-section-label"><SparkIcon />Technical toolkit</p><h2 id="skills-heading">Skills for thoughtful solutions</h2><p>A growing toolkit across web development, AI and data.</p></div>
          <div className="developer-skill-grid">
            {skillGroups.map((group, index) => <article key={group.title} className="developer-skill-card">
              <span className="developer-skill-card__number">0{index + 1}</span><h3>{group.title}</h3>
              <div className="developer-skill-card__badges">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="developer-contact" aria-labelledby="contact-heading">
        <div className="developer-section-inner developer-contact__inner">
          <div className="developer-contact__intro"><p className="developer-section-label"><MailIcon />Start a conversation</p><h2 id="contact-heading">Have a project in mind?</h2><p>For website development, full stack applications or software project inquiries, get in touch by email.</p><a href={inquiry} className="developer-button developer-button--primary">Let’s Work Together <ArrowIcon /></a></div>
          <div className="developer-contact-grid">
            <a href={`mailto:${email}`} className="developer-contact-card"><span className="developer-contact-card__icon"><MailIcon /></span><span className="developer-contact-card__label">Email me</span><span className="developer-contact-card__value">{email}</span></a>
            {contactOptions.map(({ label, key, detail }) => configuredLinks[key]
              ? <a key={key} href={configuredLinks[key]} target="_blank" rel="noopener noreferrer" className="developer-contact-card"><span className="developer-contact-card__icon">{key === "linkedin" ? <LinkedInIcon /> : <ArrowIcon />}</span><span className="developer-contact-card__label">{label}</span><span className="developer-contact-card__value">{detail} <span aria-hidden="true">↗</span></span></a>
              : <div key={key} className="developer-contact-card developer-contact-card--pending"><span className="developer-contact-card__icon"><ArrowIcon /></span><span className="developer-contact-card__label">{label}</span><span className="developer-contact-card__value">Profile link not configured</span></div>)}
            {whatsappPhone && <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noreferrer" className="developer-contact-card"><span className="developer-contact-card__icon"><ChatIcon /></span><span className="developer-contact-card__label">WhatsApp me</span><span className="developer-contact-card__value">Start a conversation ↗</span></a>}
          </div>
        </div>
        <div className="developer-back"><Link to="/">← Back to Ratan Mahal Wildlife Sanctuary</Link></div>
      </section>
    </main>
  );
}

function ArrowIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function EducationIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="developer-icon"><path d="m3 9 9-5 9 5-9 5-9-5Zm4 2.2v5.1c2.8 2.4 7.2 2.4 10 0v-5.1M21 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function WebIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><rect x="2.2" y="3" width="15.6" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2.8 7h14.4M6 5h.1m2.3 0h.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function LocationIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><path d="M16 8.5c0 4.1-6 9-6 9s-6-4.9-6-9a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>; }
function SparkIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><path d="m10 2 1.6 5.2L17 9l-5.4 1.8L10 16l-1.7-5.2L3 9l5.3-1.8L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="m16 13 .8 2.2L19 16l-2.2.8L16 19l-.8-2.2L13 16l2.2-.8L16 13Z" fill="currentColor" /></svg>; }
function MailIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><rect x="2.2" y="4" width="15.6" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="m3 5 7 5.5L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ChatIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="developer-icon"><path d="M17 9.5a6.8 6.8 0 0 1-7 6.5 7.7 7.7 0 0 1-3-.6L3 17l1.3-3.2A6.2 6.2 0 0 1 3 9.5 6.8 6.8 0 0 1 10 3a6.8 6.8 0 0 1 7 6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
function LinkedInIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="developer-icon"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.02-.19c-1.28 0-2.15.7-2.5 1.36V10h-2.67v8h2.67v-4.23c0-1.11.21-2.19 1.59-2.19 1.36 0 1.38 1.27 1.38 2.26V18h2.67v-4.69c0-2.31-.5-3.5-3.14-3.5ZM7 6.13a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z" /></svg>; }

export default Developer;
