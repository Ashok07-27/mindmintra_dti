import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mindmitra-user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("mindmitra-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mindmitra-user");
    }
  }, [user]);

  const login = (payload) => {
    localStorage.setItem("mindmitra-token", payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("mindmitra-token");
    localStorage.removeItem("mindmitra-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}



