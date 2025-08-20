"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)

  const whatsappNumber = "0412963830808" // Número de WhatsApp de contacto
  const message = "¡Hola! Me interesa participar en las Rifas El Negro. ¿Podrían ayudarme?"

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <>
      {/* Botón flotante principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Panel de chat expandido */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-lg shadow-xl border border-border animate-in slide-in-from-bottom-2">
          <div className="bg-green-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Rifas El Negro</h3>
                <p className="text-sm opacity-90">Soporte al Cliente</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-700">¡Hola! 👋 Bienvenido a Rifas El Negro. ¿En qué podemos ayudarte?</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">Opciones rápidas:</p>
              <div className="space-y-2">
                <button
                  onClick={openWhatsApp}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  💰 Información sobre rifas activas
                </button>
                <button
                  onClick={openWhatsApp}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  🎫 Ayuda con mi compra
                </button>
                <button
                  onClick={openWhatsApp}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  📞 Contactar soporte
                </button>
              </div>
            </div>

            <Button onClick={openWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
