import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { IoCloseOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../services/errorTypes";

const CreateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Extract referral code from URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const refCode = queryParams.get("ref") || queryParams.get("referral");
    if (refCode) {
      setReferralCode(refCode);
      console.log("Referral code detected:", refCode);
    }
  }, [location.search]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Create registration data with referral code if available
      const registrationData = {
        fullName: name,
        email,
        password,
        confirmPassword,
        ...(referralCode && { referralCode }),
      };

      const response = await authService.register(registrationData);

      if (response.success) {
        toast.success("Registration successful! Please verify your email.");
        // Navigate to OTP verification page, passing the email
        navigate("/verify-otp", { state: { email } });
      }
    } catch (error: unknown) {
      let message = "Registration failed. Please try again.";
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
    <>
      <div className="bg-black">
        <div className="w-full  relative min-h-screen bgSignIn bg-cover bg-center">
          <Link
            to={"/"}
            className="md:flex hidden absolute top-5 left-5 text-white items-center gap-3"
          >
            <img src={logo} alt="logo" className="h-10 rounded-lg" />
            <h2 className="text-lg font-semibold leading-tight">
              Wealth <br /> Way Trade
            </h2>
          </Link>
          <div className="max-w-7xl flex items-center justify-center md:p-5 p-3 min-h-screen w-full mx-auto ">
            <div className="w-full">
              <div className="w-full md:mt-16 mt-8 bg-black rounded-3xl md:p-8 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-medium text-4xl ">Register</h2>
                  <Link to={"/"}>
                    <IoCloseOutline className="text-[#5f29b7] cursor-pointer text-5xl" />
                  </Link>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="text-white mt-8 grid md:grid-cols-2 grid-cols-1 gap-5"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                    placeholder="Name"
                    disabled={loading}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                    placeholder="E-Mail"
                    disabled={loading}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-5 border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                    placeholder="Password"
                    disabled={loading}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mt-5 border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                    placeholder="Confirm Password"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5f29b7] md:col-span-2 w-full justify-center mt-8 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
                  >
                    {loading ? "Processing..." : "Create an account"}{" "}
                    <FaArrowRightLong />
                  </button>
                </form>

                <p className="text-[#7A6E8C] md:text-lg md:mt-28 mt-16">
                  Already have account?
                </p>
                <Link
                  to={"/sign-in"}
                  className="border-[#5f29b7] border text-white w-full justify-center mt-4 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
                >
                  Sign In
                  <FaArrowRightLong className="text-[#B689FF]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAccount;
