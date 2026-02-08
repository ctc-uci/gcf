import { useEffect, useState } from "react";

import { Center, Spinner } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [programAccountUpdatesData, setProgramAccountUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (path) => {
    try {
      const response = await backend.get(`/update-permissions/${path}`);
      return response.data;
    } catch (error) {
      console.error(
        "Request failed:",
        path,
        error.response?.status,
        error.message
      );
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
        const [programAccountUpdates, mediaUpdates, programUpdates] =
          await Promise.all([
            fetchData(`program-account/${userId}`),
            fetchData(`media-updates/${userId}`),
            fetchData(`program-updates/${userId}`),
          ]);

        setProgramAccountUpdatesData(programAccountUpdates);
        setMediaUpdatesData(mediaUpdates);
        setProgramUpdatesData(programUpdates);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner
          size="xl"
          color="gray.500"
        />
      </Center>
    );
  }

  return (
    <>
      {role === "Program Director" ? (
        <ProgramUpdatesTable
          data={programUpdatesData}
          isLoading={isLoading}
        />
      ) : (
        <>
          <MediaUpdatesTable
            data={mediaUpdatesData}
            isLoading={isLoading}
          />
          <ProgramAccountUpdatesTable
            data={programAccountUpdatesData}
            isLoading={isLoading}
          />
        </>
      )}
    </>
  );
};
