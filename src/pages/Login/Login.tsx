import React, { useState } from "react";
import axios from "axios";
import useUserStore from "../../entity/user/user.store";
import { useNavigate } from "react-router-dom";
import { URLs } from "../../app/router/router.scheme";

const Login: React.FC = () => {
  const { setUser } = useUserStore();
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/login", { id: userId });
      setUser(response.data);
      navigate(URLs.CHAT);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;