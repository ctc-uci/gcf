import { useContext, useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

//import { BackendContext } from "../../../../server/routes/updatesPermissions";
import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const { userId } = useParams();

  const [programAccountUpdatesData, setProgramAccountUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [role, setRole] = useState("");

  const fetchData = async (path) => {
    const response = await fetch(
      `http://localhost:3001/update-permissions/${path}`
    );

    if (!response.ok) {
      const message = await response.text();
      console.error("Request failed:", response.status, message);
      return [];
    }
    return response.json();
  };

  const memoizedData = useMemo(() => {
    try {
      return Promise.all([
        fetchData(`program-account/${userId}`),
        fetchData(`media-updates/${userId}`),
        fetchData(`program-updates/${userId}`),
        fetchData(`role/${userId}`),
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [userId]);

  useEffect(() => {
    memoizedData.then(
      ([programAccountUpdates, mediaUpdates, programUpdates, userRole]) => {
        setProgramAccountUpdatesData(programAccountUpdates);
        setMediaUpdatesData(mediaUpdates);
        setProgramUpdatesData(programUpdates);
        setRole(userRole[0].role);
      }
    );
  }, [memoizedData]);

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
