export function BrandMark({ size = 24, className = '' }) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={`brand-logo ${className}`.trim()}
      draggable="false"
      decoding="async"
    />
  )
}
