import React, { Suspense } from 'react';
import Signin from "../../components/auth/Signin";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function () {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div>
				<Signin isSignUpDefault={false} type={"coach"} />
			</div>
		</Suspense>
	);
}
