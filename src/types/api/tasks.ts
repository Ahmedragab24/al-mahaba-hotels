export interface TaskAttachment {
  name: string;
  url: string;
  type: "image" | "file";
  size?: string;
}

export interface TaskComment {
  id: string | number;
  task_id?: string | number;
  body: string;
  sender?: "user" | "support";
  senderName?: string;
  sender_name?: string;
  avatar?: string;
  content?: string; // UI mapping
  time?: string; // UI mapping
  created_at?: string;
  read?: boolean;
  attachments?: TaskAttachment[];
}

export interface TaskLog {
  id: string | number;
  task_id?: string | number;
  action: string;
  user: string;
  time: string;
  created_at?: string;
}

export interface Task {
  id: string | number;
  title: string;
  description: string;
  department: string;
  department_id?: string | number;
  assigned_to?: string | number;
  assignedTeam?: string; // UI mapping
  assigned_team?: string;
  assignedAvatar?: string;
  priority: "urgent" | "medium" | "normal" | "high" | "low";
  status: "open" | "in_progress" | "awaiting_reply" | "completed" | "closed";
  deadline?: string;
  requestDate?: string; // UI mapping
  lastUpdate?: string; // UI mapping
  created_at?: string;
  updated_at?: string;
  is_archived?: boolean;
  messages?: TaskComment[]; // UI mapping for replies
  comments?: TaskComment[];
  logs?: TaskLog[];
}
