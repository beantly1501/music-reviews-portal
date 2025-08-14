import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, UserInfoType } from "@shared/utils";

export function useGetUserById(userId: number | string | undefined) {
  const [state, setState] = useState<{
    user: UserInfoType | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    if (
      userId === undefined ||
      userId === null ||
      String(userId).trim() === ""
    ) {
      setState({ user: null, loading: false, error: "Missing userId" });
      return;
    }

    setState({ user: null, loading: true, error: null });

    try {
      const token = getToken();
      const url = `/api/user/${encodeURIComponent(String(userId))}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setState({ user: null, loading: false, error: "Unauthorized" });
        } else if (res.status === 404) {
          setState({ user: null, loading: false, error: "User not found" });
        } else {
          const text = await res.text();
          setState({
            user: null,
            loading: false,
            error: text || `Request failed: ${res.status}`,
          });
        }
        return;
      }

      const user: UserInfoType = await res.json();
      setState({ user, loading: false, error: null });
    } catch (e: unknown) {
      setState({
        user: null,
        loading: false,
        error: extractErrorMessage(e),
      });
    }
  }, [userId]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    refresh: fetchUser,
  };
}
