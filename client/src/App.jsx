import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home/Home";
import CreateUser from "./pages/User/CreateUser";
import UserList from "./pages/User/UserList";
import CreateListing from "./pages/CreateListing/CreateListing";
import Login from "./pages/User/Login";
import VerifyCode from "./pages/User/VerifyCode";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import { AuthProvider } from "./contexts/AuthContext";
import Favorites from "./pages/Favorites/Favorites";

const App = () => {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<UserList />} />
        <Route path="/user/create" element={<CreateUser />} />
        <Route path="/listing/create" element={<CreateListing />} />
        <Route path="/signup" element={<CreateUser />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
