import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config/render';

const LEMONS = [
  { cx: 96, cy: 250, r: 22, delay: '0s' },
  { cx: 500, cy: 300, r: 17, delay: '1.4s' },
  { cx: 60, cy: 430, r: 14, delay: '2.6s' },
];

const DROPLETS = [
  { cx: 140, cy: 470, r: 7, withFace: true },
  { cx: 470, cy: 450, r: 5, withFace: false },
  { cx: 30, cy: 500, r: 6, withFace: false },
  { cx: 555, cy: 520, r: 8, withFace: true },
  { cx: 300, cy: 445, r: 4, withFace: false },
];

const CLOUDS = [
  { cx: 250, cy: 65, scale: 0.9 },
  { cx: 410, cy: 105, scale: 0.65 },
  { cx: 130, cy: 150, scale: 0.55 },
];

const LEMON_TEXTURE_DOTS = [
  { dx: -0.34, dy: -0.22 },
  { dx: 0.16, dy: -0.44 },
  { dx: 0.4, dy: 0.02 },
  { dx: -0.08, dy: 0.36 },
  { dx: -0.42, dy: 0.18 },
  { dx: 0.3, dy: 0.4 },
  { dx: 0.02, dy: -0.1 },
];

function Lemon({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: string }) {
  const rx = r * 0.86;
  const ry = r;

  return (
    <g className="beach-bg__lemon" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: delay }}>
      <ellipse cx={cx} cy={cy + ry * 1.15} rx={rx * 1.3} ry={ry * 0.24} fill="#2e93c9" opacity="0.16" />

      <path
        d={`M ${cx} ${cy - ry}
            C ${cx + rx} ${cy - ry * 0.98}, ${cx + rx * 1.02} ${cy + ry * 0.98}, ${cx} ${cy + ry}
            C ${cx - rx * 1.02} ${cy + ry * 0.98}, ${cx - rx} ${cy - ry * 0.98}, ${cx} ${cy - ry} Z`}
        fill="url(#lemon-gradient)"
        stroke="#e0a900"
        strokeWidth={Math.max(1.2, r * 0.07)}
      />

      {/* 꼭지 + 잎 */}
      <ellipse cx={cx} cy={cy - ry * 0.98} rx={r * 0.16} ry={r * 0.1} fill="#e0a900" />
      <path
        d={`M ${cx} ${cy - ry * 1.02}
            q ${r * 0.38} ${-r * 0.36} ${r * 0.58} ${-r * 0.02}
            q ${-r * 0.26} ${r * 0.34} ${-r * 0.58} ${r * 0.02} Z`}
        fill="#46d9a0"
      />

      {/* 껍질 질감 */}
      {LEMON_TEXTURE_DOTS.map((dot) => (
        <circle
          key={`${dot.dx}-${dot.dy}`}
          cx={cx + dot.dx * r}
          cy={cy + dot.dy * r}
          r={Math.max(0.8, r * 0.055)}
          fill="#e0a900"
          opacity="0.4"
        />
      ))}

      <ellipse cx={cx - r * 0.32} cy={cy - r * 0.4} rx={r * 0.26} ry={r * 0.15} fill="#fff8e8" opacity="0.85" />
    </g>
  );
}

function Droplet({ cx, cy, r, withFace }: { cx: number; cy: number; r: number; withFace: boolean }) {
  return (
    <g className="beach-bg__droplet">
      <path
        d={`M ${cx} ${cy - r * 1.6} C ${cx + r} ${cy - r * 0.4}, ${cx + r} ${cy + r}, ${cx} ${cy + r} C ${cx - r} ${cy + r}, ${cx - r} ${cy - r * 0.4}, ${cx} ${cy - r * 1.6} Z`}
        fill="#7fd8f2"
        opacity="0.9"
      />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.1} rx={r * 0.28} ry={r * 0.18} fill="#ffffff" opacity="0.7" />
      {withFace && (
        <>
          <circle cx={cx - r * 0.3} cy={cy + r * 0.15} r={r * 0.09} fill="#123247" />
          <circle cx={cx + r * 0.3} cy={cy + r * 0.15} r={r * 0.09} fill="#123247" />
        </>
      )}
    </g>
  );
}

function Cloud({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`} opacity="0.85">
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="#ffffff" />
      <ellipse cx="-18" cy="4" rx="16" ry="10" fill="#ffffff" />
      <ellipse cx="18" cy="4" rx="18" ry="11" fill="#ffffff" />
    </g>
  );
}

function Starfish({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = 5;
  const outerR = r;
  const innerR = r * 0.45;
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    coords.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return (
    <polygon points={coords.join(' ')} fill="#ffa23c" stroke="#e0821f" strokeWidth="1" strokeLinejoin="round" />
  );
}

function Shell({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const ridgeOffsets = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <g>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill="#fff8e8" stroke="#e3be72" strokeWidth="1.2" />
      {ridgeOffsets.map((t) => (
        <line
          key={t}
          x1={cx}
          y1={cy}
          x2={cx + t * r}
          y2={cy - Math.sqrt(Math.max(0, r * r - (t * r) ** 2))}
          stroke="#e3be72"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

function WaveFoam({ path, baseY }: { path: string; baseY: number }) {
  const bubbleXs = [30, 95, 165, 235, 300, 365, 430, 495, 560];
  return (
    <g opacity="0.35">
      <path d={path} stroke="#ffffff" strokeWidth="3" fill="none" />
      {bubbleXs.map((x, i) => (
        <circle key={x} cx={x} cy={baseY + (i % 2 === 0 ? -6 : -2)} r={i % 3 === 0 ? 2.6 : 1.6} fill="#ffffff" />
      ))}
    </g>
  );
}

function Parasol() {
  return (
    <g transform="translate(470, 470)">
      <rect x="-4" y="0" width="8" height="130" rx="4" fill="#e3be72" />
      <path d="M -85 0 A 85 55 0 0 1 85 0 Z" fill="#ff86a8" />
      <path d="M -85 0 A 85 55 0 0 1 -51 -46 L -34 0 Z" fill="#fff8e8" />
      <path d="M -17 -53 A 85 55 0 0 1 17 -53 L 17 0 L -17 0 Z" fill="#fff8e8" />
      <path d="M 51 -46 A 85 55 0 0 1 85 0 L 51 0 Z" fill="#fff8e8" />
      <path
        d="M -85 0 Q -73 12 -60 0 Q -48 12 -35 0 Q -23 12 -10 0 Q 2 12 15 0 Q 27 12 40 0 Q 52 12 65 0 Q 77 12 85 0 Z"
        fill="#ff86a8"
      />
    </g>
  );
}

export function BeachBackground() {
  return (
    <svg
      className="beach-bg"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdf3ff" />
          <stop offset="100%" stopColor="#eafbff" />
        </linearGradient>
        <linearGradient id="sea-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bdeffa" />
          <stop offset="55%" stopColor="#5fc7ea" />
          <stop offset="100%" stopColor="#2e93c9" />
        </linearGradient>
        <linearGradient id="sand-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d999" />
          <stop offset="100%" stopColor="#e3be72" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lemon-gradient" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="55%" stopColor="#ffde59" />
          <stop offset="100%" stopColor="#f2b705" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#sky-gradient)" />
      <circle cx="75" cy="65" r="90" fill="url(#sun-glow)" />

      {CLOUDS.map((cloud) => (
        <Cloud key={`${cloud.cx}-${cloud.cy}`} {...cloud} />
      ))}

      <path
        d={`M 0 240 Q 75 210 150 240 T 300 240 T 450 240 T ${CANVAS_WIDTH} 240 V ${CANVAS_HEIGHT} H 0 Z`}
        fill="url(#sea-gradient)"
      />

      <g className="beach-bg__waves">
        <WaveFoam path="M 0 280 Q 75 265 150 280 T 300 280 T 450 280 T 600 280" baseY={280} />
        <WaveFoam path="M 0 335 Q 75 320 150 335 T 300 335 T 450 335 T 600 335" baseY={335} />
      </g>

      {LEMONS.map((lemon) => (
        <Lemon key={`${lemon.cx}-${lemon.cy}`} {...lemon} />
      ))}

      <path
        d={`M 0 470 Q 100 450 200 470 T 400 470 T ${CANVAS_WIDTH} 470 V ${CANVAS_HEIGHT} H 0 Z`}
        fill="url(#sand-gradient)"
      />

      <Starfish cx={70} cy={610} r={14} />
      <Shell cx={40} cy={560} r={12} />
      <Shell cx={520} cy={590} r={10} />

      {DROPLETS.map((droplet) => (
        <Droplet key={`${droplet.cx}-${droplet.cy}`} {...droplet} />
      ))}

      <Parasol />
    </svg>
  );
}
