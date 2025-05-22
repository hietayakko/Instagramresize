import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Instagram画像リサイザー",
  description: "Instagramの4:5比率に画像をリサイズし、カスタム余白を追加できます",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head />
      <body className={notoSansJP.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
