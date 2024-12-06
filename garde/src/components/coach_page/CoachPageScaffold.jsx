export default function CoachPageScaffold() {
	return (
		<>
			<div className="text-white">
				<header className="flex items-center justify-between border-b py-4 px-4 top-1 relative">
					<div className="bg-gray-700 h-10 w-12 rounded animate-pulse" />
					<div className="bg-gray-700 h-10 w-60 rounded-lg animate-pulse" />
					<div className="bg-gray-700 h-8 w-8 rounded-full relative -left-3 animate-pulse" />
				</header>
			</div>
			<div className="flex flex-row mx-10 pt-10 text-white space-x-6">
				<div className="w-1/2">
					<>
						<div className="flex justify-between items-center mt-1 mr-2 mb-5">
							<div className="bg-gray-700 h-6 w-32 rounded animate-pulse" />
							<div className="flex gap-8">
								<div className="bg-gray-700 h-8 w-8 rounded animate-pulse" />
								<div className="bg-gray-700 h-8 w-8 rounded animate-pulse" />
							</div>
						</div>
						<div className="video-gallery grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
							{Array(1)
								.fill("")
								.map((_, idx) => (
									<div
										key={idx}
										className="bg-gray-700 w-full py-24 aspect-video rounded-lg animate-pulse"
									/>
								))}
						</div>
					</>
				</div>

				<div className="w-1/2">
					<div className="w-full text-black">
						<div className="flex mb-4 space-x-4 border-b pb-2">
							<div className="bg-gray-700 h-9 w-12 rounded animate-pulse" />
							<div className="bg-gray-700 h-9 w-12 rounded animate-pulse" />
						</div>
						<div className="editor-content border border-gray-300 p-4 rounded bg-gray-700 animate-pulse h-[415px]" />
						<div className="text-center">
							<div className="bg-gray-700 h-10 w-44 mx-auto mt-4 rounded animate-pulse" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
