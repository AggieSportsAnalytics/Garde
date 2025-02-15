import React, { Suspense } from "react";
import Signin from "../../components/auth/Signin";

export default function () {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Signin />
		</Suspense>
	);
}
