import { Collection } from "mongodb";

import {Pets, Pets_Model, User, User_Model } from "./types.ts";

//Creamos funciones de conversion 

export const fromModeltoUser = async (
    model_user: User_Model,
    petsCollection: Collection<Pets_Model> ): Promise<User> => {
        const PetConfirmation = await petsCollection
        .find({_id: { $in: model_user.pets}})
        .toArray();

    return {
        id: model_user._id!.toString(),
        name: model_user.name,
        pets: PetConfirmation.map((p) => fromModeltoPet(p)),
    };

};

export const fromModeltoPet = (model_Pets: Pets_Model): Pets => ({
    id: model_Pets._id!.toString(),
    name: model_Pets.name,

});
 