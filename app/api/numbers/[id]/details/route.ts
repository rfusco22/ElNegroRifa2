import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get number details with raffle information
    const numberDetails = (await executeQuery(
      `SELECT 
        rn.id,
        rn.number,
        rn.status,
        rn.reserved_at,
        rn.user_id,
        r.title as raffle_title,
        r.draw_date as raffle_draw_date,
        r.ticket_price,
        DATE_ADD(rn.reserved_at, INTERVAL 15 MINUTE) as expires_at
      FROM raffle_numbers rn
      JOIN raffles r ON rn.raffle_id = r.id
      WHERE rn.id = ? AND rn.user_id = ?`,
      [numberId, decoded.id],
    )) as any[]

    if (numberDetails.length === 0) {
      return NextResponse.json({ error: "Número no encontrado o no tienes acceso" }, { status: 404 })
    }

    const number = numberDetails[0]

    // Check if reservation has expired
    if (number.status === "reserved" && new Date() > new Date(number.expires_at)) {
      // Mark as available
      await executeQuery(
        "UPDATE raffle_numbers SET status = 'available', user_id = NULL, reserved_at = NULL WHERE id = ?",
        [numberId],
      )

      return NextResponse.json({ error: "La reserva ha expirado" }, { status: 410 })
    }

    return NextResponse.json(number)
  } catch (error) {
    console.error("Error fetching number details:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
