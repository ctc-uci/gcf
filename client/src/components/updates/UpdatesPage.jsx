import { useEffect, useState } from "react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const { userId } = useParams();
  const { backend } = useBackendContext();

  const [programAccountUpdatesData, setProgramAccountUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [role, setRole] = useState("");

  const fetchData = async (path) => {
    try {
      const response = await backend.get(`/update-permissions/${path}`);
      return response.data;
    } catch (error) {
      console.error("Request failed:", error.response?.status, error.message);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
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
        setRole(userRole.role);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    if (userId && backend) {
      loadData();
    }
  }, [userId, backend]);

  return (
    <>
      {role === "Program Director" ? (
        <ProgramUpdatesTable data={programUpdatesData} />
      ) : (
        <>
          <MediaUpdatesTable data={mediaUpdatesData} />
          <ProgramAccountUpdatesTable data={programAccountUpdatesData} />
        </>
      )}
    </>
  );
};
