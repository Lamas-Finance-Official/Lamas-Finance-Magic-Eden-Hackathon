export type JackpotLottery = {
  "version": "0.1.0",
  "name": "jackpot_lottery",
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
          "name": "state",
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
        }
      ],
      "args": []
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
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextRoundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextRoundPool",
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
          "name": "profitTaxPercentage",
          "type": "u8"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "lotteryMaxNum",
          "type": "u8"
        },
        {
          "name": "lotteryLen",
          "type": "u8"
        },
        {
          "name": "rewardDistributionPercentage",
          "type": {
            "array": [
              "u8",
              7
            ]
          }
        }
      ]
    },
    {
      "name": "buyTicket",
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
          "name": "state",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tickets",
          "type": {
            "vec": {
              "array": [
                "u8",
                6
              ]
            }
          }
        }
      ]
    },
    {
      "name": "rollLottery",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
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
      "args": []
    },
    {
      "name": "finalizeRound",
      "docs": [
        "Server count all number of winning ticket then call this instruction",
        "to transfer appropriate amount of token to the result pool",
        "",
        "`num_winning_ticket`: Map the amount of matching number to the amount of winning ticket",
        "if there not enough match to count as winning then the server can skip",
        "that check and set the value to 0.",
        "",
        "Example:",
        "- 3 player match 4 number",
        "- 1 player match 3 number",
        "- matching 1 or 2 number dont yield any reward",
        "",
        "`num_winning_ticket` will be [0, 0, 0, 1, 3, 0, 0]"
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResultPool",
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
      "args": [
        {
          "name": "numWinningTicket",
          "type": {
            "array": [
              "u64",
              7
            ]
          }
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
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "resultPool",
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
          "name": "lotteryTicket",
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
      "name": "clearRoundResult",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResultPool",
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
      "name": "lotteryState",
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
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": {
              "defined": "GameStage"
            }
          }
        ]
      }
    },
    {
      "name": "lotteryRoundResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "poolValueWhenRoundEnd",
            "type": "u64"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u8"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u8"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "lotteryMaxNum",
            "type": "u8"
          },
          {
            "name": "lotteryLen",
            "type": "u8"
          },
          {
            "name": "lotteryResult",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "rewardDistributionPercentage",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "rewardMapNumMatchToToken",
            "type": {
              "array": [
                "u64",
                7
              ]
            }
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeEndRound",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lotteryTicket",
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
            "name": "lotteryNumber",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "unixTimeBuy",
            "type": "u64"
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
  "types": [
    {
      "name": "GameStage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitNextRound"
          },
          {
            "name": "BuyTicket"
          },
          {
            "name": "WaitFinalizeRound"
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
      "name": "BuyZeroTicket",
      "msg": "Can not buy zero ticket"
    },
    {
      "code": 6002,
      "name": "NumTicketNotMatch",
      "msg": "Number of ticket in the instruction and number of account info to store those ticket does not match"
    },
    {
      "code": 6003,
      "name": "DuplicatedLotteryNumber",
      "msg": "Duplocated lottery number"
    },
    {
      "code": 6004,
      "name": "OutOfRangeLotteryNumber",
      "msg": "Out of range lottery number"
    },
    {
      "code": 6005,
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6006,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6007,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6008,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
    },
    {
      "code": 6009,
      "name": "ViolatedRoundResultConstraint",
      "msg": "Violated round result constraint"
    },
    {
      "code": 6010,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6011,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    },
    {
      "code": 6012,
      "name": "ViolatedLotteryTicketConstraint",
      "msg": "Violated lottery ticket constraint"
    }
  ]
};

export const IDL: JackpotLottery = {
  "version": "0.1.0",
  "name": "jackpot_lottery",
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
          "name": "state",
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
        }
      ],
      "args": []
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
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextRoundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextRoundPool",
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
          "name": "profitTaxPercentage",
          "type": "u8"
        },
        {
          "name": "taxBurnPercentage",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "lotteryMaxNum",
          "type": "u8"
        },
        {
          "name": "lotteryLen",
          "type": "u8"
        },
        {
          "name": "rewardDistributionPercentage",
          "type": {
            "array": [
              "u8",
              7
            ]
          }
        }
      ]
    },
    {
      "name": "buyTicket",
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
          "name": "state",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tickets",
          "type": {
            "vec": {
              "array": [
                "u8",
                6
              ]
            }
          }
        }
      ]
    },
    {
      "name": "rollLottery",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
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
      "args": []
    },
    {
      "name": "finalizeRound",
      "docs": [
        "Server count all number of winning ticket then call this instruction",
        "to transfer appropriate amount of token to the result pool",
        "",
        "`num_winning_ticket`: Map the amount of matching number to the amount of winning ticket",
        "if there not enough match to count as winning then the server can skip",
        "that check and set the value to 0.",
        "",
        "Example:",
        "- 3 player match 4 number",
        "- 1 player match 3 number",
        "- matching 1 or 2 number dont yield any reward",
        "",
        "`num_winning_ticket` will be [0, 0, 0, 1, 3, 0, 0]"
      ],
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResultPool",
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
      "args": [
        {
          "name": "numWinningTicket",
          "type": {
            "array": [
              "u64",
              7
            ]
          }
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
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "resultPool",
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
          "name": "lotteryTicket",
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
      "name": "clearRoundResult",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResult",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "roundResultPool",
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
      "name": "lotteryState",
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
            "name": "roundResult",
            "type": "publicKey"
          },
          {
            "name": "stage",
            "type": {
              "defined": "GameStage"
            }
          }
        ]
      }
    },
    {
      "name": "lotteryRoundResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "poolValueWhenRoundEnd",
            "type": "u64"
          },
          {
            "name": "profitTaxPercentage",
            "type": "u8"
          },
          {
            "name": "taxBurnPercentage",
            "type": "u8"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "lotteryMaxNum",
            "type": "u8"
          },
          {
            "name": "lotteryLen",
            "type": "u8"
          },
          {
            "name": "lotteryResult",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "rewardDistributionPercentage",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "rewardMapNumMatchToToken",
            "type": {
              "array": [
                "u64",
                7
              ]
            }
          },
          {
            "name": "unixTimeStartRound",
            "type": "u64"
          },
          {
            "name": "unixTimeEndRound",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lotteryTicket",
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
            "name": "lotteryNumber",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "unixTimeBuy",
            "type": "u64"
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
  "types": [
    {
      "name": "GameStage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WaitNextRound"
          },
          {
            "name": "BuyTicket"
          },
          {
            "name": "WaitFinalizeRound"
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
      "name": "BuyZeroTicket",
      "msg": "Can not buy zero ticket"
    },
    {
      "code": 6002,
      "name": "NumTicketNotMatch",
      "msg": "Number of ticket in the instruction and number of account info to store those ticket does not match"
    },
    {
      "code": 6003,
      "name": "DuplicatedLotteryNumber",
      "msg": "Duplocated lottery number"
    },
    {
      "code": 6004,
      "name": "OutOfRangeLotteryNumber",
      "msg": "Out of range lottery number"
    },
    {
      "code": 6005,
      "name": "IntegerOverflow",
      "msg": "Integer overflow"
    },
    {
      "code": 6006,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6007,
      "name": "InvalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6008,
      "name": "InvalidUserToken",
      "msg": "Invalid User Token"
    },
    {
      "code": 6009,
      "name": "ViolatedRoundResultConstraint",
      "msg": "Violated round result constraint"
    },
    {
      "code": 6010,
      "name": "ViolatedPoolConstraint",
      "msg": "Violated pool constraint"
    },
    {
      "code": 6011,
      "name": "ViolatedTreasuryConstraint",
      "msg": "Violated treasury constraint"
    },
    {
      "code": 6012,
      "name": "ViolatedLotteryTicketConstraint",
      "msg": "Violated lottery ticket constraint"
    }
  ]
};
