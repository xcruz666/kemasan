"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const LIGHTBOX_ZOOM = 2.5;
const SWIPE_DISTANCE = 50;
const TAP_DISTANCE = 6;

type Offset = { x: number; y: number };

/**
 * Product photos. Mouse users get an in-place zoom that follows the cursor and
 * a preview on thumbnail hover; a click or tap opens a full-screen viewer.
 */
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const first = images[0];
  const current = images[active];

  function onStagePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    event.currentTarget.style.setProperty("--zoom-x", `${x}%`);
    event.currentTarget.style.setProperty("--zoom-y", `${y}%`);
  }

  return (
    <div className="product-gallery">
      <button
        type="button"
        className={`product-gallery-stage${hoverZoom ? " is-zoomed" : ""}`}
        // Keep the first photo's shape so switching photos doesn't move the page.
        style={{ aspectRatio: `${first.width} / ${first.height}` }}
        aria-label={`Perbesar foto: ${current.alt}`}
        onClick={() => setOpen(true)}
        onPointerEnter={(event) => setHoverZoom(event.pointerType === "mouse")}
        onPointerLeave={() => setHoverZoom(false)}
        onPointerMove={onStagePointerMove}
      >
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          sizes="(max-width: 900px) 100vw, 50vw"
          preload={active === 0}
          unoptimized
        />
        <span className="product-gallery-hint" aria-hidden="true">
          <Maximize2 size={16} />
        </span>
      </button>

      {images.length > 1 && (
        <ul className="product-gallery-thumbs">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                className="product-gallery-thumb"
                aria-label={`Lihat foto ${index + 1}`}
                aria-pressed={index === active}
                onClick={() => setActive(index)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setActive(index);
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 900px) 33vw, 12vw"
                  unoptimized
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Lightbox
          images={images}
          index={active}
          onIndexChange={setActive}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    startX: number;
    startY: number;
    offset: Offset;
    onImage: boolean;
    moved: boolean;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const image = images[index];
  const zoomed = scale > 1;
  const many = images.length > 1;

  useEffect(() => {
    dialogRef.current?.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
    };
  }, []);

  function resetZoom() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function go(step: number) {
    resetZoom();
    onIndexChange((index + step + images.length) % images.length);
  }

  /** Keeps the zoomed photo covering its own frame instead of sliding away. */
  function clamp(next: Offset): Offset {
    const element = imageRef.current;
    if (!element) return next;
    const maxX = ((LIGHTBOX_ZOOM - 1) * element.offsetWidth) / 2;
    const maxY = ((LIGHTBOX_ZOOM - 1) * element.offsetHeight) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  /** Zooms in so the point under the pointer stays where it is. */
  function zoomAt(clientX: number, clientY: number) {
    const element = imageRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    setScale(LIGHTBOX_ZOOM);
    setOffset(clamp({ x: x * (1 - LIGHTBOX_ZOOM), y: y * (1 - LIGHTBOX_ZOOM) }));
  }

  function toggleZoom() {
    if (zoomed) resetZoom();
    else setScale(LIGHTBOX_ZOOM);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      offset,
      onImage: imageRef.current?.contains(event.target as Node) ?? false,
      moved: false,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) > TAP_DISTANCE) {
      state.moved = true;
      if (zoomed) setPanning(true);
    }
    if (zoomed && state.moved) {
      setOffset(clamp({ x: state.offset.x + dx, y: state.offset.y + dy }));
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    drag.current = null;
    setPanning(false);
    if (!state) return;
    const dx = event.clientX - state.startX;
    if (!state.moved) {
      // A tap on the photo zooms; a tap on the dark area around it closes.
      if (!state.onImage) dialogRef.current?.close();
      else if (zoomed) resetZoom();
      else zoomAt(event.clientX, event.clientY);
    } else if (!zoomed && many && Math.abs(dx) > SWIPE_DISTANCE) {
      go(dx < 0 ? 1 : -1);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (!many) return;
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  }

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Pratinjau foto produk"
      onClose={onClose}
      onKeyDown={onKeyDown}
    >
      <div className="lightbox-bar">
        <span className="lightbox-count">
          {many ? `${index + 1} / ${images.length}` : ""}
        </span>
        <button
          type="button"
          className="lightbox-icon"
          aria-label={zoomed ? "Perkecil" : "Perbesar"}
          onClick={toggleZoom}
        >
          {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
        <button
          type="button"
          className="lightbox-icon"
          aria-label="Tutup"
          onClick={() => dialogRef.current?.close()}
          autoFocus
        >
          <X size={22} />
        </button>
      </div>

      <div className="lightbox-body">
        <div
          className={`lightbox-stage${zoomed ? " is-zoomed" : ""}${panning ? " is-panning" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current = null;
            setPanning(false);
          }}
        >
          <Image
            ref={imageRef}
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
            draggable={false}
            unoptimized
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          />
        </div>
        {many && (
          <>
            <button
              type="button"
              className="lightbox-icon lightbox-nav lightbox-prev"
              aria-label="Foto sebelumnya"
              onClick={() => go(-1)}
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              className="lightbox-icon lightbox-nav lightbox-next"
              aria-label="Foto berikutnya"
              onClick={() => go(1)}
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      {image.alt && <p className="lightbox-caption">{image.alt}</p>}
    </dialog>
  );
}
