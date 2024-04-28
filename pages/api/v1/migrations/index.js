import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

const ALLOWED_METHODS = ["GET", "POST"];

export default async function migrations(request, response) {
  if (!ALLOWED_METHODS.includes(request.method))
    response.status(405).json("Method not allowed");

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      const status = migratedMigrations.length > 0 ? 201 : 200;
      response.status(status).json(migratedMigrations);
    }
  } catch (error) {
    return response.status(500).json(error);
  } finally {
    await dbClient.end();
  }
}
