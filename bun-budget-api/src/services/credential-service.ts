import prisma from "../utils/prisma";

export const getCredentialId = async (username: string, password: string) => {
  const passwordHash = await Bun.password.hash(password);

  const foundCredential = await prisma.credential.findUnique({
    where: { username, passwordHash },
    select: { id: true },
  });

  return foundCredential?.id;
};
