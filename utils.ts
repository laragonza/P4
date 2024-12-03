import { Vehicle, VehicleModel, Part, PartModel } from "./types.ts";

export const formVehicleModelToVehicle = (
  vehicleModel: VehicleModel,
  parts: Part[] = [],
  joke?: string
): Vehicle => {
  return {
    id: vehicleModel._id!.toString(),
    name: vehicleModel.name,
    manufacturer: vehicleModel.manufacturer,
    year: vehicleModel.year,
    joke,
    parts,
  };
};

export const formPartModelToPart = (partModel: PartModel): Part => {
  return {
    id: partModel._id!.toString(),
    name: partModel.name,
    price: partModel.price,
    vehicleId: partModel.vehicleId.toString(),
  };
};