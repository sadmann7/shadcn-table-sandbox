import { UnstyledTable } from "@/components/unstyled-table";
import { prisma } from "@/lib/db";
import { faker } from "@faker-js/faker";
import { type Skater } from "@prisma/client";

faker.seed(69420);

interface IndexPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const page = typeof searchParams.page === "string" ? +searchParams.page : 1;
  const pageCount = 10;

  // Get 10 skaters from the database
  const skaters = await prisma.skater.findMany({
    take: pageCount,
    skip: page * 10,
  });

  // Generate 100 skaters if there are less than 100
  if (skaters.length < 100) {
    for (let i = 0; i < 100; i++) {
      const name = faker.name.firstName();
      const age = faker.datatype.number({ min: 10, max: 50 });
      const email = faker.internet.email();
      const stats = faker.datatype.number({ min: 10, max: 100 });
      const stance =
        faker.helpers.shuffle<Skater["stance"]>(["mongo", "goofy"])[0] ??
        "goofy";
      const deckPrice = faker.datatype.number({ min: 50, max: 200 });

      await prisma.skater.create({
        data: {
          name,
          age,
          email,
          stats,
          stance,
          deckPrice,
        },
      });
    }
  }

  return <UnstyledTable data={skaters} pageCount={pageCount} />;
}
