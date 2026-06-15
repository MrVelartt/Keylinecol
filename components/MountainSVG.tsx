'use client'

import { motion } from 'framer-motion'

const contourLines = [
  {
    d: 'M 120,350 C 280,250 420,175 560,195 C 700,215 820,175 960,155 C 1080,138 1200,200 1360,255',
    opacity: 0.45,
    delay: 0.9,
  },
  {
    d: 'M 60,385 C 220,295 370,225 510,240 C 650,255 800,215 950,200 C 1090,185 1210,250 1390,298',
    opacity: 0.35,
    delay: 1.1,
  },
  {
    d: 'M 10,420 C 170,345 330,285 480,295 C 630,305 780,270 930,260 C 1080,250 1210,300 1400,340',
    opacity: 0.28,
    delay: 1.3,
  },
  {
    d: 'M 0,455 C 150,390 310,340 470,348 C 630,356 780,324 930,318 C 1080,312 1220,355 1430,390',
    opacity: 0.20,
    delay: 1.5,
  },
  {
    d: 'M 0,488 C 150,435 310,395 470,400 C 630,405 780,376 930,372 C 1080,368 1230,400 1440,430',
    opacity: 0.14,
    delay: 1.7,
  },
]

export default function MountainSVG() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <svg
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="keypointGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8DC63F" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#8DC63F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8DC63F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="60%" stopColor="#0a120a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a120a" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a120a" stopOpacity="0.6" />
            <stop offset="30%" stopColor="#0a120a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Far mountains */}
        <motion.path
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          d="M 0,430 C 100,360 210,270 350,195 C 490,120 640,175 780,145 C 920,115 1060,195 1190,215 C 1300,232 1390,305 1440,340 L 1440,700 L 0,700 Z"
          fill="#0b160b"
        />

        {/* Middle mountains */}
        <motion.path
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, delay: 0.15, ease: 'easeOut' }}
          d="M 0,490 C 120,420 250,355 390,310 C 520,268 650,310 790,280 C 930,250 1060,295 1190,268 C 1300,246 1390,330 1440,370 L 1440,700 L 0,700 Z"
          fill="#0d1b0d"
        />

        {/* Foreground mountains */}
        <motion.path
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, delay: 0.3, ease: 'easeOut' }}
          d="M 0,550 C 80,495 190,445 320,420 C 450,395 580,440 710,408 C 840,376 970,408 1100,382 C 1230,356 1350,425 1440,460 L 1440,700 L 0,700 Z"
          fill="#0f1f0f"
        />

        {/* Topographic dotted contour lines */}
        {contourLines.map((line, i) => (
          <motion.path
            key={i}
            d={line.d}
            fill="none"
            stroke="#8DC63F"
            strokeWidth="0.75"
            strokeDasharray="4 9"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: line.opacity }}
            transition={{ duration: 1.8, delay: line.delay, ease: 'easeOut' }}
          />
        ))}

        {/* Keypoint — the luminous key contour marker */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: '780px 145px' }}
        >
          {/* Ambient glow */}
          <circle cx="780" cy="145" r="48" fill="url(#keypointGlow)" />

          {/* Pulse ring 1 */}
          <motion.circle
            cx="780"
            cy="145"
            r="9"
            fill="none"
            stroke="#8DC63F"
            strokeWidth="0.6"
            animate={{ r: [9, 22], opacity: [0.7, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.8, ease: 'easeOut' }}
          />

          {/* Pulse ring 2 (offset) */}
          <motion.circle
            cx="780"
            cy="145"
            r="9"
            fill="none"
            stroke="#8DC63F"
            strokeWidth="0.4"
            animate={{ r: [9, 32], opacity: [0.4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.8, delay: 0.6, ease: 'easeOut' }}
          />

          {/* Core dot */}
          <circle cx="780" cy="145" r="3.5" fill="#8DC63F" />
          <circle cx="780" cy="145" r="1.8" fill="white" />
        </motion.g>

        {/* Keypoint label */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <line
            x1="780"
            y1="145"
            x2="850"
            y2="112"
            stroke="#8DC63F"
            strokeWidth="0.5"
            strokeDasharray="2 5"
            opacity="0.7"
          />
          <text
            x="857"
            y="109"
            fill="#8DC63F"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="0.12em"
            opacity="0.8"
          >
            KEYPOINT
          </text>
        </motion.g>

        {/* Bottom fade to page bg */}
        <rect x="0" y="0" width="1440" height="700" fill="url(#fadeBottom)" />
        {/* Top fade */}
        <rect x="0" y="0" width="1440" height="700" fill="url(#fadeTop)" />
      </svg>
    </div>
  )
}
