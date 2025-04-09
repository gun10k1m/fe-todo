import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch.util';
type GetTodosParams = {
  all?: boolean;
  limit?: number;
  offset?: number;
  completed?: string;
  keyword?: string;
};

export const getTodos = async (params: GetTodosParams = {}) => {
  const query = new URLSearchParams();

  if (params.all !== undefined) query.append('all', String(params.all));
  if (params.limit !== undefined) query.append('limit', String(params.limit));
  if (params.offset !== undefined) query.append('offset', String(params.offset));
  if (params.completed !== undefined) query.append('completed', params.completed);
  if (params.keyword) query.append('keyword', params.keyword);
  const data = await apiFetch(`/api/todos?${query.toString()}`);

  return data.todos || [];
};

export const useGetList = (params?: GetTodosParams) => {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => getTodos(params),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const useGetInfiniteList = (params?: GetTodosParams, options?: { enabled?: boolean }) => {
  return useInfiniteQuery({
    queryKey: ['todos', 'infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiFetch(
        `/api/todos?${new URLSearchParams({
          all: 'true',
          completed: params?.completed || '',
          keyword: params?.keyword || '',
          offset: pageParam.toString(),
          limit: '10',
        }).toString()}`,
      );
      return response.todos || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    initialPageParam: 0,
    staleTime: 0,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: true,
  });
};

// 상세 조회
const getTodoDetail = async (id: number | null) => {
  if (id === null) {
    return null;
  }
  const response = await apiFetch(`/api/todos/${id}`);
  return response.todo || null;
};

export const useGetTodoDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => getTodoDetail(id),
    enabled: id !== null && id !== undefined,
  });
};
