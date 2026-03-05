import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md';
import { useState, useContext } from 'react';

import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';

import { BackendContext } from '../../contexts/BackendContext';

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { backend } = useContext(BackendContext);
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();

  const verifyEmail = async (email) => {
    try {
      await backend.post('/gcf-users/verify-email', { email });
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch {
      setErrorMessage('No account associated with this email');
    }
  };
  return (
    <GridItem>
      <Box
        w="546px"
        h="344px"
        mt="20%"
        padding="40px"
        borderRadius="12px"
        boxShadow="xl"
      >
        <Heading fontSize={'5xl'}>Forgot Password?</Heading>
        <form
          style={{ width: '70%' }}
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            verifyEmail(email);
          }}
        >
          <Stack mt="28px" spacing={7}>
            <FormControl w={'100%'}>
              <FormLabel fontSize="lg">Email</FormLabel>
              <Center>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  size={'lg'}
                  name="email"
                  isRequired
                  autoComplete="email"
                  padding="16px"
                  borderRadius="6px"
                  border="1px"
                  borderColor="gray.200"
                />
              </Center>
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            </FormControl>

            <Center>
              <Button
                type="submit"
                size="lg"
                bg="black"
                color="white"
                borderRadius="6px"
                w="full"
                mt="18px"
              >
                <MdOutlineSubdirectoryArrowRight /> Submit
              </Button>
            </Center>
          </Stack>
        </form>
      </Box>
    </GridItem>
  );
};
