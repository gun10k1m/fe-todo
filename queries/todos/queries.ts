// 리스트 불러오기
import { useQuery } from '@tanstack/react-query';

const getTodos = async () => {
  const response = await fetch('/api/todos');
  const data = await response.json();
  return data.todos;
};

export const useGetAllList = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
  });
};
