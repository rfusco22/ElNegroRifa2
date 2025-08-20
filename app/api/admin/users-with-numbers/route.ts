import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token requerido" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todos los usuarios con sus números
    const users = await query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.cedula,
        u.created_at
      FROM users u
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC
    `)

    // Para cada usuario, obtener sus números
    const usersWithNumbers = await Promise.all(
      users.map(async (user: any) => {
        const numbers = await query(
          `
          SELECT 
            rn.id,
            rn.number,
            rn.status,
            rn.reserved_at,
            p.status as payment_status,
            pm.name as payment_method,
            p.amount as payment_amount,
            p.reference as payment_reference,
            p.proof_image as payment_proof
          FROM raffle_numbers rn
          LEFT JOIN payments p ON rn.id = p.raffle_number_id
          LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
          WHERE rn.user_id = ?
          ORDER BY rn.reserved_at DESC
        `,
          [user.id],
        )

        return {
          ...user,
          numbers,
        }
      }),
    )

    return NextResponse.json(usersWithNumbers)
  } catch (error) {
    console.error("Error fetching users with numbers:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
