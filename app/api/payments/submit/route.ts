import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData()
    const raffleNumberId = formData.get("raffle_number_id") as string
    const paymentMethod = formData.get("payment_method") as string
    const amount = formData.get("amount") as string
    const referenceNumber = formData.get("reference_number") as string
    const notes = formData.get("notes") as string
    const paymentProof = formData.get("payment_proof") as File

    if (!raffleNumberId || !paymentMethod || !amount || !referenceNumber) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verify the number belongs to the user and is reserved
    const numberCheck = (await executeQuery(
      "SELECT id, status, user_id FROM raffle_numbers WHERE id = ? AND user_id = ?",
      [raffleNumberId, decoded.id],
    )) as any[]

    if (numberCheck.length === 0) {
      return NextResponse.json({ error: "Número no encontrado o no tienes acceso" }, { status: 404 })
    }

    if (numberCheck[0].status !== "reserved") {
      return NextResponse.json({ error: "El número no está reservado" }, { status: 400 })
    }

    // Handle file upload (in a real app, you'd upload to cloud storage)
    let paymentProofData = ""
    if (paymentProof && paymentProof.size > 0) {
      // Convert file to base64 for storage (in production, use cloud storage)
      const bytes = await paymentProof.arrayBuffer()
      const buffer = Buffer.from(bytes)
      paymentProofData = `data:${paymentProof.type};base64,${buffer.toString("base64")}`
    }

    // Create payment record
    const result = (await executeQuery(
      `INSERT INTO payments 
      (raffle_number_id, user_id, payment_method, amount, reference_number, payment_proof, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [raffleNumberId, decoded.id, paymentMethod, Number.parseFloat(amount), referenceNumber, paymentProofData],
    )) as any

    if (result.insertId) {
      return NextResponse.json({
        message: "Comprobante de pago enviado exitosamente",
        payment_id: result.insertId,
      })
    } else {
      return NextResponse.json({ error: "Error al crear el registro de pago" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error submitting payment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
