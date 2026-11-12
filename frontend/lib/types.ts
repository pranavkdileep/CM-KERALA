export type Role = "citizen" | "cmo" | "officer";
export type Status = "Submitted" | "Under Review" | "In Progress" | "Resolved" | "Reopened";
export type Priority = "Low" | "Medium" | "High";
export type ReportState = "none" | "pending" | "accepted" | "rejected";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: Role;
  designation?: string;
  department: { id: string; name: string; slug: string } | null;
};

export type DepartmentSummary = { id: string; name: string; slug: string; description?: string };

export type GrievanceItem = {
  id: string;
  referenceId: string;
  district: string;
  category: string;
  subject: string;
  priority: Priority;
  status: Status;
  department: { id: string; name: string; slug: string } | null;
  officer: { id: string; name: string } | null;
  citizenName?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  isOverdue: boolean;
  escalationLevel: number;
  actionReportStatus: ReportState;
  reopenRequested: boolean;
  aiSource?: "ai" | "fallback";
};

export type HistoryEntry = {
  id: string;
  action: string;
  fromStatus: Status | null;
  toStatus: Status | null;
  remark?: string;
  visibility: "public" | "internal";
  actorName: string;
  actorRole: Role;
  at: string;
};

export type AttachmentInfo = { id: string; kind: "evidence" | "action_report"; name: string; mimeType: string; size: number; createdAt: string };

export type ActionReport = {
  summary: string;
  details: string;
  attachmentId: string | null;
  submittedAt: string;
  reviewStatus: ReportState;
  reviewedAt?: string;
  reviewRemark?: string;
};

export type Assignment = {
  id: string;
  state: "active" | "superseded" | "completed";
  department: { id: string; name: string } | null;
  officer: { id: string; name: string } | null;
  assignedBy?: string;
  instructions?: string;
  assignedAt: string;
  actionReport: ActionReport | null;
};

export type GrievanceDetail = GrievanceItem & {
  description: string;
  ai: {
    source: "ai" | "fallback";
    model: string;
    category: string;
    departmentName?: string;
    priority: Priority;
    summary: string;
    duplicates: { referenceId: string; score: number }[];
    citizenOverrode: boolean;
  } | null;
  citizen?: { name: string; email: string; mobile?: string };
  escalation?: { level: number; reason?: string; at?: string };
  resolution: { summary: string; resolvedAt: string } | null;
  currentAssignmentId: string | null;
  history: HistoryEntry[];
  attachments: AttachmentInfo[];
  assignments: Assignment[];
  feedback: { id: string; rating: number; satisfied: boolean; comment?: string; createdAt: string }[];
  canGiveFeedback: boolean;
  allowedStatuses: Status[];
};

export type Page<T> = { items: T[]; page: number; limit: number; total: number; pages: number };

export type Breakdown = { name: string; total: number; resolved: number; pending: number; overdue: number };

export type Stats = {
  totals: { total: number; resolved: number; pending: number; overdue: number; escalated: number; awaitingReview: number; reopenRequested: number; unassigned: number };
  byStatus: Record<Status, number>;
  byPriority: Record<string, number>;
  byDistrict: Breakdown[];
  byCategory: Breakdown[];
  byDepartment: (Breakdown & { id: string })[];
  averageResolutionDays: number | null;
  department?: DepartmentSummary;
};

export type AiSuggestion = {
  analysisId: string;
  category: string;
  department: string | null;
  priority: Priority;
  summary: string;
  reasoning?: string;
  source: "ai" | "fallback";
  model: string;
  note: "not_configured" | "service_error" | null;
  duplicates: { referenceId: string; score: number }[];
  disclaimer: string;
};

export type TrackResult = {
  referenceId: string;
  status: Status;
  district: string;
  category: string;
  department: string | null;
  submittedAt: string;
  updatedAt: string;
  isOverdue: boolean;
  history: { status: Status | null; title: string; at: string }[];
};
