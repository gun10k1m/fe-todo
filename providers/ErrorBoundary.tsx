'use client';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GlobalErrorHandler = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => <ErrorPage resetErrorBoundary={resetErrorBoundary} />}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default GlobalErrorHandler;

const ErrorPage = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => {
  const router = useRouter();

  const handleHomePage = () => {
    router.push('/');
  };
  return (
    <>
      <div>
        <AlertCircle size={50} />
      </div>
      <h1>문제가 발생했습니다.</h1>
      <div>
        죄송합니다. 오류가 발생했습니다.
        <br />
        다시 시도해 주세요.
      </div>
      <div className="text-lg text-center p-8 w-full">
        <Button onClick={() => resetErrorBoundary()} variant="default" className="px-6 py-2 rounded-md w-full">
          다시 시도
        </Button>
        <Button onClick={handleHomePage} variant="default" className="px-6 py-2 rounded-md w-full">
          홈으로 가기
        </Button>
      </div>
    </>
  );
};
