import { create } from "zustand";

type User = {
  username: string;
  fullName: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const storedToken = localStorage.getItem("qlbh_token");
const storedUser = localStorage.getItem("qlbh_user");

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) as User : null,
  async login(payload) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (payload.username !== "admin" || payload.password !== "123456") {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    const token = "demo-token";
    const user = {
      username: "admin",
      fullName: "Quản trị viên",
      role: "ADMIN",
    };

    localStorage.setItem("qlbh_token", token);
    localStorage.setItem("qlbh_user", JSON.stringify(user));
    set({ token, user });
  },
  logout() {
    localStorage.removeItem("qlbh_token");
    localStorage.removeItem("qlbh_user");
    set({ token: null, user: null });
  },
}));
