import { useMutation, useQueryClient } from '@tanstack/react-query';

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

const updateTodo = async (id: number, title: string, description: string) => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title, description }: { id: number; title: string; description: string }) =>
      updateTodo(id, title, description),
    onSuccess: (_, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
    },
  });
};
