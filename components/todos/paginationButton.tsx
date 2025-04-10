import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const LIMIT = 10;

interface PaginationProps {
  isFirstPage: boolean;
  isLastPage: boolean;
  offset: number;
  setOffset: (offset: number) => void;
}

export function PaginationButton({ isFirstPage, isLastPage, offset, setOffset }: PaginationProps) {
  return (
    <div className="flex justify-center mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={isFirstPage ? 'pointer-events-none opacity-50' : ''}
              onClick={(e) => {
                e.preventDefault();
                setOffset(Math.max(0, offset - LIMIT));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
              {offset / LIMIT + 1}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              className={isLastPage ? 'pointer-events-none opacity-50' : ''}
              onClick={(e) => {
                e.preventDefault();
                if (!isLastPage) setOffset((offset / LIMIT + 1) * LIMIT);
              }}
            >
              {offset / LIMIT + 2}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              className={isLastPage ? 'pointer-events-none opacity-50' : ''}
              onClick={(e) => {
                e.preventDefault();
                setOffset(offset + LIMIT);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
