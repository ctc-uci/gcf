import { EditIcon } from "@chakra-ui/icons";
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

import GcfGlobe from "/gcf_globe.png";

const CardView = ({ data, openEditForm }) => {
  return (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap={6}
    >
      {data.map((p) => (
        <GridItem key={p.id}>
          <Card
            w="auto"
            minW={324}
            minH={400}
            h="auto"
            br={20}
          >
            <CardHeader position="relative">
              <Text size="md"> {p.launchDate} </Text>
              <Text size="md"> {p.location} </Text>
              <Box
                position="absolute"
                top={2}
                right={2}
              >
                <IconButton
                  aria-label="edit"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditForm(p)}
                  bg="#808080"
                  borderRadius="full"
                  color="white"
                />
              </Box>
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
                />
              </Center>
              <Box
                position="absolute"
                bottom={15}
                right={2}
              >
                <Badge
                  p={2}
                  borderRadius="full"
                  bg="#808080"
                  color="white"
                >
                  {p.students} Students
                </Badge>
              </Box>
            </CardBody>
            <CardFooter
              bg="gray.200"
              w="100%"
              h="auto"
              minh="20%"
            >
              <VStack align="left">
                <Text> {p.title} </Text>
                <Flex
                  gap={3}
                  flexWrap="wrap"
                >
                  {p.programDirectors.map((d) => (
                    <Text
                      key={d.userId}
                      fontSize="sm"
                    >
                      {d.firstName} {d.lastName}
                    </Text>
                  ))}
                </Flex>
              </VStack>
            </CardFooter>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

export default CardView;
