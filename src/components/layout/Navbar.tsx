export default function Navbar() {
    return (
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Hospital Management System</h1>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-medium">Admin</p>
                    <p className="text-sm text-gray-500">admin@hospital.com</p>
                </div>

                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    A
                </div>
            </div>
        </header>
    )
}