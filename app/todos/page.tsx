'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FilterIcon, LoaderCircle, SearchIcon, Ellipsis, Plus, Home } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/use-toast';
import { useGetList, useGetInfiniteList, getTodos } from '@/queries/todos/queries';
import { useDeleteTodo, usePatchCompletedList } from '@/queries/todos/mutation';
import { TodoDetailModal } from '@/components/todos/detailModal';
import { TodoCreateModal } from '@/components/todos/createModal';
import { AccordionSkeleton } from '@/components/todos/AccordionSkeleton';
import { TodoProps } from '@/interfaces/todos.interface';

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

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const handleDeleteClick = (id: number) => {
    setTodoToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete !== null) {
      deleteTodo(todoToDelete, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '할 일이 성공적으로 삭제되었습니다.' });
          setTodoToDelete(null);
          setIsAlertOpen(false);
        },
      });
    }
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={completed} onCheckedChange={(checked) => setCompleted(!!checked)}>
              완료된 목록
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isInfiniteMode}
              onCheckedChange={(checked) => {
                setIsInfiniteMode(!!checked);
                setCompleted(false);
                setOffset(0);
              }}
            >
              무한 스크롤
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <AccordionItem
                value={todo.id.toString()}
                key={todo.id}
                ref={index === array.length - 1 ? handleInfiniteObserver : null}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => patchCompleted({ id: todo.id, completed: !todo.completed })}
                    className="mt-6 data-[state=checked]:bg-blue-600"
                  />
                  <div className="flex-1">
                    <AccordionTrigger className="text-left">
                      <div className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground mt-2">
                      <div className="break-all">{todo.description || '설명이 없습니다.'}</div>
                    </AccordionContent>
                  </div>
                  <div className="mt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="flex flex-col items-center">
                        <DropdownMenuItem
                          onSelect={() => {
                            setDetailOpen(true);
                            setSelectedTodoId(todo.id);
                          }}
                          className="cursor-pointer w-full flex justify-center"
                        >
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="w-full" />
                        <DropdownMenuItem
                          onSelect={() => handleDeleteClick(todo.id)}
                          className="cursor-pointer w-full flex justify-center"
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionItem>
            ),
          )}
        </Accordion>
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
      {!isInfiniteMode && !hasNoData && (
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
      )}
      <TodoDetailModal
        id={selectedTodoId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTodoId(null);
        }}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Todo 삭제</AlertDialogTitle>
            <AlertDialogDescription>정말로 이 할 일을 삭제하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-red-400 hover:bg-red-600 text-white" onClick={handleConfirmDelete}>
              {isDeleting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
