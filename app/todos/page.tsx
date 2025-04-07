'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useGetAllList, useGetInfiniteList } from '@/queries/todos/queries';
import { usePatchCompletedList } from '@/queries/todos/mutation';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

const LIMIT = 10;

const getValidOffset = (param: string | null): number => {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

function TodoList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const completedParam = searchParams.get('completed');
  const keywordParam = searchParams.get('keyword') || '';
  const offsetParam = searchParams.get('offset');

  const [completed, setCompleted] = useState(completedParam === 'true');
  const [keyword, setKeyword] = useState(keywordParam);
  const debouncedKeyword = useDebounce(keyword, 200);
  const [offset, setOffset] = useState(getValidOffset(offsetParam));
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const { data: paginatedData, isLoading: isPaginatedLoading } = useGetAllList({
    all: false,
    completed: completed ? 'true' : undefined,
    keyword: debouncedKeyword,
    offset: offset,
    limit: LIMIT,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useGetInfiniteList({
    all: true,
    completed: completed ? 'true' : undefined,
    keyword: debouncedKeyword,
    limit: LIMIT,
  });

  const { mutate: patchCompleted } = usePatchCompletedList();

  const lastTodoElementRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isInfiniteLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isInfiniteLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const isLastPage = !isInfiniteMode && offset + LIMIT > paginatedData?.totalCount;
  const isFirstPage = offset === 0;
  const hasNoData =
    !paginatedData ||
    (Array.isArray(paginatedData) && paginatedData.length === 0 && !isPaginatedLoading && !isInfiniteMode);

  return (
    <div className="p-8">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">📋 투두 리스트</h1>
      </div>
      <div className="flex gap-4 m-5">
        <Input
          placeholder="키워드를 검색해주세요"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (isInfiniteMode) {
              setOffset(0);
            }
          }}
          className="w-60 flex-1"
        />
        <Button
          onClick={() => {
            setOffset(0);
          }}
        >
          검색
        </Button>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="completed"
            checked={completed}
            onCheckedChange={(checked) => {
              setCompleted(!!checked);
              setOffset(0);
            }}
          />
          <label htmlFor="completed" className="text-sm">
            완료된 항목만 보기
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="infinite"
            checked={isInfiniteMode}
            onCheckedChange={(checked) => {
              setIsInfiniteMode(!!checked);
              if (checked) {
                setCompleted(false);
                setOffset(0);
              } else {
                setOffset(0);
              }
            }}
          />
          <label htmlFor="infinite" className="text-sm">
            무한 스크롤 모드
          </label>
        </div>
      </div>

      {isPaginatedLoading && !isInfiniteMode ? (
        <div className="flex justify-center items-center h-40">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </div>
      ) : hasNoData && !isInfiniteMode ? (
        <div className="flex justify-center items-center h-40 text-gray-500">불러올 데이터가 없습니다</div>
      ) : (
        <>
          <div className="m-5 px-4 border rounded-lg shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {(isInfiniteMode ? infiniteData?.pages.flat() : paginatedData)?.map(
                (todo: TodoProps, index: number, array: TodoProps[]) => (
                  <AccordionItem
                    value={todo.id.toString()}
                    key={todo.id}
                    ref={index === array.length - 1 ? lastTodoElementRefCallback : null}
                  >
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={todo.completed}
                        className="mt-5 data-[state=checked]:bg-green-500"
                        onCheckedChange={() => patchCompleted({ id: todo.id, completed: !todo.completed })}
                      />
                      <div className="flex-1">
                        <AccordionTrigger>
                          <h3 className="font-medium">{todo.title}</h3>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {todo.description}
                        </AccordionContent>
                      </div>
                    </div>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </div>
          {isInfiniteMode && isFetchingNextPage && (
            <div className="flex justify-center items-center h-20">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              추가 데이터 로딩 중...
            </div>
          )}
        </>
      )}
      {!isInfiniteMode && (
        <div className="flex justify-center gap-4 mt-5">
          <Pagination className="mt-4">
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
                <PaginationLink href="#" isActive className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {offset / LIMIT + 1}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" className="hover:bg-primary/10">
                  {offset / LIMIT + 2}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={isLastPage || hasNoData ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    setOffset(offset + LIMIT);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default function GetAllList() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}>
      <TodoList />
    </Suspense>
  );
}
