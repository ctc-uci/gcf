import React from 'react';

import { Card, CardBody, CardFooter, CardHeader } from '@chakra-ui/react';

const CardView = ({ title, country, instruments, students, started }) => {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>

      <CardBody></CardBody>
    </Card>
  );
};

export default CardView;
