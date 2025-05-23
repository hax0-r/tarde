import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";
import { Button } from "../../../Components/ui/button";
import { SlGraph } from "react-icons/sl";
import { Input } from "../../../Components/ui/input";
import { Link } from "react-router";
import { TiEdit } from "react-icons/ti";
import { useRef, useState, ChangeEvent, useEffect } from "react";
import authService from "../../../services/authService";
import { UserProfileData } from "../../../services/errorTypes";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import apiClient from "../../../services/api";

const Setting = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUserProfile(response.data);
        setFullName(response.data.fullName);
        if (response.data.profileImage) {
          setImageUrl(response.data.profileImage);
          setOriginalImageUrl(response.data.profileImage);
        }
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Display temporary preview
      const tempPreviewUrl = URL.createObjectURL(file);
      setImageUrl(tempPreviewUrl);

      // Start uploading process
      setUploading(true);

      // Create form data to upload directly to the backend
      const formData = new FormData();
      formData.append("profileImage", file);

      // Make direct API call to update profile image
      const response = await apiClient.put("/users/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Profile image updated successfully");

        // Get the updated image URL
        const profileImageUrl = response.data.data.profileImage;
        setOriginalImageUrl(profileImageUrl);

        // Clean up temporary preview URL
        URL.revokeObjectURL(tempPreviewUrl);

        // Refresh profile data
        fetchUserProfile();
      } else {
        // Revert to original image if update fails
        setImageUrl(originalImageUrl);
        toast.error(response.data.message || "Failed to update profile image");
      }
    } catch (error: unknown) {
      // Revert to original image on error
      setImageUrl(originalImageUrl);
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update profile image";
      toast.error(errorMessage);
      console.error("Error updating profile image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const response = await authService.updateProfile({ fullName });
      if (response.success) {
        toast.success("Name updated successfully");
        setIsEditingName(false);
        // Refresh profile data
        fetchUserProfile();
      } else {
        toast.error(response.message || "Failed to update name");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update name";
      toast.error(errorMessage);
      console.error("Error updating name:", error);
    }
  };

  const getDefaultProfileImage = () => {
    return "https://pagedone.io/asset/uploads/1705471668.png";
  };

  return (
    <UserDashboardLeftBar breadcrumb="Setting">
      <section className="relative pt-40 pb-24">
        <img
          src="/images/bgTrade.png"
          alt="cover-image"
          className="w-full rounded-lg absolute top-0 left-0 z-0 h-60 object-cover"
        />
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-center sm:justify-start relative z-10 mb-5">
            {loading ? (
              <div className="w-32 h-32 border-4 border-solid border-[#6d45b9] rounded-full bg-[#2a1c40] flex items-center justify-center">
                <span className="text-white opacity-50">Loading...</span>
              </div>
            ) : (
              <>
                <img
                  src={imageUrl || getDefaultProfileImage()}
                  alt="user-avatar-image"
                  className={`w-32 h-32 border-4 border-solid border-[#6d45b9] rounded-full object-cover ${
                    uploading ? "opacity-50" : ""
                  }`}
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <TiEdit
                    className={`text-white mt-10 opacity-80 cursor-pointer text-2xl ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={uploading ? undefined : handleEditClick}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-center flex-col sm:flex-row max-sm:gap-5 sm:justify-between mb-5">
            <div className="block">
              {loading ? (
                <div className="h-8 w-40 bg-[#2a1c40] rounded animate-pulse mb-2"></div>
              ) : isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[#2a1c40] border-[#6d45b9] text-xl"
                    placeholder="Enter your name"
                  />
                  <Button onClick={handleNameSave} size="lg">
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingName(false);
                      setFullName(userProfile?.fullName || "");
                    }}
                    size="lg"
                    variant="outline"
                    className="text-black"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl text-[#ffffffe5] mb-1 max-sm:text-center">
                      {userProfile?.fullName || "User"}
                    </h3>
                    <TiEdit
                      className="text-white opacity-80 cursor-pointer text-xl"
                      onClick={handleNameEdit}
                    />
                  </div>
                  <p className="font-normal text-base leading-7 text-gray-400 max-sm:text-center">
                    Passionate about financial markets and smart investments
                  </p>
                </>
              )}
            </div>
            <Link to={"/platform"}>
              <Button className="rounded-full py-6">
                <SlGraph className="ml-2" />
                <span className="pr-2 capitalize text-base leading-7 text-white">
                  Go to Trading
                </span>
              </Button>
            </Link>
          </div>
          <div className="max-w-lg w-full">
            <label htmlFor="" className="text-sm opacity-70">
              E-Mail
            </label>
            {loading ? (
              <div className="h-10 w-full bg-[#2a1c40] rounded animate-pulse mt-1"></div>
            ) : (
              <Input
                placeholder="E-mail"
                value={userProfile?.email || ""}
                className="mt-1"
                readOnly
              />
            )}
          </div>
        </div>
      </section>
    </UserDashboardLeftBar>
  );
};

export default Setting;
