const fs = require("fs");
const path = require("path");

// Create upload directories
const uploadDir = path.join(process.cwd(), "uploads");
const folders = ["items", "borrowing-letters", "avatars", "general"];

console.log("Creating upload directories...");

// Create main uploads directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory");
} else {
  console.log("📁 Uploads directory already exists");
}

// Create subfolders
folders.forEach((folder) => {
  const folderPath = path.join(uploadDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Created ${folder} directory`);
  } else {
    console.log(`📁 ${folder} directory already exists`);
  }
});

// Create .gitkeep files to ensure folders are tracked
folders.forEach((folder) => {
  const gitkeepPath = path.join(uploadDir, folder, ".gitkeep");
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, "");
    console.log(`✅ Created .gitkeep in ${folder}`);
  }
});

console.log("🎉 Upload directories setup complete!");
console.log(`📍 Upload path: ${uploadDir}`);
