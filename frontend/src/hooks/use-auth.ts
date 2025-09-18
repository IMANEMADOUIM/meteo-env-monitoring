// hooks/use-auth.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";



const fetchCurrentUser = async () => {
  const response = await axios.get("/auth/me"); // maintenant /auth/me
  return response.data;
};

const useAuth = () => {
  return useQuery({ queryKey: ["currentUser"], queryFn: fetchCurrentUser, staleTime: Infinity, retry: 1 });
};

export default useAuth;