import { Box, Text, Image, VStack, HStack } from "@chakra-ui/react";

const profileData = [
  { label: "Email", value: "hello@gcf.org" },
  { label: "Role", value: "Regional Director" },
  { label: "Program", value: "Uganda" },
];

const dataBoxStyle = {
  bg: "#D9D9D9",
  borderRadius: "100px",
  padding: "10px 20px",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "504px",
  height: "47px",
};

export const Profile = () => {
  return (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={8} align="center" p={4} w="100%">
        <Image
          src="/profile-image.png"
          boxSize="300px"
          borderRadius="full"
          fit="cover"
          alt="Profile"
        />
        <Text fontSize="2xl" fontWeight="bold">Seth Kaser</Text>
        <VStack spacing="10px" align="left">
          {profileData.map(({ label, value }) => (
            <HStack key={label} spacing={40}>
              <Text w="80px" fontSize="lg" fontWeight="medium">{label}</Text>
              <Text {...dataBoxStyle}>{value}</Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};