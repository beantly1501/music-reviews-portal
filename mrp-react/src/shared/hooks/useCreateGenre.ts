import { useState } from "react";
import { getToken } from "@shared/utils";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useCreateGenre() {
  const [isCreating, setIsCreating] = useState(false);

  const createGenre = async (name: string): Promise<boolean> => {
    setIsCreating(true);
    try {
      const token = getToken();
      const res = await fetch(`${VITE_BACKEND_URL}/genre/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return { createGenre, isCreating };
}
