import { useState } from "react";
import { Category, Transaction, BudgetLimit } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  categories: Category[];
  transactions: Transaction[];
  limits: BudgetLimit[];
  onAddCategory: (c: Category) => void;
  onUpdateLimit: (categoryId: string, limit: number) => void;
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

const ICON_OPTIONS = ["ShoppingCart", "Car", "Home", "Heart", "Gamepad2", "UtensilsCrossed", "Plane", "Book", "Music", "Shirt", "Dumbbell", "Baby", "Briefcase", "Laptop", "TrendingUp", "Gift"];
const COLOR_OPTIONS = ["#10b981", "#3b82f6", "#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444", "#d97706", "#6366f1", "#14b8a6"];

export default function CategoriesPage({ categories, transactions, limits, onAddCategory, onUpdateLimit }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editLimitId, setEditLimitId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState("");
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("ShoppingCart");
  const [newColor, setNewColor] = useState("#10b981");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  const getSpent = (catId: string) =>
    transactions.filter((t) => t.categoryId === catId && t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const getLimit = (catId: string) => limits.find((l) => l.categoryId === catId)?.limit ?? 0;

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const handleSaveLimit = (catId: string) => {
    const val = parseFloat(limitInput);
    if (val > 0) onUpdateLimit(catId, val);
    setEditLimitId(null);
    setLimitInput("");
  };

  const handleAddCategory = () => {
    if (!newName) return;
    onAddCategory({
      id: Date.now().toString(),
      name: newName,
      icon: newIcon,
      color: newColor,
      type: newType,
    });
    setShowAdd(false);
    setNewName("");
  };

  const CategoryCard = ({ cat }: { cat: Category }) => {
    const spent = getSpent(cat.id);
    const limit = getLimit(cat.id);
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const over = limit > 0 && spent > limit;

    return (
      <div className="glass rounded-2xl p-4 animate-fade-in hover-scale">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "22" }}>
            <Icon name={cat.icon} size={20} style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
            {cat.type === "expense" && (
              <p className={`text-xs ${over ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                {formatAmount(spent)} ₽ {limit > 0 ? `/ ${formatAmount(limit)} ₽` : ""}
              </p>
            )}
          </div>
          {cat.type === "expense" && (
            <button
              onClick={() => { setEditLimitId(cat.id); setLimitInput(limit > 0 ? limit.toString() : ""); }}
              className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 font-semibold hover:bg-purple-100 transition-colors"
            >
              Лимит
            </button>
          )}
        </div>

        {cat.type === "expense" && limit > 0 && (
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: over ? "linear-gradient(90deg, #ef4444, #f97316)" : `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`,
              }}
            />
          </div>
        )}

        {editLimitId === cat.id && (
          <div className="mt-3 flex gap-2 animate-scale-in">
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="Лимит в ₽"
              autoFocus
              className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button onClick={() => handleSaveLimit(cat.id)} className="px-4 py-2 gradient-purple text-white rounded-xl text-sm font-semibold">
              ОК
            </button>
            <button onClick={() => setEditLimitId(null)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-5">
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full gradient-purple text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-400/30 hover-scale"
      >
        <Icon name={showAdd ? "ChevronUp" : "Plus"} size={20} />
        {showAdd ? "Скрыть" : "Добавить категорию"}
      </button>

      {showAdd && (
        <div className="glass rounded-2xl p-5 animate-scale-in space-y-4">
          <h3 className="font-bold text-gray-900">Новая категория</h3>
          <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
            {(["expense", "income"] as const).map((t) => (
              <button key={t} onClick={() => setNewType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${newType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                {t === "income" ? "Доход" : "Расход"}
              </button>
            ))}
          </div>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название категории"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300" />
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Иконка</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button key={ic} onClick={() => setNewIcon(ic)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newIcon === ic ? "bg-purple-100 ring-2 ring-purple-400" : "bg-gray-100 hover:bg-gray-200"}`}>
                  <Icon name={ic} size={18} className={newIcon === ic ? "text-purple-600" : "text-gray-500"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Цвет</p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button onClick={handleAddCategory} disabled={!newName}
            className="w-full gradient-purple text-white rounded-2xl py-3 font-bold disabled:opacity-40">
            Создать
          </button>
        </div>
      )}

      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Расходы
        </h2>
        <div className="space-y-2.5">
          {expenseCategories.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Доходы
        </h2>
        <div className="space-y-2.5">
          {incomeCategories.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      </div>
    </div>
  );
}
