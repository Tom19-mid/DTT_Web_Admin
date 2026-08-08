import patientApi from "./patientApi";
import doctorApi from "./doctorApi";
import specialtyApi from "./specialtyApi";
import appointmentApi from "./appointmentApi";
import type {
  DashboardData,
  DoctorChartData,
  RecentActivityItem,
  AppointmentRecord,
  DateFilterType,
} from "../types/dashboard";

const parseApptDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.trim().split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  const dashParts = dateStr.trim().split("-");
  if (dashParts.length === 3) {
    const y = parseInt(dashParts[0], 10);
    const m = parseInt(dashParts[1], 10) - 1;
    const d = parseInt(dashParts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  return null;
};

export const dashboardApi = {
  getDashboardData: async (
    filterType: DateFilterType = "all",
    customDate?: string
  ): Promise<DashboardData> => {
    try {
      // Call endpoints in parallel for maximum speed
      const [patients, doctors, specialties, appointments] = await Promise.all([
        patientApi.getAll(),
        doctorApi.getAll(),
        specialtyApi.getAll(),
        appointmentApi.getAll(),
      ]);

      const appointmentList = (appointments as AppointmentRecord[]) || [];

      const totalPatients = Array.isArray(patients) ? patients.length : 0;
      const totalDoctors = Array.isArray(doctors) ? doctors.length : 0;
      const totalSpecialties = Array.isArray(specialties) ? specialties.length : 0;

      // Xây dựng Map tra cứu tên Bác sĩ chính xác theo doctorId từ bảng doctors
      const doctorIdToNameMap: Record<number, string> = {};
      if (Array.isArray(doctors)) {
        doctors.forEach((d: Record<string, unknown>) => {
          const dId = Number(d.doctorId || d.doctor_id || d.id);
          const dName = String(d.fullName || d.full_name || d.name || "");
          if (dId && dName) {
            doctorIdToNameMap[dId] = dName;
          }
        });
      }

      // Calculate today date strings for comparison
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();

      const todayVnFormat1 = `${dd}/${mm}/${yyyy}`; // "08/08/2026"
      const todayVnFormat2 = `${yyyy}-${mm}-${dd}`; // "2026-08-08"

      const todayAppointmentsCount = appointmentList.filter((a: AppointmentRecord) => {
        if (!a.date) return false;
        return (
          a.date.includes(todayVnFormat1) ||
          a.date.includes(todayVnFormat2) ||
          a.date === "Hôm nay"
        );
      }).length;

      // Lọc danh sách lịch hẹn theo bộ lọc ngày được chọn
      let filteredAppointments = appointmentList;

      if (filterType === "today") {
        filteredAppointments = appointmentList.filter((a: AppointmentRecord) => {
          if (!a.date) return false;
          return (
            a.date.includes(todayVnFormat1) ||
            a.date.includes(todayVnFormat2) ||
            a.date === "Hôm nay"
          );
        });
      } else if (filterType === "7days") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredAppointments = appointmentList.filter((a: AppointmentRecord) => {
          const parsed = parseApptDate(a.date);
          if (!parsed) return true;
          return parsed >= sevenDaysAgo;
        });
      } else if (filterType === "30days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredAppointments = appointmentList.filter((a: AppointmentRecord) => {
          const parsed = parseApptDate(a.date);
          if (!parsed) return true;
          return parsed >= thirtyDaysAgo;
        });
      } else if (filterType === "custom" && customDate) {
        let formatted1 = customDate; // e.g. "08/08/2026"
        let formatted2 = customDate; // e.g. "2026-08-08"

        if (customDate.includes("/")) {
          const parts = customDate.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            formatted1 = `${d}/${m}/${y}`;
            formatted2 = `${y}-${m}-${d}`;
          }
        } else if (customDate.includes("-")) {
          const parts = customDate.split("-");
          if (parts.length === 3) {
            const [y, m, d] = parts;
            formatted1 = `${d}/${m}/${y}`;
            formatted2 = `${y}-${m}-${d}`;
          }
        }

        filteredAppointments = appointmentList.filter((a: AppointmentRecord) => {
          if (!a.date) return false;
          return (
            a.date.includes(formatted1) ||
            a.date.includes(formatted2)
          );
        });
      }

      const totalAppointments = filteredAppointments.length;

      // Gom nhóm số lượng lịch hẹn theo tên Bác sĩ (Ưu tiên tra theo doctorId để tính cả các ca slot_id = null)
      const doctorMap: Record<string, { total: number; completed: number; pending: number }> = {};

      if (filteredAppointments.length > 0) {
        filteredAppointments.forEach((a: AppointmentRecord) => {
          const docId = Number(a.doctorId || (a as Record<string, unknown>).doctor_id);
          let docName = (a.doctorName || a.doctor_name || "").trim();

          // Nếu có DoctorId trong bản ghi (kể cả khi slot_id = null hay docName = ""), dùng tên Bác sĩ chính xác từ doctorIdToNameMap
          if (docId && doctorIdToNameMap[docId]) {
            docName = doctorIdToNameMap[docId];
          }

          // Nếu hoàn toàn không có DoctorId và không có tên Bác sĩ
          if (!docName) {
            const reasonLower = (a.reason || "").toLowerCase();
            if (reasonLower.includes("tổng quát") || reasonLower.includes("tầm soát") || reasonLower.includes("gói")) {
              docName = "Gói khám tổng quát";
            } else {
              docName = "Chưa phân công BS";
            }
          }

          if (!doctorMap[docName]) {
            doctorMap[docName] = { total: 0, completed: 0, pending: 0 };
          }
          doctorMap[docName].total += 1;
          const status = (a.status || a.status_name || "").toLowerCase();
          if (status.includes("completed") || status.includes("hoàn thành") || a.statusId === 4) {
            doctorMap[docName].completed += 1;
          } else {
            doctorMap[docName].pending += 1;
          }
        });
      }

      const chartData: DoctorChartData[] = Object.keys(doctorMap).length > 0
        ? Object.entries(doctorMap).map(([doctor, stat]) => ({
            doctor: doctor,
            appointments: stat.total,
            completed: stat.completed,
            pending: stat.pending,
          }))
        : [];

      // Hoạt động gần đây (6 lịch hẹn mới nhất trong danh sách đã lọc)
      const recentActivities: RecentActivityItem[] = filteredAppointments.length > 0
        ? filteredAppointments.slice(0, 6).map((a: AppointmentRecord, idx: number) => {
            const docId = Number(a.doctorId || (a as Record<string, unknown>).doctor_id);
            const statusLower = (a.status || "").toLowerCase();
            let color = "bg-blue-600";
            if (statusLower.includes("completed") || statusLower.includes("hoàn thành") || a.statusId === 4) {
              color = "bg-green-600";
            } else if (statusLower.includes("cancel") || statusLower.includes("hủy") || a.statusId === 5) {
              color = "bg-red-500";
            } else if (statusLower.includes("check") || a.statusId === 7) {
              color = "bg-orange-500";
            }

            const docDisplay = (docId && doctorIdToNameMap[docId]) || a.doctorName || "Gói khám tổng quát";

            return {
              id: a.appointmentId || a.id || idx + 1,
              name: a.patientName || a.patient_name || `Bệnh nhân #${a.patientId || idx + 1}`,
              description: `Lịch khám với ${docDisplay} - Chuyên khoa ${a.specialtyName || "Nội tổng quát"}`,
              time: a.date || "Vừa xong",
              color: color,
            };
          })
        : [];

      return {
        totalPatients,
        totalDoctors,
        totalSpecialties,
        totalAppointments,
        todayAppointments: todayAppointmentsCount,
        chartData,
        recentActivities,
      };
    } catch (error) {
      console.warn("dashboardApi.getDashboardData error:", error);
      return {
        totalPatients: 0,
        totalDoctors: 0,
        totalSpecialties: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        chartData: [],
        recentActivities: [],
      };
    }
  },
};

export default dashboardApi;
