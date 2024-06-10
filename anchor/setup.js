import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import IDL from "./idl.json";
import { Program } from "@coral-xyz/anchor";

var programID;
var MINT_ADDRESS;

function createProvider(wallet, connection) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  return provider;
}

function createTransaction() {
  const transaction = new Transaction();
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 200000
    })
  );
  return transaction;
}

async function createAssociatedTokenAccounts(
  wallet,
  connection,
  recipientAddresses
) {
  const instructions = [];
  const recipientAtas = [];

  for (const addr of recipientAddresses) {
    const associatedToken = getAssociatedTokenAddressSync(
      MINT_ADDRESS,
      new PublicKey(addr),
      false,
      TOKEN_PROGRAM_ID
    );

    const instruction = createAssociatedTokenAccountIdempotentInstruction(
      wallet.publicKey,
      associatedToken,
      new PublicKey(addr),
      MINT_ADDRESS,
      TOKEN_PROGRAM_ID
    );
    instructions.push(instruction);
    recipientAtas.push(associatedToken);
  }

  return { instructions, recipientAtas };
}

export async function callSplit(
  wallet,
  connection,
  addresses,
  amount,
  programId,
  tokenAddress
) {
  programID = new PublicKey(
    programId
  );
  MINT_ADDRESS = new PublicKey(
    tokenAddress
  );

  const provider = createProvider(wallet, connection);
  const program = new Program(IDL, programID, provider);
  const transaction = createTransaction();

  const associatedToken = getAssociatedTokenAddressSync(
    MINT_ADDRESS,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const senderAtaInstruction =
    createAssociatedTokenAccountIdempotentInstruction(
      wallet.publicKey,
      associatedToken,
      wallet.publicKey,
      MINT_ADDRESS,
      TOKEN_PROGRAM_ID
    );
  transaction.add(senderAtaInstruction);

  const RECIPIENT_ADDRESSES = addresses;

  const { instructions: recipientAtaInstructions, recipientAtas } =
    await createAssociatedTokenAccounts(
      wallet,
      connection,
      RECIPIENT_ADDRESSES
    );

  recipientAtaInstructions.forEach((instruction) =>
    transaction.add(instruction)
  );

  const destinationAtas = recipientAtas.map((addr) => ({
    pubkey: new PublicKey(addr),
    isSigner: false,
    isWritable: true,
  }));

  const decimals = 9;

  transaction.add(
    await program.methods
      .transferSplTokens(new BN(amount * Math.pow(10, decimals)))
      .accounts({
        sourceTokenAccount: associatedToken,
        authority: wallet.publicKey,
        splTokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(destinationAtas)
      .instruction()
  );

  return await provider.sendAndConfirm(transaction);
}
