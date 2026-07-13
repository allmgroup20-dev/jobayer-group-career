export interface WorkerUser {
  id: number;
  workerId: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  sponsorId?: string;
  sponsorName?: string;
  level: number;
  joinDate?: string;
  currency: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalTeamMembers: number;
  membershipStatus: string;
  isTestAccount: number;
}

export interface CompanyUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  price: number;
  currency: string;
  commissionPercentage: number;
  commissionFixed: number;
  imageUrl?: string;
  category?: string;
  stock: number;
  isActive: number;
}

export interface Order {
  id: number;
  orderId: string;
  workerId: string;
  productId?: number;
  productName?: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus: string;
  commissionStatus: string;
  orderStatus: string;
  transactionId?: string;
  createdAt: string;
}

export interface CommissionRecord {
  id: number;
  commissionId: string;
  orderId: string;
  fromWorkerId: string;
  toWorkerId: string;
  levelNumber: number;
  percentage?: number;
  fixedAmount?: number;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface CommissionLevel {
  id: number;
  levelNumber: number;
  levelName: string;
  percentage: number;
  fixedAmount: number;
  currency: string;
  isActive: number;
}

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
  nameBn?: string;
  exchangeRate: number;
  isDefault: number;
  isActive: number;
}

export interface Translation {
  id: number;
  translationKey: string;
  enText: string;
  bnText?: string;
  category: string;
}

export interface TreeMember {
  workerId: string;
  name: string;
  phone: string;
  level: number;
  joinDate: string;
  totalTeam: number;
  children: TreeMember[];
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalOrders: number;
  totalRevenue: number;
  totalPayout: number;
  pendingCommissions: number;
}

export interface TestSession {
  id: number;
  sessionId: string;
  isActive: number;
  mockWorkersCount: number;
  createdAt: string;
}
