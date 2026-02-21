import { useState } from "react";

import { EditIcon, EmailIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";

import GcfGlobe from "/gcf_globe.png";

export const CardView = ({ data }) => {
  const { backend } = useBackendContext();

  const RegionText = ({ id }) => {
    const [region, setRegion] = useState("");

    const fetch = async () => {
      const res = await backend.get(
        `/regional-directors/regional-director-region/${id}`
      );
      setRegion(res.data[0]?.name);
    };

    fetch();
    return <Text fontSize="sm">{region}</Text>;
  };

  return (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap={6}
    >
      {data.map((a) => (
        <GridItem key={a.id}>
          <Card
            w="auto"
            minW={324}
            minH={400}
            h="auto"
            br={20}
          >
            <CardHeader position="relative">
              <Box
                position="absolute"
                top={2}
                right={2}
              >
                {/* TODO: add ability to open the account edit form onClick */}
                <IconButton
                  aria-label="edit"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  bg="#808080"
                  borderRadius="full"
                  color="white"
                  //onClick={() => openEditForm(a)}
                />
              </Box>
              <Badge
                borderRadius="full"
                p={2}
                bg="#808080"
                color="white"
              >
                {a.role}
              </Badge>
            </CardHeader>
            <CardBody position="relative">
              <Center mt={10}>
                {/* TODO: replace GCF Globe with an image associated with the program */}
                <Image
                  src={GcfGlobe}
                  opacity="30%"
                  h={300}
                  position="absolute"
                  draggable="false"
                  alt="GCF Globe"
                  mt={10}
                />
              </Center>
            </CardBody>
            <CardFooter
              bg="gray.200"
              w="100%"
              h="auto"
              minh="20%"
            >
              <VStack align="left">
                <Text>
                  {a.firstName} {a.lastName}{" "}
                </Text>
                <VStack align="left">
                  <Flex
                    gap={3}
                    flexWrap="wrap"
                  >
                    {a.role === "Regional Director" ? (
                      <RegionText id={a.id} />
                    ) : (
                      a.programs.map((p) => <Text fontSize="sm">{p}</Text>)
                    )}
                  </Flex>
                </VStack>
              </VStack>
              <Box
                position="absolute"
                bottom={5}
                right={2}
              >
                <IconButton
                  aria-label="search"
                  icon={
                    <EmailIcon
                      w={5}
                      h={5}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  bg="#808080"
                  borderRadius="full"
                  color="white"
                  w={10}
                  h={10}
                />
              </Box>
            </CardFooter>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

export default CardView;
