import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const useUserInfo = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState("loading");
  const getUserInfo = () => {
    if (sessionStatus === "loading") {
      return;
    }
    if (!session?.user?.id) {
      setStatus("unauthenticated");
      return "";
    }
    fetch("/api/users?id=" + session.user.id).then((response) => {
      response.json().then((json) => {
        setUserInfo(json.user);
        setStatus("authenticated");
      });
    });
  };
  useEffect(() => {
    getUserInfo();
  }, [sessionStatus]);
  return { userInfo, setUserInfo, status };
};

export default useUserInfo;
