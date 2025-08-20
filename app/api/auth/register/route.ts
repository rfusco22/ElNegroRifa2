import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, contraseña y nombre completo son requeridos" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const user = await createUser({
      email,
      password,
      full_name,
      phone,
    })

    if (!user) {
      return NextResponse.json({ error: "Error al crear usuario. El email podría estar en uso." }, { status: 400 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
      message: "Usuario registrado exitosamente",
    })
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
