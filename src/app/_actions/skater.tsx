"use server"

import { revalidateTag } from "next/cache"

import { prisma } from "@/lib/db"

export async function deleteSkaters(ids: string[]) {
  const deleteSkaters = ids.map((skaterId) =>
    prisma.skater.delete({
      where: {
        id: skaterId.toString(),
      },
    })
  )

  await Promise.all(deleteSkaters)
  revalidateTag("skaters")
}
