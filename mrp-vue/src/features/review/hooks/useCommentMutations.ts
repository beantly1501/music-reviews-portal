import { useAuthStore, type CommentResponse } from "@/shared";

export const useCommentMutations = () => {
  const { token } = useAuthStore();

  const submitComment = async (
    reviewId: number,
    type: "SONG" | "ALBUM",
    content: string,
  ): Promise<CommentResponse> => {
    const seg = type === "SONG" ? "song" : "album";
    const response = await fetch(`/api/comments/${seg}/${reviewId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error(`Failed to post comment: ${response.status}`);
    return response.json();
  };

  const updateComment = async (
    commentId: number,
    type: "SONG" | "ALBUM",
    content: string,
  ): Promise<CommentResponse> => {
    const seg = type === "SONG" ? "song" : "album";
    const response = await fetch(`/api/comments/${seg}/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error(`Failed to update comment: ${response.status}`);
    return response.json();
  };

  const deleteComment = async (
    commentId: number,
    type: "SONG" | "ALBUM",
  ): Promise<void> => {
    const seg = type === "SONG" ? "song" : "album";
    const response = await fetch(`/api/comments/${seg}/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(`Failed to delete comment: ${response.status}`);
  };

  return { submitComment, updateComment, deleteComment };
};
