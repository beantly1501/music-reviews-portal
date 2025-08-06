import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useGetAllReviews } from "./hooks/useGetAllReviews";

export default function AllReviewsPage() {
  const { reviews, loading, error, refresh } = useGetAllReviews();

  if (loading) {
    return <div>Loading all reviews...</div>;
  }

  if (error) {
    return (
      <div>
        <div>Error fetching reviews: {error}</div>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <h1>All Reviews</h1>
      <DataTable
        value={reviews}
        rowHover
        stripedRows
        removableSort
        emptyMessage={"There are currently no reviews."}
      >
        <Column
          header="Name"
          body={(row) => (row.type === "SONG" ? row.songName : row.albumName)}
          sortable
        />
        <Column
          field="type"
          header="Type"
          body={(row) => (
            <Tag
              value={row.type === "SONG" ? "Song" : "Album"}
              severity={row.type === "SONG" ? "success" : "info"}
            />
          )}
          sortable
        />

        <Column field="username" header="Username" sortable />
        <Column
          field="grade"
          header="Rating"
          body={(row) => <Rating value={row.grade} cancel={false} readOnly />}
          sortable
        />
        <Column field="description" header="Description" />
        <Column
          field="creationDate"
          header="Created"
          body={(row) => new Date(row.creationDate).toLocaleDateString("hr-HR")}
          sortable
        />
      </DataTable>
    </div>
  );
}
