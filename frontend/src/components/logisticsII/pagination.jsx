import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function getPaginationNumbers(current, total) {
  const delta = 2; // pages to show before/after current
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last !== 1) {
        rangeWithDots.push(<PaginationEllipsis/>);
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}

export default function PaginationComponent({totalPage, page, setPage}){
    
    return (
        <Pagination>
            <PaginationContent>          
            {/* Previous Button */}
            <PaginationItem>
                <PaginationPrevious
                to="#"
                onClick={(e) => {
                    e.preventDefault();
                    setPage(p => Math.max(p - 1, 1));
                }}
                aria-disabled={page === 1}
                />
            </PaginationItem>

            {/* Page Numbers */}
            {getPaginationNumbers(page, totalPage).map((num, idx) => (
            <PaginationItem key={idx}>
                {num === "..." ? (
                <span className="px-2">...</span>
                ) : (
                <PaginationLink
                    to="#"
                    onClick={(e) => {
                    e.preventDefault();
                    setPage(num);
                    }}
                    isActive={page === num}
                >
                    {num}
                </PaginationLink>
                )}
            </PaginationItem>
            ))}

            {/* Next Button */}
            <PaginationItem>
                <PaginationNext
                to="#"
                onClick={(e) => {
                    e.preventDefault();
                    setPage(p => Math.min(p + 1, totalPage));
                }}
                aria-disabled={page === totalPage}
                />
            </PaginationItem>
            </PaginationContent>
      </Pagination>
    )
}