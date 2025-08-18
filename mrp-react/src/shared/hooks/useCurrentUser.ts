import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, UserInfoType } from "@shared/utils";

export function useCurrentUser() {
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
    setState({ user: null, loading: true, error: null });

    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: "No auth token" });
      return;
    }

    try {
      const res = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
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
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    refresh: fetchUser,
  };
}
