import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

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
  if (!response.ok) {
    throw new Error('네트워크 오류가 발생했습니다.');
  }
  const data = await response.json();
  console.log(data.todos);
  return data.todos || [];
};

export const useGetAllList = (params?: GetTodosParams) => {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => getTodos(params),
  });
};

export const useGetInfiniteList = (params?: GetTodosParams) => {
  return useInfiniteQuery({
    queryKey: ['todos', 'infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/todos?${new URLSearchParams({
          all: 'true',
          completed: params?.completed || '',
          keyword: params?.keyword || '',
          offset: pageParam.toString(),
          limit: (pageParam === 0 ? 30 : params?.limit || 10).toString(),
        }).toString()}`,
      );

      if (!response.ok) {
        throw new Error('네트워크 오류가 발생했습니다.');
      }

      const data = await response.json();
      return data.todos || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < (params?.limit || 10)) return undefined;
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    initialPageParam: 0,
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

  return data.todo || null;
};

export const useGetTodoDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => getTodoDetail(id),
    enabled: id !== null && id !== undefined,
  });
};
