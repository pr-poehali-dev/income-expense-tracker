import { useState } from "react";
import { Category, Transaction } from "@/types/finance";
import Icon from "@/components/ui/icon";

interface Props {
  categories: Category[];
  memberId?: string;
  onAdd: (t: Transaction) => void;
  onClose: () => void;
}

export default function AddTransactionModal({ categories, memberId = "", onAdd, onClose }: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const filtered = categories.filter((c) => c.type === type);

  const handleSubmit = () => {
    if (!amount || !categoryId || !description) return;
    onAdd({
      id: Date.now().toString(),
      memberId,
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Новая транзакция</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-5 bg-gray-100 rounded-2xl p-1.5">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setCategoryId(""); }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                type === t
                  ? t === "income"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-red-500 text-white shadow-md"
                  : "text-gray-500"
              }`}
            >
              {t === "income" ? "Доход" : "Расход"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Сумма</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-3xl font-black bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-300 text-gray-900 border-0"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">₽</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Описание</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: обед в кафе"
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Категория</label>
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${
                  categoryId === cat.id ? "border-purple-500 bg-purple-50" : "border-transparent bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "22" }}>
                  <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || !categoryId || !description}
          className="w-full gradient-purple text-white rounded-2xl py-4 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover-scale"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}