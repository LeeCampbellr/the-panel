import React, { useState, useEffect, useRef } from "react";

import { Tabs } from "@base-ui-components/react/tabs";
import "./styles/index.css";

import Trigger from "./components/trigger/trigger";
import Panel from "./components/panel/panel";
import { Corner } from "./hooks/useDrag";
import tabsStyles from "./components/tabs/tabs.module.css";
import { Headings } from "./sections/headings/headings";
import { MetaData } from "./sections/metaData/metaData";
import { Images } from "./sections/images/images";
import { Tracking } from "./sections/tracking/tracking";

export default function ThePanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [isDragging, setIsDragging] = useState(false);

  // Store the pre-drag state to restore after drag ends
  const wasOpenBeforeDragRef = useRef(false);

  // Add a lock to prevent unexpected panel opening
  const lockOpenStateRef = useRef(false);

  // Track all state changes for debugging
  useEffect(() => {
    console.log(
      `[ThePanel] State change - isOpen: ${isOpen}, corner: ${corner}, isDragging: ${isDragging}`
    );
  }, [isOpen, corner, isDragging]);

  // Custom state setter with logging
  const setIsOpenWithLog = (newState: boolean, source: string) => {
    if (lockOpenStateRef.current && newState === true) {
      console.log(
        `[ThePanel] Prevented panel opening from ${source} due to lock`
      );
      return;
    }

    console.log(`[ThePanel] setIsOpen(${newState}) called from ${source}`);
    setIsOpen(newState);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpenWithLog(false, "clickOutside");
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const handleCornerChange = (newCorner: Corner) => {
    console.log(
      `[ThePanel] Corner changing from ${corner} to ${newCorner}, isOpen: ${isOpen}, isDragging: ${isDragging}, lock: ${lockOpenStateRef.current}`
    );

    // Don't change corner during dragging to avoid state conflicts
    if (isDragging) {
      console.log("[ThePanel] Ignoring corner change during drag");
      return;
    }

    setCorner(newCorner);
  };

  const handleDragStart = () => {
    // Save current open state in ref to avoid state update timing issues
    wasOpenBeforeDragRef.current = isOpen;
    console.log(
      `[ThePanel] Drag start, current isOpen: ${isOpen}, saved to ref: ${wasOpenBeforeDragRef.current}`
    );

    // Lock the panel state changes during drag operation and a short time after
    lockOpenStateRef.current = true;

    // Always close panel during drag
    setIsOpenWithLog(false, "dragStart");
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    // Read directly from ref to avoid state batching issues
    const shouldReopen = wasOpenBeforeDragRef.current;
    console.log(
      `[ThePanel] Drag end, wasOpenBeforeDrag (from ref): ${shouldReopen}, lock: ${lockOpenStateRef.current}`
    );

    // First, update the dragging state
    setIsDragging(false);

    // Allow a small delay to ensure all drag-related state updates are processed
    setTimeout(() => {
      // Then determine if we should reopen the panel
      if (shouldReopen) {
        console.log("[ThePanel] Will reopen panel");
        setIsOpenWithLog(true, "dragEnd-reopen");
      } else {
        console.log("[ThePanel] Keeping panel closed");
        // Explicitly ensure the panel stays closed
        setIsOpenWithLog(false, "dragEnd-keep-closed");
      }

      // Release the lock after state is handled
      setTimeout(() => {
        console.log("[ThePanel] Releasing open state lock");
        lockOpenStateRef.current = false;
      }, 200);
    }, 50);
  };

  return (
    <div ref={containerRef} data-the-panel>
      <Trigger
        isOpen={isOpen && !isDragging}
        setIsOpen={(newOpenState) =>
          setIsOpenWithLog(newOpenState, "trigger-click")
        }
        corner={corner}
        onCornerChange={handleCornerChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        showDebug={true}
      />

      <Panel isOpen={isOpen && !isDragging} corner={corner}>
        <Tabs.Root className={tabsStyles.Tabs} defaultValue="headings">
          <Tabs.List className={tabsStyles.List}>
            <Tabs.Tab className={tabsStyles.Tab} value="headings">
              Headings
            </Tabs.Tab>
            <Tabs.Tab className={tabsStyles.Tab} value="open-graph">
              Meta Data
            </Tabs.Tab>
            <Tabs.Tab className={tabsStyles.Tab} value="images">
              Images
            </Tabs.Tab>
            <Tabs.Tab className={tabsStyles.Tab} value="tracking">
              Tracking
            </Tabs.Tab>
            <Tabs.Indicator className={tabsStyles.Indicator} />
          </Tabs.List>

          <Tabs.Panel className={tabsStyles.Panel} value="headings">
            <Headings />
          </Tabs.Panel>
          <Tabs.Panel className={tabsStyles.Panel} value="open-graph">
            <MetaData />
          </Tabs.Panel>
          <Tabs.Panel className={tabsStyles.Panel} value="images">
            <Images />
          </Tabs.Panel>
          <Tabs.Panel className={tabsStyles.Panel} value="tracking">
            <Tracking />
          </Tabs.Panel>
        </Tabs.Root>
      </Panel>
    </div>
  );
}
