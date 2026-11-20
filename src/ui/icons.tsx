import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Icon>
    <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon>
    <path d="M8.5 6v12M15.5 6v12" strokeWidth="3" />
  </Icon>
);

export const RestartIcon = () => (
  <Icon>
    <path d="M4 12a8 8 0 1 0 2.6-5.9" />
    <path d="M4 4.5V9h4.5" />
  </Icon>
);

export const BackSentenceIcon = () => (
  <Icon>
    <path d="M18.5 6.5v11L10 12z" fill="currentColor" />
    <path d="M6 6.5v11" />
  </Icon>
);

export const ForwardSentenceIcon = () => (
  <Icon>
    <path d="M5.5 6.5v11L14 12z" fill="currentColor" />
    <path d="M18 6.5v11" />
  </Icon>
);

export const MinusIcon = () => (
  <Icon>
    <path d="M6 12h12" />
  </Icon>
);

export const PlusIcon = () => (
  <Icon>
    <path d="M6 12h12M12 6v12" />
  </Icon>
);

export const ArrowLeftIcon = () => (
  <Icon>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Icon>
);

export const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Icon>
);

export const MoonIcon = () => (
  <Icon>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
  </Icon>
);
