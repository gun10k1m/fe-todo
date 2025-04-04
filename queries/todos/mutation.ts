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
