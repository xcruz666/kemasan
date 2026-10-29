import { cache } from "react";
import { dataPath } from "./data-dir";
import { DEFAULT_LANDING, type LandingContent, normalizeLanding } from "./landing-shared";
import { readJson, writeJsonAtomic } from "./storage";

const landingFile = () => dataPath("landing.json");

/** Throws when the data folder cannot be read. Admin use. */
export async function readLanding(): Promise<LandingContent> {
  let value: unknown = null;
  try {
    value = await readJson(landingFile());
  } catch (error) {
    // A corrupt file falls back to defaults so the admin can save over it.
    if (!(error instanceof SyntaxError)) throw error;
    console.error("[content] landing.json rusak, memakai isi bawaan.");
  }
  return normalizeLanding(value);
}

/** Never throws; once per request. Public pages use this. */
export const getLanding = cache(async (): Promise<LandingContent> => {
  try {
    return await readLanding();
  } catch (error) {
    console.error("[content] Gagal membaca isi halaman utama:", error);
    return DEFAULT_LANDING;
  }
});

export async function saveLanding(content: LandingContent) {
  await writeJsonAtomic(landingFile(), content);
}
