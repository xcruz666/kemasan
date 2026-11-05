// Zips the project source into dist/optima-kemasan-prima-source.zip.
// Run with: npm run zip:source
import { execFileSync } from "node:child_process";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createZip } from "./lib/zip.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "dist");
const archivePath = path.join(outputDirectory, "optima-kemasan-prima-source.zip");
/** Everything sits under this folder inside the ZIP, so extracting doesn't spill files. */
const archiveFolder = "optima-kemasan-prima";

/** Skipped wherever they appear. */
const SKIPPED_NAMES = new Set([
  "node_modules", // npm install recreates it
  ".next", // build output
  ".git", // history; clone the repo if you need it
  ".DS_Store",
  "test-results",
]);
/** Skipped only at the project root. */
const SKIPPED_ROOT = new Set([
  "dist", // build output, and where this ZIP is written
  "optima-data", // local admin content
  "data", // local admin content (default DATA_DIR)
]);
const ENV_EXAMPLE = ".env.example";

/** .env, .env.local and similar hold real secrets and never go into the ZIP. */
function isSecretEnvFile(name) {
  return name.startsWith(".env") && name !== ENV_EXAMPLE;
}

function isSkipped(name, relativePath) {
  return (
    SKIPPED_NAMES.has(name) ||
    (relativePath === name && SKIPPED_ROOT.has(name)) ||
    name.endsWith(".tsbuildinfo") ||
    isSecretEnvFile(name)
  );
}

async function listFiles(directory, prefix = "") {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (isSkipped(entry.name, relativePath)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolutePath, relativePath)));
    else if (entry.isFile()) files.push({ absolutePath, relativePath });
    else console.warn(`Dilewati (bukan file biasa): ${relativePath}`);
  }
  return files;
}

/**
 * The local .env.example may have been filled with real values. The ZIP gets
 * the committed version, which is the blank template.
 */
function committedEnvExample() {
  try {
    return execFileSync("git", ["show", `HEAD:${ENV_EXAMPLE}`], { cwd: root, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

const archiveFiles = [];
for (const file of await listFiles(root)) {
  const metadata = await lstat(file.absolutePath);
  const entry = {
    absolutePath: file.absolutePath,
    relativePath: path.posix.join(archiveFolder, file.relativePath),
    modifiedAt: metadata.mtime,
    mode: metadata.mode,
  };
  if (file.relativePath === ENV_EXAMPLE) {
    const template = committedEnvExample();
    if (!template) {
      console.warn(`Dilewati: ${ENV_EXAMPLE} (versi commit tidak bisa dibaca dari git).`);
      continue;
    }
    if (!template.equals(await readFile(file.absolutePath))) {
      entry.contents = template;
      console.log(`${ENV_EXAMPLE}: memakai versi commit (versi lokal berbeda dan tidak ikut).`);
    }
  }
  archiveFiles.push(entry);
}

const leaked = archiveFiles.find((file) => isSecretEnvFile(path.posix.basename(file.relativePath)));
if (leaked) throw new Error(`ZIP tidak boleh berisi file env: ${leaked.relativePath}`);

await mkdir(outputDirectory, { recursive: true });
await writeFile(archivePath, createZip(archiveFiles));

const size = (await lstat(archivePath)).size;
console.log(`ZIP siap: ${path.relative(root, archivePath)} (${archiveFiles.length} file, ${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Tidak ikut: node_modules, .next, .git, dist, optima-data, data, file .env (kecuali ${ENV_EXAMPLE} versi commit).`);
