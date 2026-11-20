import type { ReactNode } from 'react';

function Icon({
  children,
  size = 22,
  filled = false,
}: {
  children: ReactNode;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Icon size={28} filled>
    <path d="M8 5l11 7-11 7z" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon size={28} filled>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </Icon>
);

export const RestartIcon = () => (
  <Icon>
    <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5" />
  </Icon>
);

export const RewindIcon = () => (
  <Icon>
    <path d="M11 18l-6-6 6-6M19 18l-6-6 6-6" />
  </Icon>
);

export const ForwardIcon = () => (
  <Icon>
    <path d="M13 6l6 6-6 6M5 6l6 6-6 6" />
  </Icon>
);

export const ExpandIcon = () => (
  <Icon size={20}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
);

export const CollapseIcon = () => (
  <Icon size={20}>
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </Icon>
);

export const ArrowRightIcon = () => (
  <Icon size={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const FileIcon = () => (
  <Icon size={20}>
    <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" />
    <path d="M13.5 3.5v5h5" />
  </Icon>
);

export const SearchIcon = () => (
  <Icon size={20}>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4.5-4.5" />
  </Icon>
);

export const PencilIcon = () => (
  <Icon size={20}>
    <path d="M4.5 19.5l1-4.5L16 4.5a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L9 18.5z" />
    <path d="M14 6.5l3.5 3.5" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon size={20}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v5.5M14 10.5v5.5" />
  </Icon>
);

/* The pictures on the home page's tool cards. */

export const ReaderToolIcon = () => (
  <Icon size={32}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M12 6v3M12 15v3" />
  </Icon>
);

export const LibraryToolIcon = () => (
  <Icon size={32}>
    <path
      d="M5 4.5h4v15H5zM10.5 4.5h4v15h-4zM16.2 6.2l3.6-1 3 13.3-3.6 1z"
      transform="translate(-1.5 0)"
    />
  </Icon>
);

export const SettingsToolIcon = () => (
  <Icon size={32}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </Icon>
);

export const DrillsToolIcon = () => (
  <Icon size={32}>
    <path d="M4 7h16M4 12h10M4 17h13" />
    <path d="M18 10l3 2-3 2" />
  </Icon>
);

export const ProgressToolIcon = () => (
  <Icon size={32}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icon>
);
