import type { Metadata } from 'next'
import './globals.css'
import ClientRouter from './client'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout() {
  return (
    <html lang="en">
      <body>
        <ClientRouter />
      </body>
    </html>
  )
}
