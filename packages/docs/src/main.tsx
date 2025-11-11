import { SwipeBarProvider } from "@luciodale/swipe-bar";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SwipeBarProvider>
      <App />
    </SwipeBarProvider>
  </React.StrictMode>
);
