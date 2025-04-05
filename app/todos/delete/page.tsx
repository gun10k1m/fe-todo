'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, LoaderCircle } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useGetAllList } from '@/queries/todos/queries';
import { usePatchCompletedList } from '@/queries/todos/mutation';

export default function DeletePage() {
  const { data, isLoading, error } = useGetAllList();
  const { mutate: patchCompleted } = usePatchCompletedList();

  return (
    <div>
      <h1>투두 리스트</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          로딩 중...
        </div>
      ) : error ? (
        <div>에러가 발생했습니다: {error.message}</div>
      ) : (
        <>
          <div className="m-10 p-3 border border-solid">
            <Accordion type="single" collapsible className="w-full">
              {data?.map((todo: TodoProps) => (
                <AccordionItem value={todo.id.toString()} key={todo.id}>
                  <div className="flex">
                    <Checkbox
                      checked={todo.completed}
                      className="flex mt-5 mr-5"
                      onCheckedChange={() => patchCompleted({ id: todo.id, completed: !todo.completed })}
                    />
                    <div className="flex-1">
                      <AccordionTrigger>
                        <h3>{todo.title}</h3>
                      </AccordionTrigger>
                      <AccordionContent>{todo.description}</AccordionContent>
                    </div>
                    {/* 삭제 구현 부분 */}
                    <Button variant="outline" size="icon">
                      <Trash2 className="stroke-red-400" />
                    </Button>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}
