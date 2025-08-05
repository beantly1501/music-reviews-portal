// RegisterPage.tsx
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
import {
  extractErrorMessage,
  RegisterForm,
  registerSchema,
} from "@shared/utils";
import { Link, useNavigate } from "react-router";

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

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          email: data.email,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }
      const body = await res.json();
      const token: string = body.token;
      if (!token || isTokenExpired(token)) throw new Error("Invalid token");

      localStorage.setItem("jwt", token);
      navigate("/", { replace: true });
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl mb-4">Register</h2>
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

          <div className="field">
            <label htmlFor="email">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText id="email" type="email" {...field} />
              )}
            />
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          {error && <div className="error-text mb-2">{error}</div>}

          <Button type="submit" label="Register" disabled={isSubmitting} />

          <div className="mt-2 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Login here.
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
