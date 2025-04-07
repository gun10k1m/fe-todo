import { TodoCreateFormValues } from '@/interfaces/todos.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Todo Create
const createTodoItem = async (values: TodoCreateFormValues) => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodoItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

//Todo Update
const updateTodoItem = async <T extends object>(id: number, updateData: T) => {
  if ('title' in updateData && (updateData as any).title.trim() === '') {
    throw new Error('제목은 필수 입력 항목입니다.');
  }
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

export const usePatchCompletedList = (options?: {
  onSuccess?: (data: any, variables: { id: number; completed: boolean }) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => updateTodoItem(id, { completed }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      options?.onSuccess?.(data, variables);
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title, description }: { id: number; title: string; description: string }) =>
      updateTodoItem(id, { title, description }),
    onSuccess: (_, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
    },
  });
};

// Todo Delete
const deleteTodoItem = async (id: number) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTodoItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
