import { Route, Routes } from "react-router";
import Layout from "./pages/Layout.tsx";
import ReviewsPage from "./pages/Reviews.page.tsx";
import SongsPage from "./features/songs/Songs.page.tsx";
import ProfilePage from "./features/profile/Profile.page.tsx";
import ErrorPage from "./pages/Error.page.tsx";
import UserReviewPage from "./pages/UserReview.page.tsx";
import AlbumsPage from "./features/albums/Albums.page.tsx";
import NewestReviewsPage from "./features/newest-reviews/NewestReviews.page.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<NewestReviewsPage />} />
        <Route path="/all-reviews" element={<ReviewsPage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/artists" element={<AlbumsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/user-review/:id" element={<UserReviewPage />} />

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
