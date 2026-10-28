"use client";

import { type ChangeEvent, type ReactNode, useId, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { Bold, ImagePlus, Italic, Link, List, ListOrdered, Quote } from "lucide-react";
import { uploadUrl } from "@/lib/content/image-ref";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload-image";

type Mode = "visual" | "markdown";

function askAlt(): string | null {
  for (;;) {
    const alt = window.prompt("Teks alt gambar (wajib, jelaskan isi gambar):", "");
    if (alt === null) return null;
    const trimmed = alt.trim().slice(0, 160);
    if (trimmed) return trimmed;
  }
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="admin-tool"
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  label,
  error,
}: {
  id?: string;
  value: string;
  onChange: (markdown: string) => void;
  label: string;
  error?: string;
}) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const labelId = `${baseId}-label`;
  const [mode, setMode] = useState<Mode>("visual");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  // Uploads are async; read the latest Markdown when the upload finishes.
  const latestValue = useRef(value);
  latestValue.current = value;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
        code: false,
        codeBlock: false,
        underline: false,
      }),
      Image,
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "admin-prose",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
          }
        : null,
  });

  function switchMode(next: Mode) {
    if (next === mode) return;
    if (next === "visual") {
      editor?.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    }
    setMode(next);
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Alamat link (kosongkan untuk menghapus link):", previous ?? "https://");
    if (href === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href.trim() === "") chain.unsetLink().run();
    else chain.setLink({ href: href.trim() }).run();
  }

  async function insertImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    const result = await uploadImageFile(file);
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    const alt = askAlt();
    if (alt === null) return;
    const src = uploadUrl(result.image.file);
    if (mode === "visual" && editor) {
      editor.chain().focus().setImage({ src, alt }).run();
    } else {
      const current = latestValue.current;
      const safeAlt = alt.replace(/[[\]]/g, "");
      const separator = current.trim() ? "\n\n" : "";
      onChange(`${current.replace(/\s+$/, "")}${separator}![${safeAlt}](${src})\n`);
    }
  }

  const visualDisabled = mode !== "visual" || !editor;

  return (
    <div className="admin-field">
      <span className="admin-label" id={labelId}>
        {label}
      </span>
      <div className={error ? "admin-editor admin-editor-invalid" : "admin-editor"}>
        <div className="admin-editor-bar">
          <div className="admin-editor-tabs" role="group" aria-label="Mode editor">
            <button
              type="button"
              className="admin-editor-tab"
              aria-pressed={mode === "visual"}
              onClick={() => switchMode("visual")}
            >
              Visual
            </button>
            <button
              type="button"
              className="admin-editor-tab"
              aria-pressed={mode === "markdown"}
              onClick={() => switchMode("markdown")}
            >
              Markdown
            </button>
          </div>
          <div className="admin-toolbar" role="toolbar" aria-label="Format teks">
            {mode === "visual" && (
              <>
                <ToolButton
                  label="Heading 2"
                  active={active?.h2 ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <span className="admin-tool-text">H2</span>
                </ToolButton>
                <ToolButton
                  label="Heading 3"
                  active={active?.h3 ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <span className="admin-tool-text">H3</span>
                </ToolButton>
                <ToolButton
                  label="Tebal"
                  active={active?.bold ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold size={16} aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label="Miring"
                  active={active?.italic ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic size={16} aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label="Daftar"
                  active={active?.bulletList ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  <List size={16} aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label="Daftar bernomor"
                  active={active?.orderedList ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered size={16} aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label="Kutipan"
                  active={active?.blockquote ?? false}
                  disabled={visualDisabled}
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                  <Quote size={16} aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label="Link"
                  active={active?.link ?? false}
                  disabled={visualDisabled}
                  onClick={setLink}
                >
                  <Link size={16} aria-hidden="true" />
                </ToolButton>
              </>
            )}
            <ToolButton
              label={uploading ? "Mengunggah gambar…" : "Gambar"}
              disabled={uploading || (mode === "visual" && !editor)}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus size={16} aria-hidden="true" />
            </ToolButton>
            <input
              ref={fileInput}
              className="admin-visually-hidden"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              tabIndex={-1}
              aria-hidden="true"
              onChange={insertImage}
            />
          </div>
        </div>
        <div hidden={mode !== "visual"}>
          <EditorContent editor={editor} />
        </div>
        {mode === "markdown" && (
          <textarea
            id={baseId}
            className="admin-editor-textarea"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-labelledby={labelId}
            rows={16}
            spellCheck
          />
        )}
      </div>
      <div aria-live="polite">
        {uploading && <p className="admin-help">Mengunggah gambar…</p>}
        {uploadError && <p className="admin-error">{uploadError}</p>}
      </div>
      {error && (
        <p className="admin-error" id={`${baseId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
