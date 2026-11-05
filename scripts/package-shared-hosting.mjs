import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createZip } from "./lib/zip.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");
const staticDirectory = path.join(root, ".next", "static");
const publicDirectory = path.join(root, "public");
const outputDirectory = path.join(root, "dist");
const stageDirectory = path.join(outputDirectory, "shared-hosting");
const archivePath = path.join(
  outputDirectory,
  "optima-kemasan-prima-shared-hosting.zip",
);

async function requirePath(target, label, type) {
  try {
    const metadata = await lstat(target);
    if (!metadata[type]()) throw new Error();
  } catch {
    throw new Error(`${label} tidak ditemukan: ${path.relative(root, target)}. Jalankan npm run build terlebih dahulu.`);
  }
}

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Arsip tidak dapat berisi symbolic link: ${relativePath}`);
    }
    if (entry.isDirectory()) files.push(...(await listFiles(absolutePath, relativePath)));
    else if (entry.isFile()) files.push({ absolutePath, relativePath });
    else throw new Error(`Tipe file tidak didukung dalam arsip: ${relativePath}`);
  }
  return files;
}

await requirePath(standalone, "Folder standalone", "isDirectory");
await requirePath(staticDirectory, "Folder aset statis Next.js", "isDirectory");
await requirePath(publicDirectory, "Folder public", "isDirectory");
for (const requiredFile of ["server.js", "package.json"]) {
  await requirePath(path.join(standalone, requiredFile), `File ${requiredFile}`, "isFile");
}

await mkdir(outputDirectory, { recursive: true });
await rm(stageDirectory, { recursive: true, force: true });
await rm(archivePath, { force: true });
await mkdir(stageDirectory, { recursive: true });

/*
 * CloudLinux Node.js Selector refuses to save any app setting (Node version,
 * environment variables) while the application root holds a real node_modules
 * folder: it wants to put its own symlink there. The standalone build lives in
 * app/ and a small launcher in the root starts it.
 */
const appDirectory = path.join(stageDirectory, "app");

await writeFile(
  path.join(stageDirectory, "README.txt"),
  [
    "OPTIMA KEMASAN PRIMA — NEXT.JS STANDALONE",
    "",
    "1. Stop aplikasi, lalu kosongkan folder aplikasi Node.js (hapus semua isinya,",
    "   termasuk node_modules dan .next lama). Folder DATA_DIR tidak ikut dihapus.",
    "2. Unggah dan ekstrak seluruh isi ZIP ini ke folder aplikasi tersebut.",
    "3. Atur startup file aplikasi menjadi: server.js",
    "4. Gunakan Node.js 24 (minimal 20.9), klik SAVE, lalu start aplikasi.",
    "",
    "Folder aplikasi harus berisi server.js, package.json, README.txt, dan folder app.",
    "Jangan membuat folder node_modules di folder aplikasi. CloudLinux membuat",
    "symlink node_modules sendiri dan menolak menyimpan pengaturan jika ada folder asli.",
    "Jangan klik \"Run NPM Install\" di panel; dependensi sudah ada di folder app.",
    "Alamat port disediakan oleh panel hosting melalui variabel PORT.",
    "",
    "Environment aplikasi yang wajib diisi:",
    "  SITE_URL             origin domain publik, contoh https://www.example.com",
    "  DATA_DIR             path ABSOLUT folder data admin di LUAR folder aplikasi ini,",
    "                       contoh /home/<user>/optima-data",
    "  ADMIN_PASSWORD_HASH  hasil `npm run admin:hash-password` di komputer developer",
    "  SESSION_SECRET       string acak minimal 32 karakter",
    "",
    "Produk, halaman, dan foto yang dibuat di /admin disimpan di DATA_DIR.",
    "Backup cukup dengan menyalin folder DATA_DIR. Deploy ZIP baru tidak menyentuhnya.",
    "",
    "Informasi penerapan dapat berbeda antarpenyedia shared hosting.",
    "",
  ].join("\n"),
);

await writeFile(
  path.join(stageDirectory, "server.js"),
  [
    "// Starts the Next.js standalone server in ./app. See README.txt.",
    'require("./app/server.js");',
    "",
  ].join("\n"),
);

// No dependencies here on purpose: "Run NPM Install" in the panel then installs nothing.
await writeFile(
  path.join(stageDirectory, "package.json"),
  `${JSON.stringify(
    {
      name: "optima-kemasan-prima-launcher",
      private: true,
      main: "server.js",
      engines: { node: ">=20.9" },
    },
    null,
    2,
  )}\n`,
);

const roots = [standalone, publicDirectory, staticDirectory];
const targets = [appDirectory, path.join(appDirectory, "public"), path.join(appDirectory, ".next", "static")];
for (let index = 0; index < roots.length; index += 1) {
  const files = await listFiles(roots[index]);
  for (const file of files) {
    // Next.js copies the developer's .env files into standalone; they hold
    // local secrets and would override nothing useful on the server.
    if (index === 0 && /^\.env/.test(file.relativePath)) continue;
    const destination = path.join(targets[index], file.relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    const contents = await readFile(file.absolutePath);
    await writeFile(destination, contents, { mode: (await lstat(file.absolutePath)).mode & 0o777 });
  }
}

const stagedFiles = await listFiles(stageDirectory);
const leakedEnv = stagedFiles.find((file) => /(^|\/)\.env/.test(file.relativePath));
if (leakedEnv) throw new Error(`Paket tidak boleh berisi file env: ${leakedEnv.relativePath}`);
const archiveFiles = [];
for (const file of stagedFiles) {
  const metadata = await lstat(file.absolutePath);
  archiveFiles.push({ ...file, modifiedAt: metadata.mtime, mode: metadata.mode });
}

await writeFile(archivePath, createZip(archiveFiles));
console.log(`Paket siap diunggah: ${path.relative(root, archivePath)}`);
console.log(`Root ZIP: server.js (launcher), package.json, README.txt, app/. Node.js minimal: 20.9.`);
