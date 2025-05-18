export interface TrackingEvent {
  timestamp: number;
  type: string;
  name: string;
  properties: Record<string, any>;
}

export interface TrackingState {
  events: TrackingEvent[];
}
