// lib/auth.ts
import { createClient } from "@/lib/supabase/client";

export type User = {
  id: string;
  email: string;
  name: string;
  balance: number;
  created_at: string;
};

export async function registerUser(email: string, password: string, name: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
        `${window.location.origin}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function loginUser(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data.user;
}

export async function logoutUser() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email || "",
    name: profile?.name || user.user_metadata?.name || "",
    balance: profile?.balance || 0,
    created_at: profile?.created_at || user.created_at,
  };
}

export async function updateUserBalance(amount: number): Promise<User | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User tidak ditemukan");

  // Get current balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const currentBalance = profile?.balance || 0;
  const newBalance = currentBalance + amount;

  // Update balance
  const { error } = await supabase
    .from("profiles")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return getCurrentUser();
}

export async function getUserBalance(): Promise<number> {
  const user = await getCurrentUser();
  return user?.balance || 0;
}
