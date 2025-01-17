export function RecordingDetailLoading() {
	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="animate-pulse">
					<div className="h-8 bg-foreground rounded w-1/3 mb-8" />
					<div className="h-64 bg-foreground rounded mb-8" />
					<div className="space-y-4">
						<div className="h-4 bg-foreground rounded w-3/4" />
						<div className="h-12 bg-foreground rounded w-1/2" />
						<div className="h-8 bg-foreground rounded w-2/3" />
					</div>
				</div>
			</div>
		</div>
	);
}
