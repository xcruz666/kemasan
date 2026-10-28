import { CONTENT_TYPES, type ImageExtension, readUpload } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const bytes = await readUpload(file);
  if (!bytes) return new Response("Not found", { status: 404 });

  const extension = file.slice(file.lastIndexOf(".") + 1) as ImageExtension;
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": CONTENT_TYPES[extension],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
