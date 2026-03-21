import { SwipeBarBottom, SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";

function MultiContent() {
	const { openSidebar, closeSidebar, bottomSidebars } = useSwipeBarContext();
	const isPrimaryOpen = bottomSidebars.primary?.isOpen ?? false;
	const isSecondaryOpen = bottomSidebars.secondary?.isOpen ?? false;

	return (
		<div className="relative min-h-[500px] flex flex-col items-center justify-center gap-4 p-6">
			<p className="text-sm text-white/50 mb-2">
				Two independent bottom sheets. The secondary opens only programmatically and stacks on top.
			</p>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => openSidebar("bottom")}
					className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
				>
					Open Primary
				</button>
				<button
					type="button"
					onClick={() => openSidebar("bottom", { id: "secondary" })}
					className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20"
				>
					Open Secondary
				</button>
			</div>
			<div className="flex gap-3 text-xs text-white/40">
				<span>Primary: {isPrimaryOpen ? "open" : "closed"}</span>
				<span>Secondary: {isSecondaryOpen ? "open" : "closed"}</span>
			</div>

			<SwipeBarBottom
				sidebarHeightPx={400}
				isAbsolute
				className="bg-[#1a1a2e] text-white border-t border-white/10"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-white/90">Primary Panel</span>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => openSidebar("bottom", { id: "secondary" })}
								className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
							>
								Open Secondary
							</button>
							<button
								type="button"
								onClick={() => closeSidebar("bottom")}
								className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
							>
								Close
							</button>
						</div>
					</div>
					<p className="text-xs text-white/50">
						This is the primary bottom sheet. It has its own state independent of the secondary.
					</p>
					<div className="grid grid-cols-2 gap-2 mt-2">
						<div className="rounded-lg border border-white/10 bg-white/5 p-3">
							<div className="text-xs text-white/50">Status</div>
							<div className="text-sm text-white/80 mt-1">Active</div>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-3">
							<div className="text-xs text-white/50">Items</div>
							<div className="text-sm text-white/80 mt-1">24</div>
						</div>
					</div>
				</div>
			</SwipeBarBottom>

			<SwipeBarBottom
				id="secondary"
				sidebarHeightPx={300}
				isAbsolute
				swipeToOpen={false}
				showToggle={false}
				swipeBarZIndex={70}
				overlayZIndex={65}
				className="bg-[#1a1a2e] text-white border-t border-amber-400/20"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-amber-400">Secondary Panel</span>
						<button
							type="button"
							onClick={() => closeSidebar("bottom", { id: "secondary" })}
							className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-400/20"
						>
							Close
						</button>
					</div>
					<p className="text-xs text-white/50">
						Programmatic only. Higher z-index stacks it above the primary sheet.
					</p>
					<div className="grid grid-cols-2 gap-2 mt-2">
						<div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
							<div className="text-xs text-amber-300/60">Notifications</div>
							<div className="text-lg font-bold text-amber-400 mt-1">12</div>
						</div>
						<div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
							<div className="text-xs text-amber-300/60">Messages</div>
							<div className="text-lg font-bold text-amber-400 mt-1">5</div>
						</div>
					</div>
				</div>
			</SwipeBarBottom>
		</div>
	);
}

export function MultiInstanceDemo() {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<MultiContent />
			</div>
		</SwipeBarProvider>
	);
}
