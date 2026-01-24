import { useEffect, useState } from "react";

import { getAuth } from "firebase/auth";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [gcfUserData, setGcfUserData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [regionalDirectorsData, setRegionalDirectorsData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          programUpdatesRes,
          mediaUpdatesRes,
          programRes,
          usersRes,
          countryRes,
          regionRes,
          regionalDirectorRes,
        ] = await Promise.all([
          fetch("http://localhost:3001/program-updates").then((res) =>
            res.json()
          ),
          fetch("http://localhost:3001/mediaChange").then((res) => res.json()),
          fetch("http://localhost:3001/program").then((res) => res.json()),
          fetch("http://localhost:3001/gcf-users").then((res) => res.json()),
          fetch("http://localhost:3001/country").then((res) => res.json()),
          fetch("http://localhost:3001/region").then((res) => res.json()),
          fetch("http://localhost:3001/regional-directors").then((res) =>
            res.json()
          ),
        ]);

        setProgramUpdatesData(programUpdatesRes);
        setMediaUpdatesData(mediaUpdatesRes);
        setProgramData(programRes);
        setGcfUserData(usersRes);
        setCountryData(countryRes);
        setRegionData(regionRes);
        setRegionalDirectorsData(regionalDirectorRes);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    loadData();
  }, []);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  let visibleMediaUpdates = [];
  let visibleProgramUpdates = [];

  // const usersById = Object.fromEntries(gcfUserData.map((u) => [u.id, u]));
  const programUpdatesById = Object.fromEntries(
    programUpdatesData.map((p) => [p.id, p])
  );
  const programsById = Object.fromEntries(programData.map((p) => [p.id, p]));
  const countriesById = Object.fromEntries(countryData.map((p) => [p.id, p]));
  const regionsById = Object.fromEntries(regionData.map((p) => [p.id, p]));
  const regionalDirectorsById = Object.fromEntries(
    regionalDirectorsData.map((p) => [p.id, p])
  );

  switch (user?.role) {
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
    default: // Project Director
      visibleProgramUpdates = programUpdatesData.filter(
        (row) => row.createdBy === currentUser.id
      );
  }

  return (
    <>
      <MediaUpdatesTable
        mediaUpdatesData={visibleMediaUpdates}
        programUpdatesData={visibleProgramUpdates}
        programData={programData}
        gcfUserData={gcfUserData}
      />
      <ProgramAccountUpdatesTable
        programData={visibleProgramUpdates}
        gcfUserData={gcfUserData}
        program={programData}
      />
      <ProgramUpdatesTable
        programUpdatesData={visibleProgramUpdates}
        gcfUserData={gcfUserData}
      />
    </>
  );
};
