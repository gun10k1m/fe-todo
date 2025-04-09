export interface TodoCreateFormValues {
  title: string;
  description?: string;
}

export interface TodoProps {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface SelectTodoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number | null;
  setId: (id: number | null) => void;
}
