// lib/auth.ts
import { registerUserAPI, loginUserAPI, getUserByEmail, updateUserBalance as updateBalanceAPI, type UserData } from "./externalDB";

export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "user" | "admin";
  balance: number;
  createdAt: string;
};

export async function registerUser(email: string, password: string, name: string, role: "user" | "admin" = "user"): Promise<User> {
  const result = await registerUserAPI(name, email, password, role);
  
  if (!result.success) {
    throw new Error(result.message || "Registrasi gagal");
  }

  const user: User = {
    id: result.user?.email || email,
    username: name,
    email: email,
    name: name,
    role: role,
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  // Store in localStorage for session
  localStorage.setItem("currentUser", JSON.stringify(user));
  
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const result = await loginUserAPI(email, password);
  
  if (!result.success) {
    throw new Error(result.message || "Login gagal");
  }

  const userData = result.user;
  
  const user: User = {
    id: userData?.email || email,
    username: userData?.username || email.split("@")[0],
    email: userData?.email || email,
    name: userData?.username || email.split("@")[0],
    role: (userData?.role as "user" | "admin") || "user",
    balance: userData?.balance || 0,
    createdAt: userData?.createdAt || new Date().toISOString(),
  };

  // Store in localStorage for session
  localStorage.setItem("currentUser", JSON.stringify(user));
  
  return user;
}

export const logoutUser = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("pendingDeposit");
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

export const updateUserBalance = async (amount: number): Promise<User> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User tidak ditemukan");
  }

  // Update balance via API
  const result = await updateBalanceAPI(currentUser.email, amount);
  
  if (!result.success) {
    throw new Error(result.message || "Gagal update saldo");
  }

  // Update local storage
  const updatedUser: User = {
    ...currentUser,
    balance: (currentUser.balance || 0) + amount,
  };
  
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  
  return updatedUser;
};

export const getUserBalance = (): number => {
  const user = getCurrentUser();
  return user?.balance || 0;
};

export const refreshUserData = async (): Promise<User | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  try {
    const result = await getUserByEmail(currentUser.email);
    if (result.success && result.data) {
      const updatedUser: User = {
        ...currentUser,
        balance: result.data.balance || currentUser.balance,
        role: result.data.role || currentUser.role,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return updatedUser;
    }
  } catch (error) {
    console.error("Failed to refresh user data:", error);
  }
  
  return currentUser;
};
