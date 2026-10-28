import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  const password = await prompt.question("Password admin baru (minimal 12 karakter): ");
  prompt.close();
  if (password.length < 12) {
    console.error("Password minimal 12 karakter.");
    process.exit(1);
  }
  console.log("\nSalin baris berikut ke environment variable aplikasi:\n");
  console.log(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}`);
}

main();
