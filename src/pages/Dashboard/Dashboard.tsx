const stats = [
  { title: "Patients", value: 1200 },
  { title: "Doctors", value: 80 },
  { title: "Appointments", value: 320 },
  { title: "Medicines", value: 540 },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gird-cols-1 md:gird-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.title} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
