import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
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
  recipientAddresses,
  programStandard
) {
  const instructions = [];
  const recipientAtas = [];

  for (const addr of recipientAddresses) {
    const associatedToken = getAssociatedTokenAddressSync(
      MINT_ADDRESS,
      new PublicKey(addr),
      false,
      programStandard
    );

    const instruction = createAssociatedTokenAccountIdempotentInstruction(
      wallet.publicKey,
      associatedToken,
      new PublicKey(addr),
      MINT_ADDRESS,
      programStandard
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

  const mintInfo = await connection.getAccountInfo(new PublicKey(MINT_ADDRESS));

  if (!mintInfo) {
    throw new Error('Invalid mint address');
  }

  let programStandard;

  if (mintInfo?.owner.equals(TOKEN_PROGRAM_ID)) {
    programStandard = TOKEN_PROGRAM_ID;
    console.log("program standard spl token");
  } else if (mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    programStandard = TOKEN_2022_PROGRAM_ID;
    console.log("program standard 2022")
  } else {
    programStandard = new PublicKey(mintInfo.owner.toBase58());
    console.log("program standard error")
  }

  const provider = createProvider(wallet, connection);
  const program = new Program(IDL, programID, provider);
  const transaction = createTransaction();

  const associatedToken = getAssociatedTokenAddressSync(
    MINT_ADDRESS,
    wallet.publicKey,
    false,
    programStandard
  );

  const senderAtaInstruction =
    createAssociatedTokenAccountIdempotentInstruction(
      wallet.publicKey,
      associatedToken,
      wallet.publicKey,
      MINT_ADDRESS,
      programStandard
    );
  transaction.add(senderAtaInstruction);

  const RECIPIENT_ADDRESSES = addresses;

  const { instructions: recipientAtaInstructions, recipientAtas } =
    await createAssociatedTokenAccounts(
      wallet,
      connection,
      RECIPIENT_ADDRESSES,
      programStandard
    );

  recipientAtaInstructions.forEach((instruction) =>
    transaction.add(instruction)
  );

  const destinationAtas = recipientAtas.map((addr) => ({
    pubkey: new PublicKey(addr),
    isSigner: false,
    isWritable: true,
  }));

  const decimals = mintInfo.data.readUInt8(44);;

  const amounts = recipientAtas.map(
    (addr) => new BN(amount * Math.pow(10, decimals))
  );

  console.log("destination", destinationAtas);
  console.log("destination", amounts);

  // transaction.add(
  //   await program.methods
  //     .transferSplTokens(new BN(amount * Math.pow(10, decimals)))
  //     .accounts({
  //       sourceTokenAccount: associatedToken,
  //       authority: wallet.publicKey,
  //       splTokenProgram: programStandard,
  //     })
  //     .remainingAccounts(destinationAtas)
  //     .instruction()
  // );

  transaction.add(
    await program.methods
      .sendToAll(amounts)
      .accounts({
        from: associatedToken,
        authority: wallet.publicKey,
        mint: MINT_ADDRESS,
        tokenProgram: programStandard,
      })
      .remainingAccounts(destinationAtas)
      .instruction()
  );

  return await provider.sendAndConfirm(transaction);
}
