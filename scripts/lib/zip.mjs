// Dependency-free ZIP writer (deflate, classic ZIP: < 65,535 files, < 4 GB).
// Used by package-shared-hosting.mjs and zip-source.mjs.
import { readFileSync } from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

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

/**
 * files: { absolutePath, relativePath, modifiedAt: Date, mode: number, contents?: Buffer }[]
 * contents, when given, is used instead of reading absolutePath.
 * Returns the whole archive as one Buffer.
 */
export function createZip(files) {
  if (files.length > 0xffff) {
    throw new Error("Jumlah file melebihi batas format ZIP klasik.");
  }

  const localEntries = [];
  const centralEntries = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.relativePath.split(path.sep).join("/"));
    if (name.length > 0xffff) throw new Error(`Nama file terlalu panjang: ${file.relativePath}`);

    const source = file.contents ?? readFileSync(file.absolutePath);
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
