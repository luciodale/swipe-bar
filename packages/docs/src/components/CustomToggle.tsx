export function CustomToggle() {
  return (
    <div
      className="rounded-full bg-slate-800 border border-white/20 text-white
				shadow-lg hover:bg-slate-700 transition-colors
				w-10 h-10 flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
