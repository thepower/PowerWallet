import { useMatch, useNavigate } from 'react-router-dom';
import { RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';

export const useInitApp = () => {
  const { activeWallet } = useWalletsStore();

  const isSignupPage = useMatch(`${RoutesEnum.signup}/:dataOrReferrer?`);
  const isSSOPage = useMatch(`${RoutesEnum.sso}/:data?`);

  const navigate = useNavigate();
  const initApp = () => {
    if (activeWallet) {
      // const currentQueryParams = location.search
      console.log(location.search);
      navigate(window.location.pathname);
    } else if (!(isSignupPage || isSSOPage)) {
      navigate(RoutesEnum.root);
    }
  };

  return {
    initApp
  };
};
