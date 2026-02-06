import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from 'react'
import { useBackendContext } from '@/contexts/hooks/useBackendContext' 
import { useAuthContext } from "@/contexts/hooks/useAuthContext"
import { admin } from "firebase-admin"

const AccountForm = ({ accountId }) => {
    const { user, loading } = useAuthContext();
    const { backend } = useBackendContext();
    const [currentUser, setCurrentUser] = useState(null);
    const userId = user.uid;

    const { formData, setFormData } = useState({
        first_name: '',
        last_name: '',
        role: 'Program Director',
        email: ''
    });
    
    useEffect(() => {
        // fetch current users data to see role and what peromissions they have
        const fetchData = async () => {
            try {
                const currentUserResponse = await backend.get(`/gcf-users${userId}`);
                const userData = currentUserResponse.data;
                setCurrentUser(userData);
            } catch (error) {
                console.error("Error loading current user:", error)
            }
        };
        fetchData();
    }, [backend, userId, loading]);

    

};
