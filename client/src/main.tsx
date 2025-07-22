import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

console.log("Main.tsx loading...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, rendering app...");
  createRoot(rootElement).render(
    <>
      <App />
      <Toaster />
    </>
  );
  console.log("App rendered successfully");
}
