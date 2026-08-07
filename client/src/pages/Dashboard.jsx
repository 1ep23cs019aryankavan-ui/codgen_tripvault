import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // No token → login
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };


  if (!user) {
    return (
      <div className="container">
        <h2>Loading...</h2>
      </div>
    );
  }


  return (
    <div className="container">

      <div className="dashboard">

        <h1>TripVault</h1>

        <h2>
          Welcome, {user.name}! 👋
        </h2>

        <p>
          Email: {user.email}
        </p>

        <p>
          Your travel memories will appear here.
        </p>

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Dashboard;