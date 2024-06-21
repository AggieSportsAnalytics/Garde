import { createFencerInstruction } from "../../../../prisma/fencer_instructions";

export default async function handler(req, res) {
    try {

        switch(req.method) {
            case 'POST': {
                const {name} = req.body;
                const new_instruction = await createFencerInstruction(name);

                return res.status(201).json(new_instruction);
            }
        }

    } catch(error) {
        console.log(error);
    }
}