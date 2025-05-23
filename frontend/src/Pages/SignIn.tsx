import { Link, useNavigate } from "react-router";
import logo from "../assets/logo.png";
import { IoCloseOutline } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../Components/ui/dialog";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { useTranslation } from "react-i18next";
import authService from "../services/authService";
import { AxiosError } from "axios";

const SignIn = () => {
  const { t } = useTranslation("signin");

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        toast.success(`Welcome, ${response.data.user.fullName}`);

        // Check if user is admin and redirect accordingly
        if (response.data.user.isAdmin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/platform");
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(forgotEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await authService.forgotPassword(forgotEmail);
      if (response.success) {
        toast.success(
          "Password reset link sent to your email. It will expire in 3 minutes."
        );
        setDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to send password reset link");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to send password reset link. Please try again.";
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      <div className="bg-black">
        <div className="w-full  relative h-screen bg-black bgSignIn bg-cover bg-center">
          <Link
            to={"/"}
            className="md:flex hidden absolute top-5 left-5 text-white items-center gap-3"
          >
            <img src={logo} alt="logo" className="h-10 rounded-lg" />
            <h2 className="text-lg font-semibold leading-tight">
              Wealth <br /> Way Trade
            </h2>
          </Link>
          <div className="max-w-7xl md:p-5 p-3 min-h-screen w-full mx-auto flex items-center justify-between gap-10">
            <div className="lg:block hidden lg:max-w-[50%] w-full mb-20">
              <h1 className="md:text-7xl text-[2.8rem] text-white font-medium max-w-2xl md:leading-[1.1] leading-tight capitalize ">
                {t("mainHeading.line1")}
                <span className="bg-gradient-to-r pt-3 block from-[#a66eff] to-white bg-clip-text text-transparent">
                  {" "}
                  with {t("mainHeading.line2")}
                </span>
              </h1>
            </div>
            <div className="lg:max-w-[50%] w-full">
              <div className="w-full bg-black rounded-3xl md:p-8 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-medium text-4xl">
                    {t("signIn")}
                  </h2>
                  <Link to={"/"}>
                    <IoCloseOutline className="text-[#5f29b7] cursor-pointer text-5xl" />
                  </Link>
                </div>
                <form onSubmit={handleSubmit} className="text-white mt-8">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b-2 border-[#685C7B] py-3 md:text-lg placeholder:text-[#685C7B]"
                      placeholder={t("email")}
                    />
                  </div>

                  <div className="relative flex items-center justify-center border-b-2 border-[#685C7B] mt-5">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 md:text-lg placeholder:text-[#685C7B]"
                      placeholder={t("Password")}
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

                  <div className="flex items-end justify-end mt-3">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <p className="text-[#8A4BF0] hover:underline cursor-pointer">
                          {t("ForgetPassword")}
                        </p>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{t("ResetPassword")}</DialogTitle>
                          <DialogDescription>
                            Enter your email to receive a password reset link.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 pt-2">
                          <div className="flex items-center gap-4">
                            <Label
                              htmlFor="email"
                              className="text-right text-nowrap"
                            >
                              {t("email")}
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="p-3"
                              placeholder={t("Enter_youre_mail")}
                            />
                          </div>
                        </div>
                        <div className="flex items-end justify-end">
                          <Button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={forgotPasswordLoading}
                            className="cursor-pointer"
                          >
                            {forgotPasswordLoading
                              ? "Sending..."
                              : "Send Reset Link"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5f29b7] w-full justify-center mt-8 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
                  >
                    {loading ? "Loading..." : t("signIn")}
                    {!loading && <FaArrowRightLong />}
                  </button>
                </form>

                <p className="text-[#7A6E8C] md:text-lg md:mt-36 mt-24">
                  {t("Stillnothaveaccount")}
                </p>
                <Link
                  to={"/create-account"}
                  className="border-[#5f29b7] border text-white w-full justify-center mt-4 flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-4 py-3 text-xl rounded-full"
                >
                  {t("Createanaccount")}
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

export default SignIn;
