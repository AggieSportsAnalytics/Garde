function Loader({ loading, height = 100, width = 100 }) {
	return (
		<>
			{loading && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
					<div className="text-center">
						<p className="text-xl mb-4">Loading ...</p>
						<div
							className={`loader spinner-border animate-spin rounded-full h-[${height}px] w-[${width}px] border-t-2 border-b-2 border-blue-500`}
						/>
					</div>
				</div>
			)}
		</>
	);
}

export default Loader;
