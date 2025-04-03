import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Foliohub - NotFound',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mt-32">
        <h1>404 ERROR</h1>
        <p className="body1 text-gray-400 mt-4 mb-10">해당 페이지를 찾을 수 없어요!</p>
        <Link href="/" className="flex items-center justify-center rounded-full bg-black text-white h-12 px-8">
          <span>메인으로 돌아가기</span>
        </Link>
      </div>
    </>
  );
}
