/* SVG logo as a standalone file — also used as favicon source */

export function ChatterbotLogo({ size = 36, showText = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Chatterbot logo"
    >
      {/* Background rounded square */}
      <rect width="48" height="48" rx="12" fill="url(#cb-grad)" />

      {/* Speech bubble body */}
      <path
        d="M10 14C10 11.8 11.8 10 14 10H34C36.2 10 38 11.8 38 14V28C38 30.2 36.2 32 34 32H26L20 38V32H14C11.8 32 10 30.2 10 28V14Z"
        fill="white"
        fillOpacity="0.18"
      />
      <path
        d="M10 14C10 11.8 11.8 10 14 10H34C36.2 10 38 11.8 38 14V28C38 30.2 36.2 32 34 32H26L20 38V32H14C11.8 32 10 30.2 10 28V14Z"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Three dots — typing indicator / chat signal */}
      <circle cx="18" cy="21" r="2.5" fill="white" />
      <circle cx="24" cy="21" r="2.5" fill="white" fillOpacity="0.75" />
      <circle cx="30" cy="21" r="2.5" fill="white" fillOpacity="0.5" />

      {/* Red accent dot on top-right — alert/safety signal */}
      <circle cx="36" cy="12" r="5" fill="#C8102E" />
      <path d="M34.5 12h3M36 10.5v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      <defs>
        <linearGradient id="cb-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#003380" />
          <stop offset="100%" stopColor="#00205B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default ChatterbotLogo
