// lib/auth.ts
export type User = {
  id: string;
  username?: string;
  email: string;
  name: string;
  balance: number;
  role: "user" | "admin";
  createdAt: string;
};

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const text = await res.text();
  if (!text) {
    throw new Error("Server tidak merespons. Pastikan environment variables sudah diset dengan benar.");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Response dari server tidak valid: " + text.substring(0, 100));
  }

  if (!res.ok) throw new Error(data.error || "Registrasi gagal");
  return data;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  if (!text) {
    throw new Error("Server tidak merespons");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Response dari server tidak valid");
  }

  if (!res.ok) throw new Error(data.error || "Login gagal");

  const user: User = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    balance: data.user.balance,
    role: data.user.role,
    createdAt: data.user.createdAt,
  };

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const updateLocalUser = (userData: Partial<User>): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = { ...currentUser, ...userData };
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  return updatedUser;
};

export const getUserBalance = (): number => {
  const user = getCurrentUser();
  return user?.balance || 0;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const refreshUserData = async (): Promise<User | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  try {
    const res = await fetch(`/api/users/me`);
    if (!res.ok) return null;

    const data = await res.json();
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      balance: data.user.balance,
      role: data.user.role,
      createdAt: data.user.createdAt,
    };

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
};
