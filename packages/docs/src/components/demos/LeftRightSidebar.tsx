import {
	SwipeBarLeft,
	SwipeBarProvider,
	SwipeBarRight,
	useSwipeBarContext,
} from "@luciodale/swipe-bar";

function SidebarContent() {
	const { openSidebar, closeSidebar, isLeftOpen, isRightOpen } = useSwipeBarContext();

	return (
		<div className="flex h-full w-full">
			<SwipeBarLeft isAbsolute className="bg-[#1a1a2e] text-white border-r border-white/10">
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="text-sm font-semibold text-white/90 mb-2">Navigation</div>
					<button
						type="button"
						className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 border border-white/10"
					>
						Dashboard
					</button>
					<button
						type="button"
						className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 border border-white/10"
					>
						Projects
					</button>
					<button
						type="button"
						className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 border border-white/10"
					>
						Settings
					</button>
					<button
						type="button"
						onClick={() => closeSidebar("left")}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarLeft>

			<div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-[400px]">
				<p className="text-sm text-white/50 mb-4">
					Swipe from left/right edge on mobile, or use the buttons below.
				</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => openSidebar("left")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Left
					</button>
					<button
						type="button"
						onClick={() => openSidebar("right")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Right
					</button>
				</div>
				<div className="flex gap-3 text-xs text-white/40">
					<span>Left: {isLeftOpen ? "open" : "closed"}</span>
					<span>Right: {isRightOpen ? "open" : "closed"}</span>
				</div>
			</div>

			<SwipeBarRight isAbsolute className="bg-[#1a1a2e] text-white border-l border-white/10">
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="text-sm font-semibold text-white/90 mb-2">Settings</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-3">
						<div className="text-xs text-white/50">Theme</div>
						<div className="mt-1 text-sm text-white/80">Dark</div>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-3">
						<div className="text-xs text-white/50">Language</div>
						<div className="mt-1 text-sm text-white/80">English</div>
					</div>
					<button
						type="button"
						onClick={() => closeSidebar("right")}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarRight>
		</div>
	);
}

export function LeftRightSidebarDemo() {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<SidebarContent />
			</div>
		</SwipeBarProvider>
	);
}
