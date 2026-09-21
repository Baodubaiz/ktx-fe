import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  /** Additional inline style */
  style?: React.CSSProperties
}

/**
 * Consistent page wrapper with max-width and animation
 */
export default function PageContainer({ children, style }: PageContainerProps) {
  return (
    <div
      style={{
        maxWidth: 1600,
        margin: '0 auto',
        animation: 'fadeInUp 0.4s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
