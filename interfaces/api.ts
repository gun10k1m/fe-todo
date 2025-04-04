import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  },
});
