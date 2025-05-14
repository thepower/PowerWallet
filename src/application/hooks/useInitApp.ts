import { useMatch, useNavigate } from 'react-router-dom';
import { RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';

export const useInitApp = () => {
  const { activeWallet } = useWalletsStore();

  const isSignupPage = useMatch(`${RoutesEnum.signup}/:dataOrReferrer?`);
  const isSSOPage = useMatch(`${RoutesEnum.sso}/:data?`);
  // const isBuyCryptoPage = useMatch(`${RoutesEnum.buy}${RoutesEnum.crypto}`);

  const navigate = useNavigate();
  const initApp = () => {
    if (activeWallet) {
      // navigate(window.location.pathname);
    } else if (
      !(
        (isSignupPage || isSSOPage)
        // || isBuyCryptoPage
      )
    ) {
      navigate(RoutesEnum.root);
    }
  };

  return {
    initApp
  };
};
