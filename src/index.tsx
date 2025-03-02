import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { Tabs } from "@base-ui-components/react/tabs";

export default function ThePanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const container = document.querySelector("[data-the-panel]");
      if (isOpen && container && !container.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div data-the-panel>
      <button onClick={() => setIsOpen(!isOpen)}>Panel</button>

      {isOpen && (
        <div className={styles.Panel}>
          <Tabs.Root className={styles.Tabs} defaultValue="overview">
            <Tabs.List className={styles.List}>
              <Tabs.Tab className={styles.Tab} value="overview">
                Overview
              </Tabs.Tab>
              <Tabs.Tab className={styles.Tab} value="projects">
                Projects
              </Tabs.Tab>
              <Tabs.Tab className={styles.Tab} value="account">
                Account
              </Tabs.Tab>
              <Tabs.Indicator className={styles.Indicator} />
            </Tabs.List>
            <Tabs.Panel className={styles.Panel} value="overview"></Tabs.Panel>
            <Tabs.Panel className={styles.Panel} value="projects"></Tabs.Panel>
            <Tabs.Panel className={styles.Panel} value="account"></Tabs.Panel>
          </Tabs.Root>
        </div>
      )}
    </div>
  );
}
