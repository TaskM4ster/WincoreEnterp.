import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./styles/components/header.css";

import "./styles/themes/variables.css";
import "./styles/base/reset.css";
import "./styles/base/global.css";

import "./styles/components/repair-card.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
