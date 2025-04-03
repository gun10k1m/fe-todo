'use client';

import { Card } from '@/components/ui/card';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export default function SignupPage() {
  interface SignupForm {
    email: string;
    password: string;
    username?: string;
  }
  //검사 파일 따로 만들기
  const registerSchema = z.object({
    email: z.string().email().min(1, { message: '이메일을 입력해주세요.' }),
    password: z.string().min(8, { message: '8자 이상 입력해주세요.' }),
    username: z.string(),
  });

  const form = useForm<SignupForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignupForm) => {
    console.log(data);
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
              name="username"
              render={({ field }) => (
                <FormItem className="flex gap-3 flex-col">
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input type="username" placeholder="이름을 입력해주세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Button type="submit" className="flex justify-center w-full mt-10">
          회원가입
        </Button>
      </Card>
    </div>
  );
}
