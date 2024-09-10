const fs = require('fs');
const path = require('path');

const schemaContent = `
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model StatusLog {
  id        Int      @id @default(autoincrement())
  timestamp DateTime
  cpuCount  Int
  memory    Float
  pid       Int
  ppid      Int
  ctime     BigInt
  elapsed   Float
  load1     Float
  load5     Float
  load15    Float
  heapTotal BigInt
  heapUsed  BigInt
  response2xx Int
  response3xx Int
  response4xx Int
  response5xx Int
  responseMean Float
  createdAt DateTime @default(now())
}
`;

const prismaDir = path.join(process.cwd(), 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir);
}

fs.writeFileSync(schemaPath, schemaContent);

console.log('Prisma schema created. Please run `npx prisma generate` to generate the Prisma client.');
console.log('Make sure to set the DATABASE_URL environment variable in your .env file.');