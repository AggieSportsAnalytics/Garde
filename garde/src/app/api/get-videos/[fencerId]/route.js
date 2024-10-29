import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(req, { params }) {
	try {
		const { fencerId } = params;
		const videos = await listR2Bucket(fencerId);

		return NextResponse.json(
			{ message: "List bucket successful", videos: videos },
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ message: "Error listing" }, { status: 500 });
	}
}

const listR2Bucket = async (fencerId) => {
	const r2Client = new S3Client({
		region: "auto",
		endpoint:
			"https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
		},
	});

	const prefix = `${fencerId}/`;

	try {
		const command = new ListObjectsV2Command({
			Bucket: process.env.BUCKET_NAME,
			Prefix: prefix,
			Delimiter: "/",
		});
		const response = await r2Client.send(command);
		const videos = response.CommonPrefixes.map((key) => {
			const keyArr = key.Prefix.split("/");
			return keyArr[1];
		});

		return videos;
	} catch (error) {
		console.error("Error listing objects in R2:", error);
	}
};
