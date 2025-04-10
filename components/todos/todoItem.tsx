import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';
import { TodoProps } from '@/interfaces/todos.interface';
import { useEffect, useRef } from 'react';

interface TodoItemProps {
  todo: TodoProps;
  patchCompleted: (data: { id: number; completed: boolean }) => void;
  setSelectedTodoId: (id: number) => void;
  setDetailOpen: (isOpen: boolean) => void;
  setIsAlertOpen: (isOpen: boolean) => void;
  handleInfiniteObserver?: (node: HTMLDivElement | null) => void;
}

export function TodoItem({
  todo,
  patchCompleted,
  setSelectedTodoId,
  setDetailOpen,
  setIsAlertOpen,
  handleInfiniteObserver,
}: TodoItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (handleInfiniteObserver && itemRef.current) {
      handleInfiniteObserver(itemRef.current);
    }
  }, [handleInfiniteObserver]);
  return (
    <AccordionItem
      value={todo.id.toString()}
      key={todo.id}
      ref={itemRef}
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
        <TodoItemActions
          todoId={todo.id}
          setSelectedTodoId={setSelectedTodoId}
          setDetailOpen={setDetailOpen}
          setIsAlertOpen={setIsAlertOpen}
        />
      </div>
    </AccordionItem>
  );
}

interface TodoItemActionsProps {
  todoId: number;
  setSelectedTodoId: (id: number) => void;
  setDetailOpen: (isOpen: boolean) => void;
  setIsAlertOpen: (isOpen: boolean) => void;
}

function TodoItemActions({ todoId, setSelectedTodoId, setDetailOpen, setIsAlertOpen }: TodoItemActionsProps) {
  return (
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
              setSelectedTodoId(todoId);
              setDetailOpen(true);
            }}
            className="cursor-pointer w-full flex justify-center"
          >
            수정
          </DropdownMenuItem>
          <DropdownMenuSeparator className="w-full" />
          <DropdownMenuItem
            onSelect={() => {
              setSelectedTodoId(todoId);
              setIsAlertOpen(true);
            }}
            className="cursor-pointer w-full flex justify-center"
          >
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
