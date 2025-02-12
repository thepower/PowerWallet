import { useState, useEffect } from 'react';
import { REFRESH_INTERVAL, TARGET_TIME_OFFSET } from 'buy/constants';

export const useTargetTime = () => {
  const [targetTime, setTargetTime] = useState(() =>
    BigInt(Math.floor(Date.now() / 1000) + Number(TARGET_TIME_OFFSET))
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      setTargetTime(now + TARGET_TIME_OFFSET);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return targetTime;
};
