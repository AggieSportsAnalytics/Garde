import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function uploadFileToS3(file, filename) {
    const fileBuffer = file;
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${filename}`,
        Body: fileBuffer,
        // ContentType: "image/png" 
        ContentType: "video/mov"
    }

    const command = new PutObjectCommand(params);
    await client.send(command); 

    return filename;
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if(!file) {
            return NextResponse.json({ error: "File not input" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = await uploadFileToS3(buffer, file.name);

        return NextResponse.json({ success: true, filename });
    } catch(error) {
        return NextResponse.json({ error: `Error uploading file: ${error}`});
    }
}