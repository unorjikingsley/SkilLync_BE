// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log: ["query"]
// })

// export default prisma;

import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances of Prisma Client in development
  // This is needed when using Next.js or nodemon
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
