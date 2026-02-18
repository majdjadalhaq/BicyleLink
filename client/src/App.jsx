import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import { AuthProvider } from "./contexts/AuthContext";

import Favorites from "./pages/Favorites/Favorites";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireVerified from "./components/RequireVerified";

import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";

// Lazy loaded components
const Home = lazy(() => import("./pages/Home/Home"));
const CreateUser = lazy(() => import("./pages/User/CreateUser"));
const UserList = lazy(() => import("./pages/User/UserList"));
const CreateListing = lazy(() => import("./pages/CreateListing/CreateListing"));
const Login = lazy(() => import("./pages/User/Login"));
const VerifyCode = lazy(() => import("./pages/User/VerifyCode"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/User/ResetPassword"));
const ListingDetail = lazy(() => import("./pages/ListingDetail/ListingDetail"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const Inbox = lazy(() => import("./pages/Inbox/Inbox"));
const EditListing = lazy(() => import("./pages/EditListing/EditListing"));
const MyListings = lazy(() => import("./pages/MyListings/MyListings"));

const App = () => {
  return (
    <AuthProvider>
      <Nav />
      <div className="app-container">
        <Breadcrumbs />
        <main className="main-content">
          <Suspense
            fallback={<div className="loading-fallback">Loading...</div>}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/user" element={<UserList />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/verify-code" element={<VerifyCode />} />

              {/* Public Only Routes */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<CreateUser />} />
                <Route path="/user/create" element={<CreateUser />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              <Route path="/favorites" element={<Favorites />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RequireVerified />}>
                  <Route path="/listing/create" element={<CreateListing />} />
                  <Route path="/listings/:id/edit" element={<EditListing />} />
                  <Route path="/my-listings" element={<MyListings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer />
    </AuthProvider>
  );
};

export default App;
