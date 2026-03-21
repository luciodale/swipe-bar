import { SwipeBarBottom, SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useState } from "react";

function SheetContent() {
	const { openSidebar, openSidebarToMidAnchor, closeSidebar, bottomSidebars, bottomAnchorState } =
		useSwipeBarContext();
	const isOpen = bottomSidebars.primary?.isOpen ?? false;
	const [useMidAnchor, setUseMidAnchor] = useState(true);

	return (
		<div className="relative min-h-[500px] flex flex-col items-center justify-center gap-4 p-6">
			<p className="text-sm text-white/50 mb-2">
				Swipe up from the bottom edge on mobile, or use the buttons.
			</p>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => (useMidAnchor ? openSidebarToMidAnchor("bottom") : openSidebar("bottom"))}
					className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
				>
					{useMidAnchor ? "Open to Mid" : "Open Full"}
				</button>
				{useMidAnchor && (
					<button
						type="button"
						onClick={() => openSidebar("bottom")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Full
					</button>
				)}
			</div>
			<div className="flex items-center gap-2 mt-2">
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						className="sr-only peer"
						checked={useMidAnchor}
						onChange={() => setUseMidAnchor(!useMidAnchor)}
					/>
					<div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-emerald-500/50 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
					<span className="ms-2 text-xs text-white/60">Mid-anchor</span>
				</label>
			</div>
			<div className="text-xs text-white/40 mt-1">
				State: {isOpen ? "open" : "closed"} | Anchor: {bottomAnchorState}
			</div>

			<SwipeBarBottom
				sidebarHeightPx={450}
				isAbsolute
				midAnchorPoint={useMidAnchor}
				swipeToOpen={!useMidAnchor}
				className="bg-[#1a1a2e] text-white border-t border-white/10"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-white/90">Quick Actions</span>
						<button
							type="button"
							onClick={() => closeSidebar("bottom")}
							className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
						>
							Close
						</button>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
							<div className="text-lg">📁</div>
							<div className="text-xs text-white/60 mt-1">Files</div>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
							<div className="text-lg">📊</div>
							<div className="text-xs text-white/60 mt-1">Stats</div>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
							<div className="text-lg">⚙️</div>
							<div className="text-xs text-white/60 mt-1">Settings</div>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
							<div className="text-lg">🔔</div>
							<div className="text-xs text-white/60 mt-1">Alerts</div>
						</div>
					</div>
					<div className="mt-auto text-center text-xs text-white/40">
						{useMidAnchor ? "Swipe up to mid-anchor, swipe again for full" : "Swipe down to close"}
					</div>
				</div>
			</SwipeBarBottom>
		</div>
	);
}

export function BottomSheetDemo() {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<SheetContent />
			</div>
		</SwipeBarProvider>
	);
}
