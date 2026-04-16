import { useCallback, useEffect, useRef, useState } from 'react';

import { useDisclosure, useToast } from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import i18n, { isAppLocale } from '@/i18n';
import { useTranslation } from 'react-i18next';

import { DEFAULT_PROFILE_IMAGE } from './constants';
import { fetchProgramData, fetchRegionData } from './profileFetchers';

export const useProfile = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const { backend } = useBackendContext();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModelOpen,
    onClose: onPasswordModelClose,
  } = useDisclosure();

  const [gcfUser, setGcfUser] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const profileEditBaselineRef = useRef(null);
  const [pendingPictureKey, setPendingPictureKey] = useState(null);
  const [pendingPicturePreviewUrl, setPendingPicturePreviewUrl] =
    useState(null);
  const [pendingAccountChange, setPendingAccountChange] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'en',
    bio: '',
  });

  const localeLabel = (code) => {
    const c = isAppLocale(String(code)) ? code : 'en';
    switch (c) {
      case 'es':
        return t('profile.langSpanish');
      case 'fr':
        return t('profile.langFrench');
      case 'zh':
        return t('profile.langChinese');
      default:
        return t('profile.langEnglish');
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userResponse = await backend.get(`/gcf-users/${currentUser.uid}`);
      const userData = userResponse.data;
      const pictureKey =
        userData.picture && userData.picture.trim() !== ''
          ? userData.picture
          : null;

      userData.pictureKey = pictureKey;

      if (pictureKey) {
        try {
          const urlResponse = await backend.get(
            `/images/url/${encodeURIComponent(pictureKey)}`
          );
          userData.picture = urlResponse.data.url;
        } catch (urlErr) {
          console.error('Error fetching profile image:', urlErr);
          userData.picture = null;
        }
      }

      setGcfUser(userData);
      const prefLang =
        userData.preferredLanguage &&
        isAppLocale(String(userData.preferredLanguage))
          ? String(userData.preferredLanguage)
          : 'en';
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: currentUser?.email || '',
        bio: '',
        language: prefLang,
      });

      if (role === 'Program Director') {
        const programData = await fetchProgramData(backend, userData.id);
        setRoleSpecificData(programData);

        let pendingChange = null;
        try {
          const pendingResponse = await backend.get('/accountChange', {
            params: { userId: currentUser.uid, resolved: 'false' },
          });
          const pendingList = pendingResponse.data || [];
          if (pendingList.length > 0) {
            pendingChange = pendingList.sort(
              (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
            )[0];
          }
        } catch (err) {
          console.error('Error fetching pending account changes:', err);
        }

        if (pendingChange) {
          const nv = pendingChange.newValues || {};
          const displayFirstName =
            nv.first_name !== undefined
              ? nv.first_name
              : (userData.firstName ?? '');
          const displayLastName =
            nv.last_name !== undefined
              ? nv.last_name
              : (userData.lastName ?? '');
          const displayBio =
            nv.bio !== undefined ? nv.bio : programData?.bio || '';

          setRoleSpecificData((prev) => ({ ...prev, bio: displayBio }));
          setFormData({
            firstName: displayFirstName,
            lastName: displayLastName,
            email: currentUser?.email || '',
            bio: displayBio,
            language: prefLang,
          });

          let pendingPic = null;
          if (nv.picture && nv.picture !== pictureKey) {
            try {
              const urlResp = await backend.get(
                `/images/url/${encodeURIComponent(nv.picture)}`
              );
              pendingPic = urlResp.data.url;
            } catch {
              // ignore
            }
          }

          setGcfUser((prev) => ({
            ...prev,
            firstName: displayFirstName,
            lastName: displayLastName,
            ...(pendingPic ? { picture: pendingPic } : {}),
          }));
          setPendingAccountChange(pendingChange);
        } else {
          setFormData((prev) => ({ ...prev, bio: programData?.bio || '' }));
          setPendingAccountChange(null);
        }
      } else if (role === 'Regional Director') {
        const regionData = await fetchRegionData(backend, userData.id);
        setRoleSpecificData(regionData);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, currentUser?.email, backend, role]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleProfilePictureUpload = async (uploadedFiles) => {
    if (!uploadedFiles?.length) return;

    const key = uploadedFiles[0].s3_key;

    try {
      const urlResponse = await backend.get(
        `/images/url/${encodeURIComponent(key)}`
      );

      if (role === 'Program Director') {
        setPendingPictureKey(key);
        setPendingPicturePreviewUrl(urlResponse.data.url);
        return;
      }

      await backend.post('/images/profile-picture', {
        key: key,
        userId: currentUser.uid,
      });

      const prevPictureKey = gcfUser?.pictureKey || null;
      const nextPictureKey = key;

      if (prevPictureKey !== nextPictureKey) {
        try {
          await backend.post('/accountChange', {
            user_id: currentUser.uid,
            author_id: currentUser.uid,
            change_type: 'Update',
            old_values: {
              first_name: gcfUser?.firstName || '',
              last_name: gcfUser?.lastName || '',
              email: currentUser?.email || '',
              picture: prevPictureKey,
              bio: '',
            },
            new_values: {
              first_name: gcfUser?.firstName || '',
              last_name: gcfUser?.lastName || '',
              email: currentUser?.email || '',
              picture: nextPictureKey,
              bio: '',
            },
            resolved: false,
            last_modified: new Date().toISOString(),
          });
        } catch (changeErr) {
          console.error('Error logging account change:', changeErr);
        }
      }

      setGcfUser((prev) => ({
        ...prev,
        pictureKey: nextPictureKey,
        picture: urlResponse.data.url,
      }));
    } catch (err) {
      console.error('Error saving profile picture:', err);
    }
  };

  const handleEdit = () => {
    const prefLang =
      gcfUser.preferredLanguage &&
      isAppLocale(String(gcfUser.preferredLanguage))
        ? String(gcfUser.preferredLanguage)
        : 'en';
    profileEditBaselineRef.current = {
      firstName: gcfUser.firstName || '',
      lastName: gcfUser.lastName || '',
      bio: role === 'Program Director' ? roleSpecificData?.bio || '' : '',
      pictureKey: gcfUser.pictureKey || null,
      language: prefLang,
    };
    setPendingPictureKey(null);
    setPendingPicturePreviewUrl(null);
    setFormData({
      firstName: gcfUser.firstName || '',
      lastName: gcfUser.lastName || '',
      email: currentUser?.email || '',
      language: prefLang,
      bio: roleSpecificData?.bio || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPassword(false);
    setNewPassword('');
    setPasswordEdited(false);
    setPendingPictureKey(null);
    setPendingPicturePreviewUrl(null);
    profileEditBaselineRef.current = null;
  };

  const saveProfileEdits = async () => {
    try {
      if (role === 'Program Director') {
        const prefLang =
          gcfUser.preferredLanguage &&
          isAppLocale(String(gcfUser.preferredLanguage))
            ? String(gcfUser.preferredLanguage)
            : 'en';
        const base = profileEditBaselineRef.current ?? {
          firstName: gcfUser?.firstName || '',
          lastName: gcfUser?.lastName || '',
          bio: roleSpecificData?.bio || '',
          pictureKey: gcfUser?.pictureKey || null,
          language: prefLang,
        };

        const newBio = formData.bio?.trim() || '';
        const newPic = pendingPictureKey ?? base.pictureKey;
        const languageChanged = base.language !== formData.language;
        const oldValues = {
          first_name: base.firstName,
          last_name: base.lastName,
          email: currentUser?.email || '',
          picture: base.pictureKey,
          bio: base.bio,
        };
        const newValues = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: currentUser?.email || '',
          picture: newPic,
          bio: newBio,
        };

        const hasProfileDiff =
          JSON.stringify(oldValues) !== JSON.stringify(newValues);

        if (languageChanged) {
          await backend.patch(
            `/gcf-users/${currentUser.uid}/preferred-language`,
            {
              preferredLanguage: formData.language,
            }
          );
          await i18n.changeLanguage(formData.language);
          setGcfUser((prev) => ({
            ...prev,
            preferredLanguage: formData.language,
          }));
        }

        if (!hasProfileDiff) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString(i18n.language || 'en', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          });
          if (languageChanged) {
            toast({
              title: t('profile.savedTitle'),
              description: t('profile.savedDesc', { time: timeStr }),
              status: 'success',
              variant: 'subtle',
              position: 'bottom-right',
            });
          }
          setIsEditing(false);
          setShowPassword(false);
          setPasswordEdited(false);
          setNewPassword('');
          setPendingPictureKey(null);
          setPendingPicturePreviewUrl(null);
          profileEditBaselineRef.current = null;
          return;
        }

        const accountChangeResponse = pendingAccountChange
          ? await backend.put(`/accountChange/${pendingAccountChange.id}`, {
              new_values: newValues,
              last_modified: new Date().toISOString(),
            })
          : await backend.post('/accountChange', {
              user_id: currentUser.uid,
              author_id: currentUser.uid,
              change_type: 'Update',
              old_values: oldValues,
              new_values: newValues,
              resolved: false,
              last_modified: new Date().toISOString(),
            });

        setGcfUser((prev) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          ...(pendingPicturePreviewUrl
            ? { picture: pendingPicturePreviewUrl }
            : {}),
        }));
        setRoleSpecificData((prev) => ({ ...prev, bio: newBio }));
        setFormData((prev) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: newBio,
        }));
        setPendingAccountChange(accountChangeResponse.data);
        setPendingPictureKey(null);
        setPendingPicturePreviewUrl(null);
        profileEditBaselineRef.current = null;
        window.dispatchEvent(new Event('profile-updated'));

        toast({
          title: t('profile.pendingApprovalTitle'),
          description: t('profile.pendingApprovalDesc'),
          status: 'info',
          variant: 'subtle',
          position: 'bottom-right',
        });

        setIsEditing(false);
        setShowPassword(false);
        setPasswordEdited(false);
        setNewPassword('');
        return;
      }

      const oldValues = {
        first_name: gcfUser?.firstName || '',
        last_name: gcfUser?.lastName || '',
        email: currentUser?.email || '',
        picture: gcfUser?.pictureKey || null,
        bio: '',
      };
      const newValues = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: currentUser?.email || '',
        picture: gcfUser?.pictureKey || null,
        bio: '',
      };

      await backend.put(`/gcf-users/${currentUser.uid}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (JSON.stringify(oldValues) !== JSON.stringify(newValues)) {
        try {
          await backend.post('/accountChange', {
            user_id: currentUser.uid,
            author_id: currentUser.uid,
            change_type: 'Update',
            old_values: oldValues,
            new_values: newValues,
            resolved: false,
            last_modified: new Date().toISOString(),
          });
        } catch (changeErr) {
          console.error('Error logging account change:', changeErr);
        }
      }

      await backend.patch(`/gcf-users/${currentUser.uid}/preferred-language`, {
        preferredLanguage: formData.language,
      });

      await i18n.changeLanguage(formData.language);
      setGcfUser((prev) => ({
        ...prev,
        preferredLanguage: formData.language,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }));
      window.dispatchEvent(new Event('profile-updated'));

      const now = new Date();
      const timeStr = now.toLocaleTimeString(i18n.language || 'en', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });

      toast({
        title: t('profile.savedTitle'),
        description: t('profile.savedDesc', { time: timeStr }),
        status: 'success',
        variant: 'subtle',
        position: 'bottom-right',
      });

      setIsEditing(false);
      setShowPassword(false);
      setPasswordEdited(false);
      setNewPassword('');
    } catch (err) {
      console.error('Error saving profile language:', err);
      toast({
        title: t('signup.errorTitle'),
        description:
          err.response?.data?.error ??
          err.message ??
          t('updates.failedSaveDesc'),
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
    }
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast({
        title: t('profile.invalidInfoTitle'),
        description: t('profile.invalidInfoDesc'),
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
      return;
    }

    if (!currentUser?.uid) return;

    if (passwordEdited && newPassword.length > 0) {
      if (newPassword.length < 12) {
        toast({
          title: t('profile.passwordInvalidTitle'),
          description: t('profile.passwordMin12Desc'),
          status: 'error',
          variant: 'subtle',
          position: 'bottom-right',
        });
        return;
      }
      onPasswordModelOpen();
      return;
    }

    await saveProfileEdits();
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const profilePicture =
    pendingPicturePreviewUrl && role === 'Program Director'
      ? pendingPicturePreviewUrl
      : gcfUser?.picture && gcfUser.picture.trim() !== ''
        ? gcfUser.picture
        : DEFAULT_PROFILE_IMAGE;

  const pdPending = role === 'Program Director' && !!pendingAccountChange;
  const ov = pendingAccountChange?.oldValues || {};
  const nv = pendingAccountChange?.newValues || {};
  const firstNamePending = pdPending && ov.first_name !== nv.first_name;
  const lastNamePending = pdPending && ov.last_name !== nv.last_name;
  const bioPending = pdPending && ov.bio !== nv.bio;
  const picturePending = pdPending && ov.picture !== nv.picture;

  const handlePasswordChangeSuccess = async () => {
    onPasswordModelClose();
    await saveProfileEdits();
    const now = new Date();
    const timeStr = now.toLocaleTimeString(i18n.language || 'en', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
    toast({
      title: t('profile.passwordUpdatedTitle'),
      description: t('profile.passwordUpdatedDesc', { time: timeStr }),
      status: 'success',
      variant: 'subtle',
      position: 'bottom-right',
    });
  };

  return {
    loading,
    gcfUser,
    currentUser,
    role,
    roleSpecificData,
    isEditing,
    formData,
    showPassword,
    setShowPassword,
    newPassword,
    setNewPassword,
    setPasswordEdited,
    profilePicture,
    pdPending,
    firstNamePending,
    lastNamePending,
    bioPending,
    picturePending,
    localeLabel,
    handleEdit,
    handleCancel,
    handleSave,
    handleInputChange,
    handleProfilePictureUpload,
    handlePasswordChangeSuccess,
    isOpen,
    onOpen,
    onClose,
    isPasswordModalOpen,
    onPasswordModelClose,
  };
};
