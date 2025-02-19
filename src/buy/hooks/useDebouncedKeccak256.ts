import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { keccak256, toHex } from 'viem/utils';

const DEFAULT_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const useDeboucedKeccak256 = (
  value: string | undefined,
  delay = 1000
) => {
  const [hash, setHash] = useState<`0x${string}`>(DEFAULT_HASH);

  const debouncedCalculateHash = useCallback(
    debounce((value: string) => {
      const newHash = keccak256(toHex(value));
      setHash(newHash);
    }, delay),
    []
  );

  useEffect(() => {
    if (!value?.trim()) {
      setHash(DEFAULT_HASH);
      return;
    }

    debouncedCalculateHash(value);

    return () => {
      debouncedCalculateHash.cancel();
    };
  }, [value, debouncedCalculateHash]);

  return hash;
};
