import localForage from 'localforage';

type ApplicationStorageKeyType = 'address' | 'wif' ;

const applicationStorage = localForage.createInstance({
  driver: localForage.LOCALSTORAGE,
  name: 'thepowereco',
  version: 1.0,
});

export const getKeyFromApplicationStorage = <T>(key: ApplicationStorageKeyType) => applicationStorage.getItem<T>(key);
export const setKeyToApplicationStorage = (key: ApplicationStorageKeyType, value: any) => applicationStorage.setItem(key, value);
export const clearApplicationStorage = async () => {
  // await applicationStorage.removeItem('tokens');
  await applicationStorage.removeItem('address');
  await applicationStorage.removeItem('wif');
};
