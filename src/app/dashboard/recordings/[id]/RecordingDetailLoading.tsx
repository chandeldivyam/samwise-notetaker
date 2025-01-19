// src/app/dashboard/recordings/[id]/RecordingDetailLoading.tsx
export function RecordingDetailLoading() {
	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-6xl mx-auto">
				<div className="bg-component-background rounded-lg shadow-sm p-6 mb-6">
					<div className="animate-pulse">
						<div className="h-8 bg-text-secondary rounded w-1/3 mb-4" />
						<div className="flex space-x-4">
							<div className="h-4 bg-text-secondary rounded w-24" />
							<div className="h-4 bg-text-secondary rounded w-24" />
							<div className="h-4 bg-text-secondary rounded w-24" />
						</div>
					</div>
				</div>

				<div className="grid gap-6 grid-cols-1">
					<div className="bg-component-background rounded-lg shadow-sm p-6">
						<div className="animate-pulse">
							<div className="h-64 bg-text-secondary rounded" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
