import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { getUserSession, getMyFavoriteListingIds } from "../lib/supabase";
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
  shouldRefetchHome: boolean;
  setShouldRefetchHome: (shouldRefetchHome: boolean) => void;
  shouldRefetchProfile: boolean;
  setShouldRefetchProfile: (shouldRefetchProfile: boolean) => void;
  myFavoriteIds: { listing_id: string }[];
  setMyFavoriteIds: (favorites: { listing_id: string }[]) => void;
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
  shouldRefetchHome: false,
  setShouldRefetchHome: () => {},
  shouldRefetchProfile: false,
  setShouldRefetchProfile: () => {},
  myFavoriteIds: [],
  setMyFavoriteIds: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [isLogged, setIsLogged] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | undefined>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldRefetchHome, setShouldRefetchHome] = useState(false);
  const [shouldRefetchProfile, setShouldRefetchProfile] = useState(false);
  const [myFavoriteIds, setMyFavoriteIds] = useState<{ listing_id: string }[]>(
    []
  );

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

  useEffect(() => {
    if (session) {
      const fetchFavorites = async () => {
        const data = await getMyFavoriteListingIds({ userId: session.user.id });
        if (data) {
          setMyFavoriteIds(data);
        }
      };

      fetchFavorites();
    }
  }, [session]);

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
        shouldRefetchHome,
        setShouldRefetchHome,
        shouldRefetchProfile,
        setShouldRefetchProfile,
        myFavoriteIds,
        setMyFavoriteIds,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
