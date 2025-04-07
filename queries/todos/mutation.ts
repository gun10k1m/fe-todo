import { TodoCreateFormValues } from '@/interfaces/todos.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 리스트 생성
const createTodo = async (values: TodoCreateFormValues) => {
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
    mutationFn: createTodo,
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

export const usePatchCompletedList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => updateTodoItem(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
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

// todo Delete
const deleteList = async (id: number) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
