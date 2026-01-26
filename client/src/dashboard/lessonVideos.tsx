import { useEffect, useState } from "react";
import { Box, Heading, AspectRatio, VStack } from "@chakra-ui/react";

interface Program {
  id: number;
  playlistLink: string;
  title: string;
}

function LessonVideos() {
  const [pdPrograms, setPdPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/program");
        const data = await res.json();
        setPdPrograms(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Heading size="md" mb={4}>
        Lesson Videos
      </Heading>
      <VStack spacing={4}>
        {pdPrograms?.map((p) => (
          <AspectRatio key={p.id} ratio={16 / 9} width="100%">
            <iframe src={p.playlistLink} title={p.title} />
          </AspectRatio>
        ))}
      </VStack>
    </Box>
  );
}

export default LessonVideos;
