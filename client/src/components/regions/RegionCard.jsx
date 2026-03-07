import {
    Card,
    CardHeader,
    CardBody,
    Text
} from '@chakra-ui/react'

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useEffect, useState } from "react";

export const RegionCard = ({ region }) => {
    const { backend } = useBackendContext();
    const [regionalDirector, setRegionalDirector] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await backend.get(`/regional-directors/region/${region.id}/`);
                const regionalDirector = res.data ? res.data : null;
                setRegionalDirector(regionalDirector);
            } catch (err) {
                console.error("Error fetching regional director:", err);
            }
        };

    fetchData();
    }, [region.id, backend]);

    return (
        <Card>
            <CardHeader>{region.name}</CardHeader>
            <CardBody>
                <Text>Regional Director: {regionalDirector ? regionalDirector["firstName"] : "N/A"} {regionalDirector ? regionalDirector["lastName"] : ""}</Text>
            </CardBody>
        </Card>
    );
}