'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, LoaderCircle } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useGetAllList } from '@/queries/todos/queries';
import { useDeleteTodo, usePatchCompletedList } from '@/queries/todos/mutation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
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

export default function DeletePage() {
  const { data, isLoading, error } = useGetAllList();
  const { mutate: patchCompleted } = usePatchCompletedList();

  
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDeleteClick = (id: number) => {
    setTodoToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete !== null) {
      deleteTodo(todoToDelete, {
        onSuccess: () => {
          toast({
            variant: 'default',
            className: 'bg-green-500 text-white',
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(todo.id)}
                      disabled={isDeleting && todoToDelete === todo.id}
                    >
                      {isDeleting && todoToDelete === todo.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="stroke-red-400" />
                      )}
                    </Button>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* AlertDialog 컴포넌트 */}
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>할 일 삭제</AlertDialogTitle>
                <AlertDialogDescription>정말로 이 할 일을 삭제하시겠습니까?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelDelete}>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>
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
        </>
      )}
    </div>
  );
}
