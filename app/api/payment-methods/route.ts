import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    const paymentMethods = await executeQuery(
      "SELECT id, method_name, account_info, is_active FROM payment_methods ORDER BY id",
    )

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
