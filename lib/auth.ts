import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "rifas-el-negro-secret-key-2025"

export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: "user" | "admin"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const results = (await executeQuery(
      "SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?",
      [email],
    )) as any[]

    if (results.length === 0) return null

    const user = results[0]
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const results = (await executeQuery("SELECT id, email, full_name, phone, role FROM users WHERE id = ?", [
      id,
    ])) as any[]

    if (results.length === 0) return null

    const user = results[0]
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
    }
  } catch (error) {
    console.error("Error getting user by id:", error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  full_name: string
  phone?: string
}): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password)

    const result = (await executeQuery(
      "INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)",
      [userData.email, hashedPassword, userData.full_name, userData.phone || null],
    )) as any

    return getUserById(result.insertId)
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const results = (await executeQuery(
      "SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?",
      [email],
    )) as any[]

    if (results.length === 0) return null

    const user = results[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) return null

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}
