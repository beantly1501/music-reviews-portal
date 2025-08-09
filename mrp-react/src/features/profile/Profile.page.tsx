import { useCurrentUser, useLogout } from "@shared/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import { ProfileInfo } from "./ProfileInfo";
import { Button } from "primereact/button";
import { useGetMyReviews } from "./hooks/useGetMyReviews.ts";

export default function ProfilePage() {
  const navigate = useNavigate();

  const {
    user,
    loading: userLoading,
    error: userError,
    refresh: refreshUser,
  } = useCurrentUser();
  const logout = useLogout();

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refresh: refreshRatings,
  } = useGetMyReviews();

  if (userLoading || reviewsLoading) return <div>Loading...</div>;

  if (!user || userError) {
    return (
      <div>
        <div>Error: {userError}</div>
        <Button onClick={refreshUser}>Retry</Button>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div>
        <div>Error loading reviews: {reviewsError}</div>
        <Button onClick={refreshRatings}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <ProfileInfo user={user} logout={logout} />

      <h1>My reviews</h1>

      <DataTable
        value={reviews}
        rowHover
        stripedRows
        emptyMessage={"You currently have no reviews."}
        removableSort
        onRowClick={(e) =>
          navigate(`/user-review/${e.data.id}`, {
            state: { review: e.data },
          })
        }
      >
        <Column
          field="name"
          header="Name"
          body={(row) => (row.type === "SONG" ? row.songName : row.albumName)}
          sortable
        />
        <Column
          header="Type"
          body={(value) => (
            <Tag
              value={value.type === "SONG" ? "Song" : "Album"}
              severity={value.type === "SONG" ? "success" : "info"}
            />
          )}
        />
        <Column
          field="grade"
          header="Rating"
          body={(value) => (
            <Rating value={value.grade} cancel={false} readOnly />
          )}
          sortable
        />
        <Column field="description" header="Description" />
        <Column
          field="creationDate"
          header="Creation Date"
          body={(row) => new Date(row.creationDate).toLocaleDateString("hr-HR")}
          sortable
        />
      </DataTable>
    </div>
  );
}
