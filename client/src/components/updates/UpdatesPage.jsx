import { useEffect, useState } from "react";

import { Heading, Text } from "@chakra-ui/react";

import { MediaUpdatesTable } from "./MediaUpdatesTable";
import { ProgramAccountUpdatesTable } from "./ProgramAccountUpdatesTable";
import { ProgramUpdatesTable } from "./ProgramUpdatesTable";

export const UpdatesPage = () => {
  const [data, setData] = useState();

  useEffect(() => {
    fetch("http://localhost:3001/program-updates")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error("Fetch error: ", error);
      });
  });

  return (
    <>
      <Heading>Updates</Heading>
      <MediaUpdatesTable />
      <ProgramAccountUpdatesTable />
      <ProgramUpdatesTable />
      <Text>{JSON.stringify(data)}</Text>
    </>
  );
};
