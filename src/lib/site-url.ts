/** Public site origin for canonical URLs. */
export function getSiteUrl(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;

  let siteUrl: URL;
  try {
    siteUrl = new URL(value);
  } catch {
    throw new Error(
      "SITE_URL must be a valid public origin, such as https://www.example.com.",
    );
  }

  if (!['http:', 'https:'].includes(siteUrl.protocol)) {
    throw new Error("SITE_URL must use HTTP or HTTPS.");
  }
  if (siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
    throw new Error(
      "SITE_URL must contain the public origin only, without a path, query, or fragment.",
    );
  }

  return new URL(siteUrl.origin);
}
