import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { WhatsAppButton } from "@/components/whatsapp/whatsapp-button"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Rifas El Negro - Participa y Gana",
  description: "Sistema de rifas online con números del 000 al 999. Múltiples formas de pago disponibles.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${manrope.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          {children}
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  )
}
