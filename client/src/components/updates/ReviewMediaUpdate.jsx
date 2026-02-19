import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  Flex,
  Text,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ReviewMediaUpdate = ({ update, onClose, onUpdate }) => {
  const { backend } = useBackendContext();

  const handleApprove = async () => {
    await backend.put(`/mediaChange/${update.updateId}/approve`);
    onUpdate(prev =>
      prev.map(row =>
        row.updateId === update.updateId ? { ...row, status: "approved" } : row
      )
    );
    onClose();
  };

  const handleArchive = async () => {
    await backend.put(`/mediaChange/${update.updateId}/archive`);
    onUpdate(prev =>
      prev.map(row =>
        row.updateId === update.updateId ? { ...row, status: "denied" } : row
      )
    );
    onClose();
  };

  const handleDeny = async () => {
    await backend.delete(`/mediaChange/${update.updateId}/deny`);
    onUpdate(prev => prev.filter(row => row.updateId !== update.updateId));
    onClose();
  };

  return (
    <Drawer isOpen={true} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold">Review Media Update</Text>
            <Flex gap={2}>
              <Button onClick={handleApprove}>Approve</Button>
              <Button onClick={handleArchive}>Archive</Button>
              <Button onClick={handleDeny}>Deny</Button>
            </Flex>
          </Flex>
        </DrawerHeader>

        <DrawerBody>
          <Flex gap={10} mb={6}>
            <Box>
              <Text fontSize="sm">Time</Text>
              <Text>{update.updateDate}</Text>
            </Box>
            <Box>
              <Text fontSize="sm">Author</Text>
              <Text>{update.firstName} {update.lastName}</Text>
            </Box>
            <Box>
              <Text fontSize="sm">Program Name</Text>
              <Text>{update.programName}</Text>
            </Box>
          </Flex>

          <Text fontSize="sm" mb={3}>Media</Text>
          <SimpleGrid columns={3} spacing={3}>
            {/* media will go here once S3 is sorted */}
          </SimpleGrid>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};