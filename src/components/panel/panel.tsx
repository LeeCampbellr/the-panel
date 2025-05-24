import styles from "./panel.module.css";
import { Corner } from "../../hooks/useDrag";
import { useCallback, useEffect, useState } from "react";

export default function Panel({
  children,
  isOpen,
  corner,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  corner: Corner;
}) {
  const [prevCorner, setPrevCorner] = useState<Corner>(corner);

  // Update prevCorner when corner changes
  useEffect(() => {
    if (corner !== prevCorner) {
      setPrevCorner(corner);
    }
  }, [corner, prevCorner]);

  // Get the pin position for a given corner
  const getPinPosition = useCallback(
    (cornerType: Corner): { x: number; y: number } => {
      const { innerWidth, innerHeight } = window;

      // Define margins from edges - keep in sync with useDrag
      const hMargin = Math.min(innerWidth * 0.05, 30); // Horizontal margin
      const vMargin = Math.min(innerHeight * 0.05, 30); // Vertical margin

      // Set pin positions inside each zone
      switch (cornerType) {
        case "bottom-right":
          return {
            x: innerWidth - hMargin - 25,
            y: innerHeight - vMargin - 25,
          };
        case "bottom-left":
          return {
            x: hMargin + 25,
            y: innerHeight - vMargin - 25,
          };
        case "top-right":
          return {
            x: innerWidth - hMargin - 25,
            y: vMargin + 25,
          };
        case "top-left":
          return {
            x: hMargin + 25,
            y: vMargin + 25,
          };
        case "bottom-center":
          return {
            x: innerWidth / 2,
            y: innerHeight - vMargin - 25,
          };
        case "top-center":
          return {
            x: innerWidth / 2,
            y: vMargin + 25,
          };
      }
    },
    []
  );

  // Calculate the panel position based on the pin position
  const getPanelStyle = useCallback(() => {
    // Get pin positions for transition animation
    const currentPin = getPinPosition(corner);

    // Base styles that apply to all pin positions
    const baseStyle: React.CSSProperties = {
      position: "fixed",
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? "visible" : "hidden",
      transition: `transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease, visibility 0.3s ease`,
    };

    // Position the panel based on the active pin
    switch (corner) {
      case "bottom-right":
        return {
          ...baseStyle,
          bottom: `calc(100vh - ${currentPin.y - 60}px)`,
          right: `calc(100vw - ${currentPin.x - 20}px)`,
          transformOrigin: "bottom right",
          transform: isOpen ? "none" : "translateY(1rem)",
        };
      case "bottom-left":
        return {
          ...baseStyle,
          bottom: `calc(100vh - ${currentPin.y - 60}px)`,
          left: `${currentPin.x - 20}px`,
          transformOrigin: "bottom left",
          transform: isOpen ? "none" : "translateY(1rem)",
        };
      case "top-right":
        return {
          ...baseStyle,
          top: `${currentPin.y + 40}px`,
          right: `calc(100vw - ${currentPin.x - 20}px)`,
          transformOrigin: "top right",
          transform: isOpen ? "none" : "translateY(-1rem)",
        };
      case "top-left":
        return {
          ...baseStyle,
          top: `${currentPin.y + 40}px`,
          left: `${currentPin.x - 20}px`,
          transformOrigin: "top left",
          transform: isOpen ? "none" : "translateY(-1rem)",
        };
      case "bottom-center":
        return {
          ...baseStyle,
          bottom: `calc(100vh - ${currentPin.y - 60}px)`,
          left: "50%",
          transform: isOpen
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(1rem)",
          transformOrigin: "bottom center",
          width: "50vw",
          maxWidth: "600px",
          minWidth: "400px",
        };
      case "top-center":
        return {
          ...baseStyle,
          top: `${currentPin.y + 40}px`,
          left: "50%",
          transform: isOpen
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(-1rem)",
          transformOrigin: "top center",
          width: "50vw",
          maxWidth: "600px",
          minWidth: "400px",
        };
    }
  }, [corner, isOpen, getPinPosition]);

  const isCenterPosition =
    corner === "top-center" || corner === "bottom-center";
  const panelStyle = getPanelStyle();

  return (
    <div
      className={styles.Panel}
      data-open={isOpen}
      data-corner={corner}
      data-center={isCenterPosition}
      style={panelStyle}
    >
      {children}
    </div>
  );
}
