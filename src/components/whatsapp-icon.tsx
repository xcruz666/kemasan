export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.45L3 20.5l1.34-4.76A8.5 8.5 0 1 1 20.5 11.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 7.4c.2-.3.6-.3.8 0l1 2c.1.2.1.4-.1.6l-.6.7c.7 1.4 1.7 2.4 3.1 3.1l.8-.9c.2-.2.4-.2.6-.1l2 1c.3.2.4.4.2.7-.5 1-1.3 1.5-2.4 1.3-3.4-.8-5.9-3.2-6.7-6.5-.2-.8.4-1.5 1.3-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}
