import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    const raffles = await executeQuery(
      "SELECT id, title, description, ticket_price, first_prize, second_prize, third_prize, draw_date, status FROM raffles WHERE status = 'active' ORDER BY created_at DESC",
    )

    return NextResponse.json(raffles)
  } catch (error) {
    console.error("Error fetching active raffles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
