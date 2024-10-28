export const swapEVM = {
  abi: [
    {
      type: 'constructor',
      inputs: [
        { name: '_seller', type: 'address', internalType: 'address' },
        { name: '_token_sell', type: 'address', internalType: 'address' },
        { name: '_token_buy', type: 'address', internalType: 'address' },
        { name: '_numerator', type: 'uint256', internalType: 'uint256' },
        { name: '_denominator', type: 'uint256', internalType: 'uint256' }
      ],
      stateMutability: 'nonpayable'
    },
    { type: 'receive', stateMutability: 'payable' },
    {
      type: 'function',
      name: 'buy',
      inputs: [
        { name: 'input', type: 'uint256', internalType: 'uint256' },
        { name: 'min_output', type: 'uint256', internalType: 'uint256' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'buy_and_bridge',
      inputs: [
        { name: 'input', type: 'uint256', internalType: 'uint256' },
        { name: 'min_output', type: 'uint256', internalType: 'uint256' },
        { name: 'send2bridge', type: 'address', internalType: 'address' },
        { name: 'recipient', type: 'address', internalType: 'address' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'calc',
      inputs: [
        { name: 'input', type: 'uint256', internalType: 'uint256' },
        { name: 'output', type: 'uint256', internalType: 'uint256' }
      ],
      outputs: [
        { name: '', type: 'uint256', internalType: 'uint256' },
        { name: '', type: 'uint256', internalType: 'uint256' }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'denominator',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'numerator',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'seller',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'setPrice',
      inputs: [
        { name: '_numerator', type: 'uint256', internalType: 'uint256' },
        { name: '_denominator', type: 'uint256', internalType: 'uint256' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'token_buy',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'contract WSK' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'token_sell',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'contract ERC20' }],
      stateMutability: 'view'
    }
  ] as const
};
