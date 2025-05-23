import { useState } from "react";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { Input } from "../../../Components/ui/input";
import transactionService from "../../../services/transactionService";
import fileUploadService from "../../../services/fileUploadService";
import { toast } from "react-toastify";
import { Button } from "../../../Components/ui/button";
import { AxiosError } from "axios";
import { FiImage, FiX } from "react-icons/fi";
import { FaCopy } from "react-icons/fa";

const Deposit = () => {
  // State for deposit amount
  const [amount, setAmount] = useState<string>("");
  // State for payment screenshot
  const [screenshot, setScreenshot] = useState<File | null>(null);
  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Bank account details to be displayed
  const bankDetails = {
    accountTitle: "Wealthy Way Trade",
    accountNumber: "1234567890123456",
    bankName: "Soneri Bank",
    branch: "Main Branch",
    iban: "PK36EXMP0123456789012345",
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  // Function to remove selected file
  const removeFile = () => {
    setScreenshot(null);
    const fileInput = document.getElementById("screenshot") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Function to get file preview URL
  const getPreviewUrl = () => {
    if (screenshot) {
      return URL.createObjectURL(screenshot);
    }
    return "";
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Function to handle deposit submission
  const handleDeposit = async () => {
    // Validate input
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    if (amountValue < 5000) {
      toast.error("Minimum deposit amount is PKR 5,000");
      return;
    }

    if (!screenshot) {
      toast.error("Please upload a screenshot of your payment");
      return;
    }

    try {
      setIsSubmitting(true);

      // First upload the screenshot to Cloudinary
      const uploadResponse = await fileUploadService.uploadFile(screenshot);

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Failed to upload screenshot");
      }

      // Then create the deposit with the screenshot URL as the transaction reference
      const response = await transactionService.createDeposit({
        amount: amountValue,
        paymentMethodId: "manual", // Use "manual" for manual deposits with screenshots
        transactionReference: uploadResponse.data.fileUrl, // Use the Cloudinary URL
      });

      if (response.success) {
        toast.success("Deposit request submitted successfully");
        // Reset form
        setAmount("");
        setScreenshot(null);
        // Reset file input
        const fileInput = document.getElementById(
          "screenshot"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(response.message || "Failed to process deposit request");
      }
    } catch (error: unknown) {
      console.error("Error processing deposit:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to process deposit. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserDashboardLeftBar breadcrumb="Deposit">
      <h2 className="md:text-3xl text-xl mt-4 tracking-wide font-semibold">
        Deposit Money
      </h2>
      <div className="flex md:flex-row flex-col mt-6 items-start justify-between md:gap-20 gap-8">
        <div className="md:max-w-[50%] w-full">
          {/* Bank Details Card */}
          <div className="bg-[#ffffff10] rounded-lg p-4 border border-[#ffffff20] mb-6">
            <h3 className="text-base font-semibold mb-3">
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#ffffff80]">Account Title</p>
                <p className="font-medium text-sm flex items-center gap-2">
                  {bankDetails.accountTitle}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountTitle)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy account title"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Account Number</p>
                <p className="font-medium text-sm flex items-center gap-2">
                  {bankDetails.accountNumber}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy account number"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Bank Name</p>
                <p className="font-medium text-sm flex items-center gap-2">
                  {bankDetails.bankName}
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy bank name"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#ffffff80]">Branch</p>
                <p className="font-medium text-sm flex items-center gap-2">
                  {bankDetails.branch}
                  <button
                    onClick={() => copyToClipboard(bankDetails.branch)}
                    className="text-[#ffffff80] hover:text-white transition-colors"
                    title="Copy branch name"
                  >
                    <FaCopy size={14} />
                  </button>
                </p>
              </div>
              {/* <div className="md:col-span-2">
                <p className="text-sm text-[#ffffff80]">IBAN</p>
                <p className="font-medium">{bankDetails.iban}</p>
              </div> */}
            </div>
          </div>

          {/* Form fields */}
          <div>
            <p className="text-sm mb-2">Deposit Amount</p>
            <Input
              placeholder="PKR 5,000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="5000"
              disabled={isSubmitting}
            />
            <p className="text-xs text-[#ffffff80] mt-1">
              Minimum deposit amount: PKR 5,000
            </p>
          </div>

          {/* Screenshot upload in separate row */}
          <div className="mt-6">
            <p className="text-sm mb-2">Payment Screenshot</p>
            <div className="relative border border-[#ffffff30] bg-[#ffffff10] rounded-md overflow-hidden h-[140px]">
              {screenshot ? (
                <div className="relative h-full">
                  <img
                    src={getPreviewUrl()}
                    alt="Payment screenshot"
                    className="w-full h-full object-contain bg-black"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00000080] flex items-end p-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-white truncate max-w-[80%]">
                        {screenshot.name}
                      </span>
                      <button
                        onClick={removeFile}
                        className="bg-[#ffffff20] hover:bg-[#ffffff40] transition-colors p-1.5 rounded-full"
                        type="button"
                      >
                        <FiX className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="screenshot"
                  className="cursor-pointer block h-full"
                >
                  <div className="flex flex-col items-center justify-center py-6 px-4 h-full">
                    <div className="h-10 w-10 bg-[#ffffff20] rounded-full flex items-center justify-center mb-2">
                      <FiImage className="text-white h-5 w-5" />
                    </div>
                    <p className="text-white font-medium text-center text-sm">
                      Click to upload payment proof
                    </p>
                    <p className="text-[#ffffff80] text-xs text-center mt-0.5">
                      PNG, JPG or JPEG (max 5MB)
                    </p>
                  </div>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-[#ffffff80] mt-1">
              Please upload a screenshot of your payment as proof of deposit
            </p>
          </div>

          {/* Submit button in separate row */}
          <div className="mt-8">
            <Button
              className="w-full rounded-lg p-6 text-white bg-[#5f29b7] cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80"
              onClick={handleDeposit}
              disabled={isSubmitting || !amount || !screenshot}
            >
              {isSubmitting ? "Processing..." : "Submit Deposit Request"}
            </Button>
          </div>
        </div>
        <div className="md:max-w-[50%] w-full">
          <h2 className="text-xl capitalize mt-4 tracking-wide font-semibold">
            Manual Deposit Instructions
          </h2>

          <h3 className="text-lg font-medium mb-2 md:mt-8 mt-5">
            How to Deposit Funds
          </h3>
          <ol className="list-decimal mt-3 pl-5 text-[#ffffffd5] space-y-3">
            <li>
              Transfer the desired amount to our bank account shown on the left
            </li>
            <li>Take a screenshot or photo of your payment confirmation</li>
            <li>Enter the exact amount you deposited</li>
            <li>Upload the screenshot as proof of payment</li>
            <li>Submit your deposit request</li>
          </ol>

          <h3 className="text-lg font-medium mb-2 mt-6">
            Important Information
          </h3>
          <ul className="list-disc mt-3 pl-5 text-[#ffffffd5] space-y-3">
            <li>Minimum Deposit: PKR 5,000 per transaction</li>

            <li>Include your account details in the bank transfer reference</li>
            <li>Keep your payment receipt until the deposit is confirmed</li>
          </ul>
        </div>
      </div>
    </UserDashboardLeftBar>
  );
};

export default Deposit;
