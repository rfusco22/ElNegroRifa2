"use client"

import { MessageCircle, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "584141234567" // Replace with actual WhatsApp number
    const message = "Hola! Me interesa participar en las rifas El Negro"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RIFAS%20EL%20NEGRO-NkvLSGBl9o0j5vqLLpNeFUxJ3Cd8Sn.png"
                alt="Rifas El Negro"
                className="h-12 w-auto"
              />
              <span className="ml-2 text-2xl font-bold text-primary font-serif">Rifas El Negro</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Tu oportunidad de ganar grandes premios. Rifas transparentes y confiables con números del 000 al 999.
            </p>
            <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar por WhatsApp
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/select-numbers" className="text-muted-foreground hover:text-primary transition-colors">
                  Participar
                </a>
              </li>
              <li>
                <a href="/my-numbers" className="text-muted-foreground hover:text-primary transition-colors">
                  Mis Números
                </a>
              </li>
              <li>
                <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div id="contact">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                <span>+58 414-123-4567</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span>info@rifaselnegro.com</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Venezuela</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 Rifas El Negro. Todos los derechos reservados. | Juega responsablemente.
          </p>
        </div>
      </div>
    </footer>
  )
}
