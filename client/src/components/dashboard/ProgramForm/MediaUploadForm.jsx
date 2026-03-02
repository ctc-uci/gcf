import {
    Box,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    Spinner,
    Image,
    useDisclosure,
    Button,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext'
import { MediaUploadModal } from "@/components/media/MediaUploadModal";

const MediaPreviewTag = ({ item, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { backend } = useBackendContext();

    useEffect(() => {
        const fetchUrl = async () => {
            if (!item.s3_key) return;

            try {
                const res = await backend.get(`/images/url/${encodeURIComponent(item.s3_key)}`);
                if (res.data && res.data.success) {
                    setPreviewUrl(res.data.url);
                }
            } catch (error) {
                console.error("Failed to fetch image URL:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUrl();
    }, [item.s3_key, backend]);

    const isVideo = item.file_type?.startsWith("video/");

    return (
        <Tag maxW="250px" p={2} borderRadius="md" size="lg">
            <Box
                w="2.5rem"
                h="2.5rem"
                mr={2}
                flexShrink={0}
                borderRadius="md"
                overflow="hidden"
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {isLoading ? (
                    <Spinner size="xs" />
                ) : isVideo ? (
                    <video
                        src={previewUrl}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        muted
                        playsInline
                    />
                ) : (
                    <Image
                        src={previewUrl}
                        alt={item.file_name}
                        boxSize="100%"
                        objectFit="cover"
                    />
                )}
            </Box>

            <TagLabel isTruncated title={item.file_name}>
                {item.file_name}
            </TagLabel>
            <TagCloseButton onClick={onRemove} />
        </Tag>
    );
};

export const MediaUploadForm = ({ onUploadComplete, uploadedMedia, onRemove }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button onClick={onOpen}> + Add </Button>
            <MediaUploadModal
                isOpen={isOpen}
                onClose={onClose}
                onUploadComplete={onUploadComplete}
                formOrigin={"program"}
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
    )
}
