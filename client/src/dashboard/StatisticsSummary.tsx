import { HStack,Box, IconButton } from "@chakra-ui/react";
import { MdOutlineFileDownload } from "react-icons/md";

const StatBox = ({ label, number }: { label: string; number: number }) => {
  return (
    <Box
      maxW="200px"
      p={4}

      color="black"
      borderRadius="md"
     
    >
      <Box fontSize="lg" mb={2}>
        {label}
      </Box>
      <Box>{number}</Box>
    </Box>
  );
};

const StatisticsSummary = () =>{
    const stats = [
    { label: "Programs", number: 120 },
    { label: "Students", number: 450 },
    { label: "Instruments", number: 75 },
  ];
    return(
    <>
    <section>
        <HStack>
            <h1>Statistics Summary</h1>
            <IconButton aria-label="download"><MdOutlineFileDownload/></IconButton>
            
        </HStack>
        <HStack>
             <HStack spacing={4} justify="center">
        {stats.map((stat) => (
          <StatBox key={stat.label} label={stat.label} number={stat.number} />
        ))}
      </HStack>
        </HStack>
        
    </section>
    </>

    );
}


export default StatisticsSummary;