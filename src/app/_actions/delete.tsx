"use server"

import { prisma } from "@/lib/db"

export async function deleteSkaters(fd: FormData) {
  const skaterIds = fd.getAll("skaterId")

  const deleteSkaters = skaterIds.map((skaterId) =>
    prisma.skater.delete({
      where: {
        id: skaterId.toString(),
      },
    })
  )

  await Promise.all(deleteSkaters)
}
