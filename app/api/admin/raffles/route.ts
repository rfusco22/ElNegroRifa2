import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const raffles = await query(`
      SELECT 
        r.*,
        COUNT(rn.id) as sold_numbers
      FROM raffles r
      LEFT JOIN raffle_numbers rn ON r.id = rn.raffle_id AND rn.status = 'sold'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)

    return NextResponse.json({ raffles })
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { name, description, ticket_price, draw_date, first_prize, second_prize, third_prize } = await request.json()

    // Crear la rifa
    const result = await query(
      `
      INSERT INTO raffles (name, description, ticket_price, total_numbers, draw_date, first_prize, second_prize, third_prize, status)
      VALUES (?, ?, ?, 1000, ?, ?, ?, ?, 'active')
    `,
      [name, description, ticket_price, draw_date, first_prize, second_prize, third_prize],
    )

    const raffleId = (result as any).insertId

    // Generar números del 000 al 999
    const numbers = []
    for (let i = 0; i < 1000; i++) {
      const number = i.toString().padStart(3, "0")
      numbers.push([raffleId, number])
    }

    // Insertar números en lotes
    const batchSize = 100
    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize)
      const placeholders = batch.map(() => "(?, ?)").join(", ")
      const values = batch.flat()

      await query(
        `
        INSERT INTO raffle_numbers (raffle_id, number) 
        VALUES ${placeholders}
      `,
        values,
      )
    }

    return NextResponse.json({ success: true, raffleId })
  } catch (error) {
    console.error("Error creating raffle:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
