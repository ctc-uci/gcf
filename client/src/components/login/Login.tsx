import { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Image,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiLogIn } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import GcfGlobe from '/gcf_globe.png';

const signinSchema = z.object({
  email: z.string().email('Incorrect Email'),
  password: z.string().min(6, 'Incorrect Password'),
});

type SigninFormValues = z.infer<typeof signinSchema>;

const welcomeTexts = [
  'Welcome!',
  'Karibu!',
  '¡Bienvenido!',
  '欢迎!',
  'Willkommen!',
];

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [textIndex, setTextIndex] = useState(0);

  const { login, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % welcomeTexts.length);
    }, 1300); // 1000ms display + 300ms animation
    return () => clearInterval(interval);
  }, []);

  const toastLoginError = useCallback(
    (msg: string) => {
      toast({
        title: 'Could not login!',
        description: msg,
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
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

      navigate('/dashboard/1');
    } catch (err) {
      const errorCode = err.code;

      switch (errorCode) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'auth/user-not-found':
          setError('email', { message: 'Incorrect Email' });
          setError('password', { message: 'Incorrect Password' });
          toastLoginError('Incorrect Login Information');
          break;
        case 'auth/unverified-email':
          toastLoginError('Please verify your email address.');
          break;
        case 'auth/user-disabled':
          toastLoginError('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          toastLoginError('Too many attempts. Please try again later.');
          break;
        case 'auth/user-signed-out':
          toastLoginError('You have been signed out. Please sign in again.');
          break;
        default:
          toastLoginError(err.message);
      }
    }
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <Grid templateColumns="repeat(2, 1fr)" h="100vh">
      {/* Left Panel */}
      <GridItem>
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          borderRight="none"
          position="relative"
          overflow="hidden"
        >
          <Box mb={6} h="60px" display="flex" alignItems="center">
            <AnimatePresence mode="wait">
              <motion.div
                key={textIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.7, -0.4, 0.4, 1.4],
                  delay: textIndex === 0 ? 0 : undefined,
                }}
              >
                <Heading fontWeight="bold" fontSize="5xl" textAlign="center">
                  {welcomeTexts[textIndex]}
                </Heading>
              </motion.div>
            </AnimatePresence>
          </Box>

          <Image src={GcfGlobe} alt="GCF Globe" maxH="55%" draggable="false" />
        </Flex>
      </GridItem>

      {/* Right Panel */}
      <GridItem bg="cyan.50">
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          px={12}
        >
          <Box
            bg="white"
            borderRadius="xl"
            p={10}
            w="100%"
            maxW="500px"
            boxShadow="sm"
          >
            <Heading fontWeight="bold" fontSize="3xl" mb={6}>
              Login
            </Heading>

            <form onSubmit={handleSubmit(handleLogin)}>
              <Stack spacing={5}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontWeight="bold">Email</FormLabel>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    size="lg"
                    {...register('email')}
                    name="email"
                    isRequired
                    autoComplete="email"
                    borderRadius="md"
                    bg="gray.50"
                  />
                  <FormErrorMessage>
                    {errors.email?.message?.toString()}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="bold">Password</FormLabel>
                  <Input
                    placeholder="Password"
                    type="password"
                    size="lg"
                    {...register('password')}
                    name="password"
                    isRequired
                    autoComplete="current-password"
                    borderRadius="md"
                    bg="gray.50"
                  />
                  <FormErrorMessage>
                    {errors.password?.message?.toString()}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  isDisabled={Object.keys(errors).length > 0}
                  bg="black"
                  color="white"
                  borderRadius="md"
                  w="100%"
                  leftIcon={<FiLogIn />}
                  _hover={{ bg: 'gray.800' }}
                >
                  Login
                </Button>

                <Center>
                  {/* TODO: Replace /signup with forgot password form */}
                  <ChakraLink
                    as={Link}
                    to="/signup"
                    textDecoration="underline"
                    color="gray.700"
                  >
                    Forgot password?
                  </ChakraLink>
                </Center>
              </Stack>
            </form>
          </Box>
        </Flex>
      </GridItem>
    </Grid>
  );
};
