import { TodoCreateFormValues } from '@/interfaces/todos.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 리스트 생성
export const createTodo = async (values: TodoCreateFormValues) => {
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

// 리스트 완료 여부 수정
const patchCompletedList = async (id: number, completed: boolean) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });
  const data = await response.json();
  return data;
};

export const usePatchCompletedList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => patchCompletedList(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// 리스트 삭제
export const deleteList = async (id: number) => {
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
