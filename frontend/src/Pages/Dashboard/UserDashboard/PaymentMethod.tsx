import { useEffect, useState } from "react";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { FiPlus } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { X } from "lucide-react";
import paymentService, {
  PaymentMethodType,
  PaymentMethodData,
  AddPaymentMethodData,
} from "../../../services/paymentService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const PaymentMethod = () => {
  // Track when the add payment method form is open
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Track selected payment method in dropdown
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  // Store saved payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  // Form fields
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Fetch payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Failed to load payment methods. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open the form
  const openForm = () => {
    setIsFormOpen(true);
    setSelectedMethod("");
    resetForm();
  };

  // Close the form
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedMethod("");
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setAccountTitle("");
    setAccountNumber("");
    setBankName("");
  };

  // Handle payment method selection
  const handleSelectMethod = (value: string) => {
    setSelectedMethod(value);
  };

  // Validate form before submission
  const validateForm = () => {
    if (!accountTitle.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!accountNumber.trim()) {
      toast.error("Account number or phone number is required");
      return false;
    }

    // Pakistani mobile number validation for JazzCash and EasyPaisa
    if (
      (selectedMethod === PaymentMethodType.JAZZCASH ||
        selectedMethod === PaymentMethodType.EASYPAISA) &&
      !/^(03\d{9})$/.test(accountNumber)
    ) {
      toast.error("Please enter a valid phone number (e.g., 03XXXXXXXXX)");
      return false;
    }

    // Bank requires bank name
    if (selectedMethod === PaymentMethodType.BANK && !bankName.trim()) {
      toast.error("Bank name is required");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const paymentData: AddPaymentMethodData = {
      type: selectedMethod as PaymentMethodType,
      accountTitle,
      accountNumber,
      ...(selectedMethod === PaymentMethodType.BANK && { bankName }),
    };

    try {
      setIsSaving(true);
      const response = await paymentService.addPaymentMethod(paymentData);

      if (response.success) {
        toast.success("Payment method added successfully");
        fetchPaymentMethods();
        closeForm();
      } else {
        toast.error(response.message || "Failed to add payment method");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to add payment method. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete payment method
  const handleDelete = async (methodId: string) => {
    try {
      setIsDeleting(methodId);
      const response = await paymentService.deletePaymentMethod(methodId);

      if (response.success) {
        toast.success("Payment method deleted successfully");
        // Update the list without making another API call
        setPaymentMethods((prevMethods) =>
          prevMethods.filter((method) => method.id !== methodId)
        );
      } else {
        toast.error(response.message || "Failed to delete payment method");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to delete payment method. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  // Get payment method icon
  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case PaymentMethodType.JAZZCASH:
        return "/images/jazzcash.png";
      case PaymentMethodType.EASYPAISA:
        return "/images/easypaisa.png";
      case PaymentMethodType.BANK:
        return "/images/bank.png"; // Assuming you have a bank icon
      default:
        return "/images/bank.png";
    }
  };

  // Format payment method name for display
  const formatMethodName = (type: PaymentMethodType) => {
    switch (type) {
      case PaymentMethodType.JAZZCASH:
        return "JazzCash";
      case PaymentMethodType.EASYPAISA:
        return "EasyPaisa";
      case PaymentMethodType.BANK:
        return "Bank Account";
      default:
        return type;
    }
  };

  return (
    <UserDashboardLeftBar breadcrumb="Payment Method">
      <h2 className="md:text-3xl text-xl mt-4 tracking-wide font-semibold">
        Payment Methods
      </h2>
      <p className="text-[#ffffffb6] mt-2">
        Add or manage your payment methods for deposits and withdrawals.
      </p>

      <div className="flex lg:flex-row flex-col justify-between gap-10 mt-5">
        {/* Left Side - Add Payment Method */}
        <div className="lg:w-1/2 w-full">
          {!isFormOpen ? (
            // Add Payment Method Button
            <div
              onClick={openForm}
              className="w-full h-60 bg-[#ffffff0a] border-2 border-dashed border-[#ffffff1a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#ffffff14] transition-all duration-300"
            >
              <div className="h-16 w-16 bg-[#6e45b9] rounded-full flex items-center justify-center mb-4">
                <FiPlus className="text-3xl text-white" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Add New Payment Method
              </h3>
              <p className="text-sm text-[#ffffff80] mt-1">
                Click to add a new payment option
              </p>
            </div>
          ) : (
            // Payment Method Form
            <div className="bg-[#ffffff0a] border border-[#ffffff1a] rounded-lg p-5 animate-slideDown">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add Payment Method</h3>
                <button
                  onClick={closeForm}
                  className="text-[#ffffff80] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-[#ffffffb6] mb-2">
                  Select Payment Method Type
                </label>
                <Select onValueChange={handleSelectMethod}>
                  <SelectTrigger className="bg-[#ffffff14] border-[#ffffff1a] focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171022] border-[#ffffff1a]">
                    <SelectItem
                      value={PaymentMethodType.JAZZCASH}
                      className="focus:bg-[#6e45b9] focus:text-white text-white"
                    >
                      JazzCash
                    </SelectItem>
                    <SelectItem
                      value={PaymentMethodType.EASYPAISA}
                      className="focus:bg-[#6e45b9] focus:text-white text-white"
                    >
                      EasyPaisa
                    </SelectItem>
                    <SelectItem
                      value={PaymentMethodType.BANK}
                      className="focus:bg-[#6e45b9] focus:text-white text-white"
                    >
                      Bank Account
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* JazzCash Form */}
              {selectedMethod === PaymentMethodType.JAZZCASH && (
                <div className="animate-slideDown">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Full Name
                      </label>
                      <Input
                        value={accountTitle}
                        onChange={(e) => setAccountTitle(e.target.value)}
                        placeholder="Enter account holder name"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Phone Number
                      </label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter JazzCash phone number"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-[#6e45b9] hover:bg-[#5a3a99]"
                    disabled={isSaving}
                    onClick={handleSubmit}
                  >
                    {isSaving ? "Saving..." : "Save JazzCash Details"}
                  </Button>
                </div>
              )}

              {/* EasyPaisa Form */}
              {selectedMethod === PaymentMethodType.EASYPAISA && (
                <div className="animate-slideDown">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Full Name
                      </label>
                      <Input
                        value={accountTitle}
                        onChange={(e) => setAccountTitle(e.target.value)}
                        placeholder="Enter account holder name"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Phone Number
                      </label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter EasyPaisa phone number"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-[#6e45b9] hover:bg-[#5a3a99]"
                    disabled={isSaving}
                    onClick={handleSubmit}
                  >
                    {isSaving ? "Saving..." : "Save EasyPaisa Details"}
                  </Button>
                </div>
              )}

              {/* Bank Account Form */}
              {selectedMethod === PaymentMethodType.BANK && (
                <div className="animate-slideDown">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Full Name
                      </label>
                      <Input
                        value={accountTitle}
                        onChange={(e) => setAccountTitle(e.target.value)}
                        placeholder="Enter account holder name"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Bank Name
                      </label>
                      <Input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter bank name"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-[#ffffffb6]">
                        Account Number
                      </label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter bank account number"
                        className="bg-[#ffffff14] border-[#ffffff1a]"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-[#6e45b9] hover:bg-[#5a3a99]"
                    disabled={isSaving}
                    onClick={handleSubmit}
                  >
                    {isSaving ? "Saving..." : "Save Bank Account Details"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Saved Accounts */}
        <div className="lg:w-1/2 w-full lg:border-l-2 border-[#ffffff27] lg:pl-7">
          <h2 className="text-xl tracking-wide font-medium">
            Your Saved Accounts
          </h2>
          <p className="text-[#ffffffb6] mt-1 text-sm">
            Payment methods you've previously added.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-[#ffffff80]">Loading payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-[#ffffff80]">
                No payment methods found. Add one to get started.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Dynamically render saved payment methods */}
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="w-full p-4 border border-[#ffffff1a] rounded-lg bg-[#ffffff0a]"
                >
                  <div className="flex justify-between gap-5 items-center">
                    <div className="">
                      <h3 className="text-lg">
                        {formatMethodName(method.type)}{" "}
                        {method.isDefault && (
                          <span className="text-xs text-[#6e45b9]">
                            (Default)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm opacity-50 mt-1">
                        {method.accountNumber}
                      </p>
                      {method.type === PaymentMethodType.BANK && (
                        <p className="text-sm opacity-50">{method.bankName}</p>
                      )}
                    </div>
                    <img
                      src={getMethodIcon(method.type)}
                      className="h-12 opacity-80"
                      alt={formatMethodName(method.type)}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-[#ffffff3a] hover:bg-[#ffffff14] hover:text-white text-black"
                        onClick={() => {
                          paymentService
                            .setDefaultPaymentMethod(method.id)
                            .then((response) => {
                              if (response.success) {
                                toast.success("Default payment method updated");
                                fetchPaymentMethods();
                              } else {
                                toast.error(
                                  response.message ||
                                    "Failed to update default method"
                                );
                              }
                            })
                            .catch(() => {
                              toast.error("Failed to update default method");
                            });
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      disabled={isDeleting === method.id}
                      onClick={() => handleDelete(method.id)}
                    >
                      {isDeleting === method.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserDashboardLeftBar>
  );
};

export default PaymentMethod;
