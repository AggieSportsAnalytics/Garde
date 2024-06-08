import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getAllIdealAngles = async () => {
    const idealAngles = await prisma.garde_ideal_angles.findMany();
    console.log(idealAngles);
    return idealAngles;
}