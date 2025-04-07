'use client';

import { TodoCreateModal } from '@/components/todos/createModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function CreatePage() {
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => {
    setCreateOpen(true);
  };
  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          openCreate();
        }}
        variant="outline"
        size="icon"
      >
        <Plus />
      </Button>
      <TodoCreateModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
        }}
      />
    </>
  );
}
