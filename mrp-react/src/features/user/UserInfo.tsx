import { Card } from "primereact/card";
import { Button } from "primereact/button";
import "primeflex/primeflex.css";
import { UserInfoType } from "@shared/utils";

interface Props {
  user: UserInfoType | null;
  logout?: () => void;
}

export function UserInfo({ user, logout }: Props) {
  if (user) {
    return (
      <Card
        className="surface-card shadow-2 border-round"
        style={{ maxWidth: "400px", margin: "2rem auto" }}
      >
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center gap-2">
            <span className="font-bold w-8rem">Username:</span>
            <span>{user.username}</span>
          </div>

          <div className="flex align-items-center gap-2">
            <span className="font-bold w-8rem">Email:</span>
            <span>{user.email}</span>
          </div>

          {logout && (
            <div className="flex justify-content-end">
              <Button
                label="Log out"
                icon="pi pi-sign-out"
                className="p-button-danger"
                onClick={logout}
              />
            </div>
          )}
        </div>
      </Card>
    );
  }
}
