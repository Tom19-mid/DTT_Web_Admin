import { Search } from "lucide-react";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="relative mb-6">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm tài khoản..."
        className="w-96 bg-gray-100/80 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-full py-2.5 pl-11 pr-4 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400"
      />
    </div>
  );
}
