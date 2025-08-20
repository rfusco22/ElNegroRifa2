import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"

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

async function runDatabaseSetup() {
  let connection

  try {
    console.log("Connecting to database...")
    connection = await mysql.createConnection(dbConfig)
    console.log("Connected successfully!")

    // Read and execute table creation script
    const createTablesSQL = fs.readFileSync(path.join(process.cwd(), "scripts", "01-create-tables.sql"), "utf8")
    const createStatements = createTablesSQL.split(";").filter((stmt) => stmt.trim())

    console.log("Creating tables...")
    for (const statement of createStatements) {
      if (statement.trim()) {
        await connection.execute(statement)
      }
    }
    console.log("Tables created successfully!")

    // Read and execute seed data script
    const seedDataSQL = fs.readFileSync(path.join(process.cwd(), "scripts", "02-seed-data.sql"), "utf8")
    const seedStatements = seedDataSQL.split(";").filter((stmt) => stmt.trim())

    console.log("Seeding initial data...")
    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement)
        } catch (error) {
          // Ignore duplicate entry errors for seeding
          if (!error.message.includes("Duplicate entry")) {
            throw error
          }
        }
      }
    }
    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup error:", error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

runDatabaseSetup()
