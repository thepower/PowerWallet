import { createMatchSelector } from 'connected-react-router';
import { RootState } from 'application/store';

export const getRouterParamsDataOrReferrer = (state: RootState) => {
  const matchSelector = createMatchSelector<
    RootState,
    { dataOrReferrer: string }
  >({ path: '/:dataOrReferrer' });
  const match = matchSelector(state);
  const dataOrReferrer = match?.params?.dataOrReferrer;

  return dataOrReferrer;
};
