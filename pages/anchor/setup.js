import { Program } from "@coral-xyz/anchor";
import IDL from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

 
const programId = new PublicKey("7n1B7Ph5gQPL8236jpZJqPEuUFBjtDaZsSt5k27hqSLc");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const programInterface = JSON.parse(JSON.stringify(IDL))
 
// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const program = new Program(programInterface, programId, {
  connection,
});

export const [ authorityPDA ] = PublicKey.findProgramAddressSync(
  [Buffer.from("authority")],
  program.programId,
);
