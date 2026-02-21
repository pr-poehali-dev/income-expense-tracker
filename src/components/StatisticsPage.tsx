import { Transaction, Category, BudgetLimit } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  limits: BudgetLimit[];
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export default function StatisticsPage({ transactions, categories, limits }: Props) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory = categories
    .filter((c) => c.type === "expense")
    .map((cat) => ({
      cat,
      amount: transactions.filter((t) => t.categoryId === cat.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
      limit: limits.find((l) => l.categoryId === cat.id)?.limit ?? 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const incomeByCategory = categories
    .filter((c) => c.type === "income")
    .map((cat) => ({
      cat,
      amount: transactions.filter((t) => t.categoryId === cat.id && t.type === "income").reduce((s, t) => s + t.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const maxExpense = expenseByCategory[0]?.amount ?? 1;
  const maxIncome = incomeByCategory[0]?.amount ?? 1;

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const statsCards = [
    { label: "Доходы", value: formatAmount(totalIncome) + " ₽", icon: "ArrowDownLeft", color: "gradient-green", textColor: "text-emerald-600" },
    { label: "Расходы", value: formatAmount(totalExpense) + " ₽", icon: "ArrowUpRight", color: "gradient-red", textColor: "text-red-500" },
    { label: "Баланс", value: (balance >= 0 ? "+" : "−") + formatAmount(Math.abs(balance)) + " ₽", icon: "Wallet", color: "gradient-purple", textColor: balance >= 0 ? "text-purple-600" : "text-red-500" },
    { label: "Накоплено", value: savingsRate + "%", icon: "PiggyBank", color: "gradient-blue", textColor: "text-blue-600" },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsCards.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4 hover-scale animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 ${s.color}`}>
              <Icon name={s.icon} size={18} />
            </div>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <p className={`text-lg font-black ${s.textColor}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Expenses breakdown */}
      {expenseByCategory.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={18} className="text-purple-500" />
            Расходы по категориям
          </h2>
          <div className="space-y-3.5">
            {expenseByCategory.map(({ cat, amount, limit }) => {
              const pct = (amount / totalExpense) * 100;
              const limitPct = limit > 0 ? Math.min((amount / limit) * 100, 100) : null;
              const over = limit > 0 && amount > limit;
              return (
                <div key={cat.id} className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                      <Icon name={cat.icon} size={15} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                        <span className="text-sm font-bold text-gray-900">{formatAmount(amount)} ₽</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{pct.toFixed(1)}% от расходов</span>
                        {limit > 0 && (
                          <span className={`text-xs font-semibold ${over ? "text-red-500" : "text-gray-400"}`}>
                            {over ? "⚠ Лимит превышен" : `до лимита: ${formatAmount(limit - amount)} ₽`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: over ? "linear-gradient(90deg, #ef4444, #f97316)" : `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                      }}
                    />
                  </div>
                  {limitPct !== null && (
                    <div className="h-1 bg-gray-50 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 opacity-40"
                        style={{ width: `${limitPct}%`, backgroundColor: over ? "#ef4444" : cat.color }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Income breakdown */}
      {incomeByCategory.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-emerald-500" />
            Источники доходов
          </h2>
          <div className="space-y-3.5">
            {incomeByCategory.map(({ cat, amount }) => {
              const pct = (amount / maxIncome) * 100;
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                      <Icon name={cat.icon} size={15} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                        <span className="text-sm font-bold text-emerald-600">+{formatAmount(amount)} ₽</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 gradient-green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget health */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="Activity" size={18} className="text-blue-500" />
          Финансовое здоровье
        </h2>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={savingsRate >= 20 ? "#10b981" : savingsRate >= 0 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, Math.min(100, savingsRate)) * 3.14} 314`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900">{Math.max(0, savingsRate)}%</span>
            <span className="text-xs text-gray-400">сбережений</span>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 font-medium">
          {savingsRate >= 30
            ? "Отличный результат! Так держать 🚀"
            : savingsRate >= 10
            ? "Хороший баланс доходов и расходов"
            : savingsRate >= 0
            ? "Стоит сократить расходы"
            : "Расходы превышают доходы — нужно пересмотреть бюджет"}
        </p>
      </div>
    </div>
  );
}
