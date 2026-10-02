import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/variables.css";
import "./styles/globals.css";
createRoot(document.getElementById("root")).render(<App />);

import { registerApp } from "./services/appUpdates";
registerApp();
import { refreshIndianCatalog } from "./services/indianMusic";
setInterval(() => {
  if (!document.hidden)
    refreshIndianCatalog()
      .then(() => window.dispatchEvent(new Event("vibe:catalog")))
      .catch(() => {});
}, 3600000);
