import { EditIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Stack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import GcfGlobe from '/gcf_globe.png';

const CardView = ({ data, openEditForm }) => {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
      }}
      gap={6}
    >
      {data.map((p) => (
        <GridItem key={p.id}>
          <Card
            w="auto"
            minW={324}
            minH={340}
            h="auto"
            br={20}
          >
            <CardHeader position="relative">
              <Tag
                size="md"
                borderRadius="md"
                color="#488181"
                bg="#d8f2f2"
              >
                {p.status}
              </Tag>
              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
              >
                LAUNCH DATE
              </Text>
              <Text size="md">
                {new Date(p.launchDate).toLocaleDateString('en-US', {})}
              </Text>
              <Text
                mt="2"
                fontSize="lg"
                fontWeight="semibold"
                color="#1d2026"
              >
                {p.title}
              </Text>
              <Text mb="0">{p.location}</Text>

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

            <Divider orientation="horizontal" />

            <CardBody position="relative">
              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                pb="2px"
              >
                STUDENTS
              </Text>

              <HStack height="25px">
                <Text>{p.students} Total</Text>
                <Divider orientation="vertical" />
                <Text>{p.students} Graduated</Text>
              </HStack>

              <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="semibold"
                mt="4"
                pb="9px"
              >
                INSTRUMENTS
              </Text>

              <HStack height="25px">
                <Text>{p.totalInstruments} Total</Text>
                <Divider orientation="vertical" />
                {Array.isArray(p.instrumentsMap)
                  ? p.instrumentsMap.map((d, idx) => (
                      <Box
                        key={`${d.name}-${d.quantity}-${idx}`}
                        bg="#E9D8FD"
                        px={3}
                        py={1}
                        borderRadius="lg"
                      >
                        {d.name} {d.quantity}
                      </Box>
                    ))
                  : null}
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

export default CardView;
