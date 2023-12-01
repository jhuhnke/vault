import { 
    Keypair, 
    PublicKey, 
    LAMPORTS_PER_SOL
} from "@solana/web3.js"; 
import { Program } from "@coral-xyz/anchor"; 
import { Vault }  from "../target/types/vault"

const program = anchor.workspace.Vault as Program<Vault>;

const connection = anchor.getProvider().connection;

const owner = Keypair.generate();

const vault = PublicKey.findProgramAddressSync([Buffer.from("vault"), owner.publicKey.toBuffer()], program.programId)[0];

const confirm = async (signature: string): Promise<string> => {
  const block = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...block
  })
  return signature
}

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`);
    return signature;
  }

  it("Airdrop", async () => {
    await connection.requestAirdrop(owner.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log)
  })

  it("Deposit", async () => {
    await program.methods.deposit(new anchor.BN(10000000)).accounts({
        signer: owner.publicKey, 
        vault, 
        systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([owner]) 
    .rpc()
    .then(confirm)
    .then(log)
  })

  it("Withdraw", async () => {
    await program.methods.withdraw(new anchor.BN(10000000)).accounts({
        signer: owner.publicKey, 
        vault, 
        systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([owner]) 
    .rpc()
    .then(confirm)
    .then(log)
  })