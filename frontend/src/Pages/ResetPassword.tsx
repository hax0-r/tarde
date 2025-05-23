import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import logo from "../assets/logo.png";
import authService from "../services/authService";
import { AxiosError } from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        toast.error("Invalid or missing reset token");
        navigate("/sign-in");
        return;
      }

      try {
        const response = await authService.verifyResetToken({ token, email });
        if (response.success) {
          setIsValid(true);
        } else {
          toast.error(response.message || "Invalid or expired reset token");
          navigate("/sign-in");
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to verify token";
        toast.error(errorMessage);
        navigate("/sign-in");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Both password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPasswordWithToken({
        email,
        token,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        toast.success("Password has been reset successfully");
        navigate("/sign-in");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Verifying reset token...</div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">
          Invalid or expired token. Please request a new password reset link.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <div className="w-full relative h-screen bg-black bgSignIn bg-cover bg-center">
        <Link
          to="/"
          className="md:flex hidden absolute top-5 left-5 text-white items-center gap-3"
        >
          <img src={logo} alt="logo" className="h-10 rounded-lg" />
          <h2 className="text-lg font-semibold leading-tight">
            Wealth <br /> Way Trade
          </h2>
        </Link>

        <div className="max-w-xl mx-auto md:p-5 p-3 min-h-screen w-full flex flex-col justify-center">
          <div className="w-full bg-black rounded-3xl md:p-8 p-4">
            <h2 className="text-white font-medium text-4xl mb-6">
              Reset Your Password
            </h2>

            <form onSubmit={handleResetPassword} className="text-white mt-8">
              <div className="relative flex items-center justify-center border-b-2 border-[#685C7B] mt-5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-3 md:text-lg placeholder:text-[#685C7B]"
                  placeholder="New Password"
                />
                {showPassword ? (
                  <IoMdEyeOff
                    className="text-[#AA87E2] text-2xl cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <IoMdEye
                    className="text-[#AA87E2] text-2xl cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>

              <div className="relative flex items-center justify-center border-b-2 border-[#685C7B] mt-5">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 md:text-lg placeholder:text-[#685C7B]"
                  placeholder="Confirm New Password"
                />
                {showConfirmPassword ? (
                  <IoMdEyeOff
                    className="text-[#AA87E2] text-2xl cursor-pointer"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <IoMdEye
                    className="text-[#AA87E2] text-2xl cursor-pointer"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#5f29b7] w-full justify-center mt-8 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
                {!loading && <FaArrowRightLong />}
              </button>
            </form>

            <div className="text-center mt-8">
              <Link to="/sign-in" className="text-[#8A4BF0] hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
