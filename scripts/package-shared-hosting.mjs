import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";

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

const crcTable = new Uint32Array(256);
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date) {
  const year = Math.max(1980, date.getFullYear());
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function createZip(files) {
  if (files.length > 0xffff) {
    throw new Error("Jumlah file melebihi batas format ZIP klasik.");
  }

  const localEntries = [];
  const centralEntries = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.relativePath.split(path.sep).join("/"));
    if (name.length > 0xffff) throw new Error(`Nama file terlalu panjang: ${file.relativePath}`);

    const source = readFileSync(file.absolutePath);
    const compressed = deflateRawSync(source, { level: 6 });
    const checksum = crc32(source);
    if (source.length > 0xffffffff || compressed.length > 0xffffffff) {
      throw new Error(`File melebihi batas ZIP 4 GB: ${file.relativePath}`);
    }

    const date = dosTimestamp(file.modifiedAt);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(date.time, 10);
    local.writeUInt16LE(date.day, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(source.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localEntries.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(date.time, 12);
    central.writeUInt16LE(date.day, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(source.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(((file.mode & 0xffff) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centralEntries.push(central, name);

    offset += local.length + name.length + compressed.length;
    if (offset > 0xffffffff) throw new Error("Ukuran arsip melebihi batas ZIP klasik 4 GB.");
  }

  const centralDirectory = Buffer.concat(centralEntries);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localEntries, centralDirectory, end]);
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

await writeFile(
  path.join(stageDirectory, "README.txt"),
  [
    "OPTIMA KEMASAN PRIMA — NEXT.JS STANDALONE",
    "",
    "1. Unggah dan ekstrak seluruh isi ZIP ini ke folder aplikasi Node.js Anda.",
    "2. Atur startup file aplikasi menjadi: server.js",
    "3. Gunakan Node.js 24 (minimal 20.9).",
    "4. Mulai atau restart aplikasi dari panel shared hosting.",
    "",
    "Folder ekstraksi harus berisi server.js, package.json, folder .next, dan folder public.",
    "Jangan menghapus node_modules, .next, atau file server lainnya.",
    "Jangan klik \"Run NPM Install\" di panel; dependensi sudah ada di dalam ZIP.",
    "Alamat port disediakan oleh panel hosting melalui variabel PORT.",
    "",
    "Environment aplikasi yang wajib diisi:",
    "  SITE_URL             origin domain publik, contoh https://www.example.com",
    "  DATA_DIR             folder data admin di LUAR folder aplikasi ini,",
    "                       contoh /home/<user>/optima-data",
    "  ADMIN_PASSWORD_HASH  hasil `npm run admin:hash-password` di komputer developer",
    "  SESSION_SECRET       string acak minimal 32 karakter",
    "",
    "Produk, halaman, dan foto yang dibuat di /admin disimpan di DATA_DIR.",
    "Backup cukup dengan menyalin folder DATA_DIR. Deploy ZIP baru tidak menyentuhnya.",
    "",
    "Untuk hosting berbasis cPanel Passenger, buat aplikasi melalui Setup Node.js App,",
    "pilih versi Node.js 20.9 atau lebih baru, arahkan Application root ke folder ini,",
    "dan tetapkan server.js sebagai Application startup file.",
    "",
    "Informasi penerapan dapat berbeda antarpenyedia shared hosting.",
    "",
  ].join("\n"),
);

await mkdir(path.join(stageDirectory, ".next"), { recursive: true });
await mkdir(path.join(stageDirectory, "public"), { recursive: true });
await mkdir(path.join(stageDirectory, ".next", "static"), { recursive: true });

const roots = [standalone, publicDirectory, staticDirectory];
const targets = [stageDirectory, path.join(stageDirectory, "public"), path.join(stageDirectory, ".next", "static")];
for (let index = 0; index < roots.length; index += 1) {
  const files = await listFiles(roots[index]);
  for (const file of files) {
    const destination = path.join(targets[index], file.relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    const contents = await readFile(file.absolutePath);
    await writeFile(destination, contents, { mode: (await lstat(file.absolutePath)).mode & 0o777 });
  }
}

const stagedFiles = await listFiles(stageDirectory);
const archiveFiles = [];
for (const file of stagedFiles) {
  const metadata = await lstat(file.absolutePath);
  archiveFiles.push({ ...file, modifiedAt: metadata.mtime, mode: metadata.mode });
}

await writeFile(archivePath, createZip(archiveFiles));
console.log(`Paket siap diunggah: ${path.relative(root, archivePath)}`);
console.log(`Isi arsip berada di root ZIP. Startup file: server.js. Node.js minimal: 20.9.`);
