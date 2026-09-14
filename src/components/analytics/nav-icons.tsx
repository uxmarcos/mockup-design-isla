/** Hugeicons-style nav icons (16px grid), inheriting currentColor. */
type P = { className?: string };

const base = {
  viewBox: "0 0 16 16",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

export function HomeIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M2.33 6.4 8 2l5.67 4.4V13a1 1 0 0 1-1 1H3.33a1 1 0 0 1-1-1V6.4Z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.33 14V9.33h3.34V14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LeadBoardIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M2.5 3.03h11c.124 0 .243.05.331.138.088.088.138.207.138.331V11c0 .257-.103.503-.284.685a.969.969 0 0 1-.685.284h-2.5a.969.969 0 0 1-.685-.284A.969.969 0 0 1 9.53 11V9.97H6.47V13c0 .257-.103.503-.284.685a.969.969 0 0 1-.685.284H3a.969.969 0 0 1-.685-.284A.969.969 0 0 1 2.03 13V3.5c0-.124.05-.243.138-.331A.469.469 0 0 1 2.5 3.03Zm.469 10h2.562V7.97H2.97v5.06Zm7.5-2h2.562V7.97h-2.562v3.06Zm-4 -2h3.062V3.97H6.47v5.06Zm-3.5-2h2.562V3.97H2.97v3.06Zm7.5 0h2.562V3.97h-2.562v3.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M10.67 1.33V4M5.33 1.33V4M2 6.67h12M3.33 2.67h9.34c.736 0 1.333.597 1.333 1.333v9.333c0 .737-.597 1.334-1.333 1.334H3.333A1.333 1.333 0 0 1 2 13.333V4c0-.736.597-1.333 1.333-1.333Z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M12 13.33V6.67M8 13.33V2.67M4 13.33V9.33"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GraphIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M7.67 7.67 4.33 9.33M12 4.67 9.67 6.67M6.67 4 8 6M6.67 12.33 4.33 10.67" />
      </g>
      <g fill="currentColor">
        <circle cx="3.07" cy="10.11" r="1.6" />
        <circle cx="5.88" cy="3.09" r="1.6" />
        <circle cx="8" cy="12.93" r="1.6" />
        <circle cx="8.7" cy="7.3" r="1.6" />
        <circle cx="12.9" cy="3.83" r="1.6" />
      </g>
    </svg>
  );
}

export function CreateContentIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M1.94 11.67 3.56 2.48a1.33 1.33 0 0 1 1.54-1.08l7.88 1.39a1.33 1.33 0 0 1 1.08 1.54l-1.62 9.19a1.33 1.33 0 0 1-1.54 1.08l-7.88-1.39a1.33 1.33 0 0 1-1.08-1.54Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="m5.95 4.25 5.26.93M5.49 6.88l5.25.93M5.03 9.51l3.28.58"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CommentsIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M1.33 14.67V2.67c0-.367.13-.68.392-.942.26-.261.574-.392.941-.392h10.667c.366 0 .68.13.941.392.261.26.392.575.392.942v8c0 .366-.13.68-.392.941a1.28 1.28 0 0 1-.941.392H4l-2.67 2.667Zm2.1-4h9.9v-8H2.67v8.75l.763-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path
        d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.93 10a1.33 1.33 0 0 0 .27 1.53l.04.04a1.33 1.33 0 1 1-1.89 1.89l-.04-.04a1.33 1.33 0 0 0-2.25.94V14a1.33 1.33 0 1 1-2.67 0v-.06a1.33 1.33 0 0 0-.87-1.21 1.33 1.33 0 0 0-1.47.28l-.04.04a1.33 1.33 0 1 1-1.89-1.89l.04-.04a1.33 1.33 0 0 0-.29-1.47A1.33 1.33 0 0 0 2 9.39H2a1.33 1.33 0 1 1 0-2.67h.06a1.33 1.33 0 0 0 1.21-.87 1.33 1.33 0 0 0-.28-1.47l-.04-.04a1.33 1.33 0 1 1 1.89-1.89l.04.04a1.33 1.33 0 0 0 1.47.29H6a1.33 1.33 0 0 0 .8-1.22V2a1.33 1.33 0 1 1 2.67 0v.06a1.33 1.33 0 0 0 2.07.79l.04-.04a1.33 1.33 0 1 1 1.89 1.89l-.04.04a1.33 1.33 0 0 0-.28 1.47v.06a1.33 1.33 0 0 0 1.21.79H14a1.33 1.33 0 1 1 0 2.67h-.06a1.33 1.33 0 0 0-1.21.8Z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
