import SiteImage from "./SiteImage";

import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { StatusIndicator } from "./SanctuaryStatus";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Posts", path: "/posts" },
  { name: "Gallery", path: "/gallery" },
  { name: "Videos", path: "/videos" },
  { name: "Hotel", path: "/stay" },
  { name: "Contact", path: "/contact" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // Listen for login/logout changes
  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")) || null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("authChanged", updateUser);

    return () => {
      window.removeEventListener("authChanged", updateUser);
    };
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    setIsMenuOpen(false);
    navigate("/");
  };

  const activeClass = ({ isActive }) =>
  `relative transition hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${
      isActive ? "text-emerald-800 after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-emerald-700" : "text-[#333333]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3EAE4] bg-white/95 shadow-sm shadow-[#183D2B]/5 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#245C3B]/25 bg-[#245C3B]/10 text-xl text-[#245C3B]">
            🐻
          </div>

          <div>
            <h1 className="text-base font-bold leading-none text-[#183D2B]">
              Ratan Mahal
            </h1>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#245C3B]">
              Wildlife Bear Sanctuary
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 text-sm font-medium xl:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={activeClass}
            >
              {link.name}
            </NavLink>
          ))}

          <StatusIndicator compact />

          <Link
            to="/stay"
            className="rounded-md bg-[#245C3B] px-4 py-2 font-semibold text-white transition hover:bg-[#347A50]"
          >
            Book Stay
          </Link>

          {/* Login / Profile */}
          {user ? (
            <div className="flex items-center gap-3">
              <SiteImage
                src={user.picture || "https://placehold.co/40"}
                alt="Profile"
                className="h-9 w-9 rounded-full border border-green-400 object-cover"
              />

              <span className="max-w-28 truncate text-white">
                {user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-red-400 px-3 py-2 text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-[#245C3B] px-4 py-2 font-semibold text-white transition hover:bg-[#347A50]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="text-2xl text-[#183D2B] xl:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </nav>

      <div className="border-t border-stone-100 px-5 pb-3 pt-2 xl:hidden">
        <StatusIndicator compact />
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-[#E3EAE4] bg-white px-5 py-5 shadow-lg xl:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium">



            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={activeClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/stay"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 w-fit rounded-md bg-[#245C3B] px-4 py-2 font-semibold text-white"
            >
              Book Hotel
            </Link>

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <SiteImage
                    src={user.picture || "https://placehold.co/40"}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border border-green-400 object-cover"
                  />

                  <span className="text-white">
                    {user.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-fit rounded-md bg-red-500 px-4 py-2 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-fit rounded-md bg-[#245C3B] px-4 py-2 text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
