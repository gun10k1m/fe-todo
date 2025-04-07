'use client';

import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLoginMutation } from '@/queries/auth/mutation';
import { LoaderCircle } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().min(1, { message: '이메일을 입력해주세요.' }).email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(8, { message: '8자 이상 입력해주세요.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginFormSchema),
  });

  const { mutate: loginMutation } = useLoginMutation();

  function onSubmit(values: LoginFormValues) {
    loginMutation(values);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
      <Card className="w-full max-w-md p-8 shadow-md border border-gray-200 rounded-xl bg-white">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">로그인</h1>
        <Form {...form}>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            {/* 이메일 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex gap-1 items-center">
                    <span className="text-red-500">*</span> 이메일
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="이메일을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* 비밀번호 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex gap-1 items-center">
                    <span className="text-red-500">*</span> 비밀번호
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="비밀번호를 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* 로그인 버튼 */}
            <Button type="submit" className="w-full mt-2 bg-blue-400 hover:bg-blue-600 text-white">
              로그인
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            아직 회원이 아니신가요?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-500 hover:text-blue-700 hover:underline font-medium transition"
            >
              회원가입 하러 가기
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
