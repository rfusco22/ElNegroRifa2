"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, User, LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onLogin: () => void
  onRegister: () => void
}

export function Header({ onLogin, onRegister }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RIFAS%20EL%20NEGRO-NkvLSGBl9o0j5vqLLpNeFUxJ3Cd8Sn.png"
              alt="Rifas El Negro"
              className="h-10 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-primary font-serif">Rifas El Negro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors">
              Inicio
            </a>
            {user && (
              <>
                <a href="/select-numbers" className="text-foreground hover:text-primary transition-colors">
                  Seleccionar Números
                </a>
                <a href="/my-numbers" className="text-foreground hover:text-primary transition-colors">
                  Mis Números
                </a>
              </>
            )}
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Mis Números</span>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={onLogin}>
                  Iniciar Sesión
                </Button>
                <Button onClick={onRegister}>Registrarse</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border/50">
              <a
                href="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </a>
              {user && (
                <>
                  <a
                    href="/select-numbers"
                    className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Seleccionar Números
                  </a>
                  <a
                    href="/my-numbers"
                    className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Números
                  </a>
                </>
              )}
              <a
                href="#contact"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </a>

              <div className="border-t border-border/50 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Hola, {user.full_name}
                      {user.role === "admin" && <span className="text-secondary ml-2">(Admin)</span>}
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full" onClick={onLogin}>
                      Iniciar Sesión
                    </Button>
                    <Button className="w-full" onClick={onRegister}>
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
