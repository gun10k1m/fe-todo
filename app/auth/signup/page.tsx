'use client';

import { Card } from '@/components/ui/card';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { SignupFormValues } from '@/interfaces/auth.interface';
import { useSignupMutation } from '@/queries/auth/mutation';

export default function SignupPage() {
  const { mutate: signupMutation, isPending } = useSignupMutation();

  const registerSchema = z.object({
    email: z.string().min(1, { message: '이메일을 입력해주세요.' }).email('이메일 형식이 올바르지 않습니다.'),
    password: z.string().min(8, { message: '8자 이상 입력해주세요.' }),
    name: z.string(),
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation(data);
  };

  return (
    <div className="flex justify-center items-center h-screen ">
      <Card className="w-full max-w-md p-10">
        <h1 className="text-2xl font-bold mb-4">회원가입</h1>
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
                    <Input type="email" placeholder="이메일을 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex gap-3 flex-col">
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex gap-3 flex-col">
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input type="name" placeholder="이름을 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="flex justify-center w-full mt-4 cursor-pointer" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        </Form>
        <Link href="/auth/login" className="flex justify-center mt-4 text-sm text-gray-500 cursor-pointer">
          로그인 하러 가기
        </Link>
      </Card>
    </div>
  );
}
