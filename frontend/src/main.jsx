import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProveedor } from "./AuthContext";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProveedor>
      <App />
    </AuthProveedor>
  </StrictMode>
);
