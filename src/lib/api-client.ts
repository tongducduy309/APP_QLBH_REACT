import axios, {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  throw new Error("KHÔNG CẤU HÌNH ĐƯỜNG DẪN API");
}

type ApiErrorResponse = {
  code?: number | string;
  message?: string;
  status?: number;
  errors?: Record<string, string | string[]>;
};

type RefreshTokenResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipErrorToast?: boolean;
};

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

const setRefreshToken = (token: string) => {
  localStorage.setItem("refresh_token", token);
};

const clearAuthStorage = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_user");
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processPendingRequests = (token: string) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const clearPendingRequests = () => {
  pendingRequests = [];
};

const showErrorToast = (message: string, skip?: boolean) => {
  if (skip) return;
  toast.error(message);
};

const getErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  if (error.code === "ECONNABORTED") {
    return "Yêu cầu quá thời gian xử lý";
  }

  if (!error.response) {
    return "Không thể kết nối đến máy chủ";
  }

  return error.response.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại";
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const skipErrorToast = originalRequest?._skipErrorToast;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthStorage();
        showErrorToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại", skipErrorToast);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newAccessToken: string) => {
            try {
              if (!originalRequest.headers) {
                originalRequest.headers = {} as AxiosRequestHeaders;
              }

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              resolve(apiClient(originalRequest));
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<RefreshTokenResponse>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ?? refreshResponse.data?.accessToken;

        const newRefreshToken =
          refreshResponse.data?.data?.refreshToken ??
          refreshResponse.data?.refreshToken ??
          refreshToken;

        if (!newAccessToken) {
          throw new Error("Không nhận được access token mới");
        }

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        processPendingRequests(newAccessToken);

        if (!originalRequest.headers) {
          originalRequest.headers = {} as AxiosRequestHeaders;
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        clearPendingRequests();
        showErrorToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại", skipErrorToast);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = getErrorMessage(error);
    showErrorToast(message, skipErrorToast);

    return Promise.reject(error);
  },
);

export default apiClient;