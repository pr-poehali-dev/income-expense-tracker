import { useState, useMemo } from "react";
import { Transaction, Category, BudgetLimit } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  limits: BudgetLimit[];
}

interface Notification {
  id: string;
  type: "warning" | "danger" | "success";
  title: string;
  message: string;
  icon: string;
}

export default function Notifications({ transactions, categories, limits }: Props) {
  const [open, setOpen] = useState(false);

  const notifications = useMemo<Notification[]>(() => {
    const result: Notification[] = [];

    limits.forEach(({ categoryId, limit }) => {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;
      const spent = transactions
        .filter((t) => t.categoryId === categoryId && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const pct = (spent / limit) * 100;

      if (pct >= 100) {
        result.push({
          id: `over-${categoryId}`,
          type: "danger",
          title: `Лимит превышен — ${cat.name}`,
          message: `Потрачено ${new Intl.NumberFormat("ru-RU").format(spent)} ₽ из ${new Intl.NumberFormat("ru-RU").format(limit)} ₽`,
          icon: "AlertCircle",
        });
      } else if (pct >= 80) {
        result.push({
          id: `warn-${categoryId}`,
          type: "warning",
          title: `80% лимита — ${cat.name}`,
          message: `Осталось ${new Intl.NumberFormat("ru-RU").format(limit - spent)} ₽ из ${new Intl.NumberFormat("ru-RU").format(limit)} ₽`,
          icon: "AlertTriangle",
        });
      }
    });

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    if (savingsRate >= 30) {
      result.push({
        id: "savings-great",
        type: "success",
        title: "Отличные сбережения!",
        message: `Вы откладываете ${Math.round(savingsRate)}% доходов — так держать!`,
        icon: "TrendingUp",
      });
    } else if (totalExpense > totalIncome) {
      result.push({
        id: "balance-negative",
        type: "danger",
        title: "Расходы превышают доходы",
        message: "Пересмотрите бюджет — расходы превысили доходы в этом месяце",
        icon: "TrendingDown",
      });
    }

    return result;
  }, [transactions, categories, limits]);

  const dangerCount = notifications.filter((n) => n.type === "danger").length;
  const warnCount = notifications.filter((n) => n.type === "warning").length;
  const total = notifications.length;

  const colorMap = {
    danger: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-500", dot: "bg-red-500" },
    warning: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-500", dot: "bg-amber-400" },
    success: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-500", dot: "bg-emerald-400" },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 glass rounded-2xl flex items-center justify-center text-gray-600 hover:bg-white transition-colors relative"
      >
        <Icon name="Bell" size={20} />
        {total > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${dangerCount > 0 ? "bg-red-500" : "bg-amber-400"}`}>
            {total}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-14 z-50 w-80 bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden animate-scale-in">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Уведомления</h3>
              <span className="text-xs text-gray-400">{total} событий</span>
            </div>
            {total === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircle2" size={24} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Всё в порядке!</p>
                <p className="text-xs text-gray-400 mt-1">Нет активных уведомлений</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => {
                  const colors = colorMap[n.type];
                  return (
                    <div key={n.id} className={`px-5 py-4 ${colors.bg}`}>
                      <div className="flex gap-3 items-start">
                        <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border ${colors.border}`}>
                          <Icon name={n.icon} size={15} className={colors.icon} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
