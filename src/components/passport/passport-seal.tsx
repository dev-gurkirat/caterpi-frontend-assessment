type PassportSealProps = {
  size?: number;
  className?: string;
};

export function PassportSeal({ size = 72, className }: PassportSealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M36 4 66 21v30L36 68 6 51V21L36 4Z"
        fill="#0B6B64"
      />
      <path
        d="M36 12 58 24.5v23L36 60 14 47.5v-23L36 12Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
      />
      <path
        d="M28 42V28.5h9.4c3.2 0 5.3 1.8 5.3 4.4 0 2.6-2.1 4.4-5.3 4.4H28Zm0 0V44.8h11"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
