import { useState, useEffect, useRef, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskCommentsQuery,
  useAddTaskCommentMutation,
  useDeleteTaskCommentMutation
} from "@/store/services/tasks/tasksService";
import { useGetUsersQuery } from "@/store/services/users/usersService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  PlusCircle,
  Search,
  Loader2,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  Clipboard,
  X,
  FileText,
  User,
  Users,
  Edit,
  Trash2,
  Trash
} from "lucide-react";
import { toast } from "sonner";

// Translation dictionary
const T = {
  ar: {
    title: "التاسكات",
    subtitle: "أرسل طلباتك، ومشاكلك التقنية، أو استفساراتك وتابع حالتها مباشرة مع الفرق المختصة.",
    searchPlaceholder: "البحث في مهامك ومراسلاتك...",
    tabTrack: "متابعة مهامي",
    tabSend: "إرسال مهمة جديدة",
    totalTasks: "إجمالي مهامي",
    openTasks: "مهام مفتوحة",
    inProgress: "قيد التنفيذ",
    awaitingReply: "بانتظار ردي",
    completedTasks: "مهام مكتملة",
    allTasks: "جميع المهام",
    taskId: "رقم المهمة",
    taskTitle: "التاسك",
    department: "القسم",
    lastUpdate: "آخر تحديث",
    assignedTeam: "الفريق المختص",
    priority: "الأولوية",
    status: "الحالة",
    action: "إجراء",
    awaitingAssignment: "بانتظار التعيين",
    urgent: "عاجل",
    medium: "متوسط",
    normal: "عادي",
    statusOpen: "مفتوح",
    statusInProgress: "قيد التنفيذ",
    statusAwaitingReply: "بانتظار الرد",
    statusCompleted: "مكتمل",
    statusClosed: "مغلق",

    // New Task Form
    createTitle: "إنشاء مهمة جديدة",
    createSubtitle: "اكتب تفاصيل طلبك أو مشكلتك ليقوم الفريق المختص بمساعدتك.",
    labelTitle: "عنوان المهمة / المشكلة",
    labelEmployee: "الموظف",
    labelAssignedTo: "تعيين إلى (الرقم التعريفي)",
    labelDept: "القسم",
    labelDetails: "تفاصيل المهمة / الطلب",
    labelDeadline: "الموعد النهائي",
    labelAttachments: "المرفقات",
    placeholderTitle: "مثال: تعطل الطابعة في الدور الثاني، أو استفسار عن الإجازات",
    placeholderDetails: "يرجى كتابة رسالة الخطأ أو تفاصيل المشكلة التقنية...",
    btnSendTask: "إرسال المهمة",
    toastSuccess: "تم إرسال المهمة بنجاح",

    // Dialog Details
    assignedParty: "الجهة المختصة",
    requestDate: "تاريخ الطلب",
    priorityLabel: "أولوية",
    tabReplies: "الردود والمتابعة",
    tabLog: "سجل المهمة",
    replyPlaceholder: "أضف رداً أو تعليقاً إضافياً...",
    readStatus: "تمت القراءة",
    logCreated: "تم إنشاء المهمة بواسطة محمد أحمد",
    logAssigned: "تم إحالة المهمة إلى الفريق المختص",
    logStatusChanged: "تم تغيير الحالة إلى قيد التنفيذ",
    logCompleted: "تم إكمال المهمة وإغلاق الطلب",
    system: "النظام",

    // Actions
    editTask: "تعديل المهمة",
    deleteTask: "حذف المهمة",
    confirmDelete: "هل أنت متأكد من الحذف؟",
    deleteComment: "حذف التعليق",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    editSubtitle: "قم بتعديل بيانات المهمة أدناه",
  },
  en: {
    title: "Tasks",
    subtitle: "Submit your requests, technical issues, or inquiries and track their status directly with the support teams.",
    searchPlaceholder: "Search in your tasks and correspondences...",
    tabTrack: "Track My Tasks",
    tabSend: "Send New Task",
    totalTasks: "Total Tasks",
    openTasks: "Open Tasks",
    inProgress: "In Progress",
    awaitingReply: "Awaiting Reply",
    completedTasks: "Completed Tasks",
    allTasks: "All Tasks",
    taskId: "Task ID",
    taskTitle: "Task",
    department: "Department",
    lastUpdate: "Last Update",
    assignedTeam: "Assigned Team",
    priority: "Priority",
    status: "Status",
    action: "Action",
    awaitingAssignment: "Awaiting Assignment",
    urgent: "Urgent",
    medium: "Medium",
    normal: "Normal",
    statusOpen: "Open",
    statusInProgress: "In Progress",
    statusAwaitingReply: "Awaiting Reply",
    statusCompleted: "Completed",
    statusClosed: "Closed",

    // New Task Form
    createTitle: "Create New Task",
    createSubtitle: "Write the details of your request or issue so the specialized team can assist you.",
    labelTitle: "Task Title / Issue",
    labelEmployee: "Employee",
    labelAssignedTo: "Assigned To (ID)",
    labelDept: "Department",
    labelDetails: "Task Details / Request",
    labelDeadline: "Deadline",
    labelAttachments: "Attachments",
    placeholderTitle: "e.g. Printer broken on the second floor, or vacation query",
    placeholderDetails: "Please write the error message or details of the technical issue...",
    btnSendTask: "Send Task",
    toastSuccess: "Task submitted successfully",

    // Dialog Details
    assignedParty: "Assigned Party",
    requestDate: "Request Date",
    priorityLabel: "Priority",
    tabReplies: "Replies & Follow-up",
    tabLog: "Task Log",
    replyPlaceholder: "Add a reply or additional comment...",
    readStatus: "Read",
    logCreated: "Task created by Muhammad Ahmed",
    logAssigned: "Task assigned to the specialized team",
    logStatusChanged: "Status changed to In Progress",
    logCompleted: "Task completed and ticket closed",
    system: "System",

    // Actions
    editTask: "Edit Task",
    deleteTask: "Delete Task",
    confirmDelete: "Are you sure you want to delete?",
    deleteComment: "Delete Comment",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    editSubtitle: "Modify the task details below",
  }
};

interface Attachment {
  name: string;
  url: string;
  type: "image" | "file";
  size?: string;
}

interface Message {
  id: string;
  sender: "user" | "support";
  senderName: string;
  avatar?: string;
  content: string;
  time: string;
  read?: boolean;
  attachment?: Attachment;
}

interface TaskLog {
  id: string;
  action: string;
  user: string;
  time: string;
}

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  lastUpdate: string;
  assignedTeam: string;
  assignedAvatar?: string;
  assignedTo?: string;
  deadline?: string;
  priority: "urgent" | "medium" | "normal";
  status: "in_progress" | "open" | "awaiting_reply" | "completed" | "closed";
  requestDate: string;
  messages: Message[];
  attachments?: TaskAttachment[];
  logs: TaskLog[];
}

function mapApiTaskToUi(apiTask: any): Task {
  return {
    id: String(apiTask.id),
    title: apiTask.title,
    description: apiTask.description,
    department: apiTask.department || "دعم تقني",
    lastUpdate: apiTask.updated_at ? new Date(apiTask.updated_at).toLocaleString() : "",
    assignedTeam: apiTask.assigned_team || "بانتظار التعيين",
    assignedAvatar: apiTask.assigned_avatar || undefined,
    assignedTo: apiTask.assignee?.id ? String(apiTask.assignee.id) : (apiTask.assigned_to ? String(apiTask.assigned_to) : ""),
    deadline: apiTask.deadline || "",
    priority: apiTask.priority || "normal",
    status: apiTask.status || "open",
    requestDate: apiTask.created_at ? new Date(apiTask.created_at).toLocaleString() : "",
    messages: [], // Populated dynamically when selected
    attachments: (apiTask.attachments || []).map((att: any) => ({
      id: String(att.id),
      file_name: att.file_name,
      file_url: att.file_url,
      file_type: att.file_type,
      file_size: att.file_size
    })),
    logs: (apiTask.logs || []).map((log: any) => ({
      id: String(log.id),
      action: log.action,
      user: log.user || "النظام",
      time: log.created_at ? new Date(log.created_at).toLocaleString() : ""
    }))
  };
}

export default function TasksPage() {
  const { lang, dir } = useI18n();
  const t = lang === "ar" ? T.ar : T.en;

  const [activeTab, setActiveTab] = useState<"track" | "send">("track");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogTab, setDialogTab] = useState<"replies" | "log">("replies");
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / Delete Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formDept, setFormDept] = useState("فريق تقنية المعلومات");
  const [formPriority, setFormPriority] = useState("urgent");
  const [formDeadline, setFormDeadline] = useState("2026-07-10");
  const [formStatus, setFormStatus] = useState("open");
  const [formDetails, setFormDetails] = useState("");
  const [formAttachments, setFormAttachments] = useState<File[]>([]);

  // RTK Query Hooks
  const { data: apiTasks = [], isLoading: isLoadingTasks } = useGetTasksQuery();
  const { data: apiUsersResponse, isLoading: isLoadingUsers } = useGetUsersQuery();

  const usersArray = useMemo(() => {
    let rawData = apiUsersResponse;
    if (!Array.isArray(rawData)) {
      rawData = (rawData as any)?.data?.data || (rawData as any)?.data || [];
    }
    return Array.isArray(rawData) ? rawData : [];
  }, [apiUsersResponse]);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const { data: rawApiComments, isLoading: isLoadingComments } = useGetTaskCommentsQuery(selectedTask?.id || "", {
    skip: !selectedTask?.id
  });

  const apiComments = useMemo(() => {
    let arr = rawApiComments;
    if (!Array.isArray(arr)) {
      arr = (arr as any)?.data?.data || (arr as any)?.data || [];
    }
    return Array.isArray(arr) ? arr : [];
  }, [rawApiComments]);

  const [addComment, { isLoading: isAddingComment }] = useAddTaskCommentMutation();
  const [deleteTaskComment, { isLoading: isDeletingComment }] = useDeleteTaskCommentMutation();

  const tasks = useMemo(() => {
    let tasksArray = apiTasks;
    if (!Array.isArray(tasksArray)) {
      tasksArray = (tasksArray as any)?.data?.data || (tasksArray as any)?.data || [];
    }
    return Array.isArray(tasksArray) ? tasksArray.map(mapApiTaskToUi) : [];
  }, [apiTasks]);

  // Sync comments for opened task
  useEffect(() => {
    if (selectedTask && apiComments) {
      const mappedComments = apiComments.map((c: any) => ({
        id: String(c.id),
        sender: c.sender || (c.user_id === 1 ? "user" : "support"),
        senderName: c.sender_name || c.senderName || "مستخدم",
        content: c.body || c.content || "",
        time: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        read: c.read ?? true,
        attachment: c.attachments?.[0] ? {
          name: c.attachments[0].name,
          url: c.attachments[0].url,
          type: c.attachments[0].type || "file",
        } : undefined
      }));
      setSelectedTask(prev => prev ? { ...prev, messages: mappedComments } : null);
    }
  }, [apiComments]);

  // Scroll to chat bottom when selectedTask or messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTask?.messages, isTyping]);

  // Filtering tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.id.toLowerCase().includes(search.toLowerCase()) ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && task.status === "open") ||
      (statusFilter === "in_progress" && task.status === "in_progress") ||
      (statusFilter === "awaiting_reply" && task.status === "awaiting_reply") ||
      (statusFilter === "completed" && task.status === "completed");

    return matchesSearch && matchesStatus;
  });

  // Task Counts
  const counts = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    awaiting_reply: tasks.filter((t) => t.status === "awaiting_reply").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  // Form submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDetails.trim()) {
      toast.error(lang === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDetails);
      formData.append("assigned_to", formAssignedTo);
      formData.append("department", formDept);
      formData.append("priority", formPriority);
      if (formDeadline) formData.append("deadline", formDeadline);
      formData.append("status", formStatus);

      formAttachments.forEach((file) => {
        formData.append("attachments[]", file);
      });

      await createTask(formData).unwrap();

      toast.success(t.toastSuccess);
      setFormTitle("");
      setFormDetails("");
      setFormAssignedTo("");
      setFormDept("فريق تقنية المعلومات");
      setFormPriority("urgent");
      setFormDeadline("2026-07-10");
      setFormStatus("open");
      setFormAttachments([]);
      setActiveTab("track"); // Switch back to list
    } catch (error) {
      toast.error(lang === "ar" ? "فشل إنشاء المهمة" : "Failed to create task");
    }
  };

  // Send message in details chat
  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTask) return;

    const formData = new FormData();
    formData.append("body", replyText);

    try {
      await addComment({ taskId: selectedTask.id, body: formData }).unwrap();
      setReplyText("");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل إرسال التعليق" : "Failed to send comment");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(lang === "ar" ? "حجم الملف كبير جداً (الحد الأقصى 1.5 ميجابايت)" : "File too large (Max 1.5MB)");
      return;
    }

    const formData = new FormData();
    formData.append("body", lang === "ar" ? `أرسل مرفقاً: ${file.name}` : `Sent attachment: ${file.name}`);
    formData.append("attachments[]", file);

    try {
      await addComment({ taskId: selectedTask.id, body: formData }).unwrap();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(lang === "ar" ? "فشل إرسال الملف" : "Failed to send file");
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await updateTask({
        id: editingTask.id,
        body: {
          title: editingTask.title,
          description: editingTask.description,
          department: editingTask.department,
          priority: editingTask.priority,
          status: editingTask.status,
          assigned_to: editingTask.assignedTo,
          deadline: editingTask.deadline,
        }
      }).unwrap();

      toast.success(lang === "ar" ? "تم تعديل المهمة بنجاح" : "Task updated successfully");
      setIsEditDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(lang === "ar" ? "فشل تعديل المهمة" : "Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id).unwrap();
      toast.success(lang === "ar" ? "تم حذف المهمة بنجاح" : "Task deleted successfully");
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      toast.error(lang === "ar" ? "فشل حذف المهمة" : "Failed to delete task");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) return;
    try {
      await deleteTaskComment(commentId).unwrap();
      toast.success(lang === "ar" ? "تم حذف التعليق بنجاح" : "Comment deleted successfully");
    } catch (error) {
      toast.error(lang === "ar" ? "فشل حذف التعليق" : "Failed to delete comment");
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "in_progress":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-900/30";
      case "open":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-900/30";
      case "awaiting_reply":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-900/30";
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-900/30";
      case "medium":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-900/30";
      case "normal":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent";
    }
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        children={
          <div className="bg-secondary p-1 rounded-xl flex items-center gap-1 border">
            <button
              onClick={() => setActiveTab("track")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                activeTab === "track"
                  ? "bg-primary shadow-sm text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              {t.tabTrack}
            </button>
            <button
              onClick={() => setActiveTab("send")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                activeTab === "send"
                  ? "bg-primary shadow-sm text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              {t.tabSend}
            </button>

          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {activeTab === "track" ? (
          <>
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className={cn("absolute top-3 h-4 w-4 text-muted-foreground", dir === "rtl" ? "right-3" : "left-3")} />
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("w-full py-5 text-base border shadow-sm", dir === "rtl" ? "pr-10" : "pl-10")}
              />
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Card
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
                  statusFilter === "all" ? "border-slate-400 dark:border-slate-500 ring-2 ring-slate-400/10" : "border-border"
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-muted-foreground">{t.totalTasks}</span>
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{counts.total}</span>
                </CardContent>
              </Card>

              <Card
                onClick={() => setStatusFilter("open")}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
                  statusFilter === "open" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-border"
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-muted-foreground">{t.openTasks}</span>
                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                      <Loader2 className="h-4 w-4 animate-spin-slow" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{counts.open}</span>
                </CardContent>
              </Card>

              <Card
                onClick={() => setStatusFilter("in_progress")}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
                  statusFilter === "in_progress" ? "border-amber-500 ring-2 ring-amber-500/10" : "border-border"
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-muted-foreground">{t.inProgress}</span>
                    <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{counts.in_progress}</span>
                </CardContent>
              </Card>

              <Card
                onClick={() => setStatusFilter("awaiting_reply")}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
                  statusFilter === "awaiting_reply" ? "border-purple-500 ring-2 ring-purple-500/10" : "border-border"
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-muted-foreground">{t.awaitingReply}</span>
                    <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{counts.awaiting_reply}</span>
                </CardContent>
              </Card>

              <Card
                onClick={() => setStatusFilter("completed")}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer border-2",
                  statusFilter === "completed" ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-border"
                )}
              >
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-muted-foreground">{t.completedTasks}</span>
                    <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{counts.completed}</span>
                </CardContent>
              </Card>
            </div>

            {/* Filter controls */}
            {/* <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStatusFilter("all"); setSearch(""); }}
                className="gap-2 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t.allTasks}
              </Button>
            </div> */}

            {/* Tasks Table */}
            <Card className="border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="text-center font-bold">{t.taskId}</TableHead>
                      <TableHead className={dir === "rtl" ? "text-right font-bold" : "text-left font-bold"}>{t.taskTitle}</TableHead>
                      <TableHead className="text-center font-bold">{t.department}</TableHead>
                      <TableHead className="text-center font-bold">{t.lastUpdate}</TableHead>
                      <TableHead className={dir === "rtl" ? "text-right font-bold" : "text-left font-bold"}>{t.assignedTeam}</TableHead>
                      <TableHead className="text-center font-bold">{t.priority}</TableHead>
                      <TableHead className="text-center font-bold">{t.status}</TableHead>
                      <TableHead className="text-center font-bold">{t.action}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          {lang === "ar" ? "لا توجد نتائج بحث مطابقة" : "No matching tasks found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150 cursor-pointer"
                          onClick={() => { setSelectedTask(task); setDialogTab("replies"); }}
                        >
                          <TableCell className="text-center font-mono font-semibold text-sm text-muted-foreground">
                            {task.id}
                          </TableCell>
                          <TableCell className={cn("max-w-xs truncate font-semibold text-foreground")}>
                            {task.title}
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            {task.department}
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium text-muted-foreground">
                            <span dir="ltr">{task.lastUpdate}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              {task.assignedAvatar ? (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={task.assignedAvatar} />
                                  <AvatarFallback>{task.assignedTeam[0]}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border text-[10px]">
                                  <User className="h-3.5 w-3.5" />
                                </div>
                              )}
                              <span className="text-sm font-medium">
                                {task.assignedTeam === "بانتظار التعيين" ? t.awaitingAssignment : task.assignedTeam}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn("px-2 py-0.5 text-xs font-semibold border shadow-none", getPriorityColor(task.priority))}>
                              {t[task.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border shadow-none", getStatusColor(task.status))}>
                              {t[`status${task.status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as keyof typeof t]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => { setEditingTask(task); setIsEditDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => { setTaskToDelete(task); setIsDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => { setSelectedTask(task); setDialogTab("replies"); }}
                              >
                                {dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        ) : (
          /* Send New Task Form (Image 2) */
          <div className="mx-auto">
            <Card className="border shadow-md">
              <CardContent className="p-6 sm:p-8">
                {/* Form Header */}
                <div className="flex items-center gap-4 border-b pb-6 mb-6">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-[#a87f32] rounded-xl border border-amber-200/50">
                    <Clipboard className="h-6 w-6" />
                  </div>
                  <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h2 className="text-xl font-bold text-foreground">{t.createTitle}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.createSubtitle}</p>
                  </div>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  {/* Task Title */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground font-semibold">{t.labelTitle}</Label>
                    <Input
                      type="text"
                      placeholder={t.placeholderTitle}
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="py-5 text-base border"
                      required
                    />
                  </div>

                  {/* Assigned To & Dept Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assigned To Select */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{t.labelAssignedTo}</Label>
                      <Select value={formAssignedTo} onValueChange={setFormAssignedTo}>
                        <SelectTrigger className="w-full py-5 border">
                          <SelectValue placeholder={t.labelAssignedTo} />
                        </SelectTrigger>
                        <SelectContent>
                          {usersArray.map((user: any) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.name || user.username || `User ${user.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Input */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{t.labelDept}</Label>
                      <Input
                        type="text"
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="py-5 text-base border"
                        required
                      />
                    </div>
                  </div>

                  {/* Priority, Deadline & Status Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{lang === "ar" ? "الأولوية" : "Priority"}</Label>
                      <Select value={formPriority} onValueChange={setFormPriority}>
                        <SelectTrigger className="w-full py-5 border">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">{lang === "ar" ? "عاجل" : "Urgent"}</SelectItem>
                          <SelectItem value="medium">{lang === "ar" ? "متوسط" : "Medium"}</SelectItem>
                          <SelectItem value="normal">{lang === "ar" ? "عادي" : "Normal"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{t.labelDeadline}</Label>
                      <Input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="py-5 text-base border"
                      />
                    </div>
                  </div>

                  {/* Details TextArea */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground font-semibold">{t.labelDetails}</Label>
                    <Textarea
                      placeholder={t.placeholderDetails}
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      className="min-h-[150px] text-base border p-4"
                      required
                    />
                  </div>

                  {/* Attachments */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground font-semibold">{t.labelAttachments}</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setFormAttachments(Array.from(e.target.files));
                        }
                      }}
                      className="py-3 text-base border"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[#a87f32] hover:bg-[#966f2a] dark:bg-[#a87f32] dark:hover:bg-[#be9343] text-white py-5 px-8 text-base font-semibold gap-2 transition-colors duration-200"
                    >
                      <Send className="h-4 w-4" />
                      {t.btnSendTask}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Task Details Dialog (Image 3) */}
      <Dialog open={!!selectedTask} onOpenChange={(v) => !v && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl h-[95vh] max-h-[95vh] flex flex-col p-0 overflow-hidden border bg-background [&>button]:hidden">
          {selectedTask && (
            <>
              {/* Dialog Header */}
              <div className="p-6 border-b flex flex-col justify-between items-start gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border">
                      {selectedTask.id}
                    </span>
                    <Badge className={cn("text-xs font-semibold border py-0.5", getStatusColor(selectedTask.status))}>
                      {t[`status${selectedTask.status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as keyof typeof t]}
                    </Badge>
                    <Badge className={cn("text-xs font-semibold border py-0.5", getPriorityColor(selectedTask.priority))}>
                      {t.priorityLabel}: {t[selectedTask.priority]}
                    </Badge>

                  </div>
                </div>


                <div className={cn("flex flex-col gap-1.5", dir === "rtl" ? "text-right" : "text-left")}>
                  <DialogTitle className="text-lg font-bold text-foreground line-clamp-2">
                    {selectedTask.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{t.assignedParty}: {selectedTask.assignedTeam === "بانتظار التعيين" ? t.awaitingAssignment : selectedTask.assignedTeam}</span>
                    <span>•</span>
                    <span>{t.requestDate}: <span dir="ltr">{selectedTask.requestDate}</span></span>
                  </div>
                </div>


              </div>

              {/* Task Initial Description Box */}
              <div className="px-6 pt-4 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm text-foreground leading-relaxed" dir="rtl">
                  {selectedTask.description}
                </div>

                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div className="flex flex-col gap-2" dir="rtl">
                    <Label className="text-muted-foreground font-semibold">{t.labelAttachments || "المرفقات"}</Label>
                    <div className="flex flex-wrap gap-3">
                      {selectedTask.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-lg border bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-colors text-xs"
                          dir="ltr"
                        >
                          <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate max-w-[150px]">{att.file_name}</p>
                            {att.file_size && <p className="opacity-70 text-[10px] mt-0.5">{Math.round(att.file_size / 1024)} KB</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs Switcher (Replies vs Log) */}
              <div className="px-6 pt-4 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border">
                  <button
                    onClick={() => setDialogTab("replies")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      dialogTab === "replies"
                        ? "bg-white dark:bg-slate-900 shadow-sm text-[#a87f32] font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.tabReplies}
                  </button>
                  <button
                    onClick={() => setDialogTab("log")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      dialogTab === "log"
                        ? "bg-white dark:bg-slate-900 shadow-sm text-[#a87f32] font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.tabLog}
                  </button>
                </div>
              </div>

              {/* Dialog Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {dialogTab === "replies" ? (
                  /* Chat Thread */
                  <div className="space-y-4 flex flex-col" dir="ltr">
                    {selectedTask.messages.map((msg) => {
                      const isCurrentUser = msg.sender === "user";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-start gap-2.5 w-full",
                            isCurrentUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {/* Support Avatar (placed left for support messages) */}
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={msg.avatar} />
                              <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">IT</AvatarFallback>
                            </Avatar>
                          )}

                          <div className={cn("flex flex-col max-w-[70%]", isCurrentUser ? "items-end" : "items-start")}>
                            {/* Message Header */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              {isCurrentUser ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-red-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 -mt-0.5"
                                    onClick={() => handleDeleteComment(msg.id)}
                                    title={t.deleteComment}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                  <span>{msg.time}</span>
                                  <span>•</span>
                                  <span className="font-semibold">{msg.senderName}</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold">{msg.senderName}</span>
                                  <span>•</span>
                                  <span>{msg.time}</span>
                                </>
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div
                              className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed space-y-2",
                                isCurrentUser
                                  ? "bg-[#a87f32] text-white rounded-tr-none text-right font-medium"
                                  : "bg-slate-100 dark:bg-slate-800 text-foreground border border-slate-200/60 dark:border-slate-700 rounded-tl-none text-left"
                              )}
                              dir="rtl"
                            >
                              {msg.attachment && (
                                <div className="mb-1">
                                  {msg.attachment.type === "image" ? (
                                    <div className="relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 max-w-[260px]">
                                      <img
                                        src={msg.attachment.url}
                                        alt={msg.attachment.name}
                                        className="w-full h-auto object-cover max-h-[200px]"
                                      />
                                      <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-200" />
                                    </div>
                                  ) : (
                                    <a
                                      href={msg.attachment.url}
                                      download={msg.attachment.name}
                                      className={cn(
                                        "flex items-center gap-3 p-2.5 rounded-lg border text-xs text-left",
                                        isCurrentUser
                                          ? "bg-black/20 hover:bg-black/30 border-white/10 text-white"
                                          : "bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700 text-foreground"
                                      )}
                                      dir="ltr"
                                    >
                                      <div className={cn("p-2 rounded-lg shrink-0", isCurrentUser ? "bg-white/15 text-white" : "bg-primary/10 text-primary")}>
                                        <FileText className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{msg.attachment.name}</p>
                                        <p className="opacity-70 text-[10px] mt-0.5">{msg.attachment.size || "—"}</p>
                                      </div>
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                            </div>

                            {/* Read Status (Only for user messages) */}
                            {isCurrentUser && (
                              <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                                <span>{t.readStatus}</span>
                                <CheckCircle2 className="h-3 w-3 text-sky-500 fill-sky-500/10" />
                              </div>
                            )}
                          </div>

                          {/* User Avatar (placed right for user messages) */}
                          {isCurrentUser && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-amber-100 text-[#a87f32] font-semibold text-xs">م</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}

                    {/* typing indicator */}
                    {isTyping && (
                      <div className="flex items-start gap-2.5 justify-start">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">IT</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-muted-foreground mb-1 font-semibold">
                            {selectedTask.assignedTeam === "بانتظار التعيين" ? "الدعم الفني" : selectedTask.assignedTeam}
                          </span>
                          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-75"></span>
                            <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-150"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  /* Task Logs Tab */
                  <div className="space-y-4" dir={dir}>
                    {selectedTask.logs.map((log) => (
                      <div key={log.id} className="flex gap-4 items-start border-l-2 dark:border-l-slate-800 pb-4 last:pb-0 pl-4 relative">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#a87f32] absolute -left-[6px] top-1.5" />
                        <div className="flex-1 flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            {t[log.action as keyof typeof t] || log.action}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user === "النظام" ? t.system : log.user}
                            </span>
                            <span>•</span>
                            <span dir="ltr">{log.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dialog Input (Only for Replies Tab and Uncompleted tasks) */}
              {dialogTab === "replies" && (
                <div className="p-4 border-t bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder={t.replyPlaceholder}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="py-5 pr-10 pl-4 border rounded-xl shadow-sm text-sm"
                      dir="rtl"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1.5 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#a87f32] hover:bg-[#966f2a] dark:bg-[#a87f32] dark:hover:bg-[#be9343] text-white h-10 w-10 rounded-full shrink-0 flex items-center justify-center p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader className={dir === "rtl" ? "text-right" : "text-left"}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">{t.editTask}</DialogTitle>
                <DialogDescription>{t.editSubtitle}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editingTask && (
            <form onSubmit={handleEditTask} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t.labelTitle}</Label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.department}</Label>
                  <Input
                    type="text"
                    value={editingTask.department}
                    onChange={(e) => setEditingTask({ ...editingTask, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.priority}</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(val: any) => setEditingTask({ ...editingTask, priority: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="normal">{t.normal}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.labelAssignedTo}</Label>
                  <Select
                    value={editingTask.assignedTo}
                    onValueChange={(val) => setEditingTask({ ...editingTask, assignedTo: val })}
                  >
                    <SelectTrigger><SelectValue placeholder={t.labelAssignedTo} /></SelectTrigger>
                    <SelectContent>
                      {usersArray.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name || user.username || `User ${user.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.labelDeadline || "Deadline"}</Label>
                  <Input
                    type="date"
                    value={editingTask.deadline || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.status}</Label>
                <Select
                  value={editingTask.status}
                  onValueChange={(val: any) => setEditingTask({ ...editingTask, status: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t.statusOpen}</SelectItem>
                    <SelectItem value="in_progress">{t.statusInProgress}</SelectItem>
                    <SelectItem value="awaiting_reply">{t.statusAwaitingReply}</SelectItem>
                    <SelectItem value="completed">{t.statusCompleted}</SelectItem>
                    <SelectItem value="closed">{t.statusClosed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.labelDetails}</Label>
                <Textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-primary hover:bg-primary/90 text-white">
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : t.saveChanges}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 text-center" dir={dir}>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl mb-2">{t.deleteTask}</DialogTitle>
          <DialogDescription className="mb-6">{t.confirmDelete}</DialogDescription>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="w-full" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.deleteTask}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { TasksPage as Component };
