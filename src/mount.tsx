import React from "react";
import { createRoot } from "react-dom/client";
import Panel from "./index";

function mountPanel(rootId = "panel") {
  let container = document.getElementById(rootId);
  if (!container) {
    container = document.createElement("div");
    container.id = rootId;
    document.body.appendChild(container);
  }
  const root = createRoot(container);
  root.render(<Panel />);
}

window.mountPanel = mountPanel;
export { mountPanel };
