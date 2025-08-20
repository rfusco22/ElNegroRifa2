import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
      message: "Login exitoso",
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
