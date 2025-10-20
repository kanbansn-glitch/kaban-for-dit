import { useSetRecoilState } from 'recoil';
import { toast } from 'sonner';
import { htmlErrorState } from '../store/errorState';

const IS_DEV = import.meta.env.DEV;

function isHtmlResponse(error) {
  if (!error) {
    return false;
  }

  if (error.contentType && error.contentType.includes('text/html')) {
    return true;
  }

  if (typeof error.rawBody === 'string' && /<html[\s\S]*>/i.test(error.rawBody)) {
    return true;
  }

  return false;
}

export function useApiErrorHandler() {
  const setHtmlError = useSetRecoilState(htmlErrorState);

  return (error, fallback = 'Une erreur est survenue') => {
    if (IS_DEV && isHtmlResponse(error) && error.rawBody) {
      setHtmlError(error.rawBody);
      return;
    }

    const baseMessage = error?.message || fallback;

    if (error?.errors) {
      const messages = Object.values(error.errors)
        .flat()
        .join('\n');
      toast.error(messages || baseMessage);
      return;
    }

    toast.error(baseMessage);
  };
}
