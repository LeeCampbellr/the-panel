import { TrackingEvent } from "./types";

const trackingEvents: TrackingEvent[] = [];

export function initializeTracking() {
  // Create a proxy for rudderanalytics to intercept calls
  const originalRudderAnalytics = (window as any).rudderanalytics;

  if (!originalRudderAnalytics) {
    console.warn("Rudderstack analytics not found on window object");
    return;
  }

  (window as any).rudderanalytics = new Proxy(originalRudderAnalytics, {
    get(target, prop) {
      const original = target[prop];
      if (prop === "track") {
        return function (...args: any[]) {
          const [eventName, properties] = args;
          trackingEvents.unshift({
            timestamp: Date.now(),
            type: "track",
            name: eventName,
            properties: properties || {},
          });
          return original.apply(target, args);
        };
      }
      return original;
    },
  });
}

export function getTrackingEvents(): TrackingEvent[] {
  return trackingEvents;
}
