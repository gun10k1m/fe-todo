'use client';

import { useQuery } from '@tanstack/react-query';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

interface TodoProps {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const fetchAllList = async () => {
  const response = await fetch('/api/todos', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('네트워크 에러');
  }

  const data = await response.json();
  console.log(data.todos);
  return data.todos;
};

export default function GetAllList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todoAllList'],
    queryFn: fetchAllList,
  });

  const handleCheckboxClick = (id: number) => {
    console.log(id);
  };

  return (
    <div>
      <h1>모든 투두 리스트</h1>
      {isLoading ? (
        <div>로딩 중...</div>
      ) : error ? (
        <div>에러가 발생했습니다: {error.message}</div>
      ) : (
        <>
          <div className="m-10 p-3 border border-solid">
            <Accordion type="single" collapsible className="w-full">
              {data?.map((todo: TodoProps) => (
                <AccordionItem value={todo.id.toString()} key={todo.id}>
                  <div className="flex">
                    <Checkbox className="flex mt-5 mr-5" onClick={() => handleCheckboxClick(todo.id)} />
                    <div className="flex-1">
                      <AccordionTrigger>
                        <h3>{todo.title}</h3>
                      </AccordionTrigger>
                      <AccordionContent>{todo.description}</AccordionContent>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}
