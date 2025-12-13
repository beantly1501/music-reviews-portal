import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { User } from "@/features";
import router from "@/router/routes.ts";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setUser(newUser: User) {
    user.value = newUser;
  }

  async function fetchUser() {
    if (!token.value) return;

    const response = await fetch("/api/user/me", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (!response.ok) {
      clearToken();
      return;
    }

    user.value = await response.json();
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem("token");
  }

  async function register(userPayload: User) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    if (!response.ok) throw new Error("Registration failed");

    const data = await response.json();
    setToken(data.token);
    setUser(userPayload);
    await router.push("/");
    return data;
  }

  async function login(userPayload: User) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    setToken(data.token);
    setUser(userPayload);
    await router.push("/");
    return data;
  }

  async function logout() {
    clearToken();
    await router.push("/login");
  }

  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    setToken,
    fetchUser,
  };
});
