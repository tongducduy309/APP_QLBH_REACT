import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import { AppProvider } from "@/app/providers/app-provider";
// import "antd/dist/reset.css";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 14,
          colorPrimary: "#0f172a",
        },
      }}
    >
      <AppProvider />
    </ConfigProvider>
  </React.StrictMode>,
);
