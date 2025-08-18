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
    <div className="error-page">
      <Card className="error-card p-shadow-2">
        <div className="error-hero">
          <div className="error-icon" aria-hidden>
            <i className="pi pi-exclamation-triangle" />
          </div>
          <h1 className="error-title">{title}</h1>
          <p className="error-detail">{detail}</p>
        </div>

        <div className="error-actions">
          <Button
            label="Go Back"
            icon="pi pi-arrow-left"
            onClick={goBack}
            outlined
          />
          <Button label="Reload" icon="pi pi-refresh" onClick={reload} />
          <Button
            label="Home"
            icon="pi pi-home"
            onClick={goHome}
            severity="help"
          />
        </div>

        <div className="error-hint">
          If the problem persists, please try again later.
        </div>
      </Card>
    </div>
  );
}
