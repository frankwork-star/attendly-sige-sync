import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./school";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type RoleContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role;
  isAdmin: boolean;
  canEditHealth: boolean;
  canDeleteHealth: boolean;
  canEditStudents: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue>({
  loading: true,
  session: null,
  user: null,
  profile: null,
  role: "apoderado",
  isAdmin: false,
  canEditHealth: false,
  canDeleteHealth: false,
  canEditStudents: false,
  refresh: async () => {},
  signOut: async () => {},
});

const PRIORITY: Role[] = ["encargado", "educadora", "apoderado"];

function pickRole(roles: string[]): Role {
  for (const r of PRIORITY) if (roles.includes(r)) return r;
  return "apoderado";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role>("apoderado");

  const load = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      setRole("apoderado");
      setLoading(false);
      return;
    }
    const userId = nextSession.user.id;
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile(profileRes.data ?? null);
    setRole(pickRole((rolesRes.data ?? []).map((r) => r.role as string)));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void load(nextSession);
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load, queryClient]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session);
  }, [load]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole("apoderado");
  }, [queryClient]);

  const value = useMemo<RoleContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      role,
      isAdmin: role === "encargado",
      canEditHealth: role === "encargado",
      canDeleteHealth: role === "encargado",
      canEditStudents: Boolean(session) && role !== "apoderado",
      refresh,
      signOut,
    }),
    [loading, session, profile, role, refresh, signOut],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
