import React, { useState, useEffect, useRef } from "react";

import { Tabs } from "@base-ui-components/react/tabs";
import "./styles/index.css";

import Trigger from "./components/trigger/trigger";
import Panel from "./components/panel/panel";
import tabsStyles from "./components/tabs/tabs.module.css";
import { Headings } from "./sections/headings/headings";
import { MetaData } from "./sections/metaData/metaData";
import { Images } from "./sections/images/images";
import { Tracking } from "./sections/tracking/tracking";

export default function ThePanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} data-the-panel>
      <Trigger isOpen={isOpen} setIsOpen={setIsOpen} />

      <Panel isOpen={isOpen}>
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
