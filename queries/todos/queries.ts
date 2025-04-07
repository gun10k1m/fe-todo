import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useEffect } from 'react';

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

//디바운스
// export const useDebounce = (value: string, delay: number) => {
// const [debouncedValue, setDebouncedValue] = useState(value);
//
// useEffect(() => {
// const handler = setTimeout(() => {
// setDebouncedValue(value);
// }, delay);
//
// return () => {
// clearTimeout(handler);
// };
// }, [value, delay]);
//
// return debouncedValue;
// };
