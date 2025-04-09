'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, Plus, Home } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetList, useGetInfiniteList, getTodos } from '@/queries/todos/queries';
import { usePatchCompletedList } from '@/queries/todos/mutation';
import { TodoDetailModal } from '@/components/todos/detailModal';
import { TodoCreateModal } from '@/components/todos/createModal';
import { AccordionSkeleton } from '@/components/todos/AccordionSkeleton';
import { TodoProps } from '@/interfaces/todos.interface';
import { TodoDeleteModal } from '@/components/todos/deleteModal';
import { TodoFilterDropdown } from '@/components/todos/dropDownFilter';
import { TodoItem } from '@/components/todos/todoItem';
import { PaginationButton } from '@/components/todos/paginationButton';

const LIMIT = 10;

const getValidOffset = (param: string | null): number => {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

function TodoList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [completed, setCompleted] = useState(searchParams.get('completed') === 'true');
  const [offset, setOffset] = useState(getValidOffset(searchParams.get('offset')));
  const [isInfiniteMode, setIsInfiniteMode] = useState(searchParams.get('all') === 'true');
  const debouncedKeyword = useDebounce(keyword, 1000);

  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const { data: paginatedData, isLoading: isPaginatedLoading } = useGetList({
    all: false,
    completed: completed ? 'true' : undefined,
    keyword: debouncedKeyword,
    offset,
    limit: LIMIT,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useGetInfiniteList(
    { all: isInfiniteMode, completed: completed ? 'true' : undefined, keyword: debouncedKeyword, limit: LIMIT },
    { enabled: isInfiniteMode },
  );

  const { mutate: patchCompleted } = usePatchCompletedList();

  const handleInfiniteObserver = useCallback(
    (node: HTMLDivElement | null) => {
      if (isInfiniteLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isInfiniteLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  useEffect(() => {
    const onFocus = () => {
      if (isInfiniteMode) queryClient.invalidateQueries({ queryKey: ['todos', 'infinite'] });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isInfiniteMode, queryClient]);

  useEffect(() => {
    setOffset(0);
  }, [completed, debouncedKeyword]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('all', isInfiniteMode ? 'true' : 'false');
    if (completed) params.set('completed', 'true');
    if (keyword) params.set('keyword', keyword);
    if (!isInfiniteMode && offset > 0) params.set('offset', offset.toString());
    router.replace(`/todos?${params.toString()}`);
  }, [completed, keyword, offset, isInfiniteMode, router]);

  useEffect(() => {
    if (!isInfiniteMode && paginatedData?.length === LIMIT) {
      const nextOffset = offset + LIMIT;
      queryClient.prefetchQuery({
        queryKey: [
          'todos',
          {
            all: false,
            completed: completed ? 'true' : undefined,
            keyword: debouncedKeyword,
            offset: nextOffset,
            limit: LIMIT,
          },
        ],
        queryFn: () =>
          getTodos({
            all: false,
            completed: completed ? 'true' : undefined,
            keyword: debouncedKeyword,
            offset: nextOffset,
            limit: LIMIT,
          }),
      });
    }
  }, [paginatedData, offset, isInfiniteMode, completed, debouncedKeyword, queryClient]);

  useEffect(() => {
    if (isInfiniteMode && hasNextPage && infiniteData) {
      const nextOffset = infiniteData.pages.flat().length;
      queryClient.prefetchQuery({
        queryKey: [
          'todos',
          'infinite',
          {
            all: true,
            completed: completed ? 'true' : undefined,
            keyword: debouncedKeyword,
            offset: nextOffset,
            limit: LIMIT,
          },
        ],
        queryFn: () =>
          getTodos({
            all: true,
            completed: completed ? 'true' : undefined,
            keyword: debouncedKeyword,
            offset: nextOffset,
            limit: LIMIT,
          }),
      });
    }
  }, [infiniteData, hasNextPage, isInfiniteMode, completed, debouncedKeyword, queryClient]);

  const isLastPage = !isInfiniteMode && offset + LIMIT > paginatedData?.totalCount;
  const isFirstPage = offset === 0;
  const hasNoData =
    !paginatedData ||
    (Array.isArray(paginatedData) && paginatedData.length === 0 && !isPaginatedLoading && !isInfiniteMode);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 relative">
      <Link href="/" className="absolute top-10 left-6 z-50 text-muted-foreground">
        <Home />
      </Link>
      <h1 className="text-3xl font-bold text-center mb-8 animate-bounce">📋 My Todo List</h1>
      <div className="flex md:flex-row items-center gap-4 mb-6 relative">
        <div className="absolute left-3 top-3">
          <SearchIcon className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search todos..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 pl-10"
        />
        <TodoFilterDropdown
          completed={completed}
          setCompleted={setCompleted}
          isInfiniteMode={isInfiniteMode}
          setIsInfiniteMode={setIsInfiniteMode}
          setOffset={setOffset}
        />
      </div>

      {isPaginatedLoading || isInfiniteLoading || isFetchingNextPage ? (
        <div className="py-6">
          <AccordionSkeleton count={10} />
        </div>
      ) : hasNoData ? (
        <div className="flex justify-center items-center h-40 text-muted-foreground">불러올 데이터가 없습니다</div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {(isInfiniteMode ? infiniteData?.pages.flat() : paginatedData)?.map(
            (todo: TodoProps, index: number, array: TodoProps[]) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                patchCompleted={patchCompleted}
                setSelectedTodoId={setSelectedTodoId}
                setDetailOpen={setDetailOpen}
                setIsAlertOpen={setIsAlertOpen}
                handleInfiniteObserver={index === array.length - 1 ? handleInfiniteObserver : undefined}
              />
            ),
          )}
        </Accordion>
      )}

      {!isInfiniteMode && !hasNoData && (
        <PaginationButton isFirstPage={isFirstPage} isLastPage={isLastPage} offset={offset} setOffset={setOffset} />
      )}

      <div className="fixed bottom-10 right-10">
        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="outline"
          size="icon"
          className="rounded-full bg-blue-400 text-white hover:bg-blue-600 p-8"
        >
          <Plus />
        </Button>
        <TodoCreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>

      <TodoDetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTodoId(null);
        }}
        id={selectedTodoId}
        setId={(id) => setSelectedTodoId(id)}
      />
      <TodoDeleteModal
        open={isAlertOpen}
        onOpenChange={(open) => {
          setIsAlertOpen(open);
        }}
        id={selectedTodoId}
        setId={(id) => setSelectedTodoId(id)}
      />
    </div>
  );
}

export default function GetTodoList() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}>
      <TodoList />
    </Suspense>
  );
}
