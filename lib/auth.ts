// lib/auth.ts
export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
};

export const registerUser = (email: string, password: string, name: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

      if (users.find(u => u.email === email)) {
        reject(new Error("Email sudah terdaftar"));
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: email.split("@")[0],
        email,
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      resolve(newUser);
    }, 800);
  });
};

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