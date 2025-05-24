import { useState, useEffect, useRef, useCallback } from "react";

export type Corner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "top-center";

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  position: Position;
  corner: Corner;
  animationDuration: number;
  debugInfo: {
    startPosition: Position | null;
    currentPosition: Position | null;
    distanceMoved: number;
    velocity: Position;
    thresholdMet: boolean;
    lastEvent: string;
    inGravityField: boolean;
  };
}

export interface UseDragOptions {
  initialCorner?: Corner;
  dragThreshold?: number;
  minAnimDuration?: number;
  maxAnimDuration?: number;
  animationDistanceFactor?: number;
  gravityRadius?: number;
  gravityStrength?: number;
  followSpeed?: number; // min follow speed at the pin
  maxFollowSpeed?: number; // speed at edge of gravity field/outside
  easeType?:
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
    | "easeInOutQuint";
}

export function useDrag({
  initialCorner = "bottom-right",
  dragThreshold = 5,
  minAnimDuration = 0.15, // Min animation duration in seconds
  maxAnimDuration = 0.3, // Max animation duration in seconds
  animationDistanceFactor = 0.0008, // How much to scale distance to time
  gravityRadius = 60,
  gravityStrength = 0.7,
  followSpeed = 0.05, // Minimum follow speed at the pin
  maxFollowSpeed = 1.0, // Maximum follow speed at the edge/outside
  easeType = "linear",
}: UseDragOptions = {}) {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    position: { x: 0, y: 0 },
    corner: initialCorner,
    animationDuration: 0.3,
    debugInfo: {
      startPosition: null,
      currentPosition: null,
      distanceMoved: 0,
      velocity: { x: 0, y: 0 },
      thresholdMet: false,
      lastEvent: "none",
      inGravityField: false,
    },
  });

  // Store options in refs so they can be updated dynamically
  const optionsRef = useRef({
    dragThreshold,
    minAnimDuration,
    maxAnimDuration,
    animationDistanceFactor,
    gravityRadius,
    gravityStrength,
    followSpeed,
    maxFollowSpeed,
    easeType,
  });

  // Update the options when they change
  useEffect(() => {
    optionsRef.current = {
      dragThreshold,
      minAnimDuration,
      maxAnimDuration,
      animationDistanceFactor,
      gravityRadius,
      gravityStrength,
      followSpeed,
      maxFollowSpeed,
      easeType,
    };
  }, [
    dragThreshold,
    minAnimDuration,
    maxAnimDuration,
    animationDistanceFactor,
    gravityRadius,
    gravityStrength,
    followSpeed,
    maxFollowSpeed,
    easeType,
  ]);

  const elementRef = useRef<HTMLElement | null>(null);
  const startPositionRef = useRef<Position | null>(null);
  const elementStartPositionRef = useRef<Position | null>(null);
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const lastPositionRef = useRef<Position | null>(null);
  const lastTimeRef = useRef<number>(0);
  const thresholdMetRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const currentCornerRef = useRef<Corner>(initialCorner);

  // Current and target positions for smooth following
  const currentPositionRef = useRef<Position>({ x: 0, y: 0 });
  const targetPositionRef = useRef<Position>({ x: 0, y: 0 });
  const cursorPositionRef = useRef<Position>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const inGravityFieldRef = useRef<boolean>(false);

  // Allow updating options from outside
  const updateOptions = useCallback((newOptions: Partial<UseDragOptions>) => {
    // Update the refs
    if (newOptions.dragThreshold !== undefined) {
      optionsRef.current.dragThreshold = newOptions.dragThreshold;
    }
    if (newOptions.minAnimDuration !== undefined) {
      optionsRef.current.minAnimDuration = newOptions.minAnimDuration;
    }
    if (newOptions.maxAnimDuration !== undefined) {
      optionsRef.current.maxAnimDuration = newOptions.maxAnimDuration;
    }
    if (newOptions.animationDistanceFactor !== undefined) {
      optionsRef.current.animationDistanceFactor =
        newOptions.animationDistanceFactor;
    }
    if (newOptions.gravityRadius !== undefined) {
      optionsRef.current.gravityRadius = newOptions.gravityRadius;
    }
    if (newOptions.gravityStrength !== undefined) {
      optionsRef.current.gravityStrength = newOptions.gravityStrength;
    }
    if (newOptions.followSpeed !== undefined) {
      optionsRef.current.followSpeed = newOptions.followSpeed;
    }
    if (newOptions.maxFollowSpeed !== undefined) {
      optionsRef.current.maxFollowSpeed = newOptions.maxFollowSpeed;
    }
    if (newOptions.easeType !== undefined) {
      optionsRef.current.easeType = newOptions.easeType;
    }

    console.log("[useDrag] Updated options:", optionsRef.current);
  }, []);

  // Log debugging info
  const logDebug = (msg: string, data?: any) => {
    console.log(`[useDrag] ${msg}`, data || "");
  };

  // Calculate visual position during drag
  const [dragPosition, setDragPosition] = useState<Position | null>(null);

  // Get the pin position for a given corner
  const getPinPosition = (corner: Corner): Position => {
    const { innerWidth, innerHeight } = window;

    // Define margins from edges
    const hMargin = Math.min(innerWidth * 0.05, 30); // Horizontal margin
    const vMargin = Math.min(innerHeight * 0.05, 30); // Vertical margin

    // Set pin positions well inside each zone, not at the screen edges
    switch (corner) {
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
  };

  // Calculate animation duration based on distance
  const calculateAnimationDuration = (
    currentPos: Position,
    targetCorner: Corner
  ): number => {
    const targetPos = getPinPosition(targetCorner);
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use the current options from ref
    const { minAnimDuration, maxAnimDuration, animationDistanceFactor } =
      optionsRef.current;

    // Calculate duration based on distance, with min and max limits
    let duration = minAnimDuration + distance * animationDistanceFactor;
    duration = Math.min(maxAnimDuration, Math.max(minAnimDuration, duration));

    logDebug("Animation calculation", {
      currentPos,
      targetPos,
      distance,
      duration,
      velocity: velocityRef.current,
    });

    return duration;
  };

  // Animation loop for smooth magnetic following
  const updateDragPosition = useCallback(() => {
    if (!isDraggingRef.current) {
      animationFrameRef.current = null;
      return;
    }

    // Get the pin position for the current corner
    const pinPosition = getPinPosition(currentCornerRef.current);

    // Calculate distance from pin
    const toPinX = pinPosition.x - cursorPositionRef.current.x;
    const toPinY = pinPosition.y - cursorPositionRef.current.y;
    const distanceToPin = Math.sqrt(toPinX * toPinX + toPinY * toPinY);

    // Get current gravity settings
    const {
      gravityRadius,
      gravityStrength,
      followSpeed: minFollowSpeed,
      maxFollowSpeed,
      easeType,
    } = optionsRef.current;

    // Determine if we're in the gravity field
    const inGravityField = distanceToPin < gravityRadius;
    inGravityFieldRef.current = inGravityField;

    // Calculate dynamic follow speed that eases from minFollowSpeed at the pin
    // up to maxFollowSpeed at the edge of the gravity field
    const distanceFraction = Math.min(distanceToPin / gravityRadius, 1);

    // Easing helper (defined inline for access to easeType)
    const applyEase = (t: number): number => {
      switch (easeType) {
        case "easeInQuad":
          return t * t;
        case "easeOutQuad":
          return 1 - (1 - t) * (1 - t);
        case "easeInOutQuad":
          return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        case "easeInCubic":
          return t * t * t;
        case "easeOutCubic":
          return 1 - Math.pow(1 - t, 3);
        case "easeInOutCubic":
          return t < 0.5 ? 4 * t * t * t : 1 - 4 * Math.pow(1 - t, 3);
        case "easeInQuart":
          return Math.pow(t, 4);
        case "easeOutQuart":
          return 1 - Math.pow(1 - t, 4);
        case "easeInOutQuart":
          return t < 0.5 ? 8 * Math.pow(t, 4) : 1 - 8 * Math.pow(1 - t, 4);
        case "easeInQuint":
          return Math.pow(t, 5);
        case "easeOutQuint":
          return 1 - Math.pow(1 - t, 5);
        case "easeInOutQuint":
          return t < 0.5 ? 16 * Math.pow(t, 5) : 1 - 16 * Math.pow(1 - t, 5);
        case "linear":
        default:
          return t;
      }
    };

    const easedFraction = applyEase(distanceFraction);

    const dynamicSpeed = inGravityField
      ? minFollowSpeed + (maxFollowSpeed - minFollowSpeed) * easedFraction
      : maxFollowSpeed;

    let nextPosition;

    if (inGravityField) {
      // Inside gravity field - apply magnetic attraction
      // Calculate gravity effect - stronger closer to the pin
      const gravityFactor =
        Math.pow(1 - distanceToPin / gravityRadius, 2) * gravityStrength;

      // Calculate target position with gravity applied
      const gravityPosition = {
        x: cursorPositionRef.current.x + toPinX * gravityFactor,
        y: cursorPositionRef.current.y + toPinY * gravityFactor,
      };

      // Smoothly move toward this position using the dynamic speed
      nextPosition = {
        x:
          currentPositionRef.current.x +
          (gravityPosition.x - currentPositionRef.current.x) * dynamicSpeed,
        y:
          currentPositionRef.current.y +
          (gravityPosition.y - currentPositionRef.current.y) * dynamicSpeed,
      };

      logDebug("Gravity effect", {
        cursor: cursorPositionRef.current,
        pinPosition,
        distanceToPin,
        gravityFactor,
        dynamicSpeed,
        easedFraction,
        gravityPosition,
        nextPosition,
      });
    } else {
      // Outside gravity field – either follow cursor directly (speed ~= 1)
      // or use small smoothing if minFollowSpeed < 1 (edge case)
      nextPosition = {
        x:
          currentPositionRef.current.x +
          (cursorPositionRef.current.x - currentPositionRef.current.x) *
            dynamicSpeed,
        y:
          currentPositionRef.current.y +
          (cursorPositionRef.current.y - currentPositionRef.current.y) *
            dynamicSpeed,
      };
    }

    // Update current position
    currentPositionRef.current = nextPosition;

    // Update drag position state
    setDragPosition(nextPosition);

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateDragPosition);
  }, []);

  useEffect(() => {
    if (!elementRef.current) {
      logDebug("No element reference available");
      return;
    }

    logDebug("Setting up drag handlers", {
      element: elementRef.current,
      corner: initialCorner,
    });

    // Initialize dragPosition with the current pin position
    const initialPinPosition = getPinPosition(initialCorner);
    currentPositionRef.current = initialPinPosition;
    targetPositionRef.current = initialPinPosition;
    cursorPositionRef.current = initialPinPosition;
    setDragPosition(initialPinPosition);

    // Add window resize handler to update positions when window size changes
    const handleResize = () => {
      // Force a re-render to update the pin positions
      setState((prev) => ({ ...prev }));
      logDebug("Window resized, updating positions");

      // Update position on resize if not dragging
      if (!isDraggingRef.current) {
        const newPinPosition = getPinPosition(currentCornerRef.current);
        currentPositionRef.current = newPinPosition;
        targetPositionRef.current = newPinPosition;
        cursorPositionRef.current = newPinPosition;
        setDragPosition(newPinPosition);
      }
    };

    window.addEventListener("resize", handleResize);

    // Get element's current position from its corner
    const getElementPosition = () => {
      if (!elementRef.current) return { x: 0, y: 0 };

      const rect = elementRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      logDebug("Pointer down", {
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId,
        pointerType: e.pointerType,
      });

      if (!elementRef.current) return;

      try {
        // Capture the pointer to ensure it receives all pointer events
        elementRef.current.setPointerCapture(e.pointerId);
        activePointerIdRef.current = e.pointerId;

        // Prevent default to avoid text selection and other browser actions
        e.preventDefault();

        const pos = { x: e.clientX, y: e.clientY };

        // Get element's current position
        elementStartPositionRef.current = getElementPosition();

        // For pointerdown, start at the current position
        currentPositionRef.current = elementStartPositionRef.current;
        targetPositionRef.current = elementStartPositionRef.current;
        cursorPositionRef.current = pos;

        // Set initial positions
        startPositionRef.current = pos;
        lastPositionRef.current = pos;
        lastTimeRef.current = Date.now();
        thresholdMetRef.current = false;
        inGravityFieldRef.current = false;

        // Reset velocity
        velocityRef.current = { x: 0, y: 0 };

        setState((prev) => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            startPosition: pos,
            currentPosition: pos,
            lastEvent: "pointerdown",
            thresholdMet: false,
            distanceMoved: 0,
            inGravityField: false,
          },
        }));

        logDebug("Pointer down processed", {
          position: pos,
          elementPosition: elementStartPositionRef.current,
        });
      } catch (err) {
        logDebug("Error in pointer down", err);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Only process if this is the active pointer
      if (activePointerIdRef.current !== e.pointerId) {
        logDebug("Ignoring move from inactive pointer", {
          active: activePointerIdRef.current,
          current: e.pointerId,
        });
        return;
      }

      if (
        !startPositionRef.current ||
        !lastPositionRef.current ||
        !elementStartPositionRef.current
      ) {
        logDebug("Missing start or last position references");
        return;
      }

      const currentPos = { x: e.clientX, y: e.clientY };

      // Update cursor position reference
      cursorPositionRef.current = currentPos;

      // Calculate distance moved from start
      const dx = currentPos.x - startPositionRef.current.x;
      const dy = currentPos.y - startPositionRef.current.y;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);

      // Only start dragging after threshold is met
      if (!thresholdMetRef.current) {
        // Use current threshold from ref
        const { dragThreshold } = optionsRef.current;

        logDebug("Checking threshold", {
          distanceMoved,
          threshold: dragThreshold,
        });
        if (distanceMoved >= dragThreshold) {
          thresholdMetRef.current = true;
          isDraggingRef.current = true;
          logDebug("Threshold met, starting drag");

          // Set cursor position to follow
          cursorPositionRef.current = currentPos;

          // Start the animation loop if not already running
          if (animationFrameRef.current === null) {
            animationFrameRef.current =
              requestAnimationFrame(updateDragPosition);
          }

          setState((prev) => ({
            ...prev,
            isDragging: true,
            debugInfo: {
              ...prev.debugInfo,
              thresholdMet: true,
              distanceMoved,
              lastEvent: "threshold-met",
              currentPosition: currentPos,
            },
          }));
        } else {
          // Update debug info even if we're not dragging yet
          setState((prev) => ({
            ...prev,
            debugInfo: {
              ...prev.debugInfo,
              currentPosition: currentPos,
              distanceMoved,
              lastEvent: "move-before-threshold",
            },
          }));
          return;
        }
      }

      // Prevent default to avoid scrolling while dragging
      e.preventDefault();

      // Calculate velocity (for debugging/monitors)
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed > 0) {
        velocityRef.current = {
          x: (currentPos.x - lastPositionRef.current.x) / elapsed,
          y: (currentPos.y - lastPositionRef.current.y) / elapsed,
        };
      }

      lastPositionRef.current = currentPos;
      lastTimeRef.current = now;

      // Determine which zone the position is in
      const newCorner = determineCorner(currentPos);
      if (newCorner !== currentCornerRef.current) {
        logDebug("Zone changed during drag", {
          from: currentCornerRef.current,
          to: newCorner,
        });
        currentCornerRef.current = newCorner;
      }

      setState((prev) => ({
        ...prev,
        position: currentPos,
        corner: newCorner,
        isDragging: true,
        debugInfo: {
          ...prev.debugInfo,
          currentPosition: currentPos,
          velocity: velocityRef.current,
          distanceMoved,
          lastEvent: "dragging",
          inGravityField: inGravityFieldRef.current,
        },
      }));
    };

    const handlePointerUp = (e: PointerEvent) => {
      logDebug("Pointer up", {
        pointerId: e.pointerId,
        active: activePointerIdRef.current,
        thresholdMet: thresholdMetRef.current,
      });

      // Only process if this is the active pointer
      if (activePointerIdRef.current !== e.pointerId) {
        logDebug("Ignoring up event from inactive pointer");
        return;
      }

      if (elementRef.current) {
        try {
          // Release the pointer capture
          elementRef.current.releasePointerCapture(e.pointerId);
        } catch (err) {
          logDebug("Error releasing pointer capture", err);
        }
      }

      activePointerIdRef.current = null;
      isDraggingRef.current = false;
      inGravityFieldRef.current = false;

      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!thresholdMetRef.current) {
        // If threshold not met, treat as a click
        logDebug("Threshold not met, treating as click");
        setState((prev) => ({
          ...prev,
          isDragging: false,
          debugInfo: {
            ...prev.debugInfo,
            lastEvent: "click-no-drag",
            inGravityField: false,
          },
        }));

        // Reset drag position to pin
        setDragPosition(null);
      } else {
        // Determine which zone the final position is in
        const currentPos = { x: e.clientX, y: e.clientY };
        const finalCorner = determineCorner(currentPos);
        currentCornerRef.current = finalCorner;

        // Calculate animation duration based on distance to target pin
        const animationDuration = calculateAnimationDuration(
          dragPosition || currentPos,
          finalCorner
        );

        logDebug("Drag complete, snapping to pin", {
          corner: finalCorner,
          finalPosition: currentPos,
          velocity: velocityRef.current,
          animationDuration,
        });

        setState((prev) => ({
          ...prev,
          isDragging: false,
          corner: finalCorner,
          animationDuration,
          debugInfo: {
            ...prev.debugInfo,
            lastEvent: "drag-complete",
            currentPosition: currentPos,
            inGravityField: false,
          },
        }));

        // Reset drag position to allow the element to snap to its pin
        setDragPosition(null);
      }

      // Clean up
      startPositionRef.current = null;
      elementStartPositionRef.current = null;
      thresholdMetRef.current = false;
    };

    const determineCorner = (position: Position): Corner => {
      const { innerWidth, innerHeight } = window;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;

      // Determine which zone the position is in
      const isTop = position.y < centerY;

      // For horizontal zones, divide the screen into thirds
      const third = innerWidth / 3;
      let horizontal: "left" | "center" | "right";

      if (position.x < third) {
        horizontal = "left";
      } else if (position.x < third * 2) {
        horizontal = "center";
      } else {
        horizontal = "right";
      }

      // Combine vertical and horizontal to get corner
      const vertical = isTop ? "top" : "bottom";
      const cornerKey = `${vertical}-${horizontal}` as Corner;

      logDebug("Determined zone", {
        position,
        vertical,
        horizontal,
        corner: cornerKey,
      });

      return cornerKey;
    };

    // Attach event listeners using pointer events which work for both touch and mouse
    const element = elementRef.current;
    if (element) {
      logDebug("Attaching event listeners to element");
      element.addEventListener("pointerdown", handlePointerDown);
      element.addEventListener("pointermove", handlePointerMove);
      element.addEventListener("pointerup", handlePointerUp);
      element.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      logDebug("Cleaning up event listeners");
      if (element) {
        element.removeEventListener("pointerdown", handlePointerDown);
        element.removeEventListener("pointermove", handlePointerMove);
        element.removeEventListener("pointerup", handlePointerUp);
        element.removeEventListener("pointercancel", handlePointerUp);
      }
      window.removeEventListener("resize", handleResize);

      // Cleanup animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [initialCorner, updateDragPosition]);

  // Position the element based on its corner
  const getCornerPosition = (): React.CSSProperties => {
    const pinPosition = getPinPosition(state.corner);

    return {
      position: "fixed",
      top: `${pinPosition.y}px`,
      left: `${pinPosition.x}px`,
    };
  };

  return {
    ref: elementRef,
    isDragging: state.isDragging,
    corner: state.corner,
    position: state.position,
    dragPosition,
    animationDuration: state.animationDuration,
    getCornerPosition,
    debugInfo: state.debugInfo,
    updateOptions,
    getPinPosition,
  };
}
