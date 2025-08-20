import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = Number.parseInt(params.id)

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "ID de pago inválido" }, { status: 400 })
    }

    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { notes } = await request.json()

    // Update payment status to validated
    await executeQuery(
      `UPDATE payments 
      SET status = 'validated', validated_by = ?, validated_at = NOW() 
      WHERE id = ?`,
      [decoded.id, paymentId],
    )

    // Get the raffle number ID to update its status
    const paymentInfo = (await executeQuery("SELECT raffle_number_id FROM payments WHERE id = ?", [paymentId])) as any[]

    if (paymentInfo.length > 0) {
      // Update raffle number status to sold
      await executeQuery("UPDATE raffle_numbers SET status = 'sold', sold_at = NOW() WHERE id = ?", [
        paymentInfo[0].raffle_number_id,
      ])
    }

    return NextResponse.json({
      message: "Pago validado exitosamente",
    })
  } catch (error) {
    console.error("Error validating payment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
