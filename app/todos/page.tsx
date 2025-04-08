'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import React from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { FilterIcon, LoaderCircle, SearchIcon, Ellipsis, Plus } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useGetAllList, useGetInfiniteList } from '@/queries/todos/queries';
import { useDeleteTodo, usePatchCompletedList } from '@/queries/todos/mutation';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { TodoDetailModal } from '@/components/todos/detailModal';
import { TodoCreateModal } from '@/components/todos/createModal';
import { toast } from '@/hooks/use-toast';

const LIMIT = 10;

const getValidOffset = (param: string | null): number => {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

function TodoList() {
  const searchParams = useSearchParams();
  const completedParam = searchParams.get('completed');
  const keywordParam = searchParams.get('keyword') || '';
  const offsetParam = searchParams.get('offset');

  const [completed, setCompleted] = useState(completedParam === 'true');
  const [keyword, setKeyword] = useState(keywordParam);
  const debouncedKeyword = useDebounce(keyword, 200);
  const [offset, setOffset] = useState(getValidOffset(offsetParam));
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
  } = useGetInfiniteList(
    {
      all: true,
      completed: completed ? 'true' : undefined,
      keyword: debouncedKeyword,
      limit: LIMIT,
    },
    {
      enabled: isInfiniteMode,
    },
  );

  const { mutate: patchCompleted } = usePatchCompletedList();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const handleDeleteClick = (id: number) => {
    setTodoToDelete(id);
    setIsAlertOpen(true);
  };
  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };
  const handleConfirmDelete = () => {
    if (todoToDelete !== null) {
      deleteTodo(todoToDelete, {
        onSuccess: () => {
          toast({
            title: '삭제 완료',
            description: '할 일이 성공적으로 삭제되었습니다.',
          });
          setTodoToDelete(null);
          setIsAlertOpen(false);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setTodoToDelete(null);
    setIsAlertOpen(false);
  };
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

  useEffect(() => {
    setOffset(0);
  }, [completed, debouncedKeyword]);

  const isLastPage = !isInfiniteMode && offset + LIMIT > paginatedData?.totalCount;
  const isFirstPage = offset === 0;
  const hasNoData =
    !paginatedData ||
    (Array.isArray(paginatedData) && paginatedData.length === 0 && !isPaginatedLoading && !isInfiniteMode);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">📋 My Todo List</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 relative">
        <div className="flex items-center gap-2 absolute left-3 top-3">
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
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter
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

      {isPaginatedLoading && !isInfiniteMode ? (
        <div className="flex justify-center items-center h-40 text-muted-foreground">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </div>
      ) : hasNoData && !isInfiniteMode ? (
        <div className="flex justify-center items-center h-40 text-muted-foreground">불러올 데이터가 없습니다</div>
      ) : (
        <>
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {(isInfiniteMode ? infiniteData?.pages.flat() : paginatedData)?.map(
                (todo: TodoProps, index: number, array: TodoProps[]) => (
                  <>
                    <AccordionItem
                      value={todo.id.toString()}
                      key={todo.id}
                      ref={index === array.length - 1 ? lastTodoElementRefCallback : null}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => patchCompleted({ id: todo.id, completed: !todo.completed })}
                          className="mt-6 data-[state=checked]:bg-green-500"
                        />
                        <div className="flex-1">
                          <AccordionTrigger className="flex justify-between items-center w-full">
                            <h3
                              className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}
                            >
                              {todo.title}
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground mt-2">
                            {todo.description || '설명이 없습니다.'}
                          </AccordionContent>
                        </div>
                        <div className="mt-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost">
                                <Ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="flex flex-col justify-center items-center">
                              <DropdownMenuItem
                                onSelect={() => {
                                  setDetailOpen(true);
                                  setSelectedTodoId(todo.id);
                                }}
                              >
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDeleteClick(todo.id)}>삭제</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </AccordionItem>
                  </>
                ),
              )}
            </Accordion>
          </div>
          <div className="fixed bottom-10 right-10">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateClick();
              }}
              variant="outline"
              size="icon"
              className="rounded-full bg-blue-400 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 p-8"
            >
              <Plus />
            </Button>
            <TodoCreateModal
              open={createModalOpen}
              onOpenChange={(open) => {
                setCreateModalOpen(open);
              }}
            />
          </div>

          {isInfiniteMode && isFetchingNextPage && (
            <div className="flex justify-center items-center h-20 text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              추가 데이터 로딩 중...
            </div>
          )}
        </>
      )}

      {!isInfiniteMode && (
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
                <PaginationLink
                  href="#"
                  isActive
                  onClick={(e) => {
                    e.preventDefault();
                    setOffset((offset / LIMIT) * LIMIT);
                  }}
                >
                  {offset / LIMIT + 1}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  className={`${isLastPage || hasNoData ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isLastPage && !hasNoData) {
                      setOffset((offset / LIMIT + 1) * LIMIT);
                    }
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
      <TodoDetailModal
        id={selectedTodoId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedTodoId(null);
          }
        }}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Todo 삭제</AlertDialogTitle>
            <AlertDialogDescription>정말로 이 할 일을 삭제하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>취소</AlertDialogCancel>
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

export default function GetAllList() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}>
      <TodoList />
    </Suspense>
  );
}
