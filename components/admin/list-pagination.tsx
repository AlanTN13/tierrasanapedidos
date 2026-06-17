"use client";

type ListPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];

export function ListPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = "registros",
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-olive/10 bg-white/88 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-foreground/66">
        Mostrando {start}-{end} de {totalItems} {itemLabel}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-olive-dark">
          <span>Por página</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-2xl border border-olive/14 bg-white px-3 py-2 text-sm font-semibold text-olive-dark outline-none focus:ring-2 focus:ring-olive/20"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Anterior
          </button>
          <div className="min-w-24 text-center text-sm font-semibold text-olive-dark">
            Página {page} de {totalPages}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center justify-center rounded-full border border-olive/14 bg-white px-4 py-2 text-sm font-semibold text-olive-dark hover:bg-olive-soft/36 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
