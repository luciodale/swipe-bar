import { SwipeBarLeft, SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";

function MultiLeftContent() {
	const { openSidebar, closeSidebar, leftSidebars } = useSwipeBarContext();
	const isNavOpen = leftSidebars.primary?.isOpen ?? false;
	const isSettingsOpen = leftSidebars.settings?.isOpen ?? false;

	return (
		<div className="relative flex h-full w-full">
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
						Analytics
					</button>
					<button
						type="button"
						onClick={() => openSidebar("left", { id: "settings" })}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-amber-300 hover:bg-amber-500/10 border border-amber-500/20"
					>
						Open Settings
					</button>
					<button
						type="button"
						onClick={() => closeSidebar("left")}
						className="w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarLeft>

			<div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-[500px]">
				<p className="text-sm text-white/50 mb-2">
					Two independent left sidebars. The settings panel opens only programmatically and stacks
					on top.
				</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => openSidebar("left")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Nav
					</button>
					<button
						type="button"
						onClick={() => openSidebar("left", { id: "settings" })}
						className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20"
					>
						Open Settings
					</button>
				</div>
				<div className="flex gap-3 text-xs text-white/40">
					<span>Nav: {isNavOpen ? "open" : "closed"}</span>
					<span>Settings: {isSettingsOpen ? "open" : "closed"}</span>
				</div>
			</div>

			<SwipeBarLeft
				id="settings"
				swipeToOpen={false}
				showToggle={false}
				swipeBarZIndex={70}
				overlayZIndex={65}
				isAbsolute
				className="bg-[#1a1a2e] text-white border-r border-amber-400/20"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-amber-400">Settings</span>
						<button
							type="button"
							onClick={() => closeSidebar("left", { id: "settings" })}
							className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-400/20"
						>
							Close
						</button>
					</div>
					<p className="text-xs text-white/50">
						Programmatic only. Higher z-index stacks it above the navigation drawer.
					</p>
					<div className="grid grid-cols-1 gap-2 mt-2">
						<div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
							<div className="text-xs text-amber-300/60">Theme</div>
							<div className="text-sm text-amber-400 mt-1">Dark</div>
						</div>
						<div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
							<div className="text-xs text-amber-300/60">Language</div>
							<div className="text-sm text-amber-400 mt-1">English</div>
						</div>
						<div className="rounded-lg border border-amber-400/10 bg-amber-400/5 p-3">
							<div className="text-xs text-amber-300/60">Notifications</div>
							<div className="text-sm text-amber-400 mt-1">Enabled</div>
						</div>
					</div>
				</div>
			</SwipeBarLeft>
		</div>
	);
}

export function MultiInstanceLeftRightDemo() {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<MultiLeftContent />
			</div>
		</SwipeBarProvider>
	);
}
