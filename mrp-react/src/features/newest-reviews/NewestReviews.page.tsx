import { useGetNewestRatings } from "./hooks/useGetNewestReviews.ts";

export default function SongsPage() {
  const { reviews, loading, error } = useGetNewestRatings(20);

  if (loading) return <div>Loading newest reviews...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <ul>
      {reviews.map((r) => (
        <li key={`${r.type}-${r.id}`}>
          <strong>{r.type === "SONG" ? "Song" : "Album"} Review</strong> by{" "}
          {r.username} on {new Date(r.creationDate).toLocaleDateString()} —
          Grade: {r.grade} <br />
          {r.description}
        </li>
      ))}
    </ul>
  );
}
