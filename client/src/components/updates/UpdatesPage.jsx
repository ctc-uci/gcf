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
    const response = await backend.get(`/update-permissions/${path}`);

    if (!response.ok) {
      const message = await response.text();
      console.error("Request failed:", response.status, message);
      return [];
    }
    return response.json();
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
        setRole(userRole[0].role);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    loadData();
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
