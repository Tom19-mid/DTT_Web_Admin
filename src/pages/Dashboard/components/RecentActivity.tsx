const activities = [
  {
    id: 1,
    name: "Nguyen Van A",
    description: "Đã đặt lịch hẹn với bác sĩ Tùng",
    time: "2 phút trước",
    color: "bg-blue-600",
  },
  {
    id: 2,
    name: "Tran Thi B",
    description: "Hồ sơ bệnh nhân được cập nhật",
    time: "15 phút trước",
    color: "bg-orange-500",
  },
  {
    id: 3,
    name: "Le Van C",
    description: "Cuộc hẹn đã hoàn tất",
    time: "1 giờ trước",
    color: "bg-green-600",
  },
  {
    id: 4,
    name: "Pham Thi D",
    description: "Bệnh nhân mới đăng ký",
    time: "2 giờ trước",
    color: "bg-purple-600",
  },
  {
    id: 5,
    name: "Hoang Van E",
    description: "Cuộc hẹn đã bị hủy",
    time: "3 giờ trước",
    color: "bg-red-500",
  },
  {
    id: 6,
    name: "Vo Thi F",
    description: "Đơn thuốc đã được cấp",
    time: "3 giờ trước",
    color: "bg-sky-500",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Hoạt động gần đây
      </h2>

      <div className="space-y-5">
        {activities.map((item) => (
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
    </div>
  );
}