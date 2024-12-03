import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { VehicleModel, PartModel } from "./types.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import "https://deno.land/x/dotenv/load.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("Por favor, proporciona una MONGO_URL en el archivo .env");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Conectado a MongoDB");

const mongoDB = mongoClient.db("classic_cars");
const VehiclesCollection = mongoDB.collection<VehicleModel>("vehicles");
const PartsCollection = mongoDB.collection<PartModel>("parts");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ VehiclesCollection, PartsCollection }),
});

console.info(`Servidor listo en ${url}`);