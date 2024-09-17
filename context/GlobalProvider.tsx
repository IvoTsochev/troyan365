import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { getUserSession } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase-config";

type GlobalContextType = {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
  loggedUser: User | undefined;
  setLoggedUser: (user: User | undefined) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  isLogged: false,
  setIsLogged: () => {},
  loggedUser: undefined,
  setLoggedUser: () => {},
  session: null,
  setSession: () => {},
  loading: true,
  setLoading: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [isLogged, setIsLogged] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | undefined>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      const data = await getUserSession();
      setSession(data.session);
      setLoggedUser(data.session?.user);
    };

    try {
      fetchUserSession();
      supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setLoggedUser(session?.user);
      });
      setIsLogged(true);
    } catch (error) {
      console.log("Error fetching user session", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        loggedUser,
        setLoggedUser,
        session,
        setSession,
        loading,
        setLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
