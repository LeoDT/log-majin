import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLogCreatedToast(templateName: string) {
  const { t } = useTranslation();
  const toast = useToast();
  const position = 'bottom-left';

  return useCallback(
    <T>(promise?: Promise<T>) => {
      if (promise) {
        toast.promise(promise, {
          success: {
            position,
            title: t('toasts.logCreated', { templateName }),
          },
          error: {
            position,
            title: 'Fail to Add Log',
          },
        });
      } else {
        toast({
          status: 'success',
          position,
          title: t('toasts.logCreated', { templateName }),
        });
      }
    },
    [templateName],
  );
}
