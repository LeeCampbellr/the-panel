import React, { useEffect, useState, useRef } from "react";
import styles from "./trigger.module.css";
import { useDrag, Corner, UseDragOptions } from "../../hooks/useDrag";
import { Pane } from "tweakpane";

export default function Trigger({
  isOpen,
  setIsOpen,
  corner,
  onCornerChange,
  onDragStart,
  onDragEnd,
  showDebug = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  corner: Corner;
  onCornerChange: (corner: Corner) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  showDebug?: boolean;
}) {
  const paneRef = useRef<Pane | null>(null);

  // Store the drag options in a ref so we can modify them with Tweakpane
  const dragOptionsRef = useRef<UseDragOptions>({
    initialCorner: corner,
    dragThreshold: 5,
    minAnimDuration: 0.15,
    maxAnimDuration: 0.3,
    animationDistanceFactor: 0.0008,
    gravityRadius: 60,
    gravityStrength: 0.7,
    followSpeed: 0.05,
    maxFollowSpeed: 1.5,
    easeType: "linear",
  });

  // Create a separate state object for Tweakpane to modify
  const [tweakableParams, setTweakableParams] = useState({
    dragThreshold: 5,
    minAnimDuration: 0.15,
    maxAnimDuration: 0.3,
    animationDistanceFactor: 0.0008,
    gravityRadius: 60,
    gravityStrength: 0.7,
    followSpeed: 0.05,
    maxFollowSpeed: 1.5,
    easeType: "linear" as
      | "linear"
      | "easeOutQuad"
      | "easeOutCubic"
      | "easeOutQuart"
      | "easeOutQuint"
      | "easeInQuad"
      | "easeInCubic"
      | "easeInQuart"
      | "easeInQuint"
      | "easeInOutQuad"
      | "easeInOutCubic"
      | "easeInOutQuart"
      | "easeInOutQuint",
  });

  const {
    ref,
    isDragging,
    corner: dragCorner,
    getCornerPosition,
    getPinPosition,
    dragPosition,
    animationDuration,
    debugInfo,
    updateOptions,
  } = useDrag(dragOptionsRef.current);

  // Track previous drag state to properly detect transitions
  const wasDraggingRef = useRef(false);
  const dragStartedRef = useRef(false);
  const pendingCornerChangeRef = useRef<Corner | null>(null);

  // Update drag options when tweakable params change
  useEffect(() => {
    updateOptions(tweakableParams);
  }, [tweakableParams, updateOptions]);

  // Initialize Tweakpane
  useEffect(() => {
    if (showDebug && !paneRef.current) {
      try {
        const pane = new Pane({
          title: "Drag Controls",
          expanded: true,
        });

        // Create folder for basic drag parameters
        const parametersFolder = pane.addFolder({
          title: "Basic Parameters",
          expanded: true,
        });

        // Add controls for basic drag options
        parametersFolder
          .addBinding(tweakableParams, "dragThreshold", {
            min: 1,
            max: 20,
            step: 1,
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              dragThreshold: ev.value,
            }));
          });

        parametersFolder
          .addBinding(tweakableParams, "minAnimDuration", {
            min: 0.05,
            max: 5,
            step: 0.01,
            label: "Min Duration",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              minAnimDuration: ev.value,
            }));
          });

        parametersFolder
          .addBinding(tweakableParams, "maxAnimDuration", {
            min: 0.1,
            max: 5,
            step: 0.01,
            label: "Max Duration",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              maxAnimDuration: ev.value,
            }));
          });

        parametersFolder
          .addBinding(tweakableParams, "animationDistanceFactor", {
            min: 0.0001,
            max: 0.002,
            step: 0.0001,
            label: "Distance Factor",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              animationDistanceFactor: ev.value,
            }));
          });

        // Create a separate folder for gravity effect
        const gravityFolder = pane.addFolder({
          title: "Gravity Effect",
          expanded: true,
        });

        // Add description
        gravityFolder.addBinding(
          {
            get info() {
              return "Controls how the trigger is pulled toward its pin";
            },
          },
          "info",
          {
            label: "About",
            readonly: true,
          }
        );

        gravityFolder
          .addBinding(tweakableParams, "gravityRadius", {
            min: 0,
            max: 150,
            step: 5,
            label: "Radius (px)",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              gravityRadius: ev.value,
            }));
          });

        gravityFolder
          .addBinding(tweakableParams, "gravityStrength", {
            min: 0,
            max: 1,
            step: 0.05,
            label: "Strength",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              gravityStrength: ev.value,
            }));
          });

        // Create magnetic follow folder
        const magneticFolder = pane.addFolder({
          title: "Magnetic Feel",
          expanded: true,
        });

        // Add description
        magneticFolder.addBinding(
          {
            get info() {
              return "Controls how quickly the trigger follows the cursor";
            },
          },
          "info",
          {
            label: "About",
            readonly: true,
          }
        );

        magneticFolder
          .addBinding(tweakableParams, "followSpeed", {
            min: 0.001,
            max: 1.5,
            step: 0.001,
            format: (v: number) => v.toFixed(3),
            label: "Min Follow Speed",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              followSpeed: ev.value,
            }));
          });

        magneticFolder
          .addBinding(tweakableParams, "maxFollowSpeed", {
            min: 0.01,
            max: 1.5,
            step: 0.001,
            format: (v: number) => v.toFixed(3),
            label: "Max Follow Speed",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              maxFollowSpeed: ev.value,
            }));
          });

        // Add ease type selector
        magneticFolder
          .addBinding(tweakableParams, "easeType", {
            options: {
              linear: "linear",
              easeInQuad: "easeInQuad",
              easeOutQuad: "easeOutQuad",
              easeInOutQuad: "easeInOutQuad",
              easeInCubic: "easeInCubic",
              easeOutCubic: "easeOutCubic",
              easeInOutCubic: "easeInOutCubic",
              easeInQuart: "easeInQuart",
              easeOutQuart: "easeOutQuart",
              easeInOutQuart: "easeInOutQuart",
              easeInQuint: "easeInQuint",
              easeOutQuint: "easeOutQuint",
              easeInOutQuint: "easeInOutQuint",
            },
            label: "Ease",
          })
          .on("change", (ev) => {
            setTweakableParams((prev) => ({
              ...prev,
              easeType: ev.value as any,
            }));
          });

        // Create a monitor folder
        const monitorFolder = pane.addFolder({ title: "Monitors" });

        // Add monitors for dynamic values
        monitorFolder.addBinding(debugInfo, "lastEvent", {
          readonly: true,
        });
        monitorFolder.addBinding(debugInfo, "distanceMoved", {
          view: "number",
          min: 0,
          max: 2500,
          readonly: true,
        });
        monitorFolder.addBinding(debugInfo.velocity, "x", {
          view: "number",
          min: -1,
          max: 1,
          readonly: true,
        });
        monitorFolder.addBinding(debugInfo.velocity, "y", {
          view: "number",
          min: -1,
          max: 1,
          readonly: true,
        });

        // Add current state monitor
        const stateMonitor = pane.addFolder({ title: "State" });

        // For isDragging, we need to create a dynamic getter because it's not directly in an object
        const stateValues = {
          get isDragging() {
            return isDragging;
          },
          get isOpen() {
            return isOpen;
          },
          get corner() {
            return corner;
          },
          get dragCorner() {
            return dragCorner;
          },
          get animationDuration() {
            return animationDuration;
          },
        };

        stateMonitor.addBinding(stateValues, "isDragging", { readonly: true });
        stateMonitor.addBinding(stateValues, "isOpen", { readonly: true });
        stateMonitor.addBinding(stateValues, "corner", { readonly: true });
        stateMonitor.addBinding(stateValues, "dragCorner", { readonly: true });
        stateMonitor.addBinding(stateValues, "animationDuration", {
          readonly: true,
        });

        // Store pane in ref
        paneRef.current = pane;

        // Position the pane in the top right corner
        const container = pane.element;
        if (container) {
          container.style.position = "fixed";
          container.style.top = "10px";
          container.style.right = "10px";
          container.style.zIndex = "10000";
        }

        console.log("[Trigger] Tweakpane initialized successfully");

        return () => {
          pane.dispose();
          paneRef.current = null;
        };
      } catch (err) {
        console.error("[Trigger] Error initializing Tweakpane:", err);
      }
    }

    if (!showDebug && paneRef.current) {
      paneRef.current.dispose();
      paneRef.current = null;
    }
  }, [showDebug, isOpen, corner, dragCorner, animationDuration, isDragging]);

  // Notify parent of drag start/end with improved detection
  useEffect(() => {
    // If we just started dragging
    if (isDragging && !wasDraggingRef.current) {
      console.log("[Trigger] Drag started");
      onDragStart?.();
      dragStartedRef.current = true;
    }
    // If we just ended dragging (but only if we actually started a drag)
    else if (!isDragging && wasDraggingRef.current && dragStartedRef.current) {
      console.log("[Trigger] Drag ended, last event:", debugInfo.lastEvent);

      // Reset drag started flag
      dragStartedRef.current = false;

      // Only notify about real drags, not clicks
      if (debugInfo.lastEvent === "drag-complete") {
        // First process any pending corner change
        if (pendingCornerChangeRef.current) {
          console.log(
            "[Trigger] Applying pending corner change:",
            pendingCornerChangeRef.current
          );
          onCornerChange(pendingCornerChangeRef.current);
          pendingCornerChangeRef.current = null;
        }

        // Then notify about drag end
        onDragEnd?.();
      }
    }

    // Update previous state reference
    wasDraggingRef.current = isDragging;
  }, [isDragging, debugInfo.lastEvent, onDragStart, onDragEnd, onCornerChange]);

  // Update parent when corner changes from drag
  useEffect(() => {
    if (corner !== dragCorner) {
      console.log(
        "[Trigger] Detected corner change from:",
        corner,
        "to:",
        dragCorner,
        "isDragging:",
        isDragging
      );

      // If currently dragging, store the corner change to apply after dragging completes
      if (isDragging) {
        console.log("[Trigger] Delaying corner change until drag completes");
        pendingCornerChangeRef.current = dragCorner;
      } else {
        console.log("[Trigger] Applying corner change immediately");
        onCornerChange(dragCorner);
      }
    }
  }, [dragCorner, corner, isDragging, onCornerChange]);

  // Get position styles based on current corner or drag position
  const positionStyle =
    isDragging && dragPosition
      ? {
          position: "fixed",
          top: `${dragPosition.y}px`,
          left: `${dragPosition.x}px`,
          transform: `translate(-50%, -50%)`,
        }
      : {
          ...getCornerPosition(),
          transform: `translate(-50%, -50%)`,
        };

  // Debug: verify function availability
  useEffect(() => {
    console.log(
      "[Trigger] getPinPosition function present:",
      typeof getPinPosition
    );
  }, [getPinPosition]);

  // Calculate zones for visual feedback
  const renderZones = () => {
    if (!showDebug) return null;

    const { innerWidth, innerHeight } = window;
    const horizontalThird = innerWidth / 3;

    const zones = [
      // bottom-right
      {
        style: {
          position: "fixed",
          bottom: 0,
          right: 0,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          border: "1px dashed rgba(255, 0, 0, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "bottom-right",
      },
      // bottom-center
      {
        style: {
          position: "fixed",
          bottom: 0,
          left: horizontalThird,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(255, 165, 0, 0.1)",
          border: "1px dashed rgba(255, 165, 0, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "bottom-center",
      },
      // bottom-left
      {
        style: {
          position: "fixed",
          bottom: 0,
          left: 0,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(0, 255, 0, 0.1)",
          border: "1px dashed rgba(0, 255, 0, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "bottom-left",
      },
      // top-right
      {
        style: {
          position: "fixed",
          top: 0,
          right: 0,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          border: "1px dashed rgba(0, 0, 255, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "top-right",
      },
      // top-center
      {
        style: {
          position: "fixed",
          top: 0,
          left: horizontalThird,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(128, 0, 128, 0.1)",
          border: "1px dashed rgba(128, 0, 128, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "top-center",
      },
      // top-left
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: horizontalThird,
          height: innerHeight / 2,
          backgroundColor: "rgba(255, 255, 0, 0.1)",
          border: "1px dashed rgba(255, 255, 0, 0.3)",
          zIndex: 90,
          pointerEvents: "none",
        },
        corner: "top-left",
      },
    ];

    return (
      <>
        {zones.map((zone, index) => (
          <div
            key={index}
            style={zone.style as React.CSSProperties}
            data-active={zone.corner === dragCorner}
          />
        ))}
      </>
    );
  };

  // Render pins for each zone
  const renderPins = () => {
    if (!showDebug) return null;

    const allCorners: Corner[] = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ];

    // Safety: if getPinPosition is not available yet, skip rendering pins
    if (typeof getPinPosition !== "function") return null;

    return (
      <>
        {allCorners.map((cornerPosition) => {
          const pinPos = getPinPosition(cornerPosition);
          const isActive =
            cornerPosition === (isDragging ? dragCorner : corner);

          return (
            <div
              key={cornerPosition}
              style={{
                position: "fixed",
                left: `${pinPos.x}px`,
                top: `${pinPos.y}px`,
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isActive
                  ? "rgba(255, 50, 50, 0.8)"
                  : "rgba(0, 0, 0, 0.3)",
                transform: "translate(-50%, -50%)",
                zIndex: 95,
                pointerEvents: "none",
              }}
            />
          );
        })}
      </>
    );
  };

  // Render a visualization of the drag path
  const renderDragPath = () => {
    if (!showDebug || !debugInfo.startPosition || !debugInfo.currentPosition)
      return null;

    const lineLength = Math.sqrt(
      Math.pow(debugInfo.currentPosition.x - debugInfo.startPosition.x, 2) +
        Math.pow(debugInfo.currentPosition.y - debugInfo.startPosition.y, 2)
    );

    const angle = Math.atan2(
      debugInfo.currentPosition.y - debugInfo.startPosition.y,
      debugInfo.currentPosition.x - debugInfo.startPosition.x
    );

    const lineStyle = {
      position: "fixed",
      left: debugInfo.startPosition.x,
      top: debugInfo.startPosition.y,
      width: `${lineLength}px`,
      height: "2px",
      backgroundColor: debugInfo.thresholdMet ? "green" : "red",
      transform: `rotate(${angle}rad)`,
      transformOrigin: "0 0",
      zIndex: 998,
      pointerEvents: "none",
      opacity: 0.5,
    } as React.CSSProperties;

    return <div style={lineStyle} />;
  };

  // Render gravity field indicator
  const renderGravityField = () => {
    if (!showDebug || !isDragging) return null;

    if (typeof getPinPosition !== "function") return null;

    const { gravityRadius } = tweakableParams;
    const activePinPosition = getPinPosition(dragCorner);

    const circleStyle = {
      position: "fixed",
      left: activePinPosition.x - gravityRadius,
      top: activePinPosition.y - gravityRadius,
      width: `${gravityRadius * 2}px`,
      height: `${gravityRadius * 2}px`,
      borderRadius: "50%",
      border: "2px dashed rgba(0, 100, 255, 0.5)",
      backgroundColor: "rgba(0, 100, 255, 0.1)",
      zIndex: 97,
      pointerEvents: "none",
    } as React.CSSProperties;

    return <div style={circleStyle} />;
  };

  // Is this a center position?
  const isCenter = corner === "top-center" || corner === "bottom-center";

  // Apply dynamic transition based on animationDuration
  const transitionStyle = isDragging
    ? "none"
    : `all ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  return (
    <>
      {/* Debug visualizations */}
      {renderZones()}
      {renderPins()}
      {renderDragPath()}
      {renderGravityField()}

      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={styles.Trigger}
        onClick={() => {
          if (!isDragging) {
            console.log("[Trigger] Button clicked, toggling isOpen:", !isOpen);
            setIsOpen(!isOpen);
          }
        }}
        style={{
          ...positionStyle,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          transition: transitionStyle,
          boxShadow: isDragging
            ? "0 10px 20px rgba(0, 0, 0, 0.2)"
            : "0 2px 5px rgba(0, 0, 0, 0.15)",
          zIndex: 101,
        }}
        data-dragging={isDragging}
        data-corner={corner}
        data-center={isCenter}
      >
        {isDragging ? "✋" : "O"}
      </button>
    </>
  );
}
