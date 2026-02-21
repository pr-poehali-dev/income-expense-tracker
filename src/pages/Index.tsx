import { useState } from "react";
import FamilyPage from "@/components/FamilyPage";
import PlanningPage from "@/components/PlanningPage";
import FamilyStatsPage from "@/components/FamilyStatsPage";
import Notifications from "@/components/Notifications";
import Icon from "@/components/ui/icon";
import { Transaction, Category, BudgetPlan, FamilyMember, BudgetLimit } from "@/types/finance";

const defaultCategories: Category[] = [
  { id: "1", name: "Зарплата", icon: "Briefcase", color: "#10b981", type: "income" },
  { id: "2", name: "Фриланс", icon: "Laptop", color: "#06b6d4", type: "income" },
  { id: "3", name: "Инвестиции", icon: "TrendingUp", color: "#8b5cf6", type: "income" },
  { id: "4", name: "Продукты", icon: "ShoppingCart", color: "#f97316", type: "expense" },
  { id: "5", name: "Транспорт", icon: "Car", color: "#3b82f6", type: "expense" },
  { id: "6", name: "Развлечения", icon: "Gamepad2", color: "#ec4899", type: "expense" },
  { id: "7", name: "ЖКХ", icon: "Home", color: "#6366f1", type: "expense" },
  { id: "8", name: "Здоровье", icon: "Heart", color: "#ef4444", type: "expense" },
  { id: "9", name: "Кафе", icon: "UtensilsCrossed", color: "#d97706", type: "expense" },
];

const defaultMembers: FamilyMember[] = [
  { id: "m1", name: "Папа", role: "parent", avatar: "👨", color: "#7c3aed" },
  { id: "m2", name: "Мама", role: "parent", avatar: "👩", color: "#ec4899" },
  { id: "m3", name: "Дети", role: "child", avatar: "🧒", color: "#06b6d4" },
];

const defaultTransactions: Transaction[] = [
  { id: "1", memberId: "m1", amount: 85000, type: "income", categoryId: "1", description: "Зарплата за январь", date: "2026-01-31" },
  { id: "2", memberId: "m2", amount: 60000, type: "income", categoryId: "1", description: "Зарплата мамы", date: "2026-02-01" },
  { id: "3", memberId: "m1", amount: 15000, type: "income", categoryId: "2", description: "Подработка", date: "2026-02-05" },
  { id: "4", memberId: "m2", amount: 4200, type: "expense", categoryId: "4", description: "Пятёрочка", date: "2026-02-10" },
  { id: "5", memberId: "m1", amount: 3500, type: "expense", categoryId: "5", description: "Бензин", date: "2026-02-12" },
  { id: "6", memberId: "m3", amount: 2800, type: "expense", categoryId: "6", description: "Кино", date: "2026-02-14" },
  { id: "7", memberId: "m1", amount: 8500, type: "expense", categoryId: "7", description: "Аренда", date: "2026-02-15" },
  { id: "8", memberId: "m2", amount: 1200, type: "expense", categoryId: "9", description: "Кафе", date: "2026-02-17" },
  { id: "9", memberId: "m3", amount: 3100, type: "expense", categoryId: "8", description: "Аптека", date: "2026-02-19" },
];

const defaultPlans: BudgetPlan[] = [
  { id: "p1", memberId: "m1", categoryId: "1", type: "income", plannedAmount: 90000, month: "2026-02" },
  { id: "p2", memberId: "m1", categoryId: "5", type: "expense", plannedAmount: 5000, month: "2026-02" },
  { id: "p3", memberId: "m1", categoryId: "7", type: "expense", plannedAmount: 10000, month: "2026-02" },
  { id: "p4", memberId: "m2", categoryId: "1", type: "income", plannedAmount: 65000, month: "2026-02" },
  { id: "p5", memberId: "m2", categoryId: "4", type: "expense", plannedAmount: 12000, month: "2026-02" },
  { id: "p6", memberId: "m3", categoryId: "6", type: "expense", plannedAmount: 3000, month: "2026-02" },
];

const defaultLimits: BudgetLimit[] = [
  { categoryId: "4", limit: 12000 },
  { categoryId: "5", limit: 5000 },
  { categoryId: "6", limit: 3000 },
];

type Tab = "family" | "planning" | "stats";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("family");
  const [members, setMembers] = useState<FamilyMember[]>(defaultMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [categories] = useState<Category[]>(defaultCategories);
  const [plans, setPlans] = useState<BudgetPlan[]>(defaultPlans);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "family", label: "Семья", icon: "Users" },
    { id: "planning", label: "Планы", icon: "CalendarCheck" },
    { id: "stats", label: "Итоги", icon: "BarChart3" },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col pb-24">
        <header className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-500 font-medium">Февраль 2026</p>
              <h1 className="text-2xl font-bold text-gray-900">Семейный бюджет</h1>
            </div>
            <Notifications transactions={transactions} categories={categories} limits={defaultLimits} />
          </div>
        </header>

        <main className="flex-1 px-5">
          {activeTab === "family" && (
            <FamilyPage
              members={members}
              transactions={transactions}
              categories={categories}
              onAddMember={(m) => setMembers((prev) => [...prev, m])}
              onAddTransaction={(t) => setTransactions((prev) => [t, ...prev])}
              onDeleteTransaction={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))}
            />
          )}
          {activeTab === "planning" && (
            <PlanningPage
              members={members}
              transactions={transactions}
              categories={categories}
              plans={plans}
              onAddPlan={(p) => setPlans((prev) => [...prev, p])}
              onDeletePlan={(id) => setPlans((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
          {activeTab === "stats" && (
            <FamilyStatsPage
              members={members}
              transactions={transactions}
              categories={categories}
              plans={plans}
            />
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4">
          <div className="glass rounded-2xl shadow-xl shadow-purple-200/40 flex items-center p-2 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "gradient-purple text-white shadow-lg shadow-purple-400/40"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                }`}
              >
                <Icon name={tab.icon} size={20} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
