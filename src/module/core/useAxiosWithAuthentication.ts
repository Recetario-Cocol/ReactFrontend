import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const useAxiosWithAuthentication = () => {
  const { token } = useAuth();

  const axiosInstance = axios.create({
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  return axiosInstance;
};

export default useAxiosWithAuthentication;
