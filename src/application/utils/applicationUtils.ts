export const sliceString = (string?: string, startEnd = 5) => {
  if (!string) return '';
  return `${string.slice(0, startEnd)}...${string.slice(-startEnd)}`;
};
