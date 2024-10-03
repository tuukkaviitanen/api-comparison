import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import UniqueError from "../errors/unique-error";

export const getCredentialId = async (username: string, password: string) => {
  const passwordHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });

  const foundCredential = await prisma.credential.findUnique({
    where: { username, passwordHash },
    select: { id: true },
  });

  return foundCredential?.id;
};

export const createCredential = async (username: string, password: string) => {
  const passwordHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });

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
