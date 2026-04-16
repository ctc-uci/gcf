import { ProfileView } from './ProfileView';
import { useProfile } from './useProfile';

export const Profile = () => {
  const profile = useProfile();
  return <ProfileView {...profile} />;
};
