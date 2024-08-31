import { RootState } from '../../application/reduxStore';

export const getSentData = (state: RootState) => state.send.sentData;
