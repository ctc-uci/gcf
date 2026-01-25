import React, { useEffect, useState } from "react";

import {
  Table,
  TableCaption,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  TableContainer,
  Button,
  Link,
  AspectRatio
} from "@chakra-ui/react";

function AdminProgramTable() {
    const [adminPrograms, setAdminPrograms] = useState([])
    const [rdPrograms, setRdPrograms] = useState([])
    const [pdPrograms, setPdPrograms] = useState([])
    const role = "pd"; // hard coded role for now

    useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJson = async (url) => {
            const res = await fetch(url);
            const text = await res.text(); 
            if (!text) return [];          
            try {
                return JSON.parse(text); 
            } catch (err) {
                console.error(`Invalid JSON from ${url}:`, text, err);
                return [];
            }
        };

        if (role === "admin") {
            const programsData = await fetchJson("http://localhost:3001/program")
            const enrollmentData = await fetchJson("http://localhost:3001/enrollmentChange")
            const countryData = await fetchJson("http://localhost:3001/country")
            const instrumentData = await fetchJson("http://localhost:3001/instrument-change")

            const enrollmentMap = Object.fromEntries(
            enrollmentData.map((e) => [e.id, e])
            );

            const countryMap = Object.fromEntries(
            countryData.map((c) => [c.id, c])
            );

            const instrumentMap = Object.fromEntries(
            instrumentData.map((i) => [i.id, i])
            );


            const merged = programsData.map((p) => {
            const enrollmentInfo = enrollmentMap[p.id] || {};
            const countryInfo = countryMap[p.id] || {};
            const instrumentInfo = instrumentMap[p.id] || {};

            return {
                ...p,
                students: enrollmentInfo?.enrollmentChange ?? 0,
                country: countryInfo?.name ?? "Unknown",
                instruments: instrumentInfo?.amountChanged ?? 0,
            };
            });
            setAdminPrograms(merged);
        }

        if (role === "rd") {
            const programsData = await fetchJson("http://localhost:3001/program")
            const enrollmentData = await fetchJson("http://localhost:3001/enrollmentChange")
            const regionData = await fetchJson("http://localhost:3001/region")


            const enrollmentMap = Object.fromEntries(
            enrollmentData.map((e) => [e.id, e])
            );

            const programsMap = Object.fromEntries(
            programsData.map((p) => [p.id, p])
            );


            const merged = regionData.map((r) => {
            const enrollmentInfo = enrollmentMap[r.id] || {};
            const programInfo = programsMap[r.id] || {};

            return {
                ...r,
                students: enrollmentInfo?.enrollmentChange ?? 0,
                title: programInfo?.title ?? "Unknown",
                launchDate: programInfo?.launchDate ?? 0,
                status: programInfo?.status ?? "Unknown",
            };
            });
            setRdPrograms(merged);
        }

        if (role === "pd") {
            const res = await fetch("http://localhost:3001/program");
            const data = await res.json();
            setPdPrograms(data);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

    if (role === "admin") {
        return (
            <TableContainer>
            <Table variant = "simple">
                <TableCaption placement="top" textAlign="left" fontSize="xl">
                    All Students 
                    <Input w="30%" size="xs" placeholder="Type to search"></Input>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                </TableCaption>
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
                    {adminPrograms?.map((p) => (
                        <Tr key={p.id}>
                            <Td>{p.title}</Td>
                            <Td>{p.status}</Td>
                            <Td>{p.launchDate}</Td>
                            <Td>{p.country}</Td>
                            <Td>{p.students}</Td>
                            <Td>{p.amountChanged}</Td>
                            <Td>{p.totalInstruments}</Td>
                        </Tr>
                    ) )}
                </Tbody>
            </Table>
            </TableContainer>
        );
    }

    else if (role === "rd") {
        return (
            <TableContainer>
            <Table variant = "simple">
                <TableCaption placement="top" textAlign="left" fontSize="xl">
                    All Students 
                    <Input w="30%" size="xs" placeholder="Type to search"></Input>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                    <Button size="xs"></Button>
                </TableCaption>
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
                    {rdPrograms?.map((r) => (
                        <Tr key={r.id}>
                            <Td>{r.title}</Td>
                            <Td>{r.status}</Td>
                            <Td>{r.launchDate}</Td>
                            <Td>{r.region}</Td>
                            <Td>{r.students}</Td>
                            <Td>{r.instruments}</Td>
                            <Td>{r.totalInstruments}</Td>
                        </Tr>
                    ) )}
                </Tbody>
            </Table>
            </TableContainer>
        );
    }

    else if (role === "pd") {
        return (
            <h1>
                <h1>Lesson videos</h1>
                {pdPrograms?.map((p) => (
                    <AspectRatio>
                        <iframe onScrollCapture={p.playlistLink}/>
                    </AspectRatio>
                ))}
            </h1>
        );
    }

}

export default AdminProgramTable;