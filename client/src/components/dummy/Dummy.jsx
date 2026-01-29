import {  Sidebar } from '@/components/navigation/Sidebar';
import { Navbar } from '@/components/navigation/Navbar';
import { Box } from '@chakra-ui/react';

export const Dummy = () => {
  return (
    <Box flexDirection="column">
        {/* TODO: change placeholder role props */}
        <Navbar role="regional_director" />
        <Sidebar role="regional_director" />
    </Box>
  )
}