'use client';

import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderCircle } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useGetAllList } from '@/queries/todos/queries';
import { usePatchCompletedList } from '@/queries/todos/mutation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

const getValidOffset = (param: string | null): number => {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

const LIMIT = 10;

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
  const [allTodos, setAllTodos] = useState<TodoProps[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    setOffset(0);
    setAllTodos([]);
  }, []);

  const { data, isLoading } = useGetAllList({
    all: isInfiniteMode,
    completed: completed ? 'true' : undefined,
    keyword: debouncedKeyword,
    offset: offset,
    limit: LIMIT,
  });

  const { mutate: patchCompleted } = usePatchCompletedList({
    onSuccess: (_, variables) => {
      if (isInfiniteMode) {
        setAllTodos((prev) =>
          prev.map((todo) => (todo.id === variables.id ? { ...todo, completed: variables.completed } : todo)),
        );
      }
    },
  });

  const isLastPage = !isInfiniteMode && offset + LIMIT > data?.totalCount;
  const isFirstPage = offset === 0;
  const hasNoData = !data || (Array.isArray(data) && data.length === 0 && !isLoading && !isInfiniteMode);
  const shouldLoadMore = isInfiniteMode && data?.length === LIMIT;

  useEffect(() => {
    if (isInfiniteMode) {
      setAllTodos([]);
      setOffset(0);
    }
  }, [isInfiniteMode, completed, debouncedKeyword]);

  useEffect(() => {
    if (data && isInfiniteMode) {
      setAllTodos((prev) => {
        const newTodos = data.filter(
          (newTodo: TodoProps) => !prev.some((existingTodo: TodoProps) => existingTodo.id === newTodo.id),
        );
        return [...prev, ...newTodos];
      });
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [data, isInfiniteMode]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (completed) params.set('completed', 'true');
    if (debouncedKeyword) params.set('keyword', debouncedKeyword);
    if (offset > 0) params.set('offset', offset.toString());
    if (isInfiniteMode) params.set('all', 'true');

    router.replace(`/todos?${params.toString()}`);
  }, [completed, debouncedKeyword, offset, isInfiniteMode, router]);

  const lastTodoElementRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && shouldLoadMore) {
          scrollPositionRef.current = window.scrollY;
          setOffset((prev) => prev + LIMIT);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, shouldLoadMore],
  );

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4 ">📋 투두 리스트</h1>
      <div className="flex gap-4 m-5">
        <Input
          placeholder="키워드를 검색해주세요"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (isInfiniteMode) {
              setOffset(0);
              setAllTodos([]);
            }
          }}
          className="w-60 flex-1"
        />
        <Button
          onClick={() => {
            setOffset(0);
            setAllTodos([]);
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
              setAllTodos([]);
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
                setAllTodos([]);
              } else {
                setOffset(0);
                setAllTodos([]);
              }
            }}
          />
          <label htmlFor="infinite" className="text-sm">
            무한 스크롤 모드
          </label>
        </div>
      </div>

      {isLoading && offset === 0 ? (
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
              {(isInfiniteMode ? allTodos : data)?.map((todo: TodoProps, index: number) => (
                <AccordionItem
                  value={todo.id.toString()}
                  key={todo.id}
                  ref={index === (isInfiniteMode ? allTodos : data).length - 1 ? lastTodoElementRefCallback : null}
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
                      <AccordionContent className="text-sm text-muted-foreground">{todo.description}</AccordionContent>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {isLoading && offset > 0 && (
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
