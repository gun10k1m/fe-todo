import { createClient } from '@/utils/client';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const supabase = createClient();
  // formData를 추출합니다.
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 사용자 정보 조회 (이메일로)
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

  // 에러가 발생하거나, 사용자가 없거나, 비밀번호가 일치하지 않으면 /error로 리다이렉트
  if (error || !user || user.password !== password) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  // 로그인 성공 시 쿠키에 userId를 저장한 후 루트("/")로 리다이렉트
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('userId', String(user.id), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // 캐시된 페이지 재검증 (원하는 경우)
  revalidatePath('/');
  return response;
}
