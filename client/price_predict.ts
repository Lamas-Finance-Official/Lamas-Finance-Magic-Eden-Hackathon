export type PricePredict = {
  "version": "0.1.0",
  "name": "price_predict",
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
      "args": [
        {
          "name": "chainlinkProgram",
          "type": "publicKey"
        },
        {
          "name": "chainlinkFeed",
          "type": "publicKey"
        },
        {
          "name": "profitTaxPercentage",
          "type": "u32"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u32"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "bonusPoints",
          "type": {
            "vec": {
              "array": [
                "u32",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "nextRound",
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
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
      "args": []
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
          "name": "roundResult",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
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
          "name": "stakeAmount",
          "type": "u64"
        },
        {
          "name": "predictPrice",
          "type": "u128"
        }
      ]
    },
    {
      "name": "computeRoundResultStart",
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
          "name": "roundResult",
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
      "name": "computeRoundResultEnd",
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sumStake",
          "type": "u128"
        },
        {
          "name": "sumStakeMulScore",
          "type": "u128"
        }
      ]
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prediction",
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
        }
      ],
      "args": [
        {
          "name": "stateBump",
          "type": "u8"
        }
      ]
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
          "name": "roundResult",
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
          "name": "stateBump",
          "type": "u8"
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
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "chainlinkProgram",
            "type": "publicKey"
          },
          {
            "name": "chainlinkFeed",
            "type": "publicKey"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u32"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u32"
          },
          {
            "name": "bonusPoints",
            "docs": [
              "ASSUMPTION: sorted, maximum 16 element"
            ],
            "type": {
              "vec": {
                "array": [
                  "u32",
                  2
                ]
              }
            }
          },
          {
            "name": "stage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roundResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "priceStartStage",
            "type": "u128"
          },
          {
            "name": "priceEndStage",
            "type": "u128"
          },
          {
            "name": "sumStake",
            "type": "u128"
          },
          {
            "name": "sumStakeMulScore",
            "type": "u128"
          },
          {
            "name": "resultVec0",
            "type": "f64"
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeEndRound",
            "type": "u64"
          },
          {
            "name": "finalized",
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
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "unixTimePredict",
            "type": "u64"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "predictVector0",
            "type": "f64"
          },
          {
            "name": "predictPrice",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Stage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitNextRound"
          },
          {
            "name": "PredictStage"
          },
          {
            "name": "ComputeStage"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "UserPredictEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "roundResult",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "unixTimePredict",
          "type": "u64",
          "index": false
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "predictVector0",
          "type": "f64",
          "index": false
        }
      ]
    },
    {
      "name": "UserClaimEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "roundResult",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "reward",
          "type": "u64",
          "index": false
        },
        {
          "name": "tax",
          "type": "u64",
          "index": false
        },
        {
          "name": "score",
          "type": "u32",
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
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6002,
      "name": "IntegerMultiplyOverflow",
      "msg": "Integer multiply overflow"
    },
    {
      "code": 6003,
      "name": "IntegerConvertOverflow",
      "msg": "Integer convert overflow"
    },
    {
      "code": 6004,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6005,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6006,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
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
      "name": "ViolatedLotteryTicketConstraint",
      "msg": "Violated lottery ticket constraint"
    },
    {
      "code": 6011,
      "name": "ViolatedChainlinkFeed",
      "msg": "Violated chainlink feed"
    },
    {
      "code": 6012,
      "name": "ViolatedChainlinkProgram",
      "msg": "Violated chainlink program"
    },
    {
      "code": 6013,
      "name": "NotEnoughDecimal",
      "msg": "Not enough decimal"
    },
    {
      "code": 6014,
      "name": "BetTooSmall",
      "msg": "Bet too small"
    },
    {
      "code": 6015,
      "name": "TooSoon",
      "msg": "Too soon"
    }
  ]
};

export const IDL: PricePredict = {
  "version": "0.1.0",
  "name": "price_predict",
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
      "args": [
        {
          "name": "chainlinkProgram",
          "type": "publicKey"
        },
        {
          "name": "chainlinkFeed",
          "type": "publicKey"
        },
        {
          "name": "profitTaxPercentage",
          "type": "u32"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u32"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "bonusPoints",
          "type": {
            "vec": {
              "array": [
                "u32",
                2
              ]
            }
          }
        }
      ]
    },
    {
      "name": "nextRound",
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
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
      "args": []
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
          "name": "roundResult",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prediction",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
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
          "name": "stakeAmount",
          "type": "u64"
        },
        {
          "name": "predictPrice",
          "type": "u128"
        }
      ]
    },
    {
      "name": "computeRoundResultStart",
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
          "name": "roundResult",
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
      "name": "computeRoundResultEnd",
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sumStake",
          "type": "u128"
        },
        {
          "name": "sumStakeMulScore",
          "type": "u128"
        }
      ]
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
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prediction",
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
        }
      ],
      "args": [
        {
          "name": "stateBump",
          "type": "u8"
        }
      ]
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
          "name": "roundResult",
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
          "name": "stateBump",
          "type": "u8"
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
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "chainlinkProgram",
            "type": "publicKey"
          },
          {
            "name": "chainlinkFeed",
            "type": "publicKey"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u32"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u32"
          },
          {
            "name": "bonusPoints",
            "docs": [
              "ASSUMPTION: sorted, maximum 16 element"
            ],
            "type": {
              "vec": {
                "array": [
                  "u32",
                  2
                ]
              }
            }
          },
          {
            "name": "stage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roundResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "priceStartStage",
            "type": "u128"
          },
          {
            "name": "priceEndStage",
            "type": "u128"
          },
          {
            "name": "sumStake",
            "type": "u128"
          },
          {
            "name": "sumStakeMulScore",
            "type": "u128"
          },
          {
            "name": "resultVec0",
            "type": "f64"
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeEndRound",
            "type": "u64"
          },
          {
            "name": "finalized",
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
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "unixTimePredict",
            "type": "u64"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "predictVector0",
            "type": "f64"
          },
          {
            "name": "predictPrice",
            "type": "u128"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Stage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitNextRound"
          },
          {
            "name": "PredictStage"
          },
          {
            "name": "ComputeStage"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "UserPredictEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "roundResult",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "unixTimePredict",
          "type": "u64",
          "index": false
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "predictVector0",
          "type": "f64",
          "index": false
        }
      ]
    },
    {
      "name": "UserClaimEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "roundResult",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "stakeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "reward",
          "type": "u64",
          "index": false
        },
        {
          "name": "tax",
          "type": "u64",
          "index": false
        },
        {
          "name": "score",
          "type": "u32",
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
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6002,
      "name": "IntegerMultiplyOverflow",
      "msg": "Integer multiply overflow"
    },
    {
      "code": 6003,
      "name": "IntegerConvertOverflow",
      "msg": "Integer convert overflow"
    },
    {
      "code": 6004,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6005,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6006,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
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
      "name": "ViolatedLotteryTicketConstraint",
      "msg": "Violated lottery ticket constraint"
    },
    {
      "code": 6011,
      "name": "ViolatedChainlinkFeed",
      "msg": "Violated chainlink feed"
    },
    {
      "code": 6012,
      "name": "ViolatedChainlinkProgram",
      "msg": "Violated chainlink program"
    },
    {
      "code": 6013,
      "name": "NotEnoughDecimal",
      "msg": "Not enough decimal"
    },
    {
      "code": 6014,
      "name": "BetTooSmall",
      "msg": "Bet too small"
    },
    {
      "code": 6015,
      "name": "TooSoon",
      "msg": "Too soon"
    }
  ]
};
