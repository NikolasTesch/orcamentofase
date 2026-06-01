import React from 'react'

interface MeasurementSvgProps {
  type: 'tshirt' | 'social' | 'pants'
}

export default function MeasurementSvg({ type }: MeasurementSvgProps) {
  const style = {
    colorText: '#111111',
    colorArrow: '#B31217',
    colorArrowBlue: '#0022cc',
    colorFabric: '#ffffff',
    colorStroke: '#333333',
    colorHighlight: '#B31217'
  }

  if (type === 'tshirt') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* T-shirt body — body width: x=105 to x=295 (190px), wider than original 140px */}
          <path
            d="M 120,40
               C 145,56 255,56 280,40
               L 335,70
               C 350,80 350,93 342,108
               L 312,154
               C 306,165 292,164 286,152
               L 286,124
               L 295,124
               L 295,416
               C 295,428 282,432 270,432
               L 130,432
               C 118,432 105,428 105,416
               L 105,124
               L 114,124
               L 114,152
               C 108,164 94,165 88,154
               L 58,108
               C 50,93 50,80 65,70
               Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Collar detail */}
          <path
            d="M 120,40 C 145,56 255,56 280,40"
            stroke={style.colorStroke}
            strokeWidth="3.5"
            fill="none"
          />

          {/* Brand Mark */}
          <g transform="translate(180, 82) scale(0.6)">
            <path d="M 5,0 L 50,0 C 53,0 55,2 54.5,4.5 L 51.5,19.5 C 51,22 48,24 45,24 L 0,24 C -3,24 -5,22 -4.5,19.5 L -1.5,4.5 C -1,2 2,0 5,0 Z" fill="#111111" />
            <path d="M 8,6 L 24,6 L 22.5,13.5 L 12,13.5 L 11,18 L 6,18 Z M 22,6 L 38,6 C 41,6 42.5,8 41.5,12.5 C 41,15.5 39,18 35.5,18 L 29.5,18 L 27.5,24 L 22.5,24 Z" fill="#ffffff" />
          </g>

          {/* Sleeve cuff lines */}
          <path d="M 58,108 L 94,124" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 342,108 L 306,124" stroke={style.colorStroke} strokeWidth="3" />

          {/* HEIGHT ARROW (A) — center of body, full length */}
          <g>
            <path d="M 200,56 L 200,416" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 190,72 L 200,56 L 210,72" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 190,400 L 200,416 L 210,400" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="175" y="162" width="50" height="38" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="200" y="182" fill={style.colorArrow} fontSize="20" fontWeight="900" textAnchor="middle">A</text>
            <text x="200" y="212" fill={style.colorArrow} fontSize="11" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (L) — spans full body width 105→295 */}
          <g>
            <path d="M 105,270 L 295,270" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 121,260 L 105,270 L 121,280" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 279,260 L 295,270 L 279,280" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="174" y="282" width="52" height="28" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="301" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="326" fill={style.colorArrowBlue} fontSize="11" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'social') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Social shirt — body width x=110 to x=290 (180px), wider than original 120px */}
          <path
            d="M 150,50 L 175,65 L 200,50 L 225,65 L 250,50
               L 278,72
               L 340,130
               C 346,138 342,150 332,162
               L 298,210
               C 292,220 278,218 274,208
               L 260,170
               L 260,150
               L 290,140
               L 290,428
               C 290,440 278,444 266,444
               L 134,444
               C 122,444 110,440 110,428
               L 110,140
               L 140,150
               L 140,170
               L 126,208
               C 122,218 108,220 102,210
               L 68,162
               C 58,150 54,138 60,130
               L 122,72
               Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Collar Wings */}
          <path d="M 150,50 L 175,65 L 158,88 L 136,60 Z" fill="#dddddd" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 250,50 L 225,65 L 242,88 L 264,60 Z" fill="#dddddd" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 175,65 L 200,82 L 225,65" stroke={style.colorStroke} strokeWidth="3" />

          {/* Button placket */}
          <path d="M 200,82 L 200,444" stroke={style.colorStroke} strokeWidth="3.5" />

          {/* Pocket */}
          <path d="M 155,135 L 178,135 L 178,165 L 155,165 Z" stroke={style.colorStroke} strokeWidth="2.5" />

          {/* HEIGHT ARROW (A) */}
          <g>
            <path d="M 215,78 L 215,428" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 205,94 L 215,78 L 225,94" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 205,412 L 215,428 L 225,412" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="228" y="162" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="243" y="181" fill={style.colorArrow} fontSize="18" fontWeight="900" textAnchor="middle">A</text>
            <text x="243" y="202" fill={style.colorArrow} fontSize="9" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (L) — spans 110→290 */}
          <g>
            <path d="M 110,272 L 290,272" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 126,262 L 110,272 L 126,282" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 274,262 L 290,272 L 274,282" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="174" y="284" width="52" height="28" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="303" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="326" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>

          {/* SLEEVE ARROW (B) */}
          <g>
            <path d="M 112,88 L 68,174" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 120,104 L 112,88 L 103,104" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 78,160 L 68,174 L 60,159" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="34" y="188" width="30" height="26" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="49" y="207" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">B</text>
            <text x="49" y="228" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">BRAÇO (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'pants') {
    return (
      <div className="measurement-svg-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        <svg viewBox="0 0 400 480" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pants — waistband x=100 to x=300 (200px), wider than original 140px */}
          <path
            d="M 100,40 L 300,40
               C 306,40 312,46 310,56
               L 284,422
               C 282,432 274,436 263,436
               L 208,436
               L 200,196
               L 192,436
               L 137,436
               C 126,436 118,432 116,422
               L 90,56
               C 88,46 94,40 100,40
               Z"
            fill={style.colorFabric}
            stroke={style.colorStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Waistband / elastic lines */}
          <path d="M 97,72 C 158,78 242,78 303,72" stroke={style.colorStroke} strokeWidth="3" />
          <path d="M 94,54 C 158,60 242,60 306,54" stroke={style.colorStroke} strokeWidth="3" />

          {/* Pocket diagonals */}
          <path d="M 96,92 L 130,134" stroke={style.colorStroke} strokeWidth="2.5" />
          <path d="M 304,92 L 270,134" stroke={style.colorStroke} strokeWidth="2.5" />

          {/* HEIGHT ARROW (A) — follows right leg edge */}
          <g>
            <path d="M 316,40 L 292,422" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 304,56 L 316,40 L 322,56" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 304,406 L 292,422 L 285,406" stroke={style.colorArrow} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="320" y="212" width="52" height="26" rx="4" fill="#ffffff" stroke={style.colorArrow} strokeWidth="2.5" />
            <text x="346" y="231" fill={style.colorArrow} fontSize="18" fontWeight="900" textAnchor="middle">A</text>
            <text x="346" y="252" fill={style.colorArrow} fontSize="9" fontWeight="800" textAnchor="middle">ALTURA (CM)</text>
          </g>

          {/* WIDTH ARROW (L) — across waistband 100→300 */}
          <g>
            <path d="M 100,62 L 300,62" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 116,52 L 100,62 L 116,72" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 284,52 L 300,62 L 284,72" stroke={style.colorArrowBlue} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="174" y="74" width="52" height="28" rx="4" fill="#ffffff" stroke={style.colorArrowBlue} strokeWidth="2.5" />
            <text x="200" y="93" fill={style.colorArrowBlue} fontSize="18" fontWeight="900" textAnchor="middle">L</text>
            <text x="200" y="116" fill={style.colorArrowBlue} fontSize="9" fontWeight="800" textAnchor="middle">LARGURA (CM)</text>
          </g>
        </svg>
      </div>
    )
  }

  return null
}
