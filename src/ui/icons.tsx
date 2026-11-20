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

export const FileIcon = () => (
  <Icon>
    <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" />
    <path d="M13.5 3.5v5h5" />
  </Icon>
);

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4.5-4.5" />
  </Icon>
);

export const PencilIcon = () => (
  <Icon>
    <path d="M4.5 19.5l1-4.5L16 4.5a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L9 18.5z" />
    <path d="M14 6.5l3.5 3.5" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v5.5M14 10.5v5.5" />
  </Icon>
);
