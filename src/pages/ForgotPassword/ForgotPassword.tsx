import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DTT_Healthcare from "../../assets/images/DTT_Healthcare.jpg";
import {
  Phone,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import authApi from "../../api/authApi";

export default function ForgotPassword() {
  // Step 1: Send OTP, Step 2: Verify OTP, Step 3: Reset Password, Step 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & timing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes

  const navigate = useNavigate();

  // Timer countdown for Step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|0[0-9]{9})$/;
    return phoneRegex.test(phoneNumber.trim());
  };

  // Helper hàm ẩn số điện thoại dạng 076*****49
  const maskPhone = (phoneNum: string) => {
    const clean = phoneNum.trim();
    if (clean.length >= 10) {
      return (
        clean.substring(0, 3) + "*****" + clean.substring(clean.length - 2)
      );
    }
    return clean;
  };

  // STEP 1 & RESEND: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage(
        "Số điện thoại không hợp lệ. Phải có 10 chữ số (Ví dụ: 0901234567)",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.sendOtp({ phone: phone.trim() });
      if (res.success) {
        const masked = maskPhone(phone);
        const isResend = step === 2;
        setSuccessMessage(
          isResend
            ? `Mã OTP đã được gửi lại đến số ${masked}.`
            : `Mã OTP đã được gửi đến số ${masked}.`,
        );

        // Log mã OTP ra F12 Console
        if (res.otpCode) {
          console.log(
            `%c🔑 [MÃ OTP XÁC MINH DTT MEDICAL]: ${res.otpCode}`,
            "color: #059669; font-weight: bold; font-size: 16px; background: #ecfdf5; padding: 6px 12px; border-radius: 6px; border: 1px solid #10b981;",
          );
        }

        setCountdown(300);
        if (step === 1) {
          setStep(2);
        }
      } else {
        setErrorMessage(res.message || "Gửi mã OTP thất bại.");
      }
    } catch (err: unknown) {
      console.error("Send OTP Error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosErr.response?.data?.message ||
          "Số điện thoại chưa được đăng ký hoặc không tồn tại trong hệ thống.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage("Vui lòng nhập đúng mã OTP gồm 6 chữ số");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.verifyOtp({
        phone: phone.trim(),
        otpCode: otpCode.trim(),
      });
      if (res.success) {
        setSuccessMessage(
          "Xác minh mã OTP thành công. Vui lòng tạo mật khẩu mới.",
        );
        setStep(3);
      } else {
        setErrorMessage(res.message || "Mã OTP không chính xác.");
      }
    } catch (err: unknown) {
      console.error("Verify OTP Error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosErr.response?.data?.message ||
          "Mã OTP không hợp lệ hoặc đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.resetPassword({
        phone: phone.trim(),
        otpCode: otpCode.trim(),
        newPassword: newPassword,
      });

      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch (err: unknown) {
      console.error("Reset Password Error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosErr.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className="min-h-screen bg-blue-900 flex justify-center items-center p-4 select-none"
      style={{ fontFamily: "Tahoma" }}
    >
      <div className="bg-white w-[480px] min-h-[580px] h-auto rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 py-6 px-4 flex flex-col justify-center items-center shrink-0 relative">
          <Link
            to="/login"
            className="absolute left-4 top-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-blue-600 transition flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </Link>

          <img
            src={DTT_Healthcare}
            alt="Logo"
            className="w-20 h-20 bg-white rounded-2xl p-2 object-contain shadow-sm"
          />
          <h1 className="text-white text-2xl font-bold mt-2">DTT Medical</h1>
          <p className="text-blue-200 mt-0.5 font-semibold text-sm">
            Quên Mật Khẩu Admin
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-10 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-gray-600">Gửi OTP</span>
          </div>
          <div
            className={`h-0.5 flex-1 mx-2 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
          />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-gray-600">
              Xác minh
            </span>
          </div>
          <div
            className={`h-0.5 flex-1 mx-2 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
          />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-gray-600">
              Đổi mật khẩu
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 flex-1 flex flex-col justify-between">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-sm font-medium rounded-xl leading-relaxed">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-medium rounded-xl leading-relaxed flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}
          {/* STEP 1: NHẬP SỐ ĐIỆN THOẠI */}
          {step === 1 && (
            <form
              onSubmit={handleSendOtp}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Bước 1: Nhập Số Điện Thoại
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Vui lòng nhập số điện thoại tài khoản Admin của bạn để nhận mã
                  xác minh OTP.
                </p>

                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Số điện thoại
                </label>
                <div className="relative mb-6">
                  <Phone
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Ví dụ: 0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-800 transition duration-300 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : (
                    <span>Gửi Mã OTP</span>
                  )}
                </button>
              </div>
            </form>
          )}
          {/* STEP 2: NHẬP MÃ OTP 6 SỐ */}
          {step === 2 && (
            <form
              onSubmit={handleVerifyOtp}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Bước 2: Xác Minh Mã OTP
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Mã OTP 6 chữ số đã được gửi tới số{" "}
                  <strong className="text-gray-800">{maskPhone(phone)}</strong>.
                </p>

                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Mã xác minh OTP (6 chữ số)
                </label>
                <div className="relative mb-4">
                  <KeyRound
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Nhập 6 chữ số OTP"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                  <span>
                    Hiệu lực còn:{" "}
                    <strong className="text-blue-700 font-mono text-sm">
                      {formatTime(countdown)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting || countdown > 240}
                    className="text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-200 transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="flex-1 bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-800 transition duration-300 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Đang xác minh...</span>
                    </>
                  ) : (
                    <span>Xác Minh OTP</span>
                  )}
                </button>
              </div>
            </form>
          )}
          {/* STEP 3: ĐẶT MẬT KHẨU MỚI */}
          {step === 3 && (
            <form
              onSubmit={handleResetPassword}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Bước 3: Tạo Mật Khẩu Mới
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Vui lòng tạo mật khẩu mới cho tài khoản Admin của bạn (tối
                  thiểu 6 ký tự).
                </p>

                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Mật khẩu mới
                </label>
                <div className="relative mb-4">
                  <Lock
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu từ 6 ký tự trở lên"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative mb-6">
                  <Lock
                    size={20}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-800 transition duration-300 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Lưu Mật Khẩu Mới</span>
                  )}
                </button>
              </div>
            </form>
          )}
          {/* STEP 4: HOÀN TẤT */}
          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <CheckCircle2
                size={64}
                className="text-emerald-500 mb-4 animate-bounce"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Đổi Mật Khẩu Thành Công!
              </h3>
              <p className="text-gray-600 text-sm mb-8 max-w-xs">
                Mật khẩu tài khoản Admin của bạn đã được cập nhật thành công.
                Vui lòng đăng nhập lại với mật khẩu mới.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-800 transition duration-300 shadow-md cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
