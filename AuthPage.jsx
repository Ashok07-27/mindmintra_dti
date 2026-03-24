import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "./api";
import { useAuth } from "./AuthContext";

const defaultForm = {
  username: "",
  email: "",
  password: "",
  tags: "anxiety, stress",
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const allowedOrigins = [
      "http://127.0.0.1:5000",
      "http://localhost:5000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ];
    const isWrongAppOrigin =
      window.location.protocol === "file:" ||
      (import.meta.env.PROD && !allowedOrigins.includes(window.location.origin));

    if (isWrongAppOrigin) {
      setError(
        `Open the app from Live Server at http://127.0.0.1:5500 or from the Node app at http://127.0.0.1:5000 instead of ${window.location.origin || "this file"}.`
      );
      return;
    }

    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      };
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, payload);
      login(data);
      navigate("/");
    } catch (requestError) {
      if (!requestError.response) {
        setError("Cannot reach the server. Please make sure the backend is running.");
        return;
      }

      if (requestError.response?.data?.code === "USER_EXISTS") {
        setIsLogin(true);
        setNotice("That email is already registered. Please log in with the same email and password.");
        return;
      }

      const status = requestError.response?.status;
      const apiMessage =
        requestError.response?.data?.message ||
        (typeof requestError.response?.data === "string"
          ? requestError.response.data
          : "");

      if (status === 404) {
        setError("API not found. Open the app at http://127.0.0.1:5000 and make sure the backend server is running.");
        return;
      }

      setError(apiMessage || `Request failed with status ${status}.`);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setNotice("");

    if (!form.email || !form.password) {
      setError("Enter your email and the new password you want to use, then try again.");
      return;
    }

    try {
      setIsResetting(true);
      const { data } = await api.post("/auth/reset-password", {
        email: form.email,
        newPassword: form.password,
      });

      setNotice(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset the password right now.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card w-full p-8 md:p-10"
        >
          <p className="text-lg font-semibold text-bloom md:text-xl">
            MindMitra: Design of Digital Peer-Support Platform for Student Well-Being
          </p>
        </motion.div>
      </section>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card my-auto p-8"
      >
        <div className="mb-6 flex rounded-full bg-sky-50 p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold ${isLogin ? "bg-white text-ink shadow" : "text-slate-500"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold ${!isLogin ? "bg-white text-ink shadow" : "text-slate-500"}`}
          >
            Register
          </button>
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Username
            </label>
            <input
              className="soft-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              required={!isLogin}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            className="soft-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Password
          </label>
          <input
            className="soft-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Support Tags
            </label>
            <input
              className="soft-input"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="anxiety, stress, loneliness"
            />
          </div>
        )}

        {notice && <p className="mb-4 text-sm font-medium text-calm">{notice}</p>}
        {error && <p className="mb-4 text-sm font-medium text-rose-500">{error}</p>}

        {isLogin && (
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting}
            className="mb-4 text-sm font-medium text-bloom underline-offset-4 transition hover:underline disabled:opacity-60"
          >
            {isResetting ? "Resetting password..." : "Reset password using the email and password above"}
          </button>
        )}

        <button className="primary-btn w-full">
          {isLogin ? "Enter MindMitra" : "Create My Safe Space"}
        </button>
      </motion.form>
    </div>
  );
}



