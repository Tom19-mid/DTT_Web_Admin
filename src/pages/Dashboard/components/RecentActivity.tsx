import type { RecentActivityItem } from "../../../types/dashboard";
import { Clock } from "lucide-react";

interface RecentActivityProps {
  activities?: RecentActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const itemList = activities || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Hoạt động gần đây
      </h2>

      {itemList.length === 0 ? (
        <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Clock size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-700 font-bold text-base">Chưa có hoạt động</p>
          <p className="text-gray-500 text-sm mt-1">Không tìm thấy lượt khám nào trong khoảng thời gian này.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {itemList.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${item.color}`} />
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                  {item.name}
                </h3>
                <p className="text-base text-gray-700 font-medium mt-1">
                  {item.description}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}