import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';

interface TodoFilterDropdownProps {
  completed: boolean;
  setCompleted: (completed: boolean) => void;
  isInfiniteMode: boolean;
  setIsInfiniteMode: (isInfiniteMode: boolean) => void;
  setOffset: (offset: number) => void;
}

export function TodoFilterDropdown({
  completed,
  setCompleted,
  isInfiniteMode,
  setIsInfiniteMode,
  setOffset,
}: TodoFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="mr-2 h-4 w-4" /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={completed} onCheckedChange={(checked) => setCompleted(!!checked)}>
          완료된 목록
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isInfiniteMode}
          onCheckedChange={(checked) => {
            setIsInfiniteMode(!!checked);
            setCompleted(false);
            setOffset(0);
          }}
        >
          무한 스크롤
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
