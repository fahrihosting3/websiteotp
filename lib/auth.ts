// lib/auth.ts
export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
};
export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  // Handle empty response
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

export const loginUser = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.email === email);

      if (!user) {
        reject(new Error("Email atau password salah"));
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      resolve(user);
    }, 700);
  });
};

export const logoutUser = () => {
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const updateUserBalance = (amount: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      reject(new Error("User tidak ditemukan"));
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      reject(new Error("User tidak ditemukan di database"));
      return;
    }

    // Update balance
    const currentBalance = users[userIndex].balance || 0;
    users[userIndex].balance = currentBalance + amount;

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

    resolve(users[userIndex]);
  });
};

export const getUserBalance = (): number => {
  const user = getCurrentUser();
  return user?.balance || 0;
};
