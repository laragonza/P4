import { Collection, ObjectId } from "mongodb";
import { Vehicle, VehicleModel, Part, PartModel } from "./types.ts";
import { formVehicleModelToVehicle, formPartModelToPart } from "./utils.ts";


export const resolvers = {
  Query: {
    vehicles: async (
      _: unknown,
      __: unknown,
      context: { VehiclesCollection: Collection<VehicleModel>; PartsCollection: Collection<PartModel> }
    ): Promise<Vehicle[]> => {
      const vehiclesModel = await context.VehiclesCollection.find().toArray();

      const vehicles = await Promise.all(
        vehiclesModel.map(async (vehicleModel) => {
          const partsModel = await context.PartsCollection.find({ vehicleId: vehicleModel._id }).toArray();
          const parts = partsModel.map(formPartModelToPart);

          const jokeResponse = await fetch("https://official-joke-api.appspot.com/random_joke");
          const jokeData = await jokeResponse.json();
          const joke = `${jokeData.setup} - ${jokeData.punchline}`;

          return formVehicleModelToVehicle(vehicleModel, parts, joke);
        })
      );

      return vehicles;
    },

    vehicle: async (
      _: unknown,
      { id }: { id: string },
      context: { VehiclesCollection: Collection<VehicleModel>; PartsCollection: Collection<PartModel> }
    ): Promise<Vehicle | null> => {
      const vehicleModel = await context.VehiclesCollection.findOne({ _id: new ObjectId(id) });
      if (!vehicleModel) return null;

      const partsModel = await context.PartsCollection.find({ vehicleId: vehicleModel._id }).toArray();
      const parts = partsModel.map(formPartModelToPart);

      const jokeResponse = await fetch("https://official-joke-api.appspot.com/random_joke");
      const jokeData = await jokeResponse.json();
      const joke = `${jokeData.setup} - ${jokeData.punchline}`;

      return formVehicleModelToVehicle(vehicleModel, parts, joke);
    },

    parts: async (
      _: unknown,
      __: unknown,
      context: { PartsCollection: Collection<PartModel> }
    ): Promise<Part[]> => {
      const partsModel = await context.PartsCollection.find().toArray();
      return partsModel.map(formPartModelToPart);
    },

    vehiclesByManufacturer: async (
      _: unknown,
      { manufacturer }: { manufacturer: string },
      context: { VehiclesCollection: Collection<VehicleModel> }
    ): Promise<Vehicle[]> => {
      const vehiclesModel = await context.VehiclesCollection.find({ manufacturer }).toArray();

      const vehicles = await Promise.all(
        vehiclesModel.map(async (vehicleModel) => {
          const jokeResponse = await fetch("https://official-joke-api.appspot.com/random_joke");
          const jokeData = await jokeResponse.json();
          const joke = `${jokeData.setup} - ${jokeData.punchline}`;

          return formVehicleModelToVehicle(vehicleModel, [], joke);
        })
      );

      return vehicles;
    },

    partsByVehicle: async (
      _: unknown,
      { vehicleId }: { vehicleId: string },
      context: { PartsCollection: Collection<PartModel> }
    ): Promise<Part[]> => {
      const partsModel = await context.PartsCollection.find({ vehicleId: new ObjectId(vehicleId) }).toArray();
      return partsModel.map(formPartModelToPart);
    },

    vehiclesByYearRange: async (
      _: unknown,
      { startYear, endYear }: { startYear: number; endYear: number },
      context: { VehiclesCollection: Collection<VehicleModel> }
    ): Promise<Vehicle[]> => {
      const vehiclesModel = await context.VehiclesCollection.find({
        year: { $gte: startYear, $lte: endYear },
      }).toArray();

      return vehiclesModel.map((vehicleModel) => formVehicleModelToVehicle(vehicleModel));
    },
  },

  Mutation: {
    addVehicle: async (
      _: unknown,
      { name, manufacturer, year }: { name: string; manufacturer: string; year: number },
      context: { VehiclesCollection: Collection<VehicleModel> }
    ): Promise<Vehicle> => {
      const { insertedId } = await context.VehiclesCollection.insertOne({ name, manufacturer, year });
      const vehicleModel: VehicleModel = { _id: insertedId, name, manufacturer, year };

      return formVehicleModelToVehicle(vehicleModel);
    },

    addPart: async (
      _: unknown,
      { name, price, vehicleId }: { name: string; price: number; vehicleId: string },
      context: { PartsCollection: Collection<PartModel> }
    ): Promise<Part> => {
      const { insertedId } = await context.PartsCollection.insertOne({
        name,
        price,
        vehicleId: new ObjectId(vehicleId),
      });
      const partModel: PartModel = { _id: insertedId, name, price, vehicleId: new ObjectId(vehicleId) };

      return formPartModelToPart(partModel);
    },

    updateVehicle: async (
      _: unknown,
      { id, name, manufacturer, year }: { id: string; name: string; manufacturer: string; year: number },
      context: { VehiclesCollection: Collection<VehicleModel> }
    ): Promise<Vehicle | null> => {
      const result = await context.VehiclesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, manufacturer, year } }
      );

      if (result.matchedCount === 0) return null;

      const vehicleModel = await context.VehiclesCollection.findOne({ _id: new ObjectId(id) });
      if (!vehicleModel) return null;

      return formVehicleModelToVehicle(vehicleModel);
    },

    deletePart: async (
      _: unknown,
      { id }: { id: string },
      context: { PartsCollection: Collection<PartModel> }
    ): Promise<Part | null> => {
        const deleteResult = await context.PartsCollection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!deleteResult) return null;
        
        return formPartModelToPart(deleteResult);
    },
  },
};