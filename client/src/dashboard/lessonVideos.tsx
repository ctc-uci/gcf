import { useEffect, useState } from "react";
import { Box, Heading, AspectRatio, VStack } from "@chakra-ui/react";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

interface Program {
  id: number;
  playlistLink: string;
  title: string;
}

function LessonVideos() {
  const { backend } = useBackendContext();
  const [pdPrograms, setPdPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const programId = 25;
        const res = await backend.get(`/program/${programId}`);
        const program = res.data;
        setPdPrograms(program ? [program] : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [backend]);

  return (
    <Box>
      <Heading size="md" mb={4}>
        Lesson Videos
      </Heading>
      <VStack spacing={4}>
        {pdPrograms?.map((p) => (
          <AspectRatio key={p.id} ratio={16 / 9} width="30%" ml={0} mr="auto">
            <iframe src={p.playlistLink} title={p.title} />
          </AspectRatio>
        ))}
      </VStack>
    </Box>
  );
}

export default LessonVideos;
