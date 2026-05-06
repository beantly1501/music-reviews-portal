<template>
  <div class="flex flex-col gap-4 mt-4">
    <div class="flex items-center gap-2">
      <h3 class="text-lg font-semibold m-0">Comments</h3>
      <Badge
        v-if="!isLoading && comments.length > 0"
        :value="comments.length"
        severity="secondary"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center p-4">
      <ProgressSpinner style="width: 32px; height: 32px" />
    </div>

    <div v-else-if="error" class="text-red-400 text-sm">
      {{ error.message }}
    </div>

    <div v-else-if="comments.length === 0" class="text-gray-400 text-sm">
      No comments yet.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border border-[#333] rounded-lg p-3 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2 text-sm">
            <span
              class="font-semibold cursor-pointer hover:text-primary transition-colors"
              @click="goToUser(comment)"
            >
              {{ comment.username }}
            </span>
            <span class="text-gray-500">
              {{ formatDate(comment.creationDate) }}
            </span>
            <span v-if="comment.updatedDate" class="text-gray-500 text-xs italic">
              (edited)
            </span>
          </div>
          <div class="flex items-center gap-1">
            <Button
              v-if="canEditComment(comment)"
              icon="pi pi-pencil"
              text
              rounded
              severity="info"
              size="small"
              @click="startEdit(comment)"
            />
            <Button
              v-if="canDeleteComment(comment)"
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              size="small"
              @click="confirmDelete(comment.id)"
            />
          </div>
        </div>

        <div v-if="editingId !== comment.id">
          <p class="text-sm whitespace-pre-wrap m-0">{{ comment.content }}</p>
        </div>
        <div v-else class="flex flex-col gap-2">
          <Textarea
            v-model="editContent"
            rows="3"
            class="w-full text-sm"
            auto-resize
          />
          <div class="flex gap-2">
            <Button
              label="Save"
              size="small"
              :loading="saving"
              :disabled="!editContent.trim() || saving"
              @click="saveEdit(comment.id)"
            />
            <Button
              label="Cancel"
              size="small"
              severity="secondary"
              outlined
              @click="cancelEdit"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAuthenticated" class="flex flex-col gap-2 mt-2">
      <Textarea
        v-model="newContent"
        rows="3"
        placeholder="Write a comment..."
        class="w-full text-sm"
        auto-resize
      />
      <div class="flex justify-end">
        <Button
          label="Post"
          icon="pi pi-send"
          size="small"
          :loading="posting"
          :disabled="!newContent.trim() || posting"
          @click="postComment"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Role } from "@/features/login-register";
import { useAuthStore, type CommentResponse } from "@/shared";
import { storeToRefs } from "pinia";
import { Badge, Button, ProgressSpinner, Textarea } from "primevue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { computed, ref, toRef } from "vue";
import { useCommentMutations } from "./hooks/useCommentMutations";
import { useGetComments } from "./hooks/useGetComments";
import router from "@/router/routes";

const props = defineProps<{
  reviewId: number;
  reviewType: "SONG" | "ALBUM";
}>();

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const confirm = useConfirm();
const toast = useToast();

const { submitComment, updateComment, deleteComment } = useCommentMutations();

const { data, isLoading, error, refetch } = useGetComments(
  toRef(props, "reviewId"),
  toRef(props, "reviewType"),
);

const comments = computed<CommentResponse[]>(() => data.value?.content ?? []);

const newContent = ref("");
const posting = ref(false);

const editingId = ref<number | null>(null);
const editContent = ref("");
const saving = ref(false);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("hr-HR", { timeZone: "UTC" });

const canEditComment = (comment: CommentResponse) =>
  !!user.value && user.value.username === comment.username;

const canDeleteComment = (comment: CommentResponse) =>
  !!user.value &&
  (user.value.username === comment.username || user.value.role === Role.ADMIN);

const goToUser = (comment: CommentResponse) => {
  if (user.value?.username === comment.username) {
    router.push("/profile");
  } else {
    router.push(`/user/${comment.userId}`);
  }
};

const postComment = async () => {
  if (!newContent.value.trim()) return;
  posting.value = true;
  try {
    await submitComment(props.reviewId, props.reviewType, newContent.value);
    newContent.value = "";
    await refetch();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error", detail: "Failed to post comment.", life: 3000 });
  } finally {
    posting.value = false;
  }
};

const startEdit = (comment: CommentResponse) => {
  editingId.value = comment.id;
  editContent.value = comment.content;
};

const cancelEdit = () => {
  editingId.value = null;
  editContent.value = "";
};

const saveEdit = async (commentId: number) => {
  if (!editContent.value.trim()) return;
  saving.value = true;
  try {
    await updateComment(commentId, props.reviewType, editContent.value);
    editingId.value = null;
    editContent.value = "";
    await refetch();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error", detail: "Failed to update comment.", life: 3000 });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (commentId: number) => {
  confirm.require({
    message: "Are you sure you want to delete this comment?",
    header: "Delete Comment",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: async () => {
      try {
        await deleteComment(commentId, props.reviewType);
        await refetch();
      } catch (e) {
        toast.add({ severity: "error", summary: "Error", detail: "Failed to delete comment.", life: 3000 });
      }
    },
  });
};
</script>
