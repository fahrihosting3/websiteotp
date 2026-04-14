import { MongoClient, Db, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || "rumahotp";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// User Types
export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  balance: number;
  createdAt: Date;
  lastLoginAt?: Date;
  profile?: {
    avatar?: string | null;
    bio?: string;
  };
  settings?: {
    notifications?: boolean;
    theme?: string;
  };
}

// Transaction Types
export type TransactionStatus = "pending" | "success" | "failed" | "expired" | "cancel";
export type TransactionType = "deposit" | "purchase" | "refund";

export interface TransactionDocument {
  _id?: ObjectId;
  externalId: string; // ID dari rumahotp API
  userId: ObjectId;
  userEmail: string;
  type: TransactionType;
  amount: number;
  fee: number;
  total: number;
  status: TransactionStatus;
  method: string;
  qrString?: string;
  qrImage?: string;
  createdAt: Date;
  updatedAt: Date;
  expiredAt?: Date;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

// User Functions
export async function createUser(userData: Omit<UserDocument, "_id" | "createdAt">): Promise<UserDocument> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");

  const existingUser = await users.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const newUser: UserDocument = {
    ...userData,
    balance: 0,
    role: userData.role || "user",
    createdAt: new Date(),
  };

  const result = await users.insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");
  return users.findOne({ email });
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");
  return users.findOne({ _id: new ObjectId(id) });
}

export async function updateUserBalance(userId: string, amount: number): Promise<UserDocument | null> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");

  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { 
      $inc: { balance: amount },
      $set: { lastLoginAt: new Date() }
    },
    { returnDocument: "after" }
  );

  return result;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");

  await users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { lastLoginAt: new Date() } }
  );
}

export async function getAllUsers(): Promise<UserDocument[]> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");
  return users.find({}).sort({ createdAt: -1 }).toArray();
}

export async function countUsers(): Promise<number> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");
  return users.countDocuments();
}

// Transaction Functions
export async function createTransaction(
  transactionData: Omit<TransactionDocument, "_id" | "createdAt" | "updatedAt">
): Promise<TransactionDocument> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");

  const newTransaction: TransactionDocument = {
    ...transactionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await transactions.insertOne(newTransaction);
  return { ...newTransaction, _id: result.insertedId };
}

export async function findTransactionByExternalId(externalId: string): Promise<TransactionDocument | null> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");
  return transactions.findOne({ externalId });
}

export async function findTransactionById(id: string): Promise<TransactionDocument | null> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");
  return transactions.findOne({ _id: new ObjectId(id) });
}

export async function updateTransactionStatus(
  externalId: string,
  status: TransactionStatus,
  additionalData?: Partial<TransactionDocument>
): Promise<TransactionDocument | null> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");

  const updateData: Partial<TransactionDocument> = {
    status,
    updatedAt: new Date(),
    ...additionalData,
  };

  if (status === "success") {
    updateData.paidAt = new Date();
  }

  const result = await transactions.findOneAndUpdate(
    { externalId },
    { $set: updateData },
    { returnDocument: "after" }
  );

  return result;
}

export async function getUserTransactions(userId: string): Promise<TransactionDocument[]> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");
  return transactions.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
}

export async function getPendingTransactionByUserId(userId: string): Promise<TransactionDocument | null> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");
  return transactions.findOne({ 
    userId: new ObjectId(userId), 
    status: "pending",
    type: "deposit"
  });
}

export async function getAllTransactions(filter?: {
  status?: TransactionStatus;
  type?: TransactionType;
  limit?: number;
}): Promise<TransactionDocument[]> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");

  const query: Record<string, any> = {};
  if (filter?.status) query.status = filter.status;
  if (filter?.type) query.type = filter.type;

  let cursor = transactions.find(query).sort({ createdAt: -1 });
  if (filter?.limit) cursor = cursor.limit(filter.limit);

  return cursor.toArray();
}

export async function getTransactionStats(): Promise<{
  totalTransactions: number;
  pendingTransactions: number;
  successTransactions: number;
  totalDeposits: number;
  totalAmount: number;
}> {
  const { db } = await connectToDatabase();
  const transactions = db.collection<TransactionDocument>("transactions");

  const [total, pending, success, deposits, amountResult] = await Promise.all([
    transactions.countDocuments(),
    transactions.countDocuments({ status: "pending" }),
    transactions.countDocuments({ status: "success" }),
    transactions.countDocuments({ type: "deposit" }),
    transactions.aggregate([
      { $match: { status: "success", type: "deposit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray()
  ]);

  return {
    totalTransactions: total,
    pendingTransactions: pending,
    successTransactions: success,
    totalDeposits: deposits,
    totalAmount: amountResult[0]?.total || 0
  };
}

export { ObjectId };
