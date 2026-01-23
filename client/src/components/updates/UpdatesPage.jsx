import { useEffect, useState } from "react";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";

// import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [gcfUserData, setGcfUserData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [programUpdatesRes, mediaUpdatesRes, programRes, usersRes] =
          await Promise.all([
            fetch("http://localhost:3001/program-updates").then((res) =>
              res.json()
            ),
            fetch("http://localhost:3001/mediaChange").then((res) =>
              res.json()
            ),
            fetch("http://localhost:3001/program").then((res) => res.json()),
            fetch("http://localhost:3001/gcf-users").then((res) => res.json()),
          ]);

        setProgramUpdatesData(programUpdatesRes);
        setMediaUpdatesData(mediaUpdatesRes);
        setProgramData(programRes);
        setGcfUserData(usersRes);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <MediaUpdatesTable
        mediaUpdatesData={mediaUpdatesData}
        programUpdatesData={programUpdatesData}
        programData={programData}
        gcfUserData={gcfUserData}
      ></MediaUpdatesTable>
      <ProgramAccountUpdatesTable
        programData={programUpdatesData}
        gcfUserData={gcfUserData}
        program={programData}
      ></ProgramAccountUpdatesTable>
    </>
  );
};
