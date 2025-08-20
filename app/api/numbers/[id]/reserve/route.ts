import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const numberId = Number.parseInt(params.id)

    if (isNaN(numberId)) {
      return NextResponse.json({ error: "ID de número inválido" }, { status: 400 })
    }

    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if number exists and is available
    const numberCheck = (await executeQuery("SELECT id, status, user_id FROM raffle_numbers WHERE id = ?", [
      numberId,
    ])) as any[]

    if (numberCheck.length === 0) {
      return NextResponse.json({ error: "Número no encontrado" }, { status: 404 })
    }

    const number = numberCheck[0]

    if (number.status !== "available") {
      return NextResponse.json(
        {
          error: number.status === "reserved" ? "Número ya reservado" : "Número ya vendido",
        },
        { status: 400 },
      )
    }

    // Reserve the number
    await executeQuery(
      `UPDATE raffle_numbers 
      SET status = 'reserved', user_id = ?, reserved_at = NOW() 
      WHERE id = ? AND status = 'available'`,
      [decoded.id, numberId],
    )

    // Verify the reservation was successful
    const reservedNumber = (await executeQuery(
      "SELECT id, number, status, user_id, reserved_at FROM raffle_numbers WHERE id = ?",
      [numberId],
    )) as any[]

    if (reservedNumber.length === 0 || reservedNumber[0].user_id !== decoded.id) {
      return NextResponse.json({ error: "Error al reservar el número" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Número reservado exitosamente",
      number: reservedNumber[0],
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    })
  } catch (error) {
    console.error("Error reserving number:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
