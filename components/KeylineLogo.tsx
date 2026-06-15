'use client'

interface Props {
  size?: number
  className?: string
}

export default function KeylineLogo({ size = 36, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer boundary ring */}
      <circle cx="24" cy="24" r="22.5" stroke="#8DC63F" strokeWidth="0.8" opacity="0.9" />

      {/* Topographic contour lines — offset to suggest terrain elevation */}
      <ellipse
        cx="24" cy="27"
        rx="16.5" ry="11.5"
        stroke="#8DC63F" strokeWidth="0.65"
        strokeDasharray="2.8 5.5"
        opacity="0.55"
      />
      <ellipse
        cx="24" cy="27"
        rx="11.5" ry="7.5"
        stroke="#8DC63F" strokeWidth="0.65"
        strokeDasharray="2.8 5.5"
        opacity="0.45"
      />
      <ellipse
        cx="24" cy="26"
        rx="6.5" ry="4"
        stroke="#8DC63F" strokeWidth="0.65"
        strokeDasharray="2.8 5.5"
        opacity="0.35"
      />

      {/* Keyline — horizontal reference at key elevation */}
      <line x1="2" y1="27" x2="46" y2="27" stroke="#8DC63F" strokeWidth="0.4" opacity="0.28" />

      {/* Keypoint marker */}
      <circle cx="24" cy="20" r="3.2" fill="#8DC63F" opacity="0.92" />
      <circle cx="24" cy="20" r="1.4" fill="#0a120a" />
      <circle cx="24" cy="20" r="0.6" fill="#8DC63F" />
    </svg>
  )
}
