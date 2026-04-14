// lib/externalDB.ts
// External API Database Integration
// API: https://orderkuota-saua.vercel.app

const API_BASE = "https://orderkuota-saua.vercel.app/api";

export interface UserData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  balance: number;
  createdAt: string;
}

export interface TransactionData {
  id: string;
  userId: string;
  userEmail: string;
  type: "deposit" | "purchase";
  amount: number;
  fee: number;
  total: number;
  status: "pending" | "success" | "cancel" | "expired";
  depositId?: string;
  qrImage?: string;
  qrString?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
}

// ============ USER FUNCTIONS ============

export async function registerUserAPI(
  username: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<ApiResponse<UserData>> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Register API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function loginUserAPI(
  email: string,
  password: string
): Promise<ApiResponse<UserData>> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getUserByEmail(email: string): Promise<ApiResponse<UserData>> {
  try {
    const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get user API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function updateUserBalance(
  email: string,
  amount: number
): Promise<ApiResponse<UserData>> {
  try {
    const res = await fetch(`${API_BASE}/users/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Update balance API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getAllUsers(): Promise<ApiResponse<UserData[]>> {
  try {
    const res = await fetch(`${API_BASE}/users/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get all users API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

// ============ TRANSACTION FUNCTIONS ============

export async function createTransaction(
  transaction: Omit<TransactionData, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<TransactionData>> {
  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Create transaction API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function updateTransactionStatus(
  depositId: string,
  status: "pending" | "success" | "cancel" | "expired"
): Promise<ApiResponse<TransactionData>> {
  try {
    const res = await fetch(`${API_BASE}/transactions/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositId, status }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Update transaction API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getTransactionsByUser(
  userEmail: string
): Promise<ApiResponse<TransactionData[]>> {
  try {
    const res = await fetch(`${API_BASE}/transactions?email=${encodeURIComponent(userEmail)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get transactions API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getTransactionByDepositId(
  depositId: string
): Promise<ApiResponse<TransactionData>> {
  try {
    const res = await fetch(`${API_BASE}/transactions/deposit?depositId=${encodeURIComponent(depositId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get transaction by deposit ID API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getAllTransactions(): Promise<ApiResponse<TransactionData[]>> {
  try {
    const res = await fetch(`${API_BASE}/transactions/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get all transactions API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

export async function getPendingTransactions(): Promise<ApiResponse<TransactionData[]>> {
  try {
    const res = await fetch(`${API_BASE}/transactions/pending`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get pending transactions API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}

// ============ ADMIN STATS ============

export async function getAdminStats(): Promise<ApiResponse<{
  totalUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  successTransactions: number;
  totalDeposit: number;
  totalRevenue: number;
}>> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Get admin stats API error:", error);
    return { success: false, message: "Gagal terhubung ke server" };
  }
}
