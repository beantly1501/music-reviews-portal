import { MOCK_REVIEWS } from "../utils/constants.tsx";
import { SongOrAlbumEnum } from "../utils/enums.tsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function ProfilePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/health");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data, "response data");
      } catch (err) {
        console.error("Error fetching health check:", err);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div>
      <h1>My reviews:</h1>

      <div>
        <DataTable
          value={MOCK_REVIEWS}
          rowHover
          stripedRows
          removableSort
          onRowClick={(e) =>
            navigate(`/user-review/${e.data.id}`, {
              state: { review: MOCK_REVIEWS[e.data.id - 1] },
            })
          }
        >
          <Column field="name" header="Name" sortable></Column>

          <Column
            header="Image"
            body={(value) => (
              <img
                src={value.image}
                alt={"cat_img"}
                className="w-6rem shadow-2 border-round"
              />
            )}
          ></Column>

          <Column
            field="rating"
            header="Rating"
            body={(value) => (
              <Rating value={value.rating} cancel={false} readOnly />
            )}
            sortable
          ></Column>
          <Column
            header="Type"
            body={(value) => (
              <Tag
                value={
                  value.songOrAlbum === SongOrAlbumEnum.SONG ? "Song" : "Album"
                }
                severity={
                  value.songOrAlbum === SongOrAlbumEnum.SONG
                    ? "success"
                    : "info"
                }
              />
            )}
          ></Column>
          <Column field="username" header="Username" sortable></Column>
        </DataTable>
      </div>
    </div>
  );
}
