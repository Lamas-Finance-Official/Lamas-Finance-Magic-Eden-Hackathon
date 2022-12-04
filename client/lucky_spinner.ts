export type LuckySpinner = {
  "version": "0.1.0",
  "name": "lucky_spinner",
  "instructions": [
    {
      "name": "init",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profitTaxPercentage",
          "type": "u64"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "rates",
          "type": {
            "vec": {
              "array": [
                "u64",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "update",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profitTaxPercentage",
          "type": "u64"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "rates",
          "type": {
            "vec": {
              "array": [
                "u64",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "spin",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrfLock",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "onVrfFulfilled",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrfLock",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        }
      ],
      "args": [
        {
          "name": "result",
          "type": {
            "defined": "vrf_lib::VrfResult"
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u64"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u64"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "rates",
            "type": {
              "vec": {
                "array": [
                  "u64",
                  2
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "vrfLock",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "events": [
    {
      "name": "SpinResult",
      "fields": [
        {
          "name": "requestTrans",
          "type": {
            "array": [
              "u8",
              64
            ]
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "betAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "multiplier",
          "type": "u64",
          "index": false
        },
        {
          "name": "decimal",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidStage",
      "msg": "Program is not in an expected stage"
    },
    {
      "code": 6001,
      "name": "BetTooSmall",
      "msg": "Bet amount is smaller than allowed"
    },
    {
      "code": 6002,
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6005,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
    },
    {
      "code": 6006,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6007,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    }
  ]
};

export const IDL: LuckySpinner = {
  "version": "0.1.0",
  "name": "lucky_spinner",
  "instructions": [
    {
      "name": "init",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profitTaxPercentage",
          "type": "u64"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "rates",
          "type": {
            "vec": {
              "array": [
                "u64",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "update",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profitTaxPercentage",
          "type": "u64"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "rates",
          "type": {
            "vec": {
              "array": [
                "u64",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "spin",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrfLock",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "onVrfFulfilled",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrfLock",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        }
      ],
      "args": [
        {
          "name": "result",
          "type": {
            "defined": "vrf_lib::VrfResult"
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u64"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u64"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "rates",
            "type": {
              "vec": {
                "array": [
                  "u64",
                  2
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "vrfLock",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "events": [
    {
      "name": "SpinResult",
      "fields": [
        {
          "name": "requestTrans",
          "type": {
            "array": [
              "u8",
              64
            ]
          },
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "betAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "multiplier",
          "type": "u64",
          "index": false
        },
        {
          "name": "decimal",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidStage",
      "msg": "Program is not in an expected stage"
    },
    {
      "code": 6001,
      "name": "BetTooSmall",
      "msg": "Bet amount is smaller than allowed"
    },
    {
      "code": 6002,
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6005,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
    },
    {
      "code": 6006,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6007,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    }
  ]
};
