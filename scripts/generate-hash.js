const bcrypt = require("bcryptjs")

async function generateHashes() {
  console.log("Generating password hashes...")

  const adminHash = await bcrypt.hash("admin123", 12)
  const userHash = await bcrypt.hash("user123", 12)

  console.log("Admin password hash:", adminHash)
  console.log("User password hash:", userHash)

  console.log("\nSQL to update users:")
  console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@simpel-ti.com';`)
  console.log(`UPDATE users SET password_hash = '${userHash}' WHERE email = 'user@simpel-ti.com';`)
}

generateHashes().catch(console.error)
