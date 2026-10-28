import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

function isMissing(error: unknown) {
  return (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
}

export async function readJson(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/** Write to a temporary file, then rename, so readers never see half a file. */
export async function writeJsonAtomic(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${randomUUID()}`;
  try {
    await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(temporary, file);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

export type JsonCollection<T> = { items: T[]; brokenFiles: string[] };

/** Read every *.json in a folder. Invalid or unreadable files are skipped and reported. */
export async function readJsonDirectory<T>(
  directory: string,
  isValid: (value: unknown) => value is T,
): Promise<JsonCollection<T>> {
  let names: string[];
  try {
    names = await readdir(directory);
  } catch (error) {
    if (isMissing(error)) return { items: [], brokenFiles: [] };
    throw error;
  }

  const items: T[] = [];
  const brokenFiles: string[] = [];
  for (const name of names.filter((entry) => entry.endsWith(".json")).sort()) {
    try {
      const value: unknown = JSON.parse(
        await readFile(path.join(/*turbopackIgnore: true*/ directory, name), "utf8"),
      );
      if (isValid(value)) items.push(value);
      else brokenFiles.push(name);
    } catch {
      brokenFiles.push(name);
    }
  }
  if (brokenFiles.length > 0) {
    console.error(
      `[content] File rusak dilewati di ${directory}: ${brokenFiles.join(", ")}`,
    );
  }
  return { items, brokenFiles };
}

export async function removeFile(file: string) {
  await rm(file, { force: true });
}
