import { Navigate, Outlet } from "react-router-dom";

const UserProtected = () => {
  const isLogin = true;

  return isLogin ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default UserProtected;
