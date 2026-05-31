import React from 'react'

interface MeasurementSvgProps {
  type: 'tshirt' | 'social' | 'pants'
}

export default function MeasurementSvg({ type }: MeasurementSvgProps) {
  // Styles are embedded inside the SVG to make them completely self-contained and print-perfect.
  const style = {
    colorText: '#111111',
    colorArrow: '#B31217', // brand red
    colorArrowBlue: '#0022cc', // brand blue for width arrow in mockup
    colorFabric: '#ffffff',
    colorStroke: '#333333',
    colorHighlight: '#B31217'
  }

  if (type === 'tshirt') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* T-shirt background/outline */}
          <path
            d="M 120,40 C 145,55 255,55 280,40 L 330,68 C 345,76 345,86 338,98 L 310,145 C 304,155 292,154 286,146 L 270,125 C 270,225 270,325 270,410 C 270,422 258,426 248,426 L 152,426 C 142,426 130,422 130,410 C 130,325 130,225 130,125 L 114,146 C 108,154 96,155 90,145 L 62,98 C 55,86 55,76 70,68 Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Collar detail */}
          <path
            d="M 120,40 C 140,75 260,75 280,40"
            stroke={style.colorStroke}
            strokeWidth="3.5"
            fill="none"
          />
          
          {/* Brand Mark (Fase logo mock) */}
          <g transform="translate(180, 85) scale(0.6)">
            <path d="M 5,0 L 50,0 C 53,0 55,2 54.5,4.5 L 51.5,19.5 C 51,22 48,24 45,24 L 0,24 C -3,24 -5,22 -4.5,19.5 L -1.5,4.5 C -1,2 2,0 5,0 Z" fill="#111111" />
            <path d="M 8,6 L 24,6 L 22.5,13.5 L 12,13.5 L 11,18 L 6,18 Z M 22,6 L 38,6 C 41,6 42.5,8 41.5,12.5 C 41,15.5 39,18 35.5,18 L 29.5,18 L 27.5,24 L 22.5,24 Z" fill="#ffffff" />
          </g>

          {/* Sleeves (cuffs line) */}
          <path d="M 62,98 L 98,118" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 338,98 L 302,118" stroke={style.colorStroke} strokeWidth="3" />

          {/* HEIGHT ARROW (Altura "A") */}
          <g>
            {/* Red vertical arrow line */}
            <path d="M 200, 56 L 200, 410" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            {/* Arrowheads */}
            <path d="M 190,72 L 200,56 L 210,72" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 190,394 L 200,410 L 210,394" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            {/* Label box & Text */}
            <rect x="175" y="160" width="50" height="38" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="200" y="180" fill={style.colorArrow} fontSize="20" fontWeight="900" textAnchor="middle">A</text>
            <text x="200" y="210" fill={style.colorArrow} fontSize="11" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (Largura "L") */}
          <g>
            {/* Blue horizontal arrow line */}
            <path d="M 136, 215 L 264, 215" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            {/* Arrowheads */}
            <path d="M 152,205 L 136,215 L 152,225" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 248,205 L 264,215 L 248,225" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            {/* Label box & Text */}
            <rect x="185" y="228" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="247" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="272" fill={style.colorArrowBlue} fontSize="11" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'social') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Social Shirt background/outline */}
          <path
            d="M 150,50 L 175,65 L 200,50 L 225,65 L 250,50 L 275,70 L 330,120 C 335,125 330,132 322,142 L 290,195 C 285,202 278,202 275,195 L 260,165 L 260,420 C 260,432 250,436 240,436 L 160,436 C 150,436 140,432 140,420 L 140,165 L 125,195 C 122,202 115,202 110,195 L 78,142 C 70,132 65,125 70,120 L 125,70 Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Collar Wings */}
          <path d="M 150,50 L 175,65 L 158,85 L 138,58 Z" fill="#dddddd" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 250,50 L 225,65 L 242,85 L 262,58 Z" fill="#dddddd" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 175,65 L 200,80 L 225,65" stroke={style.colorStroke} strokeWidth="3" />

          {/* Front button placket */}
          <path d="M 200,80 L 200,436" stroke={style.colorStroke} strokeWidth="3.5" />
          
          {/* Pocket */}
          <path d="M 160,130 L 180,130 L 180,160 L 160,160 Z" stroke={style.colorStroke} strokeWidth="2.5" />

          {/* HEIGHT ARROW (Altura "A") */}
          <g>
            <path d="M 215, 78 L 215, 424" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 205,94 L 215,78 L 225,94" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 205,408 L 215,424 L 225,408" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <rect x="228" y="160" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="243" y="179" fill={style.colorArrow} fontSize="18" fontWeight="900" textAnchor="middle">A</text>
            <text x="243" y="200" fill={style.colorArrow} fontSize="9" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (Largura "L") */}
          <g>
            <path d="M 146, 235 L 254, 235" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 162,225 L 146,235 L 162,245" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 238,225 L 254,235 L 238,245" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <rect x="185" y="244" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="263" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="284" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>

          {/* SLEEVE / ARM ARROW (Braço "B") */}
          <g>
            <path d="M 112, 85 L 75, 172" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 120,100 L 112,85 L 103,101" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 85,158 L 75,172 L 67,156" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <rect x="52" y="185" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="67" y="204" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">B</text>
            <text x="67" y="225" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">BRAÇO (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'pants') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pants outline */}
          <path
            d="M 130,40 L 270,40 C 275,40 280,44 278,52 L 255,420 C 253,428 248,432 240,432 L 205,432 L 200,200 L 195,432 L 160,432 C 152,432 147,428 145,420 L 122,52 C 120,44 125,40 130,40 Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Waist Band / elastic line */}
          <path d="M 127,70 C 170,75 230,75 273,70" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 124,52 C 170,57 230,57 276,52" stroke={style.colorStroke} strokeWidth="3" />

          {/* Pockets */}
          <path d="M 125,90 L 150,130" stroke={style.colorStroke} strokeWidth="2.5" />
          <path d="M 275,90 L 250,130" stroke={style.colorStroke} strokeWidth="2.5" />

          {/* HEIGHT ARROW (Altura "A") */}
          <g>
            {/* Runs down the right leg */}
            <path d="M 288, 40 L 268, 420" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 276,54 L 288,40 L 294,56" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 280,406 L 268,420 L 262,404" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <rect x="290" y="210" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="305" y="229" fill={style.colorArrow} fontSize="18" fontWeight="900" textAnchor="middle">A</text>
            <text x="305" y="250" fill={style.colorArrow} fontSize="9" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (Largura "L") */}
          <g>
            {/* Across the elastic waistband */}
            <path d="M 132, 60 L 268, 60" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 148,50 L 132,60 L 148,70" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 252,50 L 268,60 L 252,70" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <rect x="185" y="70" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="89" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="110" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  return null
}
