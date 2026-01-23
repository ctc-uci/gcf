import React from "react";

import {
  Table,
  TableCaption,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

/* IN MAIN PAGE
import SearchBar from "@dashboard/SearchBar"

const filterPrograms = programs.filter((p) =>
    p.program.toLowerCase().includes(SearchBar.toLowerCase())
);

*/

function lessonVideos({videos}) {
    return (
        <Table variant = "simple">
            <TableCaption placement="top">All Students</TableCaption>
            <Thead>
                <Tr>
                    <Th>Program</Th>
                    <Th>Status</Th>
                    <Th>Launch Date</Th>
                    <Th>Location</Th>
                    <Th>Students</Th>
                    <Th>Instruments</Th>
                    <Th>Total Instruments</Th>
                </Tr>
            </Thead>
            <Tbody>
                {programs?.map((p) => (
                    <Tr key={p.id}>
                        <Td>{p.program}</Td>
                        <Td>{p.status}</Td>
                        <Td>{p.launchDate}</Td>
                        <Td>{p.location}</Td>
                        <Td>{p.students}</Td>
                        <Td>{p.instruments}</Td>
                        <Td>{p.totalInstruments}</Td>
                    </Tr>
                ) )}
            </Tbody>
        </Table>
    );
}

export default lessonVideos;