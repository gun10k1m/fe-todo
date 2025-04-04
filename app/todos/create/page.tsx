'use client';

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
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';

interface todoCreateForm {
  title: string;
  description?: string;
}

export default function TestCreate() {
  const form = useForm<todoCreateForm>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const createTodoMutation = useMutation({
    mutationKey: ['createTodo'],
    mutationFn: async (values: todoCreateForm) => {
      const response = await axios.post('/api/todos', values, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    },
  });

  function onSubmit(values: todoCreateForm) {
    createTodoMutation.mutate(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Todo 추가</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>todo 추가</DialogTitle>
          <DialogDescription>todo 추가 description</DialogDescription>
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
              <Button type="submit">추가</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
