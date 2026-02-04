import { useCallback, useEffect } from "react";

import {
  AbsoluteCenter,
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { authenticateGoogleUser } from "@/utils/auth/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import GcfGlobe from "/gcf_globe.png";
import logo from "/logo.png";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { login, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
  });

  const toastLoginError = useCallback(
    (msg: string) => {
      toast({
        title: "An error occurred while signing in",
        description: msg,
        status: "error",
        variant: "subtle",
        position: "bottom-right",
      });
    },
    [toast]
  );

  const handleLogin = async (data: SigninFormValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });

      navigate("/dashboard/1");
    } catch (err) {
      const errorCode = err.code;
      const firebaseErrorMsg = err.message;

      switch (errorCode) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-email":
        case "auth/user-not-found":
          toastLoginError(
            "Email address or password does not match our records!"
          );
          break;
        case "auth/unverified-email":
          toastLoginError("Please verify your email address.");
          break;
        case "auth/user-disabled":
          toastLoginError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          toastLoginError("Too many attempts. Please try again later.");
          break;
        case "auth/user-signed-out":
          toastLoginError("You have been signed out. Please sign in again.");
          break;
        default:
          toastLoginError(firebaseErrorMsg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    await authenticateGoogleUser();
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <Center>
      <Image
        src={logo}
        alt="GCF Logo"
        position="absolute"
        h="100px"
        left="0"
        top="-6"
      />

      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={5}
      >
        <GridItem>
          <Box
            borderRight="3px solid"
            h="100%"
          >
            <AbsoluteCenter left="25%">
              <Text
                as="b"
                fontFamily="Roboto"
                fontSize="4xl"
                w="230px"
                noOfLines={4}
              >
                Welcome to Global Creation Foundation!
              </Text>
            </AbsoluteCenter>

            <Image
              src={GcfGlobe}
              alt="GCF Globe"
              opacity="30%"
              h="95%"
            />
          </Box>
        </GridItem>

        <GridItem>
          <Box
            w="100%"
            mt="20%"
          >
            <Center>
              <Heading as="u">Log In</Heading>
            </Center>
            <Center>
              <form
                onSubmit={handleSubmit(handleLogin)}
                style={{ width: "70%" }}
              >
                <Stack spacing={7}>
                  <FormControl
                    isInvalid={!!errors.email}
                    w={"100%"}
                  >
                    <FormLabel fontSize="lg">Email</FormLabel>
                    <Center>
                      <Input
                        placeholder="Email"
                        type="email"
                        size={"lg"}
                        {...register("email")}
                        name="email"
                        isRequired
                        autoComplete="email"
                        borderRadius="full"
                        bg="gray.100"
                      />
                    </Center>
                    <FormErrorMessage>
                      {errors.email?.message?.toString()}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="lg">Password</FormLabel>
                    <Center>
                      <Input
                        placeholder="Password"
                        type="password"
                        size={"lg"}
                        {...register("password")}
                        name="password"
                        isRequired
                        autoComplete="current-password"
                        borderRadius="full"
                        bg="gray.100"
                      />
                    </Center>
                    <FormErrorMessage>
                      {errors.password?.message?.toString()}
                    </FormErrorMessage>
                    <Flex
                      gap="300px"
                      mt="10px"
                    >
                      <ChakraLink
                        as={Link}
                        to="/signup"
                      >
                        <FormHelperText textDecoration="underline">
                          Click here to sign up
                        </FormHelperText>
                      </ChakraLink>
                      {/* TODO: Replace /signup with forgot password form */}
                      <ChakraLink
                        as={Link}
                        to="/signup"
                      >
                        <FormHelperText
                          color="blue.400"
                          textDecoration="underline"
                        >
                          Forgot Password?
                        </FormHelperText>
                      </ChakraLink>
                    </Flex>
                  </FormControl>
                  <Center>
                    <Button
                      type="submit"
                      size={"lg"}
                      // sx={{ width: "100%" }}
                      isDisabled={Object.keys(errors).length > 0}
                      bg="black"
                      color="white"
                      borderRadius="full"
                      w="200px"
                    >
                      Login
                    </Button>
                  </Center>
                </Stack>
              </form>
            </Center>
          </Box>
          {/* 
          <Button
            leftIcon={<FaGoogle />}
            variant={"solid"}
            size={"lg"}
            onClick={handleGoogleLogin}
            sx={{ width: "100%" }}
          >
            Login with Google
          </Button> */}
        </GridItem>
      </Grid>
    </Center>
  );
};
