import DTT_Healthcare from "../../assets/images/DTT_Healthcare.jpg";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(phone.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      const serverMessage = err.response?.data?.message;
      setErrorMessage(
        serverMessage || "Đăng nhập thất bại. Vui lòng kiểm tra số điện thoại và mật khẩu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-blue-900 flex justify-center items-center p-4"
      style={{ fontFamily: "Tahoma" }}
    >
      <div className="bg-white w-[480px] min-h-[580px] h-auto rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 py-6 px-4 flex flex-col justify-center items-center shrink-0">
          <img
            src={DTT_Healthcare}
            alt="Logo"
            className="w-24 h-24 bg-white rounded-2xl p-2 object-contain shadow-sm"
          />
          <h1 className="text-white text-3xl font-bold mt-3">DTT Medical</h1>
          <p className="text-blue-200 mt-1 font-bold text-sm">Trang quản trị (Admin)</p>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-8 flex-1 flex flex-col justify-between">
          <div>
            {errorMessage && (
              <div className="mb-5 p-3 bg-red-50 border border-red-300 text-red-700 text-sm font-medium rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            <label className="block text-gray-700 font-bold mb-2 text-sm">
              Số điện thoại
            </label>
            <div className="relative mb-5">
              <User
                size={20}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-base focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-all"
              />
            </div>

            <label className="block text-gray-700 font-bold mb-2 text-sm">
              Mật khẩu
            </label>
            <div className="relative mb-8">
              <Lock
                size={20}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-base focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-all"
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base
                         hover:bg-blue-800 transition duration-300 cursor-pointer 
                         disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng nhập Admin</span>
              )}
            </button>
            <div className="text-center mt-5">
              <Link
                to="/forgot-password"
                className="text-blue-600 font-semibold hover:underline text-sm transition"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
