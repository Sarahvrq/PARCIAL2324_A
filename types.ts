import { ObjectId, OptionalId} from "mongodb";

//Los Normales
export type User = {
    id: string;
    name: string;
    pets: Pets[];
};

export type Pets = {
    id: string;
    name: string;
};


//OptionalIds: Models
export type User_Model = OptionalId<{
    _id: ObjectId;
    name: string;
    pets: ObjectId[];
}>;

export type Pets_Model = OptionalId <{
    _id: ObjectId;
    name: string;
}>;