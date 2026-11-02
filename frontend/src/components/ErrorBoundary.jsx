import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep the detailed stack available for developers while showing visitors
    // a simple recovery screen instead of a blank document.
    console.error("Uncaught application render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#071b16] px-5 py-16 text-white">
          <section className="max-w-lg rounded-3xl border border-white/10 bg-[#102920] p-8 text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Ratan Mahal Wildlife Sanctuary</p>
            <h1 className="mt-4 font-serif text-3xl font-semibold">This page needs a moment</h1>
            <p className="mt-3 text-sm leading-6 text-stone-300">An unexpected issue interrupted this page. You can reload the site or return to the home page.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-[#082019] transition hover:bg-emerald-300">Reload page</button>
              <a href="/" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300 hover:text-emerald-200">Home</a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
