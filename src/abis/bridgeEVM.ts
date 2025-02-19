export const bridgeEVM = {
  abi: [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
      name: 'OwnableInvalidOwner',
      type: 'error'
    },
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'OwnableUnauthorizedAccount',
      type: 'error'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'bridge',
          type: 'address'
        },
        { indexed: false, internalType: 'bool', name: 'allow', type: 'bool' }
      ],
      name: 'BridgeChanged',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'address', name: 'localAddress', type: 'address' },
            { internalType: 'address', name: 'remoteAddress', type: 'address' },
            { internalType: 'uint256', name: 'amountGet', type: 'uint256' },
            { internalType: 'uint256', name: 'amountDst', type: 'uint256' },
            { internalType: 'address', name: 'tokenGive', type: 'address' },
            { internalType: 'address', name: 'auth_to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'pre_height', type: 'uint256' }
          ],
          indexed: false,
          internalType: 'struct Bridge2.Order',
          name: 'orderData',
          type: 'tuple'
        }
      ],
      name: 'NewOrder',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'OwnershipTransferred',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'bool',
          name: 'new_value',
          type: 'bool'
        }
      ],
      name: 'Pause',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'orderId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'Withdraw',
      type: 'event'
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'allowed_tokens',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'bridge_cnt',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' }
      ],
      name: 'convert',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'auth_to', type: 'address' }
      ],
      name: 'convert_token',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'countOrders',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'default_token',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'feeAccount',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'feePcm',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'inTransferDone',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      name: 'inTransferStatus',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'lastblk',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'minsig',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'orderId', type: 'uint256' },
        { internalType: 'address', name: 'rAddr', type: 'address' },
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'address', name: 'auth_to', type: 'address' }
      ],
      name: 'orderInfo',
      outputs: [
        { internalType: 'bytes32', name: '', type: 'bytes32' },
        { internalType: 'uint256', name: '', type: 'uint256' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'pause',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'bridge', type: 'address' },
        { internalType: 'bool', name: 'allow', type: 'bool' }
      ],
      name: 'setBridge',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'BridgeFeePcm', type: 'uint256' },
        { internalType: 'address', name: 'feeAccountAddress', type: 'address' }
      ],
      name: 'setFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: 'new_value', type: 'uint256' }],
      name: 'setMinSig',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bool', name: 'new_value', type: 'bool' }],
      name: 'setPause',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'addr', type: 'address' },
        { internalType: 'uint256', name: 'mode', type: 'uint256' },
        { internalType: 'uint8', name: 'remote_decimals', type: 'uint8' }
      ],
      name: 'setToken',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
      name: 'setTokenDefault',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'tokenDecimals',
      outputs: [
        { internalType: 'uint8', name: 'local', type: 'uint8' },
        { internalType: 'uint8', name: 'remote', type: 'uint8' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'orderId', type: 'uint256' },
        { internalType: 'address', name: 'rAddr', type: 'address' },
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'address', name: 'auth_to', type: 'address' }
      ],
      name: 'withdrawInbound',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    { stateMutability: 'payable', type: 'receive' }
  ] as const
};
