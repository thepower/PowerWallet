export const swapEVM = {
  abi: [
    {
      type: 'constructor',
      inputs: [
        {
          name: '_seller',
          type: 'address',
          internalType: 'address'
        },
        {
          name: '_token_pay',
          type: 'address',
          internalType: 'address'
        },
        {
          name: '_token_buy',
          type: 'address',
          internalType: 'address'
        },
        {
          name: '_numerator',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '_denominator',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'nonpayable'
    },
    {
      type: 'receive',
      stateMutability: 'payable'
    },
    {
      type: 'function',
      name: 'buy',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'min_output',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'discount_id',
          type: 'bytes32',
          internalType: 'bytes32'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'buy',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'min_output',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'buy_and_bridge',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'min_output',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'send2bridge',
          type: 'address',
          internalType: 'address'
        },
        {
          name: 'recipient',
          type: 'address',
          internalType: 'address'
        },
        {
          name: 'auth_to',
          type: 'address',
          internalType: 'address'
        },
        {
          name: 'discount_id',
          type: 'bytes32',
          internalType: 'bytes32'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'buy_and_bridge',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'min_output',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'send2bridge',
          type: 'address',
          internalType: 'address'
        },
        {
          name: 'recipient',
          type: 'address',
          internalType: 'address'
        },
        {
          name: 'auth_to',
          type: 'address',
          internalType: 'address'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'calc',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'output',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'calc',
      inputs: [
        {
          name: 'input',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'discount_id',
          type: 'bytes32',
          internalType: 'bytes32'
        },
        {
          name: 't',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'denominator',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'getDiscount',
      inputs: [
        {
          name: 'discount_id',
          type: 'bytes32',
          internalType: 'bytes32'
        }
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'numerator',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'owner',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'seller',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'address'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'setDiscount',
      inputs: [
        {
          name: 'id',
          type: 'bytes32',
          internalType: 'bytes32'
        },
        {
          name: 't0',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 't1',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 't_granularity',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'granule_increase',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: 'amount_limit',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'setPrice',
      inputs: [
        {
          name: '_numerator',
          type: 'uint256',
          internalType: 'uint256'
        },
        {
          name: '_denominator',
          type: 'uint256',
          internalType: 'uint256'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'setSeller',
      inputs: [
        {
          name: 'new_seller',
          type: 'address',
          internalType: 'address'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'setTokenBuy',
      inputs: [
        {
          name: 'new_token',
          type: 'address',
          internalType: 'address'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'setTokenPay',
      inputs: [
        {
          name: 'new_token',
          type: 'address',
          internalType: 'address'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'function',
      name: 'token_buy',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'contract WSK'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'token_pay',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'address',
          internalType: 'contract ERC20'
        }
      ],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'transferOwnership',
      inputs: [
        {
          name: 'newOwner',
          type: 'address',
          internalType: 'address'
        }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      type: 'event',
      name: 'BUY',
      inputs: [
        {
          name: 'output',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256'
        }
      ],
      anonymous: false
    },
    {
      type: 'event',
      name: 'OwnershipTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address'
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address'
        }
      ],
      anonymous: false
    },
    {
      type: 'error',
      name: 'OwnableInvalidOwner',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          internalType: 'address'
        }
      ]
    },
    {
      type: 'error',
      name: 'OwnableUnauthorizedAccount',
      inputs: [
        {
          name: 'account',
          type: 'address',
          internalType: 'address'
        }
      ]
    }
  ] as const
};
