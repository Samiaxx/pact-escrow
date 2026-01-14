# P2P Escrow on Kadena

A Proof-of-Concept non-custodial P2P escrow dApp on Kadena Mainnet.

## Overview

This application allows two parties (Creator and Buyer) to transact KDA securely using a smart contract. The contract ensures that funds are locked until the terms are met or released by an arbiter.

## Workflow

1.  **Connect Wallet**: Use Chainweaver, Zelcore, or eckoWALLET.
2.  **Create Offer (Wallet A)**: Enter an Offer ID and Amount. This creates an escrow entry on-chain.
3.  **Accept Offer (Wallet B)**: Enter the Offer ID to accept.
4.  **Deposit (Wallet A)**: Lock the KDA into the contract.
5.  **Mark Paid (Wallet B)**: Signal that off-chain payment has been made.
6.  **Release (Wallet A or Arbiter)**: Release KDA to the Buyer.
7.  **Refund (Arbiter)**: Refund KDA to the Creator if needed.

## Smart Contract

The Pact code is located in `pact/p2p-escrow.pact`.
You can deploy this to Mainnet Chain 1 using Chainweaver.

## Deployment

1.  Copy the content of `pact/p2p-escrow.pact`.
2.  Open Chainweaver (or your preferred IDE).
3.  Deploy the module to Chain 1.
4.  Update the Contract Name in the UI if you used a different namespace.

## Testing

Follow the logs in the UI to see Request Keys and status updates.
