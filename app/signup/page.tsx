'use client';

import { Card } from '@/components/ui/card';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/utils/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// todo
// 1. zod 검사 파일 따로 만들기
// 2. mutation 로직 파일 따로 만들기

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  interface SignupForm {
    email: string;
    password: string;
    username?: string;
  }
  const registerSchema = z.object({
    email: z.string().min(1, { message: '이메일을 입력해주세요.' }).email('이메일 형식이 올바르지 않습니다.'),
    password: z.string().min(8, { message: '8자 이상 입력해주세요.' }),
    username: z.string(),
  });

  const form = useForm<SignupForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
  });

  const onSubmit = (data: SignupForm) => {
    // signup(data);
    console.log(data);
  };

  const { mutate: signup, isPending } = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (data: SignupForm) => {
      const { error } = await supabase.auth.signUp({ email: data.email, password: data.password });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: '회원가입이 완료되었습니다.',
      });
      router.push('/');
    },
    onError: (error) => {
      console.error(error);
    },
  });
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
            <Button type="submit" className="flex justify-center w-full mt-4">
              회원가입
            </Button>
          </form>
        </Form>
        <Link href="/login" className="flex justify-center mt-4 text-sm text-gray-500">
          로그인 하러 가기
        </Link>
      </Card>
    </div>
  );
}
