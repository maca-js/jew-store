import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageUrl = (p: number) => `${basePath}?page=${p}`

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('…')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 py-6 font-sans text-xs tracking-widest uppercase">
      {currentPage > 1 ? (
        <Link
          href={pageUrl(currentPage - 1)}
          className="px-3 py-2 text-brand-muted hover:text-brand-black transition-colors"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-3 py-2 text-brand-border cursor-default">← Prev</span>
      )}

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-brand-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            className={`px-3 py-2 transition-colors ${
              p === currentPage
                ? 'bg-brand-black text-brand-white'
                : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageUrl(currentPage + 1)}
          className="px-3 py-2 text-brand-muted hover:text-brand-black transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-2 text-brand-border cursor-default">Next →</span>
      )}
    </div>
  )
}
