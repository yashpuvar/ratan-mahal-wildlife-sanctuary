const shapes = {
  search: <><circle cx="11" cy="11" r="7.5"/><path d="m16.5 16.5 4 4"/></>,
  "arrow-right": <><path d="M4 12h16"/><path d="m13 5 7 7-7 7"/></>,
  "arrow-left": <><path d="M20 12H4"/><path d="m11 5-7 7 7 7"/></>,
  refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 17.2 6.4L20 12M4 12l2.8 5.6A7 7 0 0 0 18.4 15"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h8"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4"/></>,
};

function UiIcon({ name, size = 20, className = "", ...props }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {shapes[name] || null}
    </svg>
  );
}

export default UiIcon;
