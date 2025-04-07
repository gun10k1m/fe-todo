import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TodoCreateFormValues } from '@/interfaces/todos.interface';
import { useCreateTodo } from '@/queries/todos/mutation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface TodoCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoCreateModal({ open, onOpenChange }: TodoCreateModalProps) {
  const form = useForm<TodoCreateFormValues>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { mutate: createTodo, isPending } = useCreateTodo();

  function onSubmit(values: TodoCreateFormValues) {
    createTodo(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Todo 추가</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex gap-1 flex-col">
                  <div className="flex gap-1 items-center">
                    <span className="text-red-500">*</span>
                    <FormLabel>제목</FormLabel>
                  </div>
                  <FormControl>
                    <Input placeholder="제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex gap-1 flex-col">
                  <div className="flex gap-1 items-center">
                    <FormLabel>본문</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea placeholder="본문" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? '추가 중...' : '추가'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
