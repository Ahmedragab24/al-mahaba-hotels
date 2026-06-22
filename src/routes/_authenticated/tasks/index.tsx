import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
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
  Users
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks/")({
  component: TasksPage,
});

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

    // New Task Form
    createTitle: "إنشاء مهمة جديدة",
    createSubtitle: "اكتب تفاصيل طلبك أو مشكلتك ليقوم الفريق المختص بمساعدتك.",
    labelTitle: "عنوان المهمة / المشكلة",
    labelEmployee: "الموظف",
    labelDept: "القسم",
    labelDetails: "تفاصيل المهمة / الطلب",
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

    // New Task Form
    createTitle: "Create New Task",
    createSubtitle: "Write the details of your request or issue so the specialized team can assist you.",
    labelTitle: "Task Title / Issue",
    labelEmployee: "Employee",
    labelDept: "Department",
    labelDetails: "Task Details / Request",
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

interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  lastUpdate: string;
  assignedTeam: string;
  assignedAvatar?: string;
  priority: "urgent" | "medium" | "normal";
  status: "in_progress" | "open" | "awaiting_reply" | "completed";
  requestDate: string;
  messages: Message[];
  logs: TaskLog[];
}

const INITIAL_TASKS: Task[] = [
  {
    id: "TSK-3091",
    title: "طلب صلاحية وصول لنظام المحاسبة الجديد",
    description: "أحتاج إلى صلاحية الدخول لنظام المحاسبة الجديد (ERP) الخاص بالشركة لإكمال تقارير نهاية الشهر. حاولت الدخول بحسابي الحالي وتظهر لي رسالة خطأ.",
    department: "دعم تقني",
    lastUpdate: "2023-11-10 1:15 PM",
    assignedTeam: "فريق تقنية المعلومات",
    assignedAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    priority: "urgent",
    status: "in_progress",
    requestDate: "2023-11-10 11:30 AM",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "محمد أحمد",
        content: "أحتاج إلى صلاحية الدخول لنظام المحاسبة الجديد (ERP) الخاص بالشركة لإكمال تقارير نهاية الشهر. حاولت الدخول بحسابي الحالي وتظهر لي رسالة خطأ.",
        time: "11:30 AM",
        read: true,
      },
      {
        id: "m2",
        sender: "support",
        senderName: "سارة خالد (IT)",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        content: "مرحباً محمد، جاري العمل على إضافة حسابك للنظام الجديد. هل يمكنك تزويدي برقمك الوظيفي للتأكيد؟",
        time: "12:05 PM",
      },
      {
        id: "m3",
        sender: "user",
        senderName: "محمد أحمد",
        content: "بالتأكيد، رقمي الوظيفي هو 4092. شكراً لتعاونكم.",
        time: "1:15 PM",
        read: true,
      }
    ],
    logs: [
      { id: "l1", action: "logCreated", user: "محمد أحمد", time: "2023-11-10 11:30 AM" },
      { id: "l2", action: "logAssigned", user: "النظام", time: "2023-11-10 11:35 AM" },
      { id: "l3", action: "logStatusChanged", user: "سارة خالد", time: "2023-11-10 12:05 PM" }
    ]
  },
  {
    id: "TSK-3092",
    title: "استفسار عن رصيد الإجازات السنوية",
    description: "أود الاستفسار عن رصيد إجازاتي السنوية المتبقية لعام 2023 وهل يمكن ترحيلها للعام القادم؟",
    department: "طلب إداري",
    lastUpdate: "2023-11-11 4:20 PM",
    assignedTeam: "بانتظار التعيين",
    priority: "normal",
    status: "open",
    requestDate: "2023-11-11 4:20 PM",
    messages: [
      {
        id: "m4",
        sender: "user",
        senderName: "محمد أحمد",
        content: "أود الاستفسار عن رصيد إجازاتي السنوية المتبقية لعام 2023 وهل يمكن ترحيلها للعام القادم؟",
        time: "4:20 PM",
        read: false,
      }
    ],
    logs: [
      { id: "l4", action: "logCreated", user: "محمد أحمد", time: "2023-11-11 4:20 PM" }
    ]
  },
  {
    id: "TSK-3085",
    title: "صيانة جهاز التكييف في المكتب رقم 4",
    description: "جهاز التكييف في المكتب رقم 4 يصدر ضوضاء عالية ولا يبرد بشكل جيد. يرجى إرسال فني صيانة.",
    department: "صيانة",
    lastUpdate: "2023-11-09 6:45 PM",
    assignedTeam: "فريق الصيانة",
    assignedAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    priority: "medium",
    status: "awaiting_reply",
    requestDate: "2023-11-09 6:00 PM",
    messages: [
      {
        id: "m5",
        sender: "user",
        senderName: "محمد أحمد",
        content: "جهاز التكييف في المكتب رقم 4 يصدر ضوضاء عالية ولا يبرد بشكل جيد. يرجى إرسال فني صيانة.",
        time: "6:00 PM",
        read: true,
      },
      {
        id: "m6",
        sender: "support",
        senderName: "فريق الصيانة",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        content: "تم فحص التكييف وتبين وجود مشكلة في المروحة الداخلية. تم طلب قطع الغيار وسنقوم بالتركيب غداً. هل توافق على جدولة الصيانة غداً صباحاً؟",
        time: "6:45 PM",
      }
    ],
    logs: [
      { id: "l5", action: "logCreated", user: "محمد أحمد", time: "2023-11-09 6:00 PM" },
      { id: "l6", action: "logAssigned", user: "النظام", time: "2023-11-09 6:05 PM" }
    ]
  },
  {
    id: "TSK-3050",
    title: "تحديث بيانات التأمين الطبي",
    description: "أرجو تحديث بيانات التأمين الطبي الخاصة بي بعد إضافة المولود الجديد وإرسال بطاقة التأمين المحدثة.",
    department: "طلب إداري",
    lastUpdate: "2023-11-02 12:30 PM",
    assignedTeam: "قسم الموارد البشرية",
    assignedAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    priority: "urgent",
    status: "completed",
    requestDate: "2023-11-02 10:00 AM",
    messages: [
      {
        id: "m7",
        sender: "user",
        senderName: "محمد أحمد",
        content: "أرجو تحديث بيانات التأمين الطبي الخاصة بي بعد إضافة المولود الجديد وإرسال بطاقة التأمين المحدثة.",
        time: "10:00 AM",
        read: true,
      },
      {
        id: "m8",
        sender: "support",
        senderName: "قسم الموارد البشرية",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        content: "أهلاً محمد، تم استلام المستندات وتحديث البيانات لدى شركة التأمين. البطاقة الجديدة ستكون جاهزة للاستلام يوم الأحد القادم.",
        time: "11:45 AM",
      },
      {
        id: "m9",
        sender: "user",
        senderName: "محمد أحمد",
        content: "رائع جداً، شكراً جزيلاً لسرعة الاستجابة.",
        time: "12:30 PM",
        read: true,
      }
    ],
    logs: [
      { id: "l7", action: "logCreated", user: "محمد أحمد", time: "2023-11-02 10:00 AM" },
      { id: "l8", action: "logAssigned", user: "النظام", time: "2023-11-02 10:10 AM" },
      { id: "l9", action: "logCompleted", user: "قسم الموارد البشرية", time: "2023-11-02 12:30 PM" }
    ]
  }
];

function TasksPage() {
  const { lang, dir } = useI18n();
  const t = lang === "ar" ? T.ar : T.en;

  const [activeTab, setActiveTab] = useState<"track" | "send">("track");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogTab, setDialogTab] = useState<"replies" | "log">("replies");
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formEmployee, setFormEmployee] = useState("محمد أحمد");
  const [formDept, setFormDept] = useState("دعم تقني");
  const [formDetails, setFormDetails] = useState("");

  // Initialize data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("almahaba_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem("almahaba_tasks", JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  // Sync to localStorage
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("almahaba_tasks", JSON.stringify(newTasks));
  };

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
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDetails.trim()) {
      toast.error(lang === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    const nextId = `TSK-${3000 + tasks.length + 50}`;
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newTask: Task = {
      id: nextId,
      title: formTitle,
      description: formDetails,
      department: formDept,
      lastUpdate: `${formattedDate} ${formattedTime}`,
      assignedTeam: formDept === "دعم تقني" ? "فريق تقنية المعلومات" : formDept === "صيانة" ? "فريق الصيانة" : "بانتظار التعيين",
      priority: "normal",
      status: "open",
      requestDate: `${formattedDate} ${formattedTime}`,
      messages: [
        {
          id: "m_init",
          sender: "user",
          senderName: formEmployee,
          content: formDetails,
          time: formattedTime,
          read: false,
        }
      ],
      logs: [
        {
          id: "l_init",
          action: "logCreated",
          user: formEmployee,
          time: `${formattedDate} ${formattedTime}`
        }
      ]
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);

    toast.success(t.toastSuccess);

    // Clear form
    setFormTitle("");
    setFormDetails("");
    setActiveTab("track"); // Switch back to list
  };

  // Send message in details chat
  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedTask) return;

    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      senderName: "محمد أحمد",
      content: replyText,
      time: formattedTime,
      read: true
    };

    const newLog: TaskLog = {
      id: `log_${Date.now()}`,
      action: "أضاف رداً جديداً",
      user: "محمد أحمد",
      time: `${formattedDate} ${formattedTime}`
    };

    // Transition status to in_progress if user replies when it was awaiting_reply
    let newStatus = selectedTask.status;
    if (selectedTask.status === "awaiting_reply") {
      newStatus = "in_progress";
    }

    const updatedTask: Task = {
      ...selectedTask,
      status: newStatus,
      lastUpdate: `${formattedDate} ${formattedTime}`,
      messages: [...selectedTask.messages, newMessage],
      logs: [...selectedTask.logs, newLog]
    };

    // Update global state
    const updatedTasks = tasks.map((tk) => (tk.id === selectedTask.id ? updatedTask : tk));
    saveTasks(updatedTasks);
    setSelectedTask(updatedTask);
    setReplyText("");

    // Setup simulated support response after 2.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      const responseTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const supportMsg: Message = {
        id: `msg_support_${Date.now()}`,
        sender: "support",
        senderName: updatedTask.assignedTeam === "بانتظار التعيين" ? "الدعم الفني" : updatedTask.assignedTeam + " - فني",
        avatar: updatedTask.assignedAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        content:
          updatedTask.id === "TSK-3091"
            ? (lang === "ar"
              ? "شكراً لك محمد على تزويدي بالرقم الوظيفي. تم تفعيل صلاحية الحساب الآن بنجاح على نظام ERP الجديد. يرجى محاولة تسجيل الدخول مرة أخرى وإعلامنا بالنتيجة."
              : "Thank you Muhammad for providing the employee ID. Your account permission has been successfully activated on the new ERP system. Please try logging in again and let us know.")
            : (lang === "ar"
              ? "أهلاً محمد، تم استلام ردك وجاري مراجعته ومتابعته من قبل فريق العمل المختص وسنفيدك بأي تحديث قريباً."
              : "Hello Muhammad, your reply has been received and is being reviewed by the team. We will update you shortly."),
        time: responseTime
      };

      const supportLog: TaskLog = {
        id: `log_support_${Date.now()}`,
        action: updatedTask.id === "TSK-3091" ? "logCompleted" : "أضاف الدعم رداً جديداً",
        user: supportMsg.senderName,
        time: `${formattedDate} ${responseTime}`
      };

      const finalStatus = updatedTask.id === "TSK-3091" ? "completed" : updatedTask.status;

      const finalTask: Task = {
        ...updatedTask,
        status: finalStatus,
        lastUpdate: `${formattedDate} ${responseTime}`,
        messages: [...updatedTask.messages, supportMsg],
        logs: [...updatedTask.logs, supportLog]
      };

      const finalTasks = updatedTasks.map((tk) => (tk.id === selectedTask.id ? finalTask : tk));
      saveTasks(finalTasks);

      // If modal is still open, update its state
      if (selectedTask.id === finalTask.id) {
        setSelectedTask(finalTask);
      }
    }, 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(lang === "ar" ? "حجم الملف كبير جداً (الحد الأقصى 1.5 ميجابايت)" : "File too large (Max 1.5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const isImage = file.type.startsWith("image/");

      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0];
      const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: "user",
        senderName: "محمد أحمد",
        content: "",
        time: formattedTime,
        read: true,
        attachment: {
          name: file.name,
          url: base64Url,
          type: isImage ? "image" : "file",
          size: `${(file.size / 1024).toFixed(1)} KB`
        }
      };

      const newLog: TaskLog = {
        id: `log_${Date.now()}`,
        action: lang === "ar" ? `أرسل مرفقاً: ${file.name}` : `Sent attachment: ${file.name}`,
        user: "محمد أحمد",
        time: `${formattedDate} ${formattedTime}`
      };

      let newStatus = selectedTask.status;
      if (selectedTask.status === "awaiting_reply") {
        newStatus = "in_progress";
      }

      const updatedTask: Task = {
        ...selectedTask,
        status: newStatus,
        lastUpdate: `${formattedDate} ${formattedTime}`,
        messages: [...selectedTask.messages, newMessage],
        logs: [...selectedTask.logs, newLog]
      };

      const updatedTasks = tasks.map((tk) => (tk.id === selectedTask.id ? updatedTask : tk));
      saveTasks(updatedTasks);
      setSelectedTask(updatedTask);

      if (fileInputRef.current) fileInputRef.current.value = "";

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responseTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const supportMsg: Message = {
          id: `msg_support_${Date.now()}`,
          sender: "support",
          senderName: updatedTask.assignedTeam === "بانتظار التعيين" ? "الدعم الفني" : updatedTask.assignedTeam + " - فني",
          avatar: updatedTask.assignedAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
          content: lang === "ar"
            ? `أهلاً محمد، تم استلام المرفق (${file.name}) بشكل سليم. جاري مراجعته والعمل على طلبك.`
            : `Hello Muhammad, we have received your attachment (${file.name}) successfully. The team is currently reviewing it.`,
          time: responseTime
        };

        const supportLog: TaskLog = {
          id: `log_support_${Date.now()}`,
          action: lang === "ar" ? "أضاف الدعم رداً جديداً" : "Support added a reply",
          user: supportMsg.senderName,
          time: `${formattedDate} ${responseTime}`
        };

        const finalTask: Task = {
          ...updatedTask,
          status: updatedTask.status,
          lastUpdate: `${formattedDate} ${responseTime}`,
          messages: [...updatedTask.messages, supportMsg],
          logs: [...updatedTask.logs, supportLog]
        };

        const finalTasks = updatedTasks.map((tk) => (tk.id === selectedTask.id ? finalTask : tk));
        saveTasks(finalTasks);

        if (selectedTask.id === finalTask.id) {
          setSelectedTask(finalTask);
        }
      }, 3000);
    };
    reader.readAsDataURL(file);
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
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStatusFilter("all"); setSearch(""); }}
                className="gap-2 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t.allTasks}
              </Button>
            </div>

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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => { setSelectedTask(task); setDialogTab("replies"); }}
                            >
                              {dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
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

                  {/* Employee & Dept Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee Select */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{t.labelEmployee}</Label>
                      <Select value={formEmployee} onValueChange={setFormEmployee}>
                        <SelectTrigger className="w-full py-5 border">
                          <SelectValue placeholder={t.labelEmployee} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="محمد أحمد">محمد أحمد</SelectItem>
                          <SelectItem value="أحمد علي">أحمد علي</SelectItem>
                          <SelectItem value="خالد عمر">خالد عمر</SelectItem>
                          <SelectItem value="سارة خالد">سارة خالد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Select */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground font-semibold">{t.labelDept}</Label>
                      <Select value={formDept} onValueChange={setFormDept}>
                        <SelectTrigger className="w-full py-5 border">
                          <SelectValue placeholder={t.labelDept} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="دعم تقني">{lang === "ar" ? "دعم تقني" : "Technical Support"}</SelectItem>
                          <SelectItem value="طلب إداري">{lang === "ar" ? "طلب إداري" : "HR/Admin Request"}</SelectItem>
                          <SelectItem value="صيانة">{lang === "ar" ? "صيانة" : "Maintenance"}</SelectItem>
                        </SelectContent>
                      </Select>
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
              <div className="px-6 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm text-foreground leading-relaxed" dir="rtl">
                  {selectedTask.description}
                </div>
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
    </>
  );
}
