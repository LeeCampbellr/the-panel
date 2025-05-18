import React, { useEffect, useState } from "react";
import { TrackingEvent } from "./types";
import { getTrackingEvents, initializeTracking } from "./getTrackingEvents";

export function Tracking() {
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    // Initialize tracking when component mounts
    initializeTracking();

    // Set up polling to check for new events
    const interval = setInterval(() => {
      setEvents(getTrackingEvents());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (events.length === 0) {
    return (
      <div style={{ padding: "1rem" }}>
        <p>No tracking events captured yet.</p>
        <p>
          Note: This panel will capture Rudderstack tracking events as they
          occur.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>Tracking Events</h2>
      <div>
        {events.map((event, index) => (
          <div key={`${event.timestamp}-${index}`}>
            <div>
              <strong>Event: </strong>
              {event.name}
            </div>
            <div>
              <strong>Time: </strong>
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
            <div>
              <strong>Properties: </strong>
              <pre>{JSON.stringify(event.properties, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
