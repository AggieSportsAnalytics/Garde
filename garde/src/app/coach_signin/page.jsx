import Signin from "../../components/auth/Signin";

export default function () {
	return (
		<div>
			<Signin isSignUpDefault={false} type={"coach"} />
		</div>
	);
}
