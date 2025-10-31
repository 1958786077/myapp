import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from './components/CustomCursor'

export const metadata: Metadata = {
  title: '黑石世界',
  description: '黑石世界，一个神秘的世界',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
