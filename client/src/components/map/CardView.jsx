import React from 'react';

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react';

const CardView = ({ title, city, country, instruments, students, started }) => {
  return (
    <Card>
      <CardHeader>
        <Badge>Placeholder</Badge>
        <Heading size="md">{title}</Heading>
        <Text>
          {city}, {country}
        </Text>
      </CardHeader>

      <CardBody>
        <HStack>
          <Text>{instruments}</Text>
          <Text>{students}</Text>
          <Text>{started}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CardView;
