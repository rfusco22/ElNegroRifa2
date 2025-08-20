import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raffleId = Number.parseInt(params.id)

    if (isNaN(raffleId)) {
      return NextResponse.json({ error: "ID de rifa inválido" }, { status: 400 })
    }

    // Get all numbers for this raffle
    const numbers = await executeQuery(
      `SELECT 
        rn.id, 
        rn.number, 
        rn.status, 
        rn.user_id, 
        rn.reserved_at, 
        rn.sold_at 
      FROM raffle_numbers rn 
      WHERE rn.raffle_id = ? 
      ORDER BY CAST(rn.number AS UNSIGNED)`,
      [raffleId],
    )

    // Clean up expired reservations (older than 15 minutes)
    await executeQuery(
      `UPDATE raffle_numbers 
      SET status = 'available', user_id = NULL, reserved_at = NULL 
      WHERE raffle_id = ? 
      AND status = 'reserved' 
      AND reserved_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
      [raffleId],
    )

    // Get updated numbers after cleanup
    const updatedNumbers = await executeQuery(
      `SELECT 
        rn.id, 
        rn.number, 
        rn.status, 
        rn.user_id, 
        rn.reserved_at, 
        rn.sold_at 
      FROM raffle_numbers rn 
      WHERE rn.raffle_id = ? 
      ORDER BY CAST(rn.number AS UNSIGNED)`,
      [raffleId],
    )

    return NextResponse.json(updatedNumbers)
  } catch (error) {
    console.error("Error fetching raffle numbers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
