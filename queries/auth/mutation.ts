import { LoginFormValues, SignupFormValues } from '@/interfaces/auth.interface';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useLoginMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (values: LoginFormValues) => {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (response.url) {
        router.push(response.url);
      }
      return values;
    },
  });
};

export const useSignupMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ['signup'],
    mutationFn: async (data: SignupFormValues) => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (data.name) {
        formData.append('name', data.name);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });

      if (response.url) {
        router.push(response.url);
      }
      return data;
    },
  });
};
