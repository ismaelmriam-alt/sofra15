import { Link } from 'react-router-dom';

export function CedarMark({ size = 30, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3 L31 15 H27.5 L35 26 H30 L38 38 H26 V45 H22 V38 H10 L18 26 H13 L20.5 15 H17 Z" fill={color} />
      <path d="M24 3 V38" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" />
    </svg>
  );
}

// Custom SOFRA wordmark: cedar tree replaces nothing — it stands beside the lettering.
export default function Logo({ light = false, to = '/' }) {
  const color = light ? '#F8F4EB' : '#285B40';
  return (
    <Link to={to} className="logo" aria-label="SOFRA home" style={{ color }}>
      <CedarMark size={30} color={light ? '#F8F4EB' : '#285B40'} />
      <span className="logo-word">
        <span>SOFRA</span>
        <small>Lebanese Table</small>
      </span>
    </Link>
  );
}
