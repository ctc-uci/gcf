import {  Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { Box } from '@chakra-ui/react';

export const Dummy = () => {
  return (
    <Box flexDirection="column">
        <Navbar role="admin" />
        <Sidebar role="project_director" />
    </Box>
  )
}