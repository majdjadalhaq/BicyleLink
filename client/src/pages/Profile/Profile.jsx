import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

const Profile = () => {
  const { user, login } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <h2>Please login first</h2>;

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);

      const res = await axios.put("/api/users/avatar", formData, {
        withCredentials: true,
      });

      login(res.data.user);
      setLoading(false);
      alert("Photo updated successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Profile</h1>

      <img
        src={
          user.avatarUrl ? user.avatarUrl : "https://via.placeholder.com/120"
        }
        alt="avatar"
        width="120"
        height="120"
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />

      <h3>{user.name}</h3>
      <p>{user.email}</p>

      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>
          {loading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
