export type GetChainResultType = {
  address: string;
  chain: number;
  chain_nodes: object;
  ok: boolean;
  result: 'found' | 'other_chain';
  txtaddress: string;
};

export type AccountActionType = {
  title: string;
  action: (data?: any) => void;
  Icon: any;
};
