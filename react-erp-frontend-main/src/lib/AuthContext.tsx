// AuthContext.tsx - provides user/auth state to the whole app via React context
// any component can call useAuth() to get the current user, role, login/logout, etc.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setToken, clearToken, getToken } from "./tokenStorage";
import * as authApi from "./authApi";

export interface AuthUser {
  userID: number;
  branchID: number;
  branchName: string;
  roleName: string;
  username: string;
  fullname: string;
  isActive: boolean;
  status: string;
  mustChangePassword: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: string | null;
  branchId: number | null;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// wraps the app so every child component can access auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // on first load, check if there's a saved token and validate it
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => {
        setUser({
          userID: Number(data.UserID),
          branchID: Number(data.BranchID),
          branchName: data.BranchName ?? "",
          roleName: data.RoleName,
          username: data.Username,
          fullname: data.Fullname ?? "",
          isActive: data.IsActive ?? true,
          status: data.Status ?? "Active",
          mustChangePassword: data.MustChangePassword ?? false,
        });
      })
      .catch(() => {
        // token expired or invalid, wipe it
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // POST /api/auth/login, store the token, then GET /api/auth/me for full details
  async function login(username: string, password: string): Promise<AuthUser> {
    const res = await authApi.login(username, password);
    setToken(res.AccessToken);

    const meData = await authApi.me();

    const authUser: AuthUser = {
      userID: meData.UserID,
      branchID: meData.BranchID,
      branchName: meData.BranchName ?? "",
      roleName: meData.RoleName,
      username: meData.Username,
      fullname: meData.Fullname,
      isActive: meData.IsActive ?? true,
      status: meData.Status ?? "Active",
      mustChangePassword: meData.MustChangePassword ?? false,
    };
    setUser(authUser);
    return authUser;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  function clearMustChangePassword() {
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.roleName ?? null,
        branchId: user?.branchID ?? null,
        isLoading,
        mustChangePassword: user?.mustChangePassword ?? false,
        login,
        logout,
        clearMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook to grab auth state - must be inside <AuthProvider>
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
