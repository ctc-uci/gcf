import { useEffect, useState } from "react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  // TODO(login): Replace useParams userId with AuthContext (currentUser?.uid).
  const { userId } = useParams();
  const { backend } = useBackendContext();

  const [programAccountUpdatesData, setProgramAccountUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  // TODO(login): Replace with useRoleContext() or AuthContext instead of fetching role/${userId}.
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (path) => {
    try {
      const response = await backend.get(`/update-permissions/${path}`);
      return response.data;
    } catch (error) {
      console.error("Request failed:", path, error.response?.status, error.message);
      return [];
    }
  };

  useEffect(() => {
    if (!userId || !backend) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [programAccountUpdates, mediaUpdates, programUpdates, userRole] =
          await Promise.all([
            fetchData(`program-account/${userId}`),
            fetchData(`media-updates/${userId}`),
            fetchData(`program-updates/${userId}`),
            fetchData(`role/${userId}`),
          ]);

        setProgramAccountUpdatesData(programAccountUpdates);
        setMediaUpdatesData(mediaUpdates);
        setProgramUpdatesData(programUpdates);
        setRole(userRole[0]['role']);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend]);

  if (isLoading) {
    return <Center py={10}>
          <Spinner
            size="xl"
            color="gray.500"
          />
        </Center>; 
  } 

  return (
    <>
      {role === "Program Director" ? (
        <ProgramUpdatesTable data={programUpdatesData} isLoading={isLoading} />
      ) : (
        <>
          <MediaUpdatesTable data={mediaUpdatesData} isLoading={isLoading} />
          <ProgramAccountUpdatesTable data={programAccountUpdatesData} isLoading={isLoading} />
        </>
      )}
    </>
  );
};
