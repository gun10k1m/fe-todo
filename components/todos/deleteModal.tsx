import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useDeleteTodo } from '@/queries/todos/mutation';
import { LoaderCircle } from 'lucide-react';

interface TodoDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number | null;
  setId: (id: number | null) => void;
}

export function TodoDeleteModal({ open, onOpenChange, id, setId }: TodoDeleteModalProps) {
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const handleConfirmDelete = () => {
    if (id !== null) {
      deleteTodo(id, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '할 일이 성공적으로 삭제되었습니다.' });
          setId(null);
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Todo 삭제</AlertDialogTitle>
          <AlertDialogDescription>정말로 이 할 일을 삭제하시겠습니까?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>취소</AlertDialogCancel>
          <AlertDialogAction className="bg-red-400 hover:bg-red-600 text-white" onClick={handleConfirmDelete}>
            {isDeleting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
