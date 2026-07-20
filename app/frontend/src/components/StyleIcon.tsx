/**
 * Unified watercolor-style glyphs for gestures, achievements, and chrome UI.
 * Replaces system emoji so the product stays visually cohesive.
 */

export type StyleIconKind =
  // gestures
  | 'tap' | 'swipe' | 'longpress' | 'circle' | 'pinch'
  | 'combo_burst' | 'combo_compress' | 'combo_bridge'
  // achievements / discoveries
  | 'firework' | 'petal' | 'hourglass' | 'trail' | 'link'
  | 'hand' | 'star' | 'spark' | 'maple' | 'snow' | 'calendar'
  | 'trophy' | 'share' | 'level' | 'owl' | 'nebula' | 'breath'
  | 'garden' | 'lock' | 'melody' | 'streak' | 'gift' | 'seasons'
  | 'unknown';

interface StyleIconProps {
  kind: StyleIconKind;
  size?: number;
  color?: string;
  muted?: boolean;
  className?: string;
  title?: string;
}

function soft(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  if (full.length < 6) return `rgba(200,190,210,${a})`;
  const r = parseInt(full.slice(0, 2), 16) || 180;
  const g = parseInt(full.slice(2, 4), 16) || 170;
  const b = parseInt(full.slice(4, 6), 16) || 190;
  return `rgba(${r},${g},${b},${a})`;
}

const DEFAULT_COLOR: Record<StyleIconKind, string> = {
  tap: '#D4B8C8',
  swipe: '#B8C8D8',
  longpress: '#D0B890',
  circle: '#B0A8D0',
  pinch: '#C0B0C8',
  combo_burst: '#D4A090',
  combo_compress: '#C8B070',
  combo_bridge: '#A8C0D0',
  firework: '#D4A8B0',
  petal: '#D4A0B0',
  hourglass: '#C8B8A0',
  trail: '#B8C0D8',
  link: '#A8B8C8',
  hand: '#C8B8C0',
  star: '#D4C890',
  spark: '#C8B878',
  maple: '#C88060',
  snow: '#A8C0D0',
  calendar: '#B0B8C8',
  trophy: '#D0B870',
  share: '#B0C0C8',
  level: '#B8A8D0',
  owl: '#A898B0',
  nebula: '#A090C0',
  breath: '#A8C0B8',
  garden: '#90B898',
  lock: '#9090A0',
  melody: '#C0A8C8',
  streak: '#D09070',
  gift: '#C8A0B0',
  seasons: '#B8B0A0',
  unknown: '#B0A8B0',
};

function Glyph({ kind, color }: { kind: StyleIconKind; color: string }) {
  const c = color;
  const c2 = soft(c, 0.5);
  const ink = soft(c, 0.88);

  switch (kind) {
    case 'tap':
      return (
        <g>
          <circle cx="12" cy="12" r="4.5" fill={c2} />
          <circle cx="12" cy="12" r="2" fill={ink} opacity="0.7" />
          {[0, 72, 144, 216, 288].map((d) => {
            const a = ((d - 90) * Math.PI) / 180;
            return (
              <line
                key={d}
                x1={12 + Math.cos(a) * 6}
                y1={12 + Math.sin(a) * 6}
                x2={12 + Math.cos(a) * 9}
                y2={12 + Math.sin(a) * 9}
                stroke={ink}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.65"
              />
            );
          })}
        </g>
      );
    case 'swipe':
    case 'trail':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round">
          <path d="M5 16 C8 10 12 8 19 6" />
          <path d="M15 5 L19 6 L17 9.5" />
          <path d="M6 18 C9 14 13 12 17 11" opacity="0.45" />
        </g>
      );
    case 'longpress':
    case 'hourglass':
      return (
        <g>
          <path d="M8 5 H16 L13 12 L16 19 H8 L11 12 Z" fill={c2} stroke={ink} strokeWidth="1" />
          <ellipse cx="12" cy="12" rx="1.5" ry="1" fill={ink} opacity="0.5" />
        </g>
      );
    case 'circle':
    case 'nebula':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round">
          <ellipse cx="12" cy="12" rx="7" ry="4.5" transform="rotate(-20 12 12)" opacity="0.85" />
          <ellipse cx="12" cy="12" rx="5" ry="3" transform="rotate(30 12 12)" opacity="0.55" />
          <circle cx="12" cy="12" r="1.6" fill={c2} stroke="none" />
        </g>
      );
    case 'pinch':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
          <path d="M7 9 C5 11 5 14 7 16" />
          <path d="M17 9 C19 11 19 14 17 16" />
          <circle cx="9" cy="12" r="1.4" fill={c2} stroke="none" />
          <circle cx="15" cy="12" r="1.4" fill={c2} stroke="none" />
        </g>
      );
    case 'combo_burst':
    case 'firework':
      return (
        <g>
          <circle cx="12" cy="13" r="3" fill={c2} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
            const a = (d * Math.PI) / 180;
            return (
              <line
                key={d}
                x1={12 + Math.cos(a) * 4}
                y1={13 + Math.sin(a) * 4}
                x2={12 + Math.cos(a) * 8.5}
                y2={13 + Math.sin(a) * 8.5}
                stroke={ink}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}
        </g>
      );
    case 'combo_compress':
    case 'spark':
      return (
        <g>
          <path d="M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10 Z" fill={c2} stroke={ink} strokeWidth="0.8" />
        </g>
      );
    case 'combo_bridge':
    case 'link':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round">
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="16" cy="12" r="3.2" />
          <line x1="10.5" y1="12" x2="13.5" y2="12" />
        </g>
      );
    case 'petal':
      return (
        <g>
          <ellipse cx="12" cy="12" rx="4" ry="7" fill={c2} transform="rotate(-18 12 12)" />
          <ellipse cx="12" cy="12" rx="2" ry="4" fill={ink} opacity="0.4" transform="rotate(-18 12 12)" />
        </g>
      );
    case 'hand':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 20 V11" />
          <path d="M12 20 V8" />
          <path d="M15 20 V11" />
          <path d="M7.5 14 C6 14 5.5 16 7 17.5" />
          <path d="M9 11 C9 8 12 7 12 8" />
        </g>
      );
    case 'star':
      return (
        <g>
          <path
            d="M12 4 L13.5 9.5 L19 10 L14.5 13.5 L16 19 L12 15.8 L8 19 L9.5 13.5 L5 10 L10.5 9.5 Z"
            fill={c2}
            stroke={ink}
            strokeWidth="0.7"
          />
        </g>
      );
    case 'maple':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((d) => (
            <ellipse key={d} cx="12" cy="7.5" rx="1.8" ry="4.5" fill={c2} transform={`rotate(${d} 12 12)`} />
          ))}
          <path d="M12 14 V19" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'snow':
      return (
        <g stroke={ink} strokeWidth="1.3" strokeLinecap="round" fill="none">
          {[0, 60, 120].map((d) => (
            <g key={d} transform={`rotate(${d} 12 12)`}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="12" y1="7.5" x2="10.2" y2="9" />
              <line x1="12" y1="7.5" x2="13.8" y2="9" />
            </g>
          ))}
        </g>
      );
    case 'calendar':
    case 'seasons':
      return (
        <g>
          <rect x="5" y="6" width="14" height="13" rx="2" fill={c2} stroke={ink} strokeWidth="1" />
          <line x1="5" y1="10" x2="19" y2="10" stroke={ink} strokeWidth="1" opacity="0.5" />
          <line x1="9" y1="4.5" x2="9" y2="7.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="15" y1="4.5" x2="15" y2="7.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
          {kind === 'seasons' && (
            <>
              <circle cx="9" cy="14" r="1.2" fill={ink} opacity="0.45" />
              <circle cx="12" cy="14" r="1.2" fill={ink} opacity="0.55" />
              <circle cx="15" cy="14" r="1.2" fill={ink} opacity="0.45" />
            </>
          )}
        </g>
      );
    case 'trophy':
      return (
        <g>
          <path d="M8 6 H16 V11 C16 14 13.5 15.5 12 15.5 C10.5 15.5 8 14 8 11 Z" fill={c2} stroke={ink} strokeWidth="1" />
          <path d="M8 8 H5.5 C5 8 5 11 7 11" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d="M16 8 H18.5 C19 8 19 11 17 11" fill="none" stroke={ink} strokeWidth="1.2" />
          <rect x="10.5" y="15.5" width="3" height="2.5" fill={ink} opacity="0.55" />
          <rect x="8.5" y="18" width="7" height="1.5" rx="0.5" fill={c2} />
        </g>
      );
    case 'share':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="7" cy="12" r="2.2" fill={c2} />
          <circle cx="17" cy="7" r="2.2" fill={c2} />
          <circle cx="17" cy="17" r="2.2" fill={c2} />
          <line x1="9" y1="11" x2="15" y2="8" />
          <line x1="9" y1="13" x2="15" y2="16" />
        </g>
      );
    case 'level':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5 L12 17" />
          <path d="M7 10 L12 5 L17 10" />
          <path d="M8 19 H16" opacity="0.5" />
        </g>
      );
    case 'owl':
      return (
        <g>
          <ellipse cx="12" cy="13" rx="6" ry="6.5" fill={c2} />
          <circle cx="9.5" cy="12" r="2" fill={soft('#F0E8F4', 0.75)} />
          <circle cx="14.5" cy="12" r="2" fill={soft('#F0E8F4', 0.75)} />
          <circle cx="9.5" cy="12" r="0.8" fill={ink} opacity="0.7" />
          <circle cx="14.5" cy="12" r="0.8" fill={ink} opacity="0.7" />
          <path d="M11 15 L12 16.5 L13 15" fill={ink} opacity="0.45" />
        </g>
      );
    case 'breath':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" fill={c2} stroke="none" />
          <circle cx="12" cy="12" r="5.5" opacity="0.7" />
          <circle cx="12" cy="12" r="8" opacity="0.4" />
        </g>
      );
    case 'garden':
      return (
        <g>
          <path d="M12 19 V11" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="9" cy="10" rx="3.5" ry="2.4" fill={c2} transform="rotate(-30 9 10)" />
          <ellipse cx="15" cy="10" rx="3.5" ry="2.4" fill={c2} transform="rotate(30 15 10)" />
          <circle cx="12" cy="8" r="1.4" fill={ink} opacity="0.45" />
        </g>
      );
    case 'lock':
      return (
        <g>
          <rect x="7" y="11" width="10" height="8" rx="1.5" fill={c2} stroke={ink} strokeWidth="1" />
          <path d="M9 11 V8.5 C9 6.5 15 6.5 15 8.5 V11" fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx="12" cy="15" r="1.1" fill={ink} opacity="0.55" />
        </g>
      );
    case 'melody':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 17 V7 L18 5 V14" />
          <circle cx="8.5" cy="17" r="2.2" fill={c2} />
          <circle cx="16.5" cy="14" r="2.2" fill={c2} />
        </g>
      );
    case 'streak':
      return (
        <g>
          <path
            d="M12 19 C8 15 6.5 12 6.5 9.5 C6.5 7 8.5 5.5 10.5 5.5 C11.4 5.5 12 6.2 12 7 C12 6.2 12.6 5.5 13.5 5.5 C15.5 5.5 17.5 7 17.5 9.5 C17.5 12 16 15 12 19Z"
            fill={c2}
            stroke={ink}
            strokeWidth="0.8"
          />
        </g>
      );
    case 'gift':
      return (
        <g>
          <rect x="6" y="10" width="12" height="9" rx="1.2" fill={c2} stroke={ink} strokeWidth="1" />
          <rect x="5.5" y="8" width="13" height="3" rx="1" fill={ink} opacity="0.35" />
          <line x1="12" y1="8" x2="12" y2="19" stroke={ink} strokeWidth="1.2" opacity="0.55" />
          <path d="M12 8 C10 5 8 6.5 9 8" fill="none" stroke={ink} strokeWidth="1.2" />
          <path d="M12 8 C14 5 16 6.5 15 8" fill="none" stroke={ink} strokeWidth="1.2" />
        </g>
      );
    default:
      return <circle cx="12" cy="12" r="4" fill={c2} />;
  }
}

export function StyleIcon({
  kind,
  size = 20,
  color,
  muted = false,
  className = '',
  title,
}: StyleIconProps) {
  const fill = color ?? DEFAULT_COLOR[kind] ?? DEFAULT_COLOR.unknown;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{
        opacity: muted ? 0.35 : 1,
        filter: muted ? 'grayscale(0.5)' : undefined,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      <circle cx="12" cy="12" r="11" fill={soft(fill, muted ? 0.08 : 0.14)} />
      <Glyph kind={kind} color={fill} />
    </svg>
  );
}

/** Map gesture id → style icon */
export function gestureIconKind(gestureId: string): StyleIconKind {
  switch (gestureId) {
    case 'tap': return 'tap';
    case 'swipe': return 'swipe';
    case 'longpress': return 'longpress';
    case 'circle': return 'circle';
    case 'pinch': return 'pinch';
    case 'combo_triple_tap': return 'combo_burst';
    case 'combo_circle_pinch': return 'combo_compress';
    case 'combo_dual_press': return 'combo_bridge';
    default: return 'unknown';
  }
}

export default StyleIcon;
