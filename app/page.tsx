'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // ShadUI Button 컴포넌트

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-2xl font-bold">MAIN</h1>
      <div className="flex gap-8">
        <Link href="/docs/api">
          <Button variant="default">API Docs</Button>
        </Link>
        <Link href="/docs/requirements">
          <Button variant="outline">Requirements</Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </div>
  );
}
