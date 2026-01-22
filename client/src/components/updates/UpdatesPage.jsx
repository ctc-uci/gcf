import { useEffect, useState } from "react";

import { Heading, Text } from "@chakra-ui/react";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const [programUpdatesData, setProgramUpdatesData] = useState();
  const [mediaUpdatesData, setMediaUpdatesData] = useState();
  const [programData, setProgramData] = useState();
  const [gcfUserData, setGcfUserData] = useState();

  useEffect(() => {
    const loadData = async () => {
      Promise.all([
        fetch("http://localhost:3001/program-updates")
          .then((res) => res.json())
          .then((data) => {
            setProgramUpdatesData(data);
          })
          .catch((error) => {
            console.error("Fetch error: ", error);
          }),
        fetch("http://localhost:3001/media-change")
          .then((res) => res.json())
          .then((data) => {
            setMediaUpdatesData(data);
          })
          .catch((error) => {
            console.error("Fetch error: ", error);
          }),
        fetch("http://localhost:3001/program")
          .then((res) => res.json())
          .then((data) => {
            setProgramData(data);
          })
          .catch((error) => {
            console.error("Fetch error: ", error);
          }),
        fetch("http://localhost:3001/gcf-user")
          .then((res) => res.json())
          .then((data) => {
            setGcfUserData(data);
          })
          .catch((error) => {
            console.error("Fetch error: ", error);
          }),
      ]);
    };

    loadData();
  }, []);

  return (
    <>
      <Heading>Updates</Heading>
      <MediaUpdatesTable />
      <ProgramAccountUpdatesTable />
      <ProgramUpdatesTable />
      <Text>{JSON.stringify(programUpdatesData)}</Text>
      <Text>{JSON.stringify(mediaUpdatesData)}</Text>
      <Text>{JSON.stringify(programData)}</Text>
      <Text>{JSON.stringify(gcfUserData)}</Text>
    </>
  );
};
