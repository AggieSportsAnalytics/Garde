import { TailSpin } from "react-loader-spinner";

function Loader({ loading }) {
	return (
		<>
			{loading && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
					<div className="text-center">
						<p className="text-xl mb-4">Loading ...</p>
						<TailSpin color="#00BFFF" height={100} width={100} />
					</div>
				</div>
			)}
		</>
	);
}

export default Loader;
