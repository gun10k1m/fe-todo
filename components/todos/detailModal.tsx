// components/TodoDetailModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetTodoDetail } from '@/queries/todos/queries';
import { LoaderCircle } from 'lucide-react';

interface TodoDetailModalProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDetailModal({ id, open, onOpenChange }: TodoDetailModalProps) {
  const { data, isLoading, error } = useGetTodoDetail(open ? id : null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              로딩 중...
            </>
          ) : error ? (
            <>
              <DialogTitle>에러 발생</DialogTitle>
              <DialogDescription>Todo 정보를 불러오는 데 실패했습니다.</DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>{data?.title}</DialogTitle>
              <DialogDescription>{data?.description}</DialogDescription>
            </>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
