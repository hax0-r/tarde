import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import authService from "../services/authService";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../services/errorTypes";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(
        "Email information is missing. Please go back to registration."
      );
      return navigate("/register");
    }

    if (!otp) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifyOTP({ email, otp });

      if (response.success) {
        toast.success("Email verified successfully!");
        navigate("/");
      }
    } catch (error: unknown) {
      let message = "Failed to verify OTP. Please try again.";
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        message = errorData.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const requestNewOTP = async () => {
    if (!email) {
      toast.error(
        "Email information is missing. Please go back to registration."
      );
      return navigate("/register");
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success("New OTP has been sent to your email");
    } catch (error: unknown) {
      let message = "Failed to send new OTP. Please try again.";
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        message = errorData.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black">
      <div className="w-full relative min-h-screen bgSignIn bg-cover bg-center">
        <div className="md:flex hidden absolute top-5 left-5 text-white items-center gap-3">
          <img src={logo} alt="logo" className="h-10 rounded-lg" />
          <h2 className="text-lg font-semibold leading-tight">
            Wealth <br /> Way Trade
          </h2>
        </div>

        <div className="max-w-7xl flex items-center justify-center md:p-5 p-3 min-h-screen w-full mx-auto">
          <div className="w-full md:max-w-md">
            <div className="w-full md:mt-16 mt-8 bg-black rounded-3xl md:p-8 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-medium text-4xl">
                  Verify Email
                </h2>
                <button onClick={() => navigate("/")} aria-label="Close">
                  <IoCloseOutline className="text-[#5f29b7] cursor-pointer text-5xl" />
                </button>
              </div>

              <p className="text-[#7A6E8C] mt-4">
                An OTP has been sent to{" "}
                <span className="text-white">{email}</span>. Please enter it
                below to verify your account.
              </p>

              <form onSubmit={handleSubmit} className="text-white mt-8">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                  placeholder="Enter OTP"
                  maxLength={6}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#5f29b7] w-full justify-center mt-8 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
                >
                  {loading ? "Verifying..." : "Verify OTP"} <FaArrowRightLong />
                </button>
              </form>

              <button
                onClick={requestNewOTP}
                disabled={loading}
                className="text-[#5f29b7] mt-4 text-center w-full block hover:underline"
              >
                Didn't receive the OTP? Request a new one
              </button>

              <button
                onClick={() => navigate("/register")}
                className="text-[#7A6E8C] mt-4 text-center w-full block hover:underline"
              >
                Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
