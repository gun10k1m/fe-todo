'use client';

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
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const getValidOffset = (param: string | null): number => {
  const parsed = parseInt(param || '', 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

const LIMIT = 10;

export default function GetAllList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const completedParam = searchParams.get('completed');
  const keywordParam = searchParams.get('keyword') || '';
  const offsetParam = searchParams.get('offset');

  const [completed, setCompleted] = useState(completedParam === 'true');
  const [keyword, setKeyword] = useState(keywordParam);
  const [offset, setOffset] = useState(getValidOffset(offsetParam));

  const { data, isLoading } = useGetAllList({
    completed: completed ? 'true' : 'false',
    keyword: keyword,
    offset: offset,
    limit: LIMIT,
  });

  const { mutate: patchCompleted } = usePatchCompletedList();

  const isLastPage = offset + LIMIT > data?.totalCount;
  const isFirstPage = offset === 0;
  const hasNoData = !data || data?.length === 0;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('completed', completed ? 'true' : 'false');
    if (keyword) params.set('keyword', keyword);
    if (offset > 0) params.set('offset', offset.toString());

    router.replace(`/todos?${params.toString()}`);
  }, [completed, keyword, offset, router]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">📋 투두 리스트</h1>

      <div className="flex gap-4 m-5">
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

        <Input
          placeholder="키워드를 검색해주세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-60 flex-1"
        />
        <Button onClick={() => setOffset(0)}>검색</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </div>
      ) : hasNoData ? (
        <div className="flex justify-center items-center h-40 text-gray-500">불러올 데이터가 없습니다</div>
      ) : (
        <>
          <div className="m-5 px-4 border rounded-lg shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {data?.map((todo: TodoProps) => (
                <AccordionItem value={todo.id.toString()} key={todo.id}>
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={todo.completed}
                      className="mt-5"
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
        </>
      )}
      <>
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
                <PaginationLink href="#" isActive>
                  {offset / LIMIT + 1}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" isActive>
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
      </>
    </div>
  );
}
