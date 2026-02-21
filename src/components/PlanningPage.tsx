import { useState } from "react";
import { FamilyMember, Transaction, Category, BudgetPlan } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  members: FamilyMember[];
  transactions: Transaction[];
  categories: Category[];
  plans: BudgetPlan[];
  onAddPlan: (p: BudgetPlan) => void;
  onDeletePlan: (id: string) => void;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const MONTH = "2026-02";

export default function PlanningPage({ members, transactions, categories, plans, onAddPlan, onDeletePlan }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? "");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const memberPlans = plans.filter((p) => p.memberId === selectedMemberId && p.month === MONTH);

  const getFactAmount = (memberId: string, categoryId: string, type: "income" | "expense") =>
    transactions
      .filter((t) => t.memberId === memberId && t.categoryId === categoryId && t.type === type && t.date.startsWith(MONTH))
      .reduce((s, t) => s + t.amount, 0);

  const filteredCats = categories.filter((c) => c.type === formType);

  const handleAdd = () => {
    if (!formAmount || !formCategoryId) return;
    onAddPlan({
      id: Date.now().toString(),
      memberId: selectedMemberId,
      categoryId: formCategoryId,
      type: formType,
      plannedAmount: parseFloat(formAmount),
      month: MONTH,
    });
    setFormAmount("");
    setFormCategoryId("");
    setFormDesc("");
    setShowForm(false);
  };

  const incomePlans = memberPlans.filter((p) => p.type === "income");
  const expensePlans = memberPlans.filter((p) => p.type === "expense");

  const totalPlanIncome = incomePlans.reduce((s, p) => s + p.plannedAmount, 0);
  const totalPlanExpense = expensePlans.reduce((s, p) => s + p.plannedAmount, 0);
  const totalFactIncome = incomePlans.reduce((s, p) => s + getFactAmount(selectedMemberId, p.categoryId, "income"), 0);
  const totalFactExpense = expensePlans.reduce((s, p) => s + getFactAmount(selectedMemberId, p.categoryId, "expense"), 0);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const PlanRow = ({ plan }: { plan: BudgetPlan }) => {
    const cat = categories.find((c) => c.id === plan.categoryId);
    const fact = getFactAmount(plan.memberId, plan.categoryId, plan.type);
    const pct = plan.plannedAmount > 0 ? Math.min((fact / plan.plannedAmount) * 100, 100) : 0;
    const over = fact > plan.plannedAmount && plan.type === "expense";
    const color = plan.type === "income" ? "#10b981" : cat?.color ?? "#888";

    return (
      <div className="glass rounded-2xl p-4 animate-fade-in group">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + "22" }}>
            <Icon name={cat?.icon ?? "Circle"} size={16} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">{cat?.name ?? "Категория"}</span>
              <button onClick={() => onDeletePlan(plan.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                <Icon name="X" size={12} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className={`text-xs font-medium ${over ? "text-red-500" : "text-gray-400"}`}>
                Факт: {plan.type === "income" ? "+" : "−"}{fmt(fact)} ₽
              </span>
              <span className="text-xs text-gray-400">
                План: {fmt(plan.plannedAmount)} ₽
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: over
                ? "linear-gradient(90deg,#ef4444,#f97316)"
                : plan.type === "income"
                  ? "linear-gradient(90deg,#10b981,#06b6d4)"
                  : `linear-gradient(90deg,${color},${color}88)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-[10px] font-semibold ${over ? "text-red-500" : pct >= 80 ? "text-amber-500" : "text-gray-400"}`}>
            {pct.toFixed(0)}%{over ? " — превышено!" : pct >= 80 ? " — почти достигнуто" : ""}
          </span>
          {plan.type === "expense" && !over && (
            <span className="text-[10px] text-gray-400">
              осталось {fmt(plan.plannedAmount - fact)} ₽
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Member selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {members.map((m) => (
          <button key={m.id} onClick={() => setSelectedMemberId(m.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedMemberId === m.id ? "text-white shadow-md" : "glass text-gray-600"
            }`}
            style={selectedMemberId === m.id ? { background: `linear-gradient(135deg,${m.color},${m.color}bb)` } : {}}>
            <span>{m.avatar}</span>
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      {/* Summary */}
      {selectedMember && (
        <div className="rounded-3xl p-5 text-white relative overflow-hidden shadow-xl"
          style={{ background: `linear-gradient(135deg,${selectedMember.color},${selectedMember.color}88)` }}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <p className="text-white/70 text-xs mb-1">Февраль 2026 · {selectedMember.name}</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white/15 rounded-2xl p-3">
              <p className="text-white/70 text-xs mb-1">Доходы план / факт</p>
              <p className="font-black text-base">{fmt(totalPlanIncome)} ₽</p>
              <p className="text-emerald-300 text-xs font-semibold">Факт: {fmt(totalFactIncome)} ₽</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3">
              <p className="text-white/70 text-xs mb-1">Расходы план / факт</p>
              <p className="font-black text-base">{fmt(totalPlanExpense)} ₽</p>
              <p className={`text-xs font-semibold ${totalFactExpense > totalPlanExpense ? "text-red-300" : "text-white/80"}`}>
                Факт: {fmt(totalFactExpense)} ₽
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add plan */}
      <button onClick={() => setShowForm(!showForm)}
        className="w-full gradient-purple text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-400/30 hover-scale">
        <Icon name={showForm ? "ChevronUp" : "Plus"} size={20} />
        {showForm ? "Скрыть" : "Добавить план"}
      </button>

      {showForm && (
        <div className="glass rounded-2xl p-5 animate-scale-in space-y-4">
          <h3 className="font-bold text-gray-900">Новый план</h3>
          <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
            {(["expense", "income"] as const).map((t) => (
              <button key={t} onClick={() => { setFormType(t); setFormCategoryId(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${formType === t
                  ? t === "income" ? "bg-emerald-500 text-white shadow-md" : "bg-red-500 text-white shadow-md"
                  : "text-gray-500"}`}>
                {t === "income" ? "Доход" : "Расход"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Категория</label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCats.map((cat) => (
                <button key={cat.id} onClick={() => setFormCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${
                    formCategoryId === cat.id ? "border-purple-500 bg-purple-50" : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "22" }}>
                    <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Плановая сумма</label>
            <div className="relative">
              <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0"
                className="w-full text-2xl font-black bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-300 text-gray-900" />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">₽</span>
            </div>
          </div>

          <button onClick={handleAdd} disabled={!formAmount || !formCategoryId}
            className="w-full gradient-purple text-white rounded-2xl py-3.5 font-bold disabled:opacity-40">
            Сохранить план
          </button>
        </div>
      )}

      {/* Income plans */}
      {incomePlans.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Планируемые доходы
          </h2>
          <div className="space-y-2.5">
            {incomePlans.map((p) => <PlanRow key={p.id} plan={p} />)}
          </div>
        </div>
      )}

      {/* Expense plans */}
      {expensePlans.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Планируемые расходы
          </h2>
          <div className="space-y-2.5">
            {expensePlans.map((p) => <PlanRow key={p.id} plan={p} />)}
          </div>
        </div>
      )}

      {memberPlans.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Icon name="CalendarPlus" size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Нет планов на февраль</p>
          <p className="text-xs mt-1">Добавь плановые доходы и расходы</p>
        </div>
      )}
    </div>
  );
}
