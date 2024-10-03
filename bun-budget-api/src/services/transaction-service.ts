import { Prisma, Transaction as ProcessedTransaction } from "@prisma/client";
import NotFoundError from "../errors/not-found-error";
import prisma from "../utils/prisma";
import Transaction from "../types/Transaction";

const mapTransaction = ({
  id,
  category,
  description,
  value,
  timestamp,
}: ProcessedTransaction) => ({
  id,
  category,
  description,
  value: Number(value),
  timestamp,
});

export const createTransaction = async (transaction: Transaction) => {
  const createdTransaction = await prisma.transaction.create({
    data: transaction,
  });

  return mapTransaction(createdTransaction);
};

export const getTransaction = async (
  transactionId: string,
  credentialId: string,
) => {
  const foundTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      credentialId,
    },
  });

  if (!foundTransaction) {
    throw new NotFoundError("Transaction not found");
  }

  return mapTransaction(foundTransaction);
};

export const getTransactions = async (credentialId: string) => {
  const foundTransactions = await prisma.transaction.findMany({
    where: { credentialId },
  });

  return foundTransactions.map(mapTransaction);
};

export const updateTransaction = async (
  transactionId: string,
  transaction: Transaction,
) => {
  try {
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId, credentialId: transaction.credentialId },
      data: transaction,
    });

    return mapTransaction(updatedTransaction);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Transaction not found");
    }
    throw error;
  }
};

export const deleteTransaction = async (
  transactionId: string,
  credentialId: string,
) => {
  try {
    await prisma.transaction.delete({
      where: { id: transactionId, credentialId },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Transaction not found");
    }
    throw error;
  }
};
