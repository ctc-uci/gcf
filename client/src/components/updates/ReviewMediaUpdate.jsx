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
  Alert,
  AlertIcon,
  CloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ReviewMediaUpdate = ({ update, onClose, onUpdate }) => {
  const { backend } = useBackendContext();
  const [message, setMessage] = useState(null);
  const updateId = update?.id;

  const handleApprove = async () => {
    if (updateId == null) return;
    try {
      await backend.put(`/mediaChange/${updateId}/approve`);
      onUpdate(prev =>
        prev.map(row =>
          row.id === updateId ? { ...row, status: "approved" } : row
        )
      );
      setMessage("Media update approved successfully.");
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage("Failed to approve. Please try again.");
    }
  };

  const handleArchive = async () => {
    if (updateId == null) return;
    try {
      await backend.put(`/mediaChange/${updateId}/archive`);
      onUpdate(prev =>
        prev.map(row =>
          row.id === updateId ? { ...row, status: "denied" } : row
        )
      );
      setMessage("Media update archived successfully.");
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage("Failed to archive. Please try again.");
    }
  };

  const handleDeny = async () => {
    if (updateId == null) return;
    try {
      await backend.delete(`/mediaChange/${updateId}/deny`);
      onUpdate(prev => prev.filter(row => row.id !== updateId));
      setMessage("Media update denied and deleted.");
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage("Failed to deny. Please try again.");
    }
  };

  return (
    <Drawer isOpen={true} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold">Review Media Update</Text>
            <Flex gap={2} alignItems="center">
              <Button onClick={handleApprove}>Approve</Button>
              <Button onClick={handleArchive}>Archive</Button>
              <Button onClick={handleDeny}>Deny</Button>
              <CloseButton onClick={onClose} />
            </Flex>
          </Flex>
        </DrawerHeader>

        <DrawerBody>
          {message && (
            <Alert status="success" mb={4}>
              <AlertIcon />
              {message}
            </Alert>
          )}

          <Flex gap={4} mb={6}>
            <Box border="1px solid" borderColor="gray.300" borderRadius="md" p={3} flex={1}>
              <Text fontWeight="bold" mb={1}>Time</Text>
              <Text>{update?.updateDate ?? "—"}</Text>
            </Box>
            <Box border="1px solid" borderColor="gray.300" borderRadius="md" p={3} flex={1}>
              <Text fontWeight="bold" mb={1}>Author</Text>
              <Text>{update?.firstName} {update?.lastName}</Text>
            </Box>
            <Box border="1px solid" borderColor="gray.300" borderRadius="md" p={3} flex={1}>
              <Text fontWeight="bold" mb={1}>Program Name</Text>
              <Text>{update?.programName ?? "—"}</Text>
            </Box>
          </Flex>

          <Text fontWeight="bold" mb={3}>Media</Text>
          <SimpleGrid columns={3} spacing={3}>
            {/* media will go here once S3 is sorted */}
          </SimpleGrid>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};