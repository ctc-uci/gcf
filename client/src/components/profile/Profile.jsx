import { useEffect, useState } from "react";

import {
  Box,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

import { MediaUploadModal } from "../media/MediaUploadModal";
const DEFAULT_PROFILE_IMAGE = "/default-profile.png";

const fetchProgramData = async (backend, userId) => {
  try {
    const response = await backend.get(`/program-directors/me/${userId}/program`);
    return response.data;
  } catch (err) {
    console.error("Error fetching program data:", err);
    return null;
  }
};

const fetchRegionData = async (backend, userId) => {
  try {
    const rdResponse = await backend.get(`/regional-directors/me/${userId}`);
    if (rdResponse.data?.regionId) {
      const regionResponse = await backend.get(`/region/${rdResponse.data.regionId}`);
      return regionResponse.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching region data:", err);
    return null;
  }
};

export const Profile = () => {
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [gcfUser, setGcfUser] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userResponse = await backend.get(`/gcf-users/${currentUser.uid}`);
        const userData = userResponse.data;
        setGcfUser(userData);

        const userRole = userData.role;

        if (userRole === "Program Director") {
          const programData = await fetchProgramData(backend, userData.id);
          setRoleSpecificData(programData);
        } else if (userRole === "Regional Director") {
          const regionData = await fetchRegionData(backend, userData.id);
          setRoleSpecificData(regionData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, backend]);

  const handleProfilePictureUpload = async (results) => {
    if (!results?.length) return;

    const key = results[0].file_name;

    try {
      await backend.post("/images/profile-picture", { key, userId: currentUser.uid });
      setGcfUser((prev) => ({ ...prev, picture: key }));
    } catch (err) {
      console.error("Error saving profile picture:", err);
    }
  };

  if (loading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  const profilePicture =
    gcfUser.picture && gcfUser.picture.trim() !== ""
      ? gcfUser.picture
      : DEFAULT_PROFILE_IMAGE;

  const fullName =
    `${gcfUser.firstName || ""} ${gcfUser.lastName || ""}`.trim() || "User";
  const email = currentUser?.email || "";
  const userRole = gcfUser.role;

  const profileData = [
    { label: "Email", value: email },
    { label: "Role", value: userRole || "" },
  ];

  if (userRole === "Program Director" && roleSpecificData?.name) {
    profileData.push({ label: "Program", value: roleSpecificData.name });
  } else if (userRole === "Regional Director" && roleSpecificData?.name) {
    profileData.push({ label: "Region", value: roleSpecificData.name });
  }

  return (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={8} align="center" p={4} w="100%">
        <VStack spacing={4} align="center">
          <Image
            src={profilePicture}
            boxSize="300px"
            borderRadius="full"
            fit="cover"
            alt="Profile"
            onClick={onOpen}
          />
          <Text fontSize="2xl" fontWeight="bold">{fullName}</Text>
        </VStack>
        <VStack spacing="10px" align="flex-start" w="100%" maxW="624px">
          {profileData.map(({ label, value }) => (
            <HStack key={label} spacing={40}>
              <Text w="80px" fontSize="lg" fontWeight="medium">{label}</Text>
              <Text
                bg="#D9D9D9"
                w="504px"
                h="47px"
                pt="6px"
                pr="86px"
                pb="6px"
                pl="86px"
                borderRadius="35px"
                textAlign="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {value}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={handleProfilePictureUpload}
        formOrigin="profile"
      />
    </Box>
  );
};