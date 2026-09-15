import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./school";

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
  canEditHealth: boolean;
  canDeleteHealth: boolean;
  canEditStudents: boolean;
};

const RoleContext = createContext<RoleContextValue>({
  role: "encargado",
  setRole: () => {},
  canEditHealth: true,
  canDeleteHealth: true,
  canEditStudents: true,
});

const KEY = "paihuen-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("encargado");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Role | null;
    if (stored === "encargado" || stored === "educadora" || stored === "apoderado") {
      setRoleState(stored);
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    window.localStorage.setItem(KEY, r);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        canEditHealth: role === "encargado",
        canDeleteHealth: role === "encargado",
        canEditStudents: role !== "apoderado",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
