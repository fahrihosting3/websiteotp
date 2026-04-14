// lib/externalDB.ts
// External API Database Integration + Local Storage Fallback
// API: https://orderkuota-saua.vercel.app

const API_BASE = "https://api-orkut-olive.vercel.app/api";

// Local storage keys
const USERS_KEY = "panel_users";
const TRANSACTIONS_KEY = "panel_transactions";

// Helper functions for local storage
function getLocalUsers(): UserData[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalUsers(users: UserData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getLocalTransactions(): TransactionData[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalTransactions(transactions: TransactionData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

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
    
    // Also save to local storage for admin view
    if (data.success) {
      const users = getLocalUsers();
      const newUser: UserData = {
        id: email,
        username,
        email,
        role,
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      // Check if user already exists
      const existingIndex = users.findIndex(u => u.email === email);
      if (existingIndex === -1) {
        users.push(newUser);
        saveLocalUsers(users);
      }
    }
    
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
  // Update in local storage
  const users = getLocalUsers();
  const index = users.findIndex(u => u.email === email);
  
  if (index !== -1) {
    users[index].balance = (users[index].balance || 0) + amount;
    saveLocalUsers(users);
    return { success: true, data: users[index] };
  }
  
  // If user not in local storage, create entry
  const newUser: UserData = {
    id: email,
    username: email.split("@")[0],
    email,
    role: "user",
    balance: amount,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveLocalUsers(users);
  
  return { success: true, data: newUser };
}

export async function getAllUsers(): Promise<ApiResponse<UserData[]>> {
  // Return from local storage (since external API may not have this endpoint yet)
  const users = getLocalUsers();
  return { success: true, data: users };
}

// ============ TRANSACTION FUNCTIONS ============

export async function createTransaction(
  transaction: Omit<TransactionData, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<TransactionData>> {
  // Save to local storage
  const transactions = getLocalTransactions();
  const newTransaction: TransactionData = {
    ...transaction,
    id: `trx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.unshift(newTransaction); // Add to beginning
  saveLocalTransactions(transactions);
  
  return { success: true, data: newTransaction };
}

export async function updateTransactionStatus(
  depositId: string,
  status: "pending" | "success" | "cancel" | "expired"
): Promise<ApiResponse<TransactionData>> {
  // Update in local storage
  const transactions = getLocalTransactions();
  const index = transactions.findIndex(t => t.depositId === depositId);
  
  if (index !== -1) {
    transactions[index].status = status;
    transactions[index].updatedAt = new Date().toISOString();
    saveLocalTransactions(transactions);
    return { success: true, data: transactions[index] };
  }
  
  return { success: false, message: "Transaksi tidak ditemukan" };
}

export async function getTransactionsByUser(
  userEmail: string
): Promise<ApiResponse<TransactionData[]>> {
  // Get from local storage
  const transactions = getLocalTransactions();
  const userTransactions = transactions.filter(t => t.userEmail === userEmail);
  return { success: true, data: userTransactions };
}

export async function getTransactionByDepositId(
  depositId: string
): Promise<ApiResponse<TransactionData>> {
  // Get from local storage
  const transactions = getLocalTransactions();
  const transaction = transactions.find(t => t.depositId === depositId);
  if (transaction) {
    return { success: true, data: transaction };
  }
  return { success: false, message: "Transaksi tidak ditemukan" };
}

export async function getAllTransactions(): Promise<ApiResponse<TransactionData[]>> {
  // Get from local storage
  const transactions = getLocalTransactions();
  return { success: true, data: transactions };
}

export async function getPendingTransactions(): Promise<ApiResponse<TransactionData[]>> {
  // Get from local storage
  const transactions = getLocalTransactions();
  const pending = transactions.filter(t => t.status === "pending");
  return { success: true, data: pending };
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
