// scripts/add-use-client.ts
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.join(__dirname, '..'); // Cambiá si tu estructura es distinta

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith('.tsx')) {
      callback(fullPath);
    }
  });
}

function addUseClientDirective(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.startsWith('"use client"') || content.startsWith("'use client'")) return;
  if (content.startsWith('"use server"') || content.startsWith("'use server'")) return;

  const newContent = `"use client";\n\n${content}`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Agregado 'use client' a: ${filePath}`);
}

walkDir(ROOT_DIR, addUseClientDirective);
