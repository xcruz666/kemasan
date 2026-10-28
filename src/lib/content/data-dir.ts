import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

/** Folder for admin content. Must live outside the deployed app folder in production. */
export function getDataDir(): string {
  const configured = process.env.DATA_DIR?.trim();
  return path.resolve(configured || path.join(process.cwd(), "data"));
}

export function dataPath(...segments: string[]): string {
  return path.join(getDataDir(), ...segments);
}

export type DataDirStatus = {
  path: string;
  configured: boolean;
  writable: boolean;
};

export async function checkDataDir(): Promise<DataDirStatus> {
  const directory = getDataDir();
  const configured = Boolean(process.env.DATA_DIR?.trim());
  try {
    await mkdir(directory, { recursive: true });
    await access(directory, constants.R_OK | constants.W_OK);
    return { path: directory, configured, writable: true };
  } catch (error) {
    console.error(`[content] Folder data tidak dapat diakses: ${directory}`, error);
    return { path: directory, configured, writable: false };
  }
}
