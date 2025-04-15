import { Route, Routes } from "react-router";
import Layout from "./pages/Layout.tsx";
import ReviewsPage from "./pages/Reviews.page.tsx";
import SongsPage from "./pages/Songs.page.tsx";
import ProfilePage from "./pages/Profile.page.tsx";
import ErrorPage from "./pages/Error.page.tsx";
import UserReviewPage from "./pages/UserReview.page.tsx";
import AlbumsPage from "./pages/Albums.page.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ReviewsPage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/user-review/:id" element={<UserReviewPage />} />

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
