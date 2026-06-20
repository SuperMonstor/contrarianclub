export type ActivityStatus = "draft" | "open" | "closed";
export type ResultsVisibility = "hidden" | "revealed";
export type PresentationMode = "join" | "poll" | "results";

export type EventSummary = {
  id: string;
  code: string;
  title: string;
  status: "draft" | "live" | "ended" | "archived";
  created_at: string;
};

export type ActivitySummary = {
  id: string;
  event_id: string;
  type: "multiple_choice";
  prompt: string;
  status: ActivityStatus;
  results_visibility: ResultsVisibility;
  created_at: string;
};

export type PollOptionResult = {
  id: string;
  activity_id: string;
  label: string;
  sort_order: number;
  votes: number;
};

export type EventState = {
  event: EventSummary;
  activity: ActivitySummary | null;
  mode: PresentationMode;
  options: PollOptionResult[];
  totalVotes: number;
  participantCount: number;
  joinUrl: string;
  presenterUrl: string;
  hostUrl: string;
};

export type ControlCommand = "open" | "close" | "reveal" | "hide" | "reset";
