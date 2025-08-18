import { useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm, loginSchema } from "@shared/utils";
import { useAuth } from "../../shared/components/Auth.tsx";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type JwtPayload = { exp?: number; sub?: string };

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000 - 30_000;
  } catch {
    return true;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setError(null);
    try {
      const res = await fetch(`${VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      const body = await res.json();
      const token: string = body.token;
      if (!token || isTokenExpired(token))
        throw new Error("Invalid or expired token");

      login(token);
      navigate("/", { replace: true });
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl mb-4">Login</h2>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid space-y-4">
          <div className="field">
            <label htmlFor="username">Username</label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => <InputText id="username" {...field} />}
            />
            {errors.username && (
              <small className="p-error">{errors.username.message}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputText id="password" type="password" {...field} />
              )}
            />
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          {error && <div className="error-text mb-2">{error}</div>}

          <Button type="submit" label="Login" disabled={isSubmitting} />

          <div className="mt-2 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Register here.
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
