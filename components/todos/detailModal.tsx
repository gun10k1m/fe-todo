// components/TodoDetailModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetTodoDetail } from '@/queries/todos/queries';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useUpdateTodo } from '@/queries/todos/mutation';

interface TodoDetailModalProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDetailModal({ id, open, onOpenChange }: TodoDetailModalProps) {
  const { data, isLoading, error } = useGetTodoDetail(open ? id : null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { mutate, isPending } = useUpdateTodo();

  const hasError = Boolean(error);

  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setDescription(data.description || '');
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      mutate(
        { id, title, description },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Todo 수정</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <>
              <Skeleton className="h-10 w-full mt-4 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
            </>
          ) : error ? (
            <div className="text-red-500 py-4">데이터를 불러오는 데 실패했습니다.</div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  제목
                </label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Todo 제목" />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  설명
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Todo 설명"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || hasError || isPending}>
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
