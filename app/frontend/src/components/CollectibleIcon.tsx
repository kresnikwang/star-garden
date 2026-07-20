/**
 * Watercolor-style collectible glyphs — replaces Apple-style emoji for visual unity.
 */
import {
  getCollectibleKind,
  KIND_DEFAULT_COLORS,
  type CollectibleKind,
} from '@/lib/theme-style';

interface CollectibleIconProps {
  emoji: string;
  size?: number;
  color?: string;
  muted?: boolean;
  className?: string;
  title?: string;
}

function soft(hex: string, a: number): string {
  // Accept #RGB / #RRGGBB
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function Glyph({ kind, color }: { kind: CollectibleKind; color: string }) {
  const c = color;
  const c2 = soft(c, 0.45);
  const c3 = soft(c, 0.22);
  const ink = soft(c, 0.85);

  switch (kind) {
    case 'petal':
      return (
        <g>
          <ellipse cx="12" cy="13" rx="5.5" ry="8" fill={c3} transform="rotate(-20 12 13)" />
          <ellipse cx="12" cy="12" rx="4.2" ry="7" fill={c2} transform="rotate(-18 12 12)" />
          <ellipse cx="12" cy="12" rx="2.2" ry="4.5" fill={ink} opacity="0.55" transform="rotate(-18 12 12)" />
          <circle cx="12" cy="18" r="1.2" fill={soft('#E8C86A', 0.7)} />
        </g>
      );
    case 'stamen':
      return (
        <g>
          <circle cx="12" cy="12" r="5" fill={c3} />
          <circle cx="12" cy="12" r="3.2" fill={c2} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={12 + Math.cos(a) * 6.5}
                cy={12 + Math.sin(a) * 6.5}
                r="1.4"
                fill={ink}
                opacity="0.75"
              />
            );
          })}
        </g>
      );
    case 'butterfly':
      return (
        <g>
          <ellipse cx="8" cy="11" rx="4.5" ry="3.2" fill={c2} transform="rotate(-25 8 11)" />
          <ellipse cx="16" cy="11" rx="4.5" ry="3.2" fill={c2} transform="rotate(25 16 11)" />
          <ellipse cx="8.5" cy="15" rx="3" ry="2.2" fill={c3} transform="rotate(-15 8.5 15)" />
          <ellipse cx="15.5" cy="15" rx="3" ry="2.2" fill={c3} transform="rotate(15 15.5 15)" />
          <rect x="11.3" y="8" width="1.4" height="9" rx="0.7" fill={ink} opacity="0.6" />
        </g>
      );
    case 'droplet':
      return (
        <g>
          <path
            d="M12 4 C12 4 6 12 6 15.5 C6 18.5 8.7 20.5 12 20.5 C15.3 20.5 18 18.5 18 15.5 C18 12 12 4 12 4Z"
            fill={c2}
          />
          <ellipse cx="10" cy="14" rx="1.6" ry="2.2" fill="rgba(255,255,255,0.45)" />
        </g>
      );
    case 'wreath':
      return (
        <g>
          <circle cx="12" cy="12" r="7.5" fill="none" stroke={c2} strokeWidth="2.2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <ellipse
                key={deg}
                cx={12 + Math.cos(a) * 7.5}
                cy={12 + Math.sin(a) * 7.5}
                rx="2.2"
                ry="1.4"
                fill={ink}
                opacity="0.7"
                transform={`rotate(${deg} ${12 + Math.cos(a) * 7.5} ${12 + Math.sin(a) * 7.5})`}
              />
            );
          })}
        </g>
      );
    case 'wind':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
          <path d="M4 9 C8 7 12 11 16 8 C18 6.5 20 7 21 8" />
          <path d="M3 13 C8 11 13 15 18 12 C19.5 11 21 11.5 22 12.5" />
          <path d="M5 17 C9 15 14 18 19 16" opacity="0.7" />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <path d="M12 20 V11" stroke={ink} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <ellipse cx="8.5" cy="10" rx="4" ry="2.5" fill={c2} transform="rotate(-35 8.5 10)" />
          <ellipse cx="15.5" cy="10" rx="4" ry="2.5" fill={c2} transform="rotate(35 15.5 10)" />
        </g>
      );
    case 'firefly':
      return (
        <g>
          <circle cx="12" cy="12" r="7" fill={c3} />
          <circle cx="12" cy="12" r="4" fill={c2} />
          <circle cx="12" cy="12" r="2" fill={soft('#FFF8DC', 0.85)} />
        </g>
      );
    case 'starfish':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="12"
              cy="7"
              rx="2"
              ry="5"
              fill={c2}
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="2.2" fill={ink} opacity="0.55" />
        </g>
      );
    case 'shell':
      return (
        <g>
          <path
            d="M6 16 C6 10 9 6 12 6 C15 6 18 10 18 16 C15 18 9 18 6 16Z"
            fill={c2}
          />
          <path d="M8 15 C9 11 11 9 12 9" stroke={ink} strokeWidth="0.9" fill="none" opacity="0.5" />
          <path d="M12 9 C13 11 15 14 16 15" stroke={ink} strokeWidth="0.9" fill="none" opacity="0.5" />
        </g>
      );
    case 'coral':
      return (
        <g stroke={ink} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M12 20 V10" />
          <path d="M12 14 L8 9" />
          <path d="M12 12 L16 8" />
          <path d="M12 10 L10 6" />
          <circle cx="8" cy="9" r="1.3" fill={c2} stroke="none" />
          <circle cx="16" cy="8" r="1.3" fill={c2} stroke="none" />
          <circle cx="10" cy="6" r="1.2" fill={c2} stroke="none" />
        </g>
      );
    case 'jellyfish':
      return (
        <g>
          <path d="M6 12 C6 7 18 7 18 12 Z" fill={c2} />
          <path d="M8 12 Q8 18 7 20" stroke={ink} strokeWidth="1.2" fill="none" opacity="0.55" />
          <path d="M12 12 Q12 19 12 21" stroke={ink} strokeWidth="1.2" fill="none" opacity="0.55" />
          <path d="M16 12 Q16 18 17 20" stroke={ink} strokeWidth="1.2" fill="none" opacity="0.55" />
        </g>
      );
    case 'wave':
      return (
        <g fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 14 C6 10 9 10 12 14 C15 18 18 18 21 14" />
          <path d="M3 18 C6 14 9 14 12 18 C15 22 18 22 21 18" opacity="0.55" />
        </g>
      );
    case 'coconut':
      return (
        <g>
          <ellipse cx="12" cy="13" rx="6" ry="5.5" fill={c2} />
          <ellipse cx="12" cy="12" rx="3.5" ry="3" fill={c3} />
          <circle cx="10" cy="11" r="0.7" fill={ink} opacity="0.5" />
          <circle cx="13" cy="10.5" r="0.7" fill={ink} opacity="0.5" />
          <circle cx="12" cy="13" r="0.7" fill={ink} opacity="0.5" />
        </g>
      );
    case 'maple':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <ellipse
              key={deg}
              cx="12"
              cy={i === 0 ? 6.5 : 7.5}
              rx={i === 0 ? 2.2 : 1.8}
              ry={i === 0 ? 5.5 : 4.5}
              fill={c2}
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          <path d="M12 14 V20" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'pinecone':
      return (
        <g>
          <ellipse cx="12" cy="13" rx="4.5" ry="6.5" fill={c2} />
          <path d="M8 10 H16 M7.5 13 H16.5 M8 16 H16" stroke={ink} strokeWidth="0.8" opacity="0.4" />
        </g>
      );
    case 'acorn':
      return (
        <g>
          <ellipse cx="12" cy="14.5" rx="4" ry="5" fill={c2} />
          <path d="M7 11 C7 8 17 8 17 11 C14 13 10 13 7 11Z" fill={ink} opacity="0.55" />
          <path d="M12 8 V6" stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'mushroom':
      return (
        <g>
          <path d="M6 13 C6 7 18 7 18 13 Z" fill={c2} />
          <rect x="10" y="12.5" width="4" height="6" rx="1.2" fill={soft('#E8D8C0', 0.85)} />
          <circle cx="9" cy="10" r="1.1" fill={soft('#FFF', 0.35)} />
          <circle cx="14" cy="11" r="0.9" fill={soft('#FFF', 0.3)} />
        </g>
      );
    case 'pumpkin':
      return (
        <g>
          <ellipse cx="12" cy="14" rx="7" ry="5.5" fill={c2} />
          <path d="M12 9 V7" stroke={soft('#6A8F5A', 0.9)} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 14 Q12 16 16 14" stroke={ink} strokeWidth="0.9" fill="none" opacity="0.35" />
        </g>
      );
    case 'sunset':
      return (
        <g>
          <circle cx="12" cy="14" r="5" fill={c2} />
          <path d="M4 16 H20" stroke={ink} strokeWidth="1.4" opacity="0.45" />
          <path d="M5 18.5 H19" stroke={c3} strokeWidth="1.2" />
          {[ -50, -25, 0, 25, 50 ].map((deg) => {
            const a = ((deg - 90) * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={12 + Math.cos(a) * 5.5}
                y1={14 + Math.sin(a) * 5.5}
                x2={12 + Math.cos(a) * 9}
                y2={14 + Math.sin(a) * 9}
                stroke={c2}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.55"
              />
            );
          })}
        </g>
      );
    case 'tea':
      return (
        <g>
          <path d="M7 11 H15 V17 C15 19 9 19 9 17 Z" fill={c2} />
          <path d="M15 12 H17.5 C18.5 12 19 14 17.5 15 H15" fill="none" stroke={ink} strokeWidth="1.2" opacity="0.7" />
          <path d="M10 8 C10 6 11 5 11 4" stroke={c3} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M13 8 C13 6 14 5 14 4" stroke={c3} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'snowflake':
      return (
        <g stroke={ink} strokeWidth="1.3" strokeLinecap="round" fill="none">
          {[0, 60, 120].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 12 12)`}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="12" y1="7" x2="10" y2="9" />
              <line x1="12" y1="7" x2="14" y2="9" />
              <line x1="12" y1="17" x2="10" y2="15" />
              <line x1="12" y1="17" x2="14" y2="15" />
            </g>
          ))}
        </g>
      );
    case 'ice':
      return (
        <g>
          <path d="M12 4 L18 12 L12 20 L6 12 Z" fill={c2} stroke={ink} strokeWidth="0.8" opacity="0.9" />
          <path d="M12 8 L15 12 L12 16 L9 12 Z" fill={soft('#FFF', 0.35)} />
        </g>
      );
    case 'aurora':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M3 14 C7 8 11 8 15 13 C17 16 20 15 21 12" stroke={c2} strokeWidth="2.4" opacity="0.7" />
          <path d="M3 17 C8 12 12 11 17 16 C19 18 21 17 22 15" stroke={soft('#A0E0D0', 0.7)} strokeWidth="1.8" />
        </g>
      );
    case 'snowman':
      return (
        <g>
          <circle cx="12" cy="16" r="4.2" fill={c2} />
          <circle cx="12" cy="10" r="3" fill={c2} />
          <circle cx="11" cy="9.5" r="0.5" fill={ink} opacity="0.5" />
          <circle cx="13" cy="9.5" r="0.5" fill={ink} opacity="0.5" />
        </g>
      );
    case 'bell':
      return (
        <g>
          <path d="M8 11 C8 7 16 7 16 11 L17 16 H7 Z" fill={c2} />
          <circle cx="12" cy="17.5" r="1.3" fill={ink} opacity="0.55" />
          <rect x="10.5" y="5.5" width="3" height="2" rx="1" fill={ink} opacity="0.5" />
        </g>
      );
    case 'starlight':
      return (
        <g>
          <circle cx="12" cy="12" r="2.2" fill={c2} />
          {[0, 45, 90, 135].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="5"
              x2="12"
              y2="8"
              stroke={ink}
              strokeWidth="1.4"
              strokeLinecap="round"
              transform={`rotate(${deg} 12 12)`}
              opacity="0.75"
            />
          ))}
          <circle cx="12" cy="12" r="5.5" fill={c3} />
        </g>
      );
    case 'hearth':
      return (
        <g>
          <path
            d="M12 19 C8 15 6 12 6 9.5 C6 7 8 5.5 10 5.5 C11 5.5 12 6.2 12 7 C12 6.2 13 5.5 14 5.5 C16 5.5 18 7 18 9.5 C18 12 16 15 12 19Z"
            fill={c2}
          />
          <path
            d="M12 16 C10 14 9 12.5 9 11 C9 10 9.8 9.2 10.8 9.2 C11.4 9.2 12 9.7 12 10.3"
            fill={soft('#FFE8C0', 0.55)}
          />
        </g>
      );
    default:
      return <circle cx="12" cy="12" r="5" fill={c2} />;
  }
}

export function CollectibleIcon({
  emoji,
  size = 24,
  color,
  muted = false,
  className = '',
  title,
}: CollectibleIconProps) {
  const kind = getCollectibleKind(emoji);
  const fill = color ?? KIND_DEFAULT_COLORS[kind];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{
        opacity: muted ? 0.35 : 1,
        filter: muted ? 'grayscale(0.6)' : undefined,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      {/* Soft watercolor wash behind glyph */}
      <circle cx="12" cy="12" r="11" fill={soft(fill, muted ? 0.08 : 0.14)} />
      <Glyph kind={kind} color={fill} />
    </svg>
  );
}

export default CollectibleIcon;
