import { api } from "../../baseApi";
import type { Task, TaskComment } from "@/types/api";

export const tasksApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], { scope?: string; status?: string; priority?: string; department?: string; assigned_to?: string | number; is_overdue?: boolean | string; search?: string; all?: boolean | number; per_page?: number } | void>({
      query: (params) => ({ url: "/tasks", params: params || undefined }),
      providesTags: ["Tasks"],
    }),
    getTaskById: build.query<Task, string | number>({
      query: (id) => ({ url: `/tasks/${id}` }),
      providesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),
    createTask: build.mutation<Task, FormData | Partial<Task>>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
        // Let fetchBaseQuery handle Content-Type for FormData
        formData: body instanceof FormData,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<Task, { id: string | number; body: Partial<Task> }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: "PUT", body }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: build.mutation<void, string | number>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tasks"],
    }),
    getTaskComments: build.query<TaskComment[], string | number>({
      query: (taskId) => ({ url: `/tasks/${taskId}/comments` }),
      providesTags: (result, error, taskId) => [{ type: "Tasks", id: `COMMENTS_${taskId}` }],
    }),
    addTaskComment: build.mutation<TaskComment, { taskId: string | number; body: FormData | { body: string } }>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body,
        formData: body instanceof FormData,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: "Tasks", id: `COMMENTS_${taskId}` }],
    }),
    deleteTaskComment: build.mutation<void, string | number>({
      query: (commentId) => ({ url: `/tasks/comments/${commentId}`, method: "DELETE" }),
      // Invalidating all tasks or a general tag is safer here since we don't have task ID easily.
      invalidatesTags: ["Tasks"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskCommentsQuery,
  useAddTaskCommentMutation,
  useDeleteTaskCommentMutation,
} = tasksApi;
