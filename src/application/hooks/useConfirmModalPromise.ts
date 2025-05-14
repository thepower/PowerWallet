import { useStore } from 'application/store';

export const useConfirmModalPromise = () => {
  const { openConfirmModal, closeConfirmModal } = useStore();

  const confirm = async (): Promise<string> => {
    try {
      const result = await openConfirmModal();
      return result;
    } catch (error) {
      return '';
    }
  };

  return { confirm, closeConfirmModal };
};
