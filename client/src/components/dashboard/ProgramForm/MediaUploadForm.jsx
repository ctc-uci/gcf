import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import { MediaUploadModal } from "@/components/media/MediaUploadModal";
import { MediaPreviewTag } from "./MediaPreviewTag";

export function MediaUploadForm({ onUploadComplete, uploadedMedia, onRemove }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}> + Add </Button>
      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={onUploadComplete}
        formOrigin="program"
      />

      <HStack wrap="wrap" mt={2} spacing={3}>
        {(uploadedMedia ?? []).map((item, i) => (
          <MediaPreviewTag
            key={item.id || item.s3_key || i}
            item={item}
            onRemove={() => onRemove(i)}
          />
        ))}
      </HStack>
    </>
  );
}
