import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
// Utils
import { getUserData } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase-config";
import { UserType } from "../types/types";
import { getFavoriteIdsFromAsyncStorage } from "../utils/asyncstorage/getFavoriteIdsFromAsyncStorage";

type GlobalContextType = {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
  userSession: Session | null;
  setUserSession: (session: Session | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  shouldRefetchHome: boolean;
  setShouldRefetchHome: (shouldRefetchHome: boolean) => void;
  shouldRefetchProfile: boolean;
  setShouldRefetchProfile: (shouldRefetchProfile: boolean) => void;
  myFavoriteIds: { listing_id: string }[];
  setMyFavoriteIds: (favorites: { listing_id: string }[]) => void;
  myFavoriteIdsFromStorage: { listing_id: string }[];
  setMyFavoriteIdsFromStorage: (favorites: { listing_id: string }[]) => void;
  userData: UserType | null;
  setUserData: (user: any) => void;
  hasCameraPermission: boolean;
  setHasCameraPermission: (hasCameraPermission: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  isLogged: false,
  setIsLogged: () => {},
  userSession: null,
  setUserSession: () => {},
  loading: true,
  setLoading: () => {},
  shouldRefetchHome: false,
  setShouldRefetchHome: () => {},
  shouldRefetchProfile: false,
  setShouldRefetchProfile: () => {},
  myFavoriteIds: [],
  setMyFavoriteIds: () => {},
  myFavoriteIdsFromStorage: [],
  setMyFavoriteIdsFromStorage: () => {},
  userData: null,
  setUserData: () => {},
  hasCameraPermission: false,
  setHasCameraPermission: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [isLogged, setIsLogged] = useState(false);
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldRefetchHome, setShouldRefetchHome] = useState(false);
  const [shouldRefetchProfile, setShouldRefetchProfile] = useState(false);
  const [myFavoriteIds, setMyFavoriteIds] = useState<{ listing_id: string }[]>(
    []
  );
  const [myFavoriteIdsFromStorage, setMyFavoriteIdsFromStorage] = useState<
    { listing_id: string }[]
  >([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    try {
      supabase.auth.onAuthStateChange((event, session) => {
        setUserSession(session);
        setIsLogged(!!session);
      });
    } catch (error) {
      console.log("Error fetching user session", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userSession) {
      const fetchUserData = async () => {
        const userId = userSession.userId || userSession.user?.id;
        const data = await getUserData({ userId });
        if (data) {
          setUserData(data);
        }
      };

      fetchUserData();
    }
  }, [userSession]);

  useEffect(() => {
    const fetchFavoritesFromStorage = async () => {
      const data = await getFavoriteIdsFromAsyncStorage();
      if (data) {
        setMyFavoriteIdsFromStorage(data);
      }
    };

    fetchFavoritesFromStorage();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        userSession,
        setUserSession,
        loading,
        setLoading,
        shouldRefetchHome,
        setShouldRefetchHome,
        shouldRefetchProfile,
        setShouldRefetchProfile,
        myFavoriteIds,
        setMyFavoriteIds,
        myFavoriteIdsFromStorage,
        setMyFavoriteIdsFromStorage,
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
