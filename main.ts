import { ListCollectionsCursor, MongoClient, ObjectId } from "mongodb";
import { User_Model, Pets_Model } from "./types.ts";
import { fromModeltoPet, fromModeltoUser } from "./util.ts";

const M_URL = Deno.env.get("MONGO_URL");
    if(!M_URL){
        console.error("M_URL no existe");
        Deno.exit(1);
    }

const client = new MongoClient (M_URL);
await client.connect();
console.info("Conexion con MongoDB exitosa");

//Creating our DB
const db = client.db("UserPet-Resgister");

//Creacion de las tablas dentro DB ^
const userCollection = db.collection<User_Model>("Users");
const petsCollection = db.collection<Pets_Model>("Pets");

//HTTP FUNCIONES
//getparams para get and delete && req.json para post and put
const handler = async (req: Request): Promise<Response> => {
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    if(method==="POST"){
        if (path==="/user"){
            const user = await req.json();

            //check if variables of the type exist (dont include arrays)
            if(!user.name){
                return new Response ("Bad request", {status: 404});
                }
            //check if user name exists
            const userDB = await userCollection.findOne({
                name: user.name,
            });

             if(userDB) return new Response ("Username ya existe", {status: 409});

            //Añadir un usuario
            const { insertedId } = await userCollection.insertOne ({ //insertEDId --> ED!!!!!!!!!!!!!
                name: user.name,
                pets: []
            });

            return new Response(
                JSON.stringify({
                    name: user.name,
                    pets: [],
                    id: insertedId,
                }), {status: 201}
            );


        } else if (path ==="/pet"){

            //check if variables of the type exist (dont include arrays)
            const pets = await req.json();

            if(!pets.name){
                return new Response ("Bad request", {status: 404});
                }

            //check if pet name exists
            const petsDB = await userCollection.findOne({
                name: pets.name,
            });

                if(petsDB) return new Response ("Username ya existe", {status: 409});

            //Añadir un usuario
            const { insertedId } = await petsCollection.insertOne ({ //insertEDId --> ED!!!!!!!!!!!!!
                name: pets.name,
            });

            return new Response(
                JSON.stringify({
                    name: pets.name,
                    id: insertedId,
                }), {status: 201}
            );

        }

    } else if (method === "GET"){
        if (path==="/users"){
            //todos los usuarios
            const name = url.searchParams.get("name");
                if(name){
                    const userDB = await userCollection.find({name}).toArray();
                    const users = await Promise.all(
                        userDB.map((u)=> fromModeltoUser(u, petsCollection))
                    );
                    return new Response (JSON.stringify(users));
                }else {
                const userDB = await userCollection.find().toArray();
                const users = await Promise.all(
                    userDB.map((u)=> fromModeltoUser(u, petsCollection))
                );
                return new Response (JSON.stringify(users));
            }
        }else if (path === "/user"){
            //solo UN usuario

            //lets pretend our user have emails
            /*const email = ur.searchParams.get("email");
                if(email){
                const userDB = await userCollection.findOne({email,})
                }else{
                return new Responde ("Bad request", {status: 400});
                
                if(userBD){
                const user = await fromModeltoUser(userDB, petCollection);
                return new Response (JSON.Stringify(user));
                }else{
                return new Responde ("User not found", {status: 404});
                } 
            

            */
        }else if (path === "/pets"){
            //array de mascotas
            const petsBD = await petsCollection.find().toArray();
            const pets = petsBD.map((p)=>fromModeltoPet(p));
            return new Response (JSON.stringify(pets));

        }else if (path === "/pet"){
            //solo UNA mascota
            const id = url.searchParams.get("id");

            if(!id){return new Response ("Bad Request", {status: 400})};
                const petsBD = await petsCollection.findOne({ _id: new ObjectId(id) });
            if(!petsBD){return new Response ("Pet not Found", {status: 404})};
                const pet = fromModeltoPet(petsBD);
                return new Response (JSON.stringify(pet));
            
        }

    } else if (method === "PUT"){ //put es para update un valor, tendra similar forma que post
        //Solo podremos modificar user, pets y pet. No hay mas que podamos modificar como type. No podemos hacer userS, porque modificar 
        //multiples usuarios no es un caso muy real.

        if (path==="/user"){
            const user = await req.json();

            //check if variables of the type exist (dont include arrays)
            if(!user.name){
                return new Response ("Bad request", {status: 404});
                }
            
        //Para añadir un Pet: Le hacemos primero que la modificacion del user ya que en ese usamos este basically.
        if(user.pet){
            const pets = await petsCollection
                .find({_id: user.pets.map((id:string) => new ObjectId(id))})
                .toArray;
            if(pets.length !== user.pets.length){
                return new Response ("Book not Found", {status: 404});
            }
        }
            //como solo tenemos campo de nombre, vamos a pretender que el usuario tiene mail como identificador personal
            /*const { modifiedCount } = await userCollection.updateOne(
                {email: user.email},
                { $set: { name: user.name, pets: user.pets } }
            );
                
            //Si el metodo modifiedCount NO SE UTULIZO
            if (!modifiedCount === 0) {
                return new Response ("User not found", {status: 404}); 
            } else {
                return new Response ("OK", {status: 404});
            }
            */

        } else if (path === "/pet") {
             const pet = await req.json();
            
            //Check si la variable existe: straight del POST, igual que con user
            if(!pet.name){
                return new Response ("Bad request", {status: 404});
                }
            
            //modificamos el campo del pet, esta vez recibiendo el _id ya que es un array. Pero esencualmente igual que con user.
            /*const { modifiedCount } = await petCollection.updateOne(
                {_id: new ObjectId (book.id as String)},
                { $set: { name: pet.name} } //
            ); 
            
            //misma comprobacion que con users:
            if (!modifiedCount === 0) {
                return new Response ("User not found", {status: 404}); 
            } else {
                return new Response ("OK", {status: 404});
            } */
        }

    }

    return new Response ("Fallo", {status: 404});
}

Deno.serve({port: 3000}, handler)