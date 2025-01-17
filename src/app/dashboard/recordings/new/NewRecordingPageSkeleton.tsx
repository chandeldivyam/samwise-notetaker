export function NewRecordingPageSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			<div className="h-8 bg-component-background rounded w-1/3" />
			<div className="space-y-4">
				<div className="h-10 bg-foreground rounded" />
				<div className="h-32 bg-foreground rounded" />
				<div className="h-40 bg-foreground rounded" />
				<div className="h-10 bg-foreground rounded" />
			</div>
		</div>
	);
}
