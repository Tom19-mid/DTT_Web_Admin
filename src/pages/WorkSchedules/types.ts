export interface TimeSlot {
  slotId: number;
  scheduleId: number;
  scheduleCode?: string;
  slotOrder?: number;
  startTime?: string;
  endTime?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkSchedule {
  scheduleId: number;
  doctorId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  timeSlots?: TimeSlot[];
}
