import { useState } from "react";
import { FamilyMember, Transaction, Category } from "@/types/finance";
import Icon from "@/components/ui/icon";
import AddTransactionModal from "@/components/AddTransactionModal";

interface Props {
  members: FamilyMember[];
  transactions: Transaction[];
  categories: Category[];
  onAddMember: (m: FamilyMember) => void;
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

const MEMBER_COLORS = ["#7c3aed", "#06b6d4", "#ec4899", "#10b981", "#f97316", "#3b82f6"];
const AVATARS: Record<string, string> = { parent: "👨", child: "🧒" };

export default function FamilyPage({ members, transactions, categories, onAddMember, onAddTransaction, onDeleteTransaction }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(members[0]?.id ?? null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"parent" | "child">("parent");

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const memberTx = transactions.filter((t) => t.memberId === selectedMemberId);
  const income = memberTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = memberTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const sorted = [...memberTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    onAddMember({
      id: Date.now().toString(),
      name: newName.trim(),
      role: newRole,
      avatar: newRole === "parent" ? "👨" : "🧒",
      color,
    });
    setNewName("");
    setShowAddMember(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Members scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {members.map((m) => {
          const mIncome = transactions.filter((t) => t.memberId === m.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
          const mExpense = transactions.filter((t) => t.memberId === m.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
          const active = selectedMemberId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 ${
                active ? "text-white shadow-lg scale-105" : "glass text-gray-600 hover:scale-102"
              }`}
              style={active ? { background: `linear-gradient(135deg, ${m.color}, ${m.color}bb)`, boxShadow: `0 8px 24px ${m.color}44` } : {}}
            >
              <span className="text-2xl">{m.avatar}</span>
              <span className="text-sm font-bold whitespace-nowrap">{m.name}</span>
              <span className={`text-xs font-semibold ${active ? "text-white/80" : "text-gray-400"}`}>
                {mExpense > 0 ? `−${fmt(mExpense)} ₽` : `+${fmt(mIncome)} ₽`}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-purple-200 text-purple-400 hover:border-purple-400 hover:text-purple-600 transition-all"
        >
          <Icon name="UserPlus" size={20} />
          <span className="text-xs font-semibold">Добавить</span>
        </button>
      </div>

      {/* Add member form */}
      {showAddMember && (
        <div className="glass rounded-2xl p-5 animate-scale-in space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">Новый участник</h3>
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {(["parent", "child"] as const).map((r) => (
              <button key={r} onClick={() => setNewRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newRole === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                {r === "parent" ? "Родитель 👨" : "Ребёнок 🧒"}
              </button>
            ))}
          </div>
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Имя участника"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button onClick={handleAddMember} disabled={!newName.trim()}
            className="w-full gradient-purple text-white rounded-xl py-3 font-bold text-sm disabled:opacity-40">
            Добавить в семью
          </button>
        </div>
      )}

      {/* Selected member stats */}
      {selectedMember && (
        <div
          className="rounded-3xl p-5 text-white relative overflow-hidden shadow-xl"
          style={{ background: `linear-gradient(135deg, ${selectedMember.color}, ${selectedMember.color}99)` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedMember.avatar}</span>
            <div>
              <p className="font-black text-xl">{selectedMember.name}</p>
              <p className="text-white/70 text-xs">{selectedMember.role === "parent" ? "Родитель" : "Ребёнок"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-xs text-white/70 mb-1">Доходы</p>
              <p className="font-bold text-sm">+{fmt(income)} ₽</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-xs text-white/70 mb-1">Расходы</p>
              <p className="font-bold text-sm">−{fmt(expense)} ₽</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-xs text-white/70 mb-1">Баланс</p>
              <p className={`font-bold text-sm ${balance < 0 ? "text-red-300" : ""}`}>
                {balance >= 0 ? "+" : "−"}{fmt(Math.abs(balance))} ₽
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add transaction */}
      {selectedMember && (
        <button
          onClick={() => setShowAddTx(true)}
          className="w-full gradient-purple text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-400/30 hover-scale"
        >
          <Icon name="Plus" size={20} />
          Добавить транзакцию для {selectedMember.name}
        </button>
      )}

      {/* Transactions list */}
      {sorted.length > 0 ? (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Операции</h2>
          <div className="space-y-2">
            {sorted.map((t, i) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <div
                  key={t.id}
                  className="glass rounded-2xl p-4 flex items-center gap-3 hover-scale group animate-fade-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (cat?.color ?? "#888") + "22" }}>
                    <Icon name={cat?.icon ?? "Circle"} size={18} style={{ color: cat?.color ?? "#888" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.description}</p>
                    <p className="text-xs text-gray-400">{cat?.name} · {new Date(t.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${t.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {t.type === "income" ? "+" : "−"}{fmt(t.amount)} ₽
                    </p>
                    <button onClick={() => onDeleteTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        selectedMember && (
          <div className="text-center py-8 text-gray-400">
            <Icon name="Receipt" size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Нет транзакций для {selectedMember.name}</p>
          </div>
        )
      )}

      {showAddTx && selectedMember && (
        <AddTransactionModal
          categories={categories}
          memberId={selectedMember.id}
          onAdd={(t) => { onAddTransaction(t); setShowAddTx(false); }}
          onClose={() => setShowAddTx(false)}
        />
      )}
    </div>
  );
}
