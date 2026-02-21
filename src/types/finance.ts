export type MemberRole = "parent" | "child";

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  color: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

export interface BudgetPlan {
  id: string;
  memberId: string;
  categoryId: string;
  type: "income" | "expense";
  plannedAmount: number;
  month: string;
}

export interface BudgetLimit {
  categoryId: string;
  limit: number;
}
