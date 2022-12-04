export type UpOrDown = {
  "version": "0.1.0",
  "name": "up_or_down",
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
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createRound",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
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
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minBetAmount",
          "type": "u64"
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
          "name": "unixTimeStartRound",
          "type": "u64"
        },
        {
          "name": "unixTimeStartLiveStage",
          "type": "u64"
        },
        {
          "name": "unixTimeEndLiveStage",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startRound",
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
          "name": "round",
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
        }
      ],
      "args": [
        {
          "name": "initPoolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "predict",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": true
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
          "name": "isUp",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizePredictionStage",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chainlinkFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "finalizeLiveStage",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chainlinkFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
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
          "name": "round",
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
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRound",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "clearRoundResult",
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
          "name": "round",
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
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "roundCounter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundResult",
      "docs": [
        "Note: we use this as Box<AccountInfo<_>>",
        "to avoid exceeding Stack memory limit"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "upPoolValue",
            "type": "u64"
          },
          {
            "name": "downPoolValue",
            "type": "u64"
          },
          {
            "name": "didUpWin",
            "type": "bool"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
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
            "name": "priceEndPredictStage",
            "type": {
              "defined": "Decimal"
            }
          },
          {
            "name": "priceEndLiveStage",
            "type": {
              "defined": "Decimal"
            }
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeStartLiveStage",
            "type": "u64"
          },
          {
            "name": "unixTimeEndLiveStage",
            "type": "u64"
          },
          {
            "name": "stage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "prediction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "result",
            "type": "publicKey"
          },
          {
            "name": "isUp",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Decimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "i128"
          },
          {
            "name": "decimals",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "GameStage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitStartRound"
          },
          {
            "name": "Prediction"
          },
          {
            "name": "Live"
          },
          {
            "name": "Ended"
          },
          {
            "name": "Canceled"
          }
        ]
      }
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
      "name": "TimingError",
      "msg": "Timing Error"
    },
    {
      "code": 6007,
      "name": "ViolatedRoundResultConstraint",
      "msg": "Violated round result constraint"
    },
    {
      "code": 6008,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6009,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    },
    {
      "code": 6010,
      "name": "ViolatedPredictionConstraint",
      "msg": "Violated prediction constraint"
    }
  ]
};

export const IDL: UpOrDown = {
  "version": "0.1.0",
  "name": "up_or_down",
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
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createRound",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
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
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minBetAmount",
          "type": "u64"
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
          "name": "unixTimeStartRound",
          "type": "u64"
        },
        {
          "name": "unixTimeStartLiveStage",
          "type": "u64"
        },
        {
          "name": "unixTimeEndLiveStage",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startRound",
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
          "name": "round",
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
        }
      ],
      "args": [
        {
          "name": "initPoolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "predict",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": true
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
          "name": "isUp",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizePredictionStage",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chainlinkFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "finalizeLiveStage",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "programState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "round",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chainlinkFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chainlinkProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
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
          "name": "round",
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
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelRound",
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
          "name": "round",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "clearRoundResult",
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
          "name": "round",
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
          "name": "pdaAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "roundCounter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundResult",
      "docs": [
        "Note: we use this as Box<AccountInfo<_>>",
        "to avoid exceeding Stack memory limit"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundIndex",
            "type": "u64"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "upPoolValue",
            "type": "u64"
          },
          {
            "name": "downPoolValue",
            "type": "u64"
          },
          {
            "name": "didUpWin",
            "type": "bool"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
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
            "name": "priceEndPredictStage",
            "type": {
              "defined": "Decimal"
            }
          },
          {
            "name": "priceEndLiveStage",
            "type": {
              "defined": "Decimal"
            }
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeStartLiveStage",
            "type": "u64"
          },
          {
            "name": "unixTimeEndLiveStage",
            "type": "u64"
          },
          {
            "name": "stage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "prediction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "result",
            "type": "publicKey"
          },
          {
            "name": "isUp",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Decimal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "i128"
          },
          {
            "name": "decimals",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "GameStage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitStartRound"
          },
          {
            "name": "Prediction"
          },
          {
            "name": "Live"
          },
          {
            "name": "Ended"
          },
          {
            "name": "Canceled"
          }
        ]
      }
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
      "name": "TimingError",
      "msg": "Timing Error"
    },
    {
      "code": 6007,
      "name": "ViolatedRoundResultConstraint",
      "msg": "Violated round result constraint"
    },
    {
      "code": 6008,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6009,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    },
    {
      "code": 6010,
      "name": "ViolatedPredictionConstraint",
      "msg": "Violated prediction constraint"
    }
  ]
};
