import { useRecoilValue } from 'recoil';
import { authUserState } from '../store/authState';

export function useCurrentUser() {
  return useRecoilValue(authUserState);
}
