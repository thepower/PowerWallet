export const claimNode = {
  abi: [
    {
      inputs: [
        { internalType: 'address', name: 'collection', type: 'address' },
        { internalType: 'address', name: 'admin', type: 'address' }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
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
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        }
      ],
      name: 'Claimed',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        }
      ],
      name: 'Deposited',
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
      inputs: [
        { internalType: 'address[]', name: 'addresses', type: 'address[]' }
      ],
      name: 'addEligible',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'available',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'claim',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'claimedAmount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: 'depositTokenIds',
          type: 'uint256[]'
        }
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'eligible',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'eligibleAmount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'nftCollection',
      outputs: [
        { internalType: 'contract IERC721', name: '', type: 'address' }
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
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'collection', type: 'address' }
      ],
      name: 'set_collection',
      outputs: [],
      stateMutability: 'nonpayable',
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
        { internalType: 'address[]', name: '_addresses', type: 'address[]' },
        { internalType: 'uint256', name: '_eligible', type: 'uint256' }
      ],
      name: 'updateEligible',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ] as const
};
