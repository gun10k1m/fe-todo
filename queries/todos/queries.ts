import { useQuery } from '@tanstack/react-query';

type GetTodosParams = {
  all?: boolean;
  limit?: number;
  offset?: number;
  completed?: string;
  keyword?: string;
};

const getTodos = async (params: GetTodosParams = {}) => {
  const query = new URLSearchParams();

  if (params.all !== undefined) query.append('all', String(params.all));
  if (params.limit !== undefined) query.append('limit', String(params.limit));
  if (params.offset !== undefined) query.append('offset', String(params.offset));
  if (params.completed !== undefined) query.append('completed', params.completed);
  if (params.keyword) query.append('keyword', params.keyword);

  const response = await fetch(`/api/todos?${query.toString()}`);
  const data = await response.json();
  return data.todos;
};

export const useGetAllList = (params?: GetTodosParams) => {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => getTodos(params),
  });
};

// 상세 조회
const getTodoDetail = async (id: number | null) => {
  if (id === null) {
    return null;
  }

  const response = await fetch(`/api/todos/${id}`);

  if (!response.ok) {
    throw new Error('할 일을 조회하는데 실패했습니다.');
  }

  const data = await response.json();

  // 콘솔값 출력
  console.log(data.todo);

  return data.todo || null;
};

export const useGetTodoDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => getTodoDetail(id),
    enabled: id !== null && id !== undefined,
  });
};
