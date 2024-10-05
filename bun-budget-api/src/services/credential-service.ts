import { Prisma } from "../../prisma/client";
import prisma from "../utils/prisma";
import UniqueError from "../errors/unique-error";

const generateHash = (string: string) => {
  const hash = new Bun.CryptoHasher("sha256");
  hash.update(string);
  const result = hash.digest("hex");
  return result;
};

export const getCredentialId = async (username: string, password: string) => {
  const passwordHash = generateHash(password);

  const foundCredential = await prisma.credential.findUnique({
    where: { username, passwordHash },
    select: { id: true },
  });

  return foundCredential?.id;
};

export const createCredential = async (username: string, password: string) => {
  const passwordHash = generateHash(password);

  try {
    await prisma.credential.create({
      data: {
        username,
        passwordHash,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new UniqueError("Username already taken");
    }
    throw error;
  }
};

export const deleteCredential = async (credentialId: string) => {
  await prisma.credential.delete({ where: { id: credentialId } });
};
