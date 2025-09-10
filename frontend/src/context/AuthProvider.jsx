import { createContext, useState, useEffect } from "react";
import api, { login as apiLogin, logout as apiLogout, removeToken, setToken } from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // temporary state until API confirms
      setAuth({ token });
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/user");
        setAuth(response.data); // user object from backend
      } catch (error) {
        if (error.response?.status === 401) {
          removeToken();
          setAuth(null);
        } else {
          console.error("Auth check failed", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data) => {
    try {
      const res = await apiLogin(data); // returns { token, user }
      const user = res?.user;

      if (res?.token) {
        setToken(res.token); // ✅ save to localStorage + axios header
        setAuth(user);
        toast.success("Login successful, redirecting...", { position: "top-center" });
        roleAccess(user, navigate);
      } else {
        toast.error("Login failed: no token returned", { position: "top-center" });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422 || error.response.status === 401) {
          toast.error("Invalid credentials", { position: "top-center" });
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.", { position: "top-center" });
        } else {
          toast.error(`Login failed (${error.response.status})`, { position: "top-center" });
        }
      } else {
        toast.error("Network error. Please check your connection.", { position: "top-center" });
      }
      console.error(error);
    }
  };

  const roleAccess = (user, navigate) => {
    switch (user?.role) {
      case "Super Admin":
        navigate("/login");
        break;
      case "LogisticsII Admin":
      case "Driver":
      case "Employee":
        navigate("/logisticsII/");
        break;
      case "LogisticsI Admin":
        navigate("/logistics1/");
        break;
      case "HR1 Admin":
        navigate("/hr1/");
        break;
      default:
        navigate("/login");
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (_) {
      // ignore errors, still clear local state
    } finally {
      removeToken();
      setAuth(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, loading, roleAccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
