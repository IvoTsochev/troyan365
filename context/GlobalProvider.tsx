import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
// Utils
import {
  getUserSession,
  getMyFavoriteListingIds,
  getUserData,
} from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase-config";
import { UserType } from "../types/types";

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
  userData: UserType | undefined;
  setUserData: (user: any) => void;
  hasCameraPermission: boolean;
  setHasCameraPermission: (hasCameraPermission: boolean) => void;
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
  userData: undefined,
  setUserData: () => {},
  hasCameraPermission: false,
  setHasCameraPermission: () => {},
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
  const [userData, setUserData] = useState<UserType | undefined>();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

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

      const fetchUserData = async () => {
        const data = await getUserData({ userId: session.user.id });
        if (data) {
          setUserData(data);
        }
      };

      fetchFavorites();
      fetchUserData();
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
        userData,
        setUserData,
        hasCameraPermission,
        setHasCameraPermission,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
