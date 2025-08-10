import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage, getToken, UserOption } from "@shared/utils";

export function useGetUsernames() {
  const [users, setUsers] = useState<UserOption[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/user/all`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as UserOption[];
      setUsers(json);
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers?.();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
