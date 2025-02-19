import { msgPackEncoder } from '@thepowereco/tssdk';

export const objectToString = (data: object) =>
  msgPackEncoder.encode(data).toString('hex');
export const stringToObject = (data: string) =>
  msgPackEncoder.decode(Buffer.from(data, 'hex'));
