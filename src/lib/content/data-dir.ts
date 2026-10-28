import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

/*
 * The turbopackIgnore comments stop Next.js file tracing from treating these
 * runtime paths as build inputs; without them the whole project (src, docs,
 * dist, local data) is copied into the standalone deploy package.
 */

/** Folder for admin content. Must live outside the deployed app folder in production. */
export function getDataDir(): string {
  const configured = process.env.DATA_DIR?.trim();
  return path.resolve(
    /*turbopackIgnore: true*/ configured ||
      path.join(/*turbopackIgnore: true*/ process.cwd(), "data"),
  );
}

export function dataPath(...segments: string[]): string {
  return path.join(/*turbopackIgnore: true*/ getDataDir(), ...segments);
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
