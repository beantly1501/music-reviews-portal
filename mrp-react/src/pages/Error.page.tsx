import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

type ErrorState = {
  title?: string;
  detail?: string;
};

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ErrorState) || {};

  const title = state.title || "Something went wrong";
  const detail =
    state.detail ||
    "An unexpected error occurred. Please try again or return to the homepage.";

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const reload = () => window.location.reload();
  const goHome = () => navigate("/");

  return (
    <div className="min-h-[80vh] p-6 flex items-center justify-center">
      <Card className="error-card shadow-md" style={{ width: 560, maxWidth: "92vw", borderRadius: 16, overflow: "hidden" }}>
        <div className="px-7 pt-7 pb-4 text-center">
          <div
            className="w-[72px] h-[72px] mx-auto mb-3 rounded-full bg-[#fff7ed] text-[#f59e0b] flex items-center justify-center"
            style={{ boxShadow: "inset 0 0 0 1px #fde68a" }}
            aria-hidden
          >
            <i className="pi pi-exclamation-triangle" style={{ fontSize: 28 }} />
          </div>
          <h1 className="mt-1.5 mb-1.5 text-2xl leading-tight">{title}</h1>
          <p className="m-0 text-[#6b7280] text-[0.95rem]">{detail}</p>
        </div>

        <div className="flex justify-center gap-[10px] px-7 pt-4 pb-2">
          <Button label="Go Back" icon="pi pi-arrow-left" onClick={goBack} outlined />
          <Button label="Reload" icon="pi pi-refresh" onClick={reload} />
          <Button label="Home" icon="pi pi-home" onClick={goHome} severity="help" />
        </div>

        <div className="px-7 pb-7 text-center text-[#9ca3af] text-[0.9rem]">
          If the problem persists, please try again later.
        </div>
      </Card>
    </div>
  );
}
