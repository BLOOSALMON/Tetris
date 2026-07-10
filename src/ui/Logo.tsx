export function Logo() {
  return (
    <div className="logo-wrap">
      <svg className="logo-svg" viewBox="0 0 320 100" aria-hidden="true">
        <defs>
          <linearGradient id="chrome-gradient" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#7b8088" />
            <stop offset="18%" stopColor="#f6f7f9" />
            <stop offset="34%" stopColor="#5b5f66" />
            <stop offset="50%" stopColor="#eceef1" />
            <stop offset="66%" stopColor="#4a4d53" />
            <stop offset="84%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#6a6e75" />
          </linearGradient>
          <filter id="chrome-emboss" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="4.5"
              specularConstant="1"
              specularExponent="16"
              lightingColor="#ffffff"
              result="spec"
            >
              <fePointLight x="-70" y="-140" z="180" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClipped" />
            <feComposite
              in="SourceGraphic"
              in2="specClipped"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1.1"
              k4="0"
            />
          </filter>
        </defs>
        <text x="50%" y="66" textAnchor="middle" className="logo-svg-text" filter="url(#chrome-emboss)">
          테트리스
        </text>
      </svg>
    </div>
  );
}
