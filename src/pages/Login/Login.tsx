import DTT_Healthcare from "../../assets/images/DTT_Healthcare.jpg";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Vui lòng nhập tên tài khoản");
      return;
    }

    if (!password.trim()) {
      alert("Vui lòng nhập mật khẩu");
      return;
    }

    console.log(username);
    console.log(password);

    // await authService.login({ Được dùng cho back-end
    //   username,
    //   password,
    // });
  };
  return (
    <div
      className="min-h-screen bg-blue-900 flex justify-center items-center"
      style={{ fontFamily: "Tahoma" }}
    >
      <div className="bg-white w-[500px] h-[600px] rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 h-56 flex flex-col justify-center items-center ">
          <img
            src={DTT_Healthcare}
            alt="Logo"
            className="w-30 h-30 bg-white rounded-2xl p-2"
          />
          <h1 className="text-white text-3xl font-bold mt-4">DTT Medical</h1>
          <p className="text-blue-400 mt-1 font-bold">Trang quản trị</p>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-8">
          <label className="block text-gray-700 font-bold mb-2">
            Tên tài khoản
          </label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Nhập tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <label className="block text-gray-700 font-bold mt-6 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-lg py-3 pl-10 pr-10 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg mt-8 font-semibold 
                             hover:bg-blue-800 transition duration-300  cursor-pointer">
            Đăng nhập
          </button>
          <div className="text-center mt-4">
            <a href="#" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
