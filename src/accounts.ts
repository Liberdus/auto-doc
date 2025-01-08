
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs/promises';
import * as path from 'path';

const geminiApiKey = "AIzaSyB0gm-Th-v34n8ydSvN855WI6Cr4Ch0qss"; 
const googleAI = new GoogleGenerativeAI(geminiApiKey);

async function processDirectory(directory: string): Promise<string> {
  const files = await fs.readdir(directory);
  let allCode = "";

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      allCode += await processDirectory(filePath); 
    } else {
      const fileExtension = path.extname(filePath);
      if (['.js', '.ts', '.py', '.java', '.cpp'].includes(fileExtension)) { 
        const code = await fs.readFile(filePath, 'utf-8');
        allCode += `\n// ${filePath}\n${code}\n`; 
      }
    }
  }

  return allCode;
}

async function main() {
  const rootDirectory = '../server/src'; // Replace with actual directory path
  const allCode = await processDirectory(rootDirectory);


  
  let prompt = `
  The following is our codebase

  \`\`\`
  ${allCode}
  \`\`\`

  Generate a documentation fo all the account types 
  Documentation should include the what each transaction are composed of 
  document it such that it exaplain from and to is the address of the account 32byte timestamp is in millisecond and signature is the hash of the transaction
  pay attention to the type defination file.
  Example User Account 
  {
    id: string;
    ...
  }
  Also elaborate for each types of account by pay attention to the validation functioni of the each transaction types
  id are not hashes they're 32byte address in shardus address space

  explain amount is in bigint and from and to the address of the account
  create a markdown accounts.md for all the account types
  `;

  const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
  const reponse2 = await model.generateContent([prompt]);
  console.log(reponse2.response.text());


}

main();
