export const parseHash = () => (
  window.location.hash?.substr(1)
    .split('&')
    .map((item) => item.split('='))
);
