"use server"

import { revalidateTag } from "next/cache"

import { prisma } from "@/lib/db"

export async function deleteSkatersAction(ids: string[]) {
  if (!isArrayOfStrings(ids)) {
    throw new Error("Skater ids must be an array of strings")
  }

  const deleteSkaters = ids.map((skaterId) =>
    prisma.skater.delete({
      where: {
        id: skaterId,
      },
    })
  )

  await Promise.all(deleteSkaters)
  revalidateTag("skaters")
}

function isArrayOfStrings(ids: string[] | string): ids is string[] {
  return ids instanceof Array
}
