import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SocketProvider } from "./contexts/SocketProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

import Favorites from "./pages/Favorites/Favorites";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import RequireVerified from "./components/RequireVerified";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Footer from "./components/Footer";
import Breadcrumbs from "./components/Breadcrumbs";
const Profile = lazy(() => import("./pages/Profile/Profile"));
const ProfileView = lazy(() => import("./pages/Profile/ProfileView"));
const ProfileSetup = lazy(() => import("./pages/Profile/ProfileSetup"));
const AccountSettings = lazy(
  () => import("./pages/AccountSettings/AccountSettings"),
);

// Lazy loaded components
const Home = lazy(() => import("./pages/Home/Home"));
const CreateUser = lazy(() => import("./pages/User/CreateUser"));
const Login = lazy(() => import("./pages/User/Login"));
const VerifyCode = lazy(() => import("./pages/User/VerifyCode"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/User/ResetPassword"));
const ListingDetail = lazy(() => import("./pages/ListingDetail/ListingDetail"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const Inbox = lazy(() => import("./pages/Inbox/Inbox"));
const EditListing = lazy(() => import("./pages/EditListing/EditListing"));
const MyListings = lazy(() => import("./pages/MyListings/MyListings"));
const UserList = lazy(() => import("./pages/User/UserList"));
const CreateListing = lazy(() => import("./pages/CreateListing/CreateListing"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const ListingManagement = lazy(() => import("./pages/Admin/ListingManagement"));
const ReportManagement = lazy(() => import("./pages/Admin/ReportManagement"));

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <NotificationProvider>
              <Nav />

              <div className="app-container">
                <Breadcrumbs />

                <main className="main-content">
                  <Suspense
                    fallback={
                      <div className="loading-fallback">Loading...</div>
                    }
                  >
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/user" element={<UserList />} />
                      <Route path="/listings/:id" element={<ListingDetail />} />
                      <Route path="/chat/:id" element={<Chat />} />
                      <Route path="/inbox" element={<Inbox />} />
                      <Route path="/verify-code" element={<VerifyCode />} />
                      <Route path="/favorites" element={<Favorites />} />

                      {/* Public Only Routes */}
                      <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<CreateUser />} />
                        <Route
                          path="/forgot-password"
                          element={<ForgotPassword />}
                        />
                        <Route
                          path="/reset-password"
                          element={<ResetPassword />}
                        />
                      </Route>

                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                        <Route element={<RequireVerified />}>
                          <Route
                            path="/listing/create"
                            element={<CreateListing />}
                          />
                          <Route
                            path="/listings/:id/edit"
                            element={<EditListing />}
                          />
                          <Route path="/my-listings" element={<MyListings />} />
                          <Route path="/profile" element={<ProfileView />} />
                          <Route
                            path="/profile/:id"
                            element={<ProfileView />}
                          />
                          <Route path="/profile/edit" element={<Profile />} />
                          <Route
                            path="/profile/setup"
                            element={<ProfileSetup />}
                          />
                          <Route
                            path="/account-settings"
                            element={<AccountSettings />}
                          />
                        </Route>
                      </Route>

                      {/* Admin Routes */}
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route
                          path="/admin/users"
                          element={<UserManagement />}
                        />
                        <Route
                          path="/admin/listings"
                          element={<ListingManagement />}
                        />
                        <Route
                          path="/admin/reports"
                          element={<ReportManagement />}
                        />
                      </Route>
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </NotificationProvider>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
