'use client';

import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const loginFormSchema = z.object({
  email: z.string().min(1, { message: '이메일을 입력해주세요.' }).email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(8, { message: '8자 이상 입력해주세요.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginFormSchema),
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (values: LoginFormValues) => {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);

      //response의 ok 분기, fetch 자체를 util화 , 오류처리 전역으로 관리
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      router.push(response.url);
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md p-10">
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex gap-3 flex-col">
                  <div className="flex gap-1 items-center">
                    <span className="text-red-500">*</span>
                    <FormLabel>이메일</FormLabel>
                  </div>
                  <FormControl>
                    <Input placeholder="이메일을 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-1 items-center">
                    <span className="text-red-500">*</span>
                    <FormLabel>비밀번호</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="비밀번호를 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="flex justify-center w-full mt-4 cursor-pointer">
              로그인
            </Button>
          </form>
        </Form>
        <Link href="auth/signup" className="flex justify-center mt-4 text-sm text-gray-500 cursor-pointer">
          회원가입 하러 가기
        </Link>
      </Card>
    </div>
  );
}
