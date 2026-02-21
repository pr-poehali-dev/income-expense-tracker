import { useState } from "react";
import { Transaction, Category } from "@/types/finance";
import Icon from "@/components/ui/icon";
import AddTransactionModal from "@/components/AddTransactionModal";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount);
}

export default function BudgetPage({ transactions, categories, onAddTransaction, onDeleteTransaction }: Props) {
  const [showModal, setShowModal] = useState(false);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in space-y-5">
      {/* Balance card */}
      <div className="gradient-purple rounded-3xl p-6 text-white shadow-2xl shadow-purple-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-12 -translate-x-8" />
        <p className="text-sm font-medium text-purple-200 mb-1">Баланс за месяц</p>
        <p className={`text-4xl font-black tracking-tight ${balance < 0 ? "text-red-300" : "text-white"}`}>
          {balance < 0 ? "−" : "+"}{formatAmount(Math.abs(balance))} ₽
        </p>
        <p className="text-sm text-purple-200 mt-1">Накоплено: {savingsRate}% от доходов</p>
        <div className="flex gap-4 mt-5">
          <div className="flex-1 bg-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-emerald-400/30 rounded-lg flex items-center justify-center">
                <Icon name="ArrowDownLeft" size={14} className="text-emerald-300" />
              </div>
              <span className="text-xs text-purple-200">Доходы</span>
            </div>
            <p className="text-lg font-bold">{formatAmount(totalIncome)} ₽</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-red-400/30 rounded-lg flex items-center justify-center">
                <Icon name="ArrowUpRight" size={14} className="text-red-300" />
              </div>
              <span className="text-xs text-purple-200">Расходы</span>
            </div>
            <p className="text-lg font-bold">{formatAmount(totalExpense)} ₽</p>
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full gradient-purple text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-400/30 hover-scale"
      >
        <Icon name="Plus" size={20} />
        Добавить транзакцию
      </button>

      {/* Transactions */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Последние операции</h2>
        <div className="space-y-2.5">
          {sorted.map((t, i) => {
            const cat = getCategoryById(t.categoryId);
            return (
              <div
                key={t.id}
                className="glass rounded-2xl p-4 flex items-center gap-3 hover-scale animate-fade-in group"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (cat?.color ?? "#888") + "22" }}
                >
                  <Icon name={cat?.icon ?? "Circle"} size={20} style={{ color: cat?.color ?? "#888" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{cat?.name} · {new Date(t.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-base ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "−"}{formatAmount(t.amount)} ₽
                  </p>
                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <AddTransactionModal
          categories={categories}
          onAdd={(t) => { onAddTransaction(t); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
