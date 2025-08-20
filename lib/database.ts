import mysql from "mysql2/promise"

const dbConfig = {
  host: "gondola.proxy.rlwy.net",
  port: 27888,
  user: "root",
  password: "CuNnAJBiOiuldFGSRmIevEgVqjdvATpL",
  database: "elnegrorifa",
  ssl: {
    rejectUnauthorized: false,
  },
}

let connection: mysql.Connection | null = null

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig)
  }
  return connection
}

export async function executeQuery(query: string, params: any[] = []) {
  const conn = await getConnection()
  try {
    const [results] = await conn.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export const query = executeQuery
