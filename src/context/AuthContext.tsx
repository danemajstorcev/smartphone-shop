import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "nexphone_users";
const SESSION_KEY = "nexphone_session";

function avatarColor(email: string): string {
  const colors = [
    "#00d8ff",
    "#7c3aed",
    "#00e699",
    "#ff6b35",
    "#f5c842",
    "#ff4060",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++)
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession());

  useEffect(() => {
    saveSession(user);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!found)
      return { ok: false, error: "No account found with this email." };
    if (found.passwordHash !== simpleHash(password))
      return { ok: false, error: "Incorrect password." };
    const { passwordHash: _, ...publicUser } = found;
    setUser(publicUser);
    return { ok: true };
  }, []);

  const signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
    ) => {
      await new Promise((r) => setTimeout(r, 700));
      const users = getStoredUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return {
          ok: false,
          error: "An account with this email already exists.",
        };
      }
      const newUser: StoredUser = {
        id: Date.now().toString(36),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        avatar: avatarColor(email),
        createdAt: new Date().toISOString(),
        passwordHash: simpleHash(password),
      };
      saveUsers([...users, newUser]);
      const { passwordHash: _, ...publicUser } = newUser;
      setUser(publicUser);
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const updateProfile = useCallback(
    (data: Partial<Pick<User, "firstName" | "lastName">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...data };
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === prev.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...data };
          saveUsers(users);
        }
        return updated;
      });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
