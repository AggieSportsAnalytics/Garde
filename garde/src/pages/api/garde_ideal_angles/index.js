import { getAllIdealAngles } from "../../../../prisma/garde_ideal_angles";

export default async function handler(req, res) {
    try {

        switch(req.method) {
            case 'GET': {
                const idealAngles = await getAllIdealAngles();
                return res.status(200).json(idealAngles);
            }
        }

    } catch(error) {
        console.log(error);
    }
}