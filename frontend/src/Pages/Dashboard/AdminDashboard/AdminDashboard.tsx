import { HiOutlineUsers } from "react-icons/hi2";
import { AiOutlineDollar } from "react-icons/ai";
import { GoDependabot } from "react-icons/go";
import DashboardCard from "../../../Components/Dashboard/DashboardCard";
import { GoDotFill } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import { HiOutlineTrash } from "react-icons/hi2";
import { Button } from "../../../Components/ui/button";
import { useState, useEffect } from "react";
import { BiSolidUserDetail } from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Link, useNavigate } from "react-router";
import { GoGift } from "react-icons/go";
import { FaMoneyBillWave } from "react-icons/fa";
import { PiRobotFill } from "react-icons/pi";
import userService, { User } from "../../../services/userService";
import authService from "../../../services/authService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { RiLogoutCircleRLine } from "react-icons/ri";
import logo from "../../../assets/logo.png";

const AdminDashboard = () => {
  const [searchItem, setSearchItem] = useState("");
  const [filterItem, setFilterItem] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setAdminName(response.data.fullName);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      authService.logout();
      toast.success("Logged out successfully");
      navigate("/sign-in");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response.success && response.data) {
        // Filter out any admin users (extra safety measure)
        const filteredUsers = response.data.filter((user) => !user.isAdmin);
        setUsers(filteredUsers);

        // Calculate total balance from all users
        const total = filteredUsers.reduce(
          (acc, user) => acc + user.balance,
          0
        );
        setTotalBalance(total);
      } else {
        toast.error(response.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success("User deleted successfully");
        // Remove the user from the list
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchItem
      ? user.fullName.toLowerCase().includes(searchItem.toLowerCase()) ||
        user.email.toLowerCase().includes(searchItem.toLowerCase()) ||
        user._id.toLowerCase().includes(searchItem.toLowerCase())
      : true;

    const matchesFilter =
      filterItem === "all" || filterItem === ""
        ? true
        : filterItem === "Active"
        ? user.isVerified
        : !user.isVerified;

    return matchesSearch && matchesFilter;
  });

  const getDefaultProfileImage = () => {
    return "https://pagedone.io/asset/uploads/1705471668.png";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <>
      {/* Admin Header */}
      <div className="bg-[#2a1c40] w-full p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-8xl mx-auto flex justify-between items-center px-2">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 rounded-lg" />
            <div>
              <h1 className="text-white text-xl font-semibold">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 text-sm">Welcome, {adminName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <RiLogoutCircleRLine className="text-lg" />
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-[#171022] w-full min-h-screen p-5">
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
          <DashboardCard
            title="Users"
            amount={`${users.length}`}
            description="Total Users"
            icon={HiOutlineUsers}
          />
          <DashboardCard
            title="Amount"
            amount={`$ ${totalBalance.toFixed(2)}`}
            description="Total Balance"
            icon={AiOutlineDollar}
          />
          <DashboardCard
            title="Active Users"
            amount={`${users.filter((user) => user.isVerified).length}`}
            description="Verified Users"
            icon={GoDependabot}
          />
        </div>

        <div className="flex items-center gap-3 my-5">
          <Link to={"/events-manage"} className="flex-1">
            <Button
              className="w-full flex items-center justify-center"
              size={"lg"}
            >
              <GoGift className="text-white mr-2" />
              Manage Events
            </Button>
          </Link>
          <Link to={"/event-add"} className="flex-1">
            <Button
              className="w-full flex items-center justify-center"
              size={"lg"}
              variant="outline"
            >
              <GoGift className="text-white mr-2" />
              Add Event
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 my-5">
          <Link to={"/deposits-manage"} className="flex-1">
            <Button
              className="w-full flex items-center justify-center bg-[#5f29b7] hover:bg-[#5f29b7]/80"
              size={"lg"}
            >
              <FaMoneyBillWave className="text-white mr-2" />
              Manage Deposits
            </Button>
          </Link>
          <Link to={"/withdrawals-manage"} className="flex-1">
            <Button
              className="w-full flex items-center justify-center bg-[#5f29b7] hover:bg-[#5f29b7]/80"
              size={"lg"}
            >
              <FaMoneyBillWave className="text-white mr-2" />
              Manage Withdrawals
            </Button>
          </Link>
        </div>

        {/* Bot Subscription Management Button */}
        <div className="flex items-center gap-3 my-5">
          <Link to={"/bot-subscriptions"} className="flex-1">
            <Button
              className="w-full flex items-center justify-center bg-[#5f29b7] hover:bg-[#5f29b7]/80"
              size={"lg"}
            >
              <PiRobotFill className="text-white mr-2" />
              Manage Bot Subscriptions
            </Button>
          </Link>
        </div>

        <div className="mt-10 mb-3 flex items-center justify-between ">
          <div className="border rounded-lg flex items-center border-[#ffffff80] pr-2 justify-center">
            <input
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              type="text"
              placeholder="Search ID, Name or Email"
              className="w-full placeholder:text-xs text-white bg-transparent p-2"
            />
            <IoIosSearch className="text-[#ffffffc4] text-2xl" />
          </div>
          <div className="md:flex hidden items-center gap-2">
            <Select onValueChange={(e) => setFilterItem(e)} defaultValue="all">
              <SelectTrigger className="w-[180px] text-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="Active">Active Users</SelectItem>
                  <SelectItem value="Inactive">Inactive Users</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 max-h-[65vh] custom-scrollbar">
          <div className="block">
            <div className="overflow-x-auto w-full border rounded-lg border-[#ffffff80]">
              <table className="w-full rounded-xl">
                <thead>
                  <tr className="bg-[#372359] text-nowrap">
                    {[
                      "User ID",
                      "Full Name & Email",
                      "Date",
                      "Status",
                      "Balance",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={index}
                        className="p-5 text-left font-medium text-white capitalize"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-nowrap divide-[#ffffff5d]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-white">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-white">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="transition-all duration-500 hover:bg-[#ffffff10]"
                      >
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {user._id.substring(0, 8)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="w-48 flex items-center gap-3">
                            <img
                              src={
                                user.profileImage || getDefaultProfileImage()
                              }
                              alt={`${user.fullName} profile`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="data">
                              <p className="font-normal text-sm text-white">
                                {user.fullName}
                              </p>
                              <p className="font-normal text-xs leading-5 text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-5 text-sm font-medium opacity-90">
                          <div
                            className={`py-1.5 px-1.5 ${
                              user.isVerified
                                ? "bg-emerald-50 text-emerald-600"
                                : "text-yellow-600 bg-yellow-50"
                            } rounded-full flex justify-center w-24 items-center gap-1`}
                          >
                            <GoDotFill />
                            <span className="font-medium text-xs">
                              {user.isVerified ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-medium text-[#fff] opacity-80">
                          ${user.balance.toFixed(2)}
                        </td>
                        <td className="p-5 flex items-center gap-2 text-sm font-medium text-[#fff] opacity-80">
                          <Link to={`/user-detail/${user._id}`}>
                            <Button>
                              <BiSolidUserDetail />
                              Details
                            </Button>
                          </Link>
                          <div
                            className={`w-8 h-8 cursor-pointer transition-all duration-500 hover:bg-red-600 hover:text-white text-red-600 bg-white flex items-center justify-center rounded-full ${
                              deletingUserId === user._id ? "opacity-50" : ""
                            }`}
                            onClick={() =>
                              !deletingUserId && handleDeleteUser(user._id)
                            }
                          >
                            <HiOutlineTrash className="text-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
