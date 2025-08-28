export default function PaginationComponent({ totalPage, page, setPage }) {
  if (!totalPage || totalPage <= 1) return null

  const prev = () => page > 1 && setPage(page - 1)
  const next = () => page < totalPage && setPage(page + 1)

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={prev}
        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        disabled={page === 1}
      >
        Prev
      </button>
      <span>
        Page {page} of {totalPage}
      </span>
      <button
        onClick={next}
        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        disabled={page === totalPage}
      >
        Next
      </button>
    </div>
  )
}
