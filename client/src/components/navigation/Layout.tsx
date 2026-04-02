import { Box, Flex } from '@chakra-ui/react';

import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <Flex
      bg="gray.50"
      minHeight="100vh"
      padding={6}
      gap={6}
    >
      <Sidebar />
      <Box
        flex="1"
        minW={0}
        display="flex"
        flexDirection="column"
      >
        <Navbar />
        <Box
          as="main"
          mt={6}
          flex="1"
          minW={0}
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
