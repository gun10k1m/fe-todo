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
