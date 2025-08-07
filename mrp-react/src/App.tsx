import { Route, Routes } from "react-router";
import Layout from "./pages/Layout.tsx";
import SongsPage from "./features/songs/Songs.page.tsx";
import NewestReviewsPage from "./features/newest-reviews/NewestReviews.page.tsx";
import AlbumsPage from "./features/albums/Albums.page.tsx";
import ProfilePage from "./features/profile/Profile.page.tsx";
import { LoginPage } from "./features/login-register/Login.page.tsx";
import UserReviewPage from "./pages/UserReview.page.tsx";
import ErrorPage from "./pages/Error.page.tsx";
import { ProtectedRoute } from "./shared/components/ProtectedRoute.tsx";
import { RegisterPage } from "./features/login-register/Register.page.tsx";
import AllReviewsPage from "./features/all-reviews/AllReviews.page.tsx";
import ArtistsPage from "./features/artists/Artists.page.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <NewestReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="all-reviews"
          element={
            <ProtectedRoute>
              <AllReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="songs"
          element={
            <ProtectedRoute>
              <SongsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="albums"
          element={
            <ProtectedRoute>
              <AlbumsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="artists"
          element={
            <ProtectedRoute>
              <ArtistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/user-review/:id" element={<UserReviewPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
