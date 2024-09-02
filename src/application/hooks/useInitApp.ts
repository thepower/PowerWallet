import { useMatch, useNavigate } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';

export const useInitApp = () => {
  const { activeWallet } = useWallets();
  const isSignupPage = useMatch(`${WalletRoutesEnum.signup}/:dataOrReferrer?`);
  const isSSOPage = useMatch(`${WalletRoutesEnum.sso}/:data?`);

  const navigate = useNavigate();
  const initApp = () => {
    if (activeWallet) {
      navigate(window.location.pathname);
    } else if (!(isSignupPage || isSSOPage)) {
      navigate(WalletRoutesEnum.root);
    }
  };

  return {
    initApp
  };
};