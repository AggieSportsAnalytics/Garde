"use client";

import { useEffect } from "react";
import checkAuth from "../hooks/jwt_verify";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../../components/axios";
import { useRouter } from "next/navigation";

export default function Fencer_Page() {
	const router = useRouter();
	const workerUrl = `${process.env.NEXT_PUBLIC_GARDE_WORKER}`;

	useEffect(() => {
		const getVideos = async (fencerId) => {
			try {
				const res = await axiosInstance.get(
					`${workerUrl}/getVideo/${fencerId}`,
				);
				return res.data.data;
			} catch (error) {
				console.error(error);
				return null;
			}
		};

		const fetchAuthData = async () => {
			try {
				const decoded = await checkAuth(router, "signin", "fencer", true);

				if (decoded?.id) {
					const vids = await getVideos(decoded.id);
					if (vids?.[vids.length - 1]?.video_id) {
						router.push(`/fencer_page/${vids[vids.length - 1].video_id}`);
						return;
					}
				}

				router.push(`/fencer_page/${uuidv4()}`);
			} catch (error) {
				console.error(error);
			}
		};

		fetchAuthData();
	}, []);
}
