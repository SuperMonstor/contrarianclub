export type ActivityStatus = "draft" | "open" | "closed";
export type ResultsVisibility = "hidden" | "revealed";
export type PresentationMode = "join" | "poll" | "results" | "swing";
export type ActivityPhase = "general" | "pre_debate" | "post_debate";
export type ActivityType = "multiple_choice" | "scale";

export type EventSummary = {
  id: string;
  code: string;
  title: string;
  status: "draft" | "live" | "ended" | "archived";
  created_at: string;
  is_default?: boolean;
};

export type ActivitySummary = {
  id: string;
  event_id: string;
  type: ActivityType;
  phase: ActivityPhase;
  prompt: string;
  status: ActivityStatus;
  results_visibility: ResultsVisibility;
  created_at: string;
  scale_left_label?: string | null;
  scale_center_label?: string | null;
  scale_right_label?: string | null;
};

export type PollOptionResult = {
  id: string;
  activity_id: string;
  label: string;
  sort_order: number;
  scale_value: number | null;
  votes: number;
};

export type EventState = {
  event: EventSummary;
  activities: ActivitySummary[];
  activity: ActivitySummary | null;
  mode: PresentationMode;
  options: PollOptionResult[];
  totalVotes: number;
  participantCount: number;
  swing: DebateSwingSummary | null;
  joinUrl: string;
  presenterUrl: string;
  hostUrl: string;
};

export type ControlCommand = "open" | "close" | "reveal" | "hide" | "reset";

export type SwingOptionTotal = {
  label: string;
  preVotes: number;
  postVotes: number;
  delta: number;
};

export type SwingTransition = {
  from: string;
  to: string;
  count: number;
};

export type DebateSwingSummary = {
  format: ActivityType;
  preActivityId: string;
  postActivityId: string;
  matchedVotes: number;
  changedVotes: number;
  changedPercent: number;
  crossedVotes: number;
  crossedPercent: number;
  movedTowardLeft: number;
  movedTowardRight: number;
  unchangedVotes: number;
  averagePre: number | null;
  averagePost: number | null;
  netSwing: number | null;
  scaleLeftLabel: string | null;
  scaleRightLabel: string | null;
  swingWinnerLabel: string | null;
  finalLeaderLabel: string | null;
  optionTotals: SwingOptionTotal[];
  transitions: SwingTransition[];
};
