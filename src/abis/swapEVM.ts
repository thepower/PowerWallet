export const swapEVM = {
  abi: [
    {
      inputs: [
        { internalType: 'address', name: '_seller', type: 'address' },
        { internalType: 'address', name: '_token_pay', type: 'address' },
        { internalType: 'address', name: '_token_buy', type: 'address' },
        { internalType: 'uint256', name: '_numerator', type: 'uint256' },
        { internalType: 'uint256', name: '_denominator', type: 'uint256' }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'input', type: 'uint256' },
        { internalType: 'uint256', name: 'min_output', type: 'uint256' }
      ],
      name: 'buy',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'input', type: 'uint256' },
        { internalType: 'uint256', name: 'min_output', type: 'uint256' },
        { internalType: 'address', name: 'send2bridge', type: 'address' },
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'address', name: 'auth_to', type: 'address' }
      ],
      name: 'buy_and_bridge',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'input', type: 'uint256' },
        { internalType: 'uint256', name: 'output', type: 'uint256' }
      ],
      name: 'calc',
      outputs: [
        { internalType: 'uint256', name: '', type: 'uint256' },
        { internalType: 'uint256', name: '', type: 'uint256' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'denominator',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'numerator',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'seller',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_numerator', type: 'uint256' },
        { internalType: 'uint256', name: '_denominator', type: 'uint256' }
      ],
      name: 'setPrice',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'token_buy',
      outputs: [{ internalType: 'contract WSK', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'token_pay',
      outputs: [{ internalType: 'contract ERC20', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
  ] as const
};
