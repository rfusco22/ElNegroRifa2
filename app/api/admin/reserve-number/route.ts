import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    const { user_id, number, raffle_id } = await request.json()

    if (!user_id || !number || !raffle_id) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Validar que el número esté en el rango correcto
    const numValue = Number.parseInt(number)
    if (isNaN(numValue) || numValue < 0 || numValue > 999) {
      return NextResponse.json({ message: "Número debe estar entre 000 y 999" }, { status: 400 })
    }

    // Formatear el número con ceros a la izquierda
    const formattedNumber = numValue.toString().padStart(3, "0")

    // Verificar que el número esté disponible
    const existingNumber = await query(
      `
      SELECT id FROM raffle_numbers 
      WHERE raffle_id = ? AND number = ? AND status != 'available'
    `,
      [raffle_id, formattedNumber],
    )

    if (existingNumber.length > 0) {
      return NextResponse.json({ message: "El número ya está reservado o vendido" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await query(
      `
      SELECT id FROM users WHERE id = ? AND role = 'user'
    `,
      [user_id],
    )

    if (user.length === 0) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Reservar el número
    const reservationTime = new Date()
    const expirationTime = new Date(reservationTime.getTime() + 6 * 60 * 60 * 1000) // 6 horas

    await query(
      `
      UPDATE raffle_numbers 
      SET status = 'reserved', user_id = ?, reserved_at = ?, expires_at = ?
      WHERE raffle_id = ? AND number = ?
    `,
      [user_id, reservationTime, expirationTime, raffle_id, formattedNumber],
    )

    return NextResponse.json({
      message: "Número reservado exitosamente",
      number: formattedNumber,
      expires_at: expirationTime,
    })
  } catch (error) {
    console.error("Error reserving number:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
