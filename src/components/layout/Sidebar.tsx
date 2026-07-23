import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserRound,
  Stethoscope,
  Building2,
  Pill,
  Calendar,
  CalendarDays,
  Bell
} from 'lucide-react'

const menus = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Patients', path: '/patients', icon: UserRound },
  { name: 'Doctors', path: '/doctors', icon: Stethoscope },
  { name: 'Specialties', path: '/specialties', icon: Building2 },
  { name: 'Medicines', path: '/medicines', icon: Pill },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
  { name: 'Work Schedules', path: '/work-schedules', icon: CalendarDays },
  { name: 'Notifications', path: '/notifications', icon: Bell },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6 text-blue-600">🏥 Hospital Admin</h2>

      <nav className="space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={20} />
              {menu.name}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}