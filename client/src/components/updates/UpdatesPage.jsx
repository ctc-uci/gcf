import { useEffect, useState, useMemo } from "react";

import { useParams } from "react-router-dom";

// import { MediaUpdatesTable } from "./MediaUpdatesTable";
// import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
// import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const { userId } = useParams();

  const [programAccountUpdatesData, setProgramAccountUpdatesData] = useState([]);
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);

  const fetchData = async ( path ) => {
    const response = await fetch(`http://localhost:3001/${path}`);
    return response.json();
  }

  const memoizedData = useMemo(() => {
    try {
      return Promise.all([
            fetchData(`/program-account/${userId}`),
            fetchData(`/media-updates/${userId}`),
            fetchData(`/program-updates/${userId}`),
          ])
    } catch (error) {
      console.error("Fetch error:", error);
    }
  });

  useEffect(() => {
    memoizedData.then(([ programAccountUpdates, mediaUpdates, programUpdates ]) => {
      setProgramUpdatesData(programAccountUpdates);
      setMediaUpdatesData(mediaUpdates);
      setProgramUpdatesData(programUpdates);
    });
  }, [memoizedData]);



  const currentUser = gcfUserData[userId];

  let visibleMediaUpdates = [];
  let visibleProgramUpdates = [];

  const programUpdatesById = Object.fromEntries(
    programUpdatesData.map((p) => [p.id, p])
  );
  const programsById = Object.fromEntries(programData.map((p) => [p.id, p]));
  const countriesById = Object.fromEntries(countryData.map((p) => [p.id, p]));
  const regionsById = Object.fromEntries(regionData.map((p) => [p.id, p]));
  const regionalDirectorsById = Object.fromEntries(
    regionalDirectorsData.map((p) => [p.id, p])
  );

  switch (currentUser?.role) {
    case "Admin":
      visibleMediaUpdates = mediaUpdatesData;
      visibleProgramUpdates = programUpdatesData;
      break;
    case "Regional Director":
      visibleProgramUpdates = programUpdatesData.filter(
        (row) =>
          regionsById[countriesById[programsById[row.programId].country].id] ===
          regionalDirectorsById[currentUser.id].regionId
      );
      visibleMediaUpdates = mediaUpdatesData.filter(
        (row) =>
          regionsById[
            countriesById[
              programsById[programUpdatesById[row.updateId].programId].country
            ].id
          ] === regionalDirectorsById[currentUser.id].regionId
      );
      break;
    default: // Project Director test
      visibleProgramUpdates = programUpdatesData.filter(
        (row) => row.createdBy === userId
      );
  }

  return (
    <>
      {/* <MediaUpdatesTable
        mediaUpdatesData={visibleMediaUpdates}
        programUpdatesData={visibleProgramUpdates}
        programData={programData}
        gcfUserData={gcfUserData}
      />
      <ProgramAccountUpdatesTable
        programData={visibleProgramUpdates}
        gcfUserData={gcfUserData}
        program={programData}
      /> */}
      {/* <ProgramUpdatesTable
        programUpdatesData={visibleProgramUpdates}
        gcfUserData={gcfUserData}
        programData={programData}
      /> */}
    </>
  );
};
