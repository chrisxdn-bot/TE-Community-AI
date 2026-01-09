import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Community Engagement Platform',
  description: 'Track and analyze community engagement across multiple channels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
