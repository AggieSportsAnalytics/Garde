import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createFencerInstruction = async (name) => {

    const fencer_instruction = await prisma.fencer_instructions.create({
        data: {
            name
        }
    });

    return fencer_instruction;
}