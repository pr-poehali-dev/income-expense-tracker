import { FamilyMember, Transaction, Category, BudgetPlan } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  members: FamilyMember[];
  transactions: Transaction[];
  categories: Category[];
  plans: BudgetPlan[];
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const MONTH = "2026-02";

export default function FamilyStatsPage({ members, transactions, categories, plans }: Props) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const memberStats = members.map((m) => {
    const inc = transactions.filter((t) => t.memberId === m.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter((t) => t.memberId === m.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const planInc = plans.filter((p) => p.memberId === m.id && p.type === "income" && p.month === MONTH).reduce((s, p) => s + p.plannedAmount, 0);
    const planExp = plans.filter((p) => p.memberId === m.id && p.type === "expense" && p.month === MONTH).reduce((s, p) => s + p.plannedAmount, 0);
    return { member: m, income: inc, expense: exp, planIncome: planInc, planExpense: planExp };
  });

  const topExpenseCategories = categories
    .filter((c) => c.type === "expense")
    .map((cat) => ({
      cat,
      amount: transactions.filter((t) => t.categoryId === cat.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
    }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Family summary card */}
      <div className="gradient-purple rounded-3xl p-6 text-white shadow-2xl shadow-purple-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <p className="text-sm text-purple-200 mb-1">Семейный баланс · Февраль 2026</p>
        <p className={`text-4xl font-black tracking-tight ${balance < 0 ? "text-red-300" : ""}`}>
          {balance >= 0 ? "+" : "−"}{fmt(Math.abs(balance))} ₽
        </p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 rounded-2xl p-3">
            <p className="text-xs text-purple-200 mb-1">Все доходы</p>
            <p className="font-bold text-base">+{fmt(totalIncome)} ₽</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl p-3">
            <p className="text-xs text-purple-200 mb-1">Все расходы</p>
            <p className="font-bold text-base">−{fmt(totalExpense)} ₽</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl p-3">
            <p className="text-xs text-purple-200 mb-1">Сбережения</p>
            <p className="font-bold text-base">{savingsRate}%</p>
          </div>
        </div>
      </div>

      {/* Per member */}
      <div>
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="Users" size={16} className="text-purple-500" />
          По участникам
        </h2>
        <div className="space-y-3">
          {memberStats.map(({ member, income, expense, planIncome, planExpense }, i) => {
            const bal = income - expense;
            const incPct = planIncome > 0 ? Math.min((income / planIncome) * 100, 100) : null;
            const expPct = planExpense > 0 ? Math.min((expense / planExpense) * 100, 100) : null;
            const expOver = planExpense > 0 && expense > planExpense;
            return (
              <div key={member.id} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{member.avatar}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role === "parent" ? "Родитель" : "Ребёнок"}</p>
                  </div>
                  <span className={`font-black text-sm ${bal >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {bal >= 0 ? "+" : "−"}{fmt(Math.abs(bal))} ₽
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Доходы</span>
                      <span className="font-semibold text-emerald-600">+{fmt(income)} ₽</span>
                    </div>
                    {incPct !== null && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full gradient-green transition-all duration-700" style={{ width: `${incPct}%` }} />
                      </div>
                    )}
                    {planIncome > 0 && <p className="text-gray-400 mt-0.5">план {fmt(planIncome)} ₽</p>}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Расходы</span>
                      <span className={`font-semibold ${expOver ? "text-red-500" : "text-gray-700"}`}>−{fmt(expense)} ₽</span>
                    </div>
                    {expPct !== null && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${expPct}%`, background: expOver ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                      </div>
                    )}
                    {planExpense > 0 && <p className={`mt-0.5 ${expOver ? "text-red-400 font-semibold" : "text-gray-400"}`}>
                      {expOver ? "⚠ план превышен!" : `план ${fmt(planExpense)} ₽`}
                    </p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top expenses */}
      {topExpenseCategories.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={16} className="text-purple-500" />
            Топ расходов семьи
          </h2>
          <div className="space-y-3">
            {topExpenseCategories.map(({ cat, amount }) => {
              const pct = (amount / totalExpense) * 100;
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cat.color + "22" }}>
                      <Icon name={cat.icon} size={13} style={{ color: cat.color }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-1">{cat.name}</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(amount)} ₽</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg,${cat.color},${cat.color}88)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health indicator */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="Activity" size={16} className="text-blue-500" />
          Финансовое здоровье семьи
        </h2>
        <div className="relative w-28 h-28 mx-auto mb-3">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
            <circle cx="60" cy="60" r="50" fill="none"
              stroke={savingsRate >= 20 ? "#10b981" : savingsRate >= 0 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${Math.max(0, savingsRate) * 3.14} 314`}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900">{savingsRate}%</span>
            <span className="text-[10px] text-gray-400">сбережений</span>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 font-medium">
          {savingsRate >= 30 ? "Отличный семейный бюджет! 🚀"
            : savingsRate >= 10 ? "Хороший баланс — продолжайте!"
            : savingsRate >= 0 ? "Стоит сократить расходы"
            : "Расходы превышают доходы — пересмотрите бюджет"}
        </p>
      </div>
    </div>
  );
}
