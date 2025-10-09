// scripts/merge-prisma.ts
import fs from "fs";
import path from "path";

const prismaDir = path.join(__dirname, "../prisma");
const output = path.join(prismaDir, "schema.prisma");

// Read all .prisma files except schema.prisma
const files = fs
  .readdirSync(prismaDir)
  .filter((f) => f.endsWith(".prisma") && f !== "schema.prisma");

let merged = "";
for (const file of files) {
  const content = fs.readFileSync(path.join(prismaDir, file), "utf-8");
  merged += "\n\n" + content;
}

// Write merged content to schema.prisma
fs.writeFileSync(output, merged.trim());
console.log("✅ Prisma schema merged successfully!");
