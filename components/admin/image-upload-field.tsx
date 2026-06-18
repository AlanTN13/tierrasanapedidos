"use client";

import { useState } from "react";

type ImageUploadFieldProps = {
  currentImagePath?: string | null;
  currentImageAlt: string;
  emptyMessage: string;
  removeFieldName: string;
  fileFieldName?: string;
  helperText: string;
};

export function ImageUploadField({
  currentImagePath,
  currentImageAlt,
  emptyMessage,
  removeFieldName,
  fileFieldName = "imageFile",
  helperText,
}: ImageUploadFieldProps) {
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const hasCurrentImage = Boolean(currentImagePath);

  return (
    <div className="space-y-3 rounded-[1.6rem] border border-dashed border-olive/18 bg-white/80 p-4">
      <input
        type="hidden"
        name={removeFieldName}
        value={removeCurrentImage ? "1" : "0"}
      />

      {hasCurrentImage && !removeCurrentImage ? (
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">
                Imagen actual
              </span>
              <button
                type="button"
                onClick={() => setRemoveCurrentImage(true)}
                className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Borrar imagen actual
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImagePath ?? ""}
                alt={currentImageAlt}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <p className="text-sm text-foreground/66">{currentImagePath}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-foreground/66">
            {removeCurrentImage
              ? "La imagen actual se va a quitar al guardar."
              : emptyMessage}
          </p>

          {hasCurrentImage && removeCurrentImage ? (
            <button
              type="button"
              onClick={() => setRemoveCurrentImage(false)}
              className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36"
            >
              Mantener imagen actual
            </button>
          ) : null}
        </div>
      )}

      <input
        type="file"
        name={fileFieldName}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="w-full rounded-2xl border border-olive/14 bg-white px-4 py-3 text-sm text-olive-dark file:mr-4 file:rounded-full file:border-0 file:bg-olive file:px-4 file:py-2 file:font-semibold file:text-white"
      />
      <p className="text-xs leading-5 text-foreground/58">{helperText}</p>
    </div>
  );
}
