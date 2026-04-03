import axios, {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { notification } from "antd";

const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  throw new Error("KHÔNG CẤU HÌNH ĐƯỜNG DẪN API");
}

type RefreshTokenResponse = {
  data: {
    accessToken: string;
    refreshToken?: string;
  };
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getAccessToken = (): string | null => localStorage.getItem("access_token");
const getRefreshToken = (): string | null => localStorage.getItem("refresh_token");

const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

const setRefreshToken = (token: string) => {
  localStorage.setItem("refresh_token", token);
};

const clearAuthStorage = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const showErrorNotification = (message?: string) => {
  notification.error({
    message: "Lỗi",
    description: message || "Đã xảy ra lỗi. Vui lòng thử lại",
    placement: "topRight",
  });
};

const showSessionExpiredNotification = () => {
  notification.error({
    message: "Phiên đăng nhập hết hạn",
    description: "Vui lòng đăng nhập lại",
    placement: "topRight",
  });
};

export const apiClient = axios.create({
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

const rejectPendingRequests = () => {
  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const responseMessage =
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Đã xảy ra lỗi. Vui lòng thử lại";

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthStorage();
        showSessionExpiredNotification();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newAccessToken: string) => {
            if (!originalRequest.headers) {
              originalRequest.headers = {} as AxiosRequestHeaders;
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
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

        const newAccessToken = refreshResponse.data.data.accessToken;
        const newRefreshToken =
          refreshResponse.data.data.refreshToken ?? refreshToken;

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
        rejectPendingRequests();
        showSessionExpiredNotification();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    showErrorNotification(responseMessage);
    return Promise.reject(error);
  },
);