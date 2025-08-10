import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Toast, ToastMessage } from "primereact/toast";

type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center"
  | "center";

export type ToastAPI = {
  show: (msg: ToastMessage | ToastMessage[]) => void;
  success: (summary: string, detail?: string, life?: number) => void;
  info: (summary: string, detail?: string, life?: number) => void;
  warn: (summary: string, detail?: string, life?: number) => void;
  error: (summary: string, detail?: string, life?: number) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastAPI | null>(null);

/** Global helper for firing toasts outside React components/modules */
let externalApi: ToastAPI | null = null;

export const toast: ToastAPI = {
  show: (msg) => externalApi?.show(msg),
  success: (s, d, life = 3000) => externalApi?.success(s, d, life),
  info: (s, d, life = 3000) => externalApi?.info(s, d, life),
  warn: (s, d, life = 3000) => externalApi?.warn(s, d, life),
  error: (s, d, life = 3000) => externalApi?.error(s, d, life),
  clear: () => externalApi?.clear(),
};

type ProviderProps = {
  children: React.ReactNode;
  position?: ToastPosition;
  life?: number;
};

export function ToastProvider({
  children,
  position = "top-right",
  life = 3000,
}: ProviderProps) {
  const ref = useRef<Toast>(null);

  const api = useMemo<ToastAPI>(() => {
    const show = (msg: ToastMessage | ToastMessage[]) => ref.current?.show(msg);
    const make =
      (severity: ToastMessage["severity"]) =>
      (summary: string, detail?: string, l?: number) =>
        show({ severity, summary, detail, life: l ?? life });

    return {
      show,
      success: make("success"),
      info: make("info"),
      warn: make("warn"),
      error: make("error"),
      clear: () => ref.current?.clear(),
    };
  }, [life]);

  useEffect(() => {
    externalApi = api;
    return () => {
      externalApi = null;
    };
  }, [api]);

  return (
    <ToastContext.Provider value={api}>
      <Toast ref={ref} position={position} />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error();
  return ctx;
}
