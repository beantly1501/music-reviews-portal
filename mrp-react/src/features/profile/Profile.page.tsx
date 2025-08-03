import { MOCK_REVIEWS, useCurrentUser, useLogout } from "@shared/utils";
import { SongOrAlbumEnum } from "@shared/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router";
import { Button } from "primereact/button";

export default function ProfilePage() {
  const navigate = useNavigate();

  const { user, loading, error, refresh } = useCurrentUser();
  const logout = useLogout();

  if (loading) return <div>Loading...</div>;

  if (!user || error)
    return (
      <div>
        <div>Error: {error}</div>
        <button onClick={refresh}>Retry</button>
      </div>
    );

  return (
    <div>
      <div>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <Button onClick={logout} label="Log out" />
      </div>

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
