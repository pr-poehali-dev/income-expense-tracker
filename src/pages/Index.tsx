import { useState } from "react";
import BudgetPage from "@/components/BudgetPage";
import CategoriesPage from "@/components/CategoriesPage";
import StatisticsPage from "@/components/StatisticsPage";
import Notifications from "@/components/Notifications";
import Icon from "@/components/ui/icon";
import { Transaction, Category, BudgetLimit } from "@/types/finance";

const defaultCategories: Category[] = [
  { id: "1", name: "Зарплата", icon: "Briefcase", color: "#10b981", type: "income" },
  { id: "2", name: "Фриланс", icon: "Laptop", color: "#06b6d4", type: "income" },
  { id: "3", name: "Инвестиции", icon: "TrendingUp", color: "#8b5cf6", type: "income" },
  { id: "4", name: "Продукты", icon: "ShoppingCart", color: "#f97316", type: "expense" },
  { id: "5", name: "Транспорт", icon: "Car", color: "#3b82f6", type: "expense" },
  { id: "6", name: "Развлечения", icon: "Gamepad2", color: "#ec4899", type: "expense" },
  { id: "7", name: "ЖКХ", icon: "Home", color: "#6366f1", type: "expense" },
  { id: "8", name: "Здоровье", icon: "Heart", color: "#ef4444", type: "expense" },
  { id: "9", name: "Кафе и рестораны", icon: "UtensilsCrossed", color: "#d97706", type: "expense" },
];

const defaultTransactions: Transaction[] = [
  { id: "1", amount: 85000, type: "income", categoryId: "1", description: "Зарплата за январь", date: "2026-01-31" },
  { id: "2", amount: 15000, type: "income", categoryId: "2", description: "Сайт для клиента", date: "2026-02-05" },
  { id: "3", amount: 4200, type: "expense", categoryId: "4", description: "Пятёрочка", date: "2026-02-10" },
  { id: "4", amount: 3500, type: "expense", categoryId: "5", description: "Бензин", date: "2026-02-12" },
  { id: "5", amount: 2800, type: "expense", categoryId: "6", description: "Кинотеатр", date: "2026-02-14" },
  { id: "6", amount: 8500, type: "expense", categoryId: "7", description: "Аренда", date: "2026-02-15" },
  { id: "7", amount: 1200, type: "expense", categoryId: "9", description: "Обед в кафе", date: "2026-02-17" },
  { id: "8", amount: 5000, type: "income", categoryId: "3", description: "Дивиденды", date: "2026-02-18" },
  { id: "9", amount: 3100, type: "expense", categoryId: "8", description: "Аптека", date: "2026-02-19" },
  { id: "10", amount: 6200, type: "expense", categoryId: "4", description: "Ашан", date: "2026-02-20" },
];

const defaultLimits: BudgetLimit[] = [
  { categoryId: "4", limit: 8000 },
  { categoryId: "5", limit: 5000 },
  { categoryId: "6", limit: 3000 },
  { categoryId: "9", limit: 2000 },
];

type Tab = "budget" | "categories" | "statistics";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("budget");
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [limits, setLimits] = useState<BudgetLimit[]>(defaultLimits);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "budget", label: "Бюджет", icon: "Wallet" },
    { id: "categories", label: "Категории", icon: "Tag" },
    { id: "statistics", label: "Статистика", icon: "BarChart3" },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col pb-24">
        <header className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-500 font-medium">Февраль 2026</p>
              <h1 className="text-2xl font-bold text-gray-900">ФинТрек</h1>
            </div>
            <Notifications transactions={transactions} categories={categories} limits={limits} />
          </div>
        </header>

        <main className="flex-1 px-5">
          {activeTab === "budget" && (
            <BudgetPage
              transactions={transactions}
              categories={categories}
              onAddTransaction={(t) => setTransactions((prev) => [t, ...prev])}
              onDeleteTransaction={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))}
            />
          )}
          {activeTab === "categories" && (
            <CategoriesPage
              categories={categories}
              transactions={transactions}
              limits={limits}
              onAddCategory={(c) => setCategories((prev) => [...prev, c])}
              onUpdateLimit={(categoryId, limit) => {
                setLimits((prev) => {
                  const exists = prev.find((l) => l.categoryId === categoryId);
                  if (exists) return prev.map((l) => l.categoryId === categoryId ? { ...l, limit } : l);
                  return [...prev, { categoryId, limit }];
                });
              }}
            />
          )}
          {activeTab === "statistics" && (
            <StatisticsPage transactions={transactions} categories={categories} limits={limits} />
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
