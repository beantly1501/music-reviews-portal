import { useState } from "react";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { confirmDialog } from "primereact/confirmdialog";

import { UserRoleEnum } from "@shared/utils";
import { useGetComments } from "../../shared/hooks/useGetComments.ts";
import { useCurrentUser } from "../../shared/hooks/useCurrentUser.ts";
import { useNavigate } from "react-router-dom";
import { submitComment } from "./hooks/submitComment.ts";
import { updateComment } from "./hooks/updateComment.ts";
import { deleteComment } from "./hooks/deleteComment.ts";
import { toast } from "../../shared/components/ToastContext.tsx";

type Props = {
  reviewId: number;
  reviewType: "SONG" | "ALBUM";
};

export function CommentSection({ reviewId, reviewType }: Props) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { comments, loading, error, refresh } = useGetComments(reviewId, reviewType);

  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePost = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      await submitComment(reviewId, reviewType, trimmed);
      setNewContent("");
      await refresh();
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleEditStart = (id: number, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleEditSave = async (commentId: number) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateComment(commentId, reviewType, trimmed);
      setEditingId(null);
      await refresh();
    } catch {
      toast.error("Failed to update comment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (commentId: number) => {
    confirmDialog({
      header: "Delete Comment",
      message: "Delete this comment permanently?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteComment(commentId, reviewType);
          await refresh();
        } catch {
          toast.error("Failed to delete comment.");
        }
      },
    });
  };

  return (
    <div className="px-4 pb-4">
      <div className="text-[1rem] font-semibold mb-3">
        Comments {comments.length > 0 && `(${comments.length})`}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <ProgressSpinner style={{ width: 32, height: 32 }} />
        </div>
      )}

      {!loading && error && (
        <Message severity="error" text={error} className="w-full mb-3" />
      )}

      {!loading && !error && comments.length === 0 && (
        <div className="text-[#6b7280] text-[0.9rem] mb-3">No comments yet.</div>
      )}

      {!loading && comments.map((comment) => {
        const date = new Date(comment.creationDate).toLocaleDateString("hr-HR", {
          timeZone: "UTC",
        });
        const canEdit = !!user && user.username === comment.username;
        const canDelete =
          !!user &&
          (user.username === comment.username || user.role === UserRoleEnum.ADMIN);
        const isEditing = editingId === comment.id;

        return (
          <div
            key={comment.id}
            className="border border-[#e5e7eb] rounded-[8px] p-3 mb-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.88rem] text-[#6b7280]">
                <span
                  className="inline-flex items-center gap-[4px] cursor-pointer select-none hover:underline"
                  onClick={() =>
                    user?.id === comment.userId
                      ? navigate("/profile")
                      : navigate(`/user/${comment.userId}`)
                  }
                >
                  <i className="pi pi-user" />
                  {comment.username}
                </span>
                <span className="mx-1 opacity-60">•</span>
                {date}
                {comment.updatedDate && (
                  <span className="ml-1 opacity-50 text-[0.82rem]">(edited)</span>
                )}
              </span>
              <div className="flex gap-2">
                {canEdit && !isEditing && (
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    severity="info"
                    onClick={() => handleEditStart(comment.id, comment.content)}
                    tooltip="Edit"
                    tooltipOptions={{ position: "top" }}
                  />
                )}
                {canDelete && !isEditing && (
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    severity="danger"
                    onClick={() => handleDelete(comment.id)}
                    tooltip="Delete"
                    tooltipOptions={{ position: "top" }}
                  />
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2 mt-1">
                <InputTextarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  autoResize
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    label="Save"
                    icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    size="small"
                    severity="success"
                    disabled={saving || !editContent.trim()}
                    onClick={() => handleEditSave(comment.id)}
                  />
                  <Button
                    label="Cancel"
                    size="small"
                    severity="secondary"
                    text
                    onClick={() => setEditingId(null)}
                  />
                </div>
              </div>
            ) : (
              <p className="m-0 text-[0.95rem] text-[#374151] leading-[1.6] whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        );
      })}

      {user && (
        <div className="flex flex-col gap-2 mt-3">
          <InputTextarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            autoResize
            className="w-full"
          />
          <div className="flex justify-end">
            <Button
              label="Post"
              icon={posting ? "pi pi-spin pi-spinner" : "pi pi-send"}
              size="small"
              disabled={posting || !newContent.trim()}
              onClick={handlePost}
            />
          </div>
        </div>
      )}

    </div>
  );
}
