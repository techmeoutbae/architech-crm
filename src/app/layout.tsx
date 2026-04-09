import type { Metadata } from "next"
import { IBM_Plex_Mono, Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Architech Designs CRM",
    template: "%s | Architech Designs CRM",
  },
  description: "Premium client portal and operations CRM for Architech Designs LLC.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${manrope.variable} ${ibmPlexMono.variable} min-h-full bg-[linear-gradient(180deg,#f5f8fc_0%,#eef4fb_100%)] font-sans text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
