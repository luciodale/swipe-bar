import { SwipeBarLeft, SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";

type TNavItem = {
	id: string;
	label: string;
	icon: string;
};

const NAV_ITEMS: TNavItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: "▤" },
	{ id: "projects", label: "Projects", icon: "▦" },
	{ id: "team", label: "Team", icon: "◉" },
	{ id: "calendar", label: "Calendar", icon: "▣" },
	{ id: "settings", label: "Settings", icon: "✦" },
];

function RailContent() {
	const { openSidebar, closeSidebar, isLeftOpen, isLeftRail } = useSwipeBarContext();

	const showLabels = isLeftOpen;

	return (
		<div className="flex h-full flex-col p-2 gap-2">
			<div
				className="flex items-center gap-3 px-2 py-3 border-b border-white/10"
				style={{ justifyContent: showLabels ? "space-between" : "center" }}
			>
				{showLabels && <span className="text-sm font-semibold text-white/90">Navigation</span>}
				<button
					type="button"
					onClick={() => {
						if (isLeftOpen) closeSidebar("left");
						else openSidebar("left");
					}}
					aria-label={isLeftOpen ? "Collapse navigation" : "Expand navigation"}
					className="flex items-center justify-center rounded-md w-8 h-8 text-white/60 hover:bg-white/10 hover:text-white/90 transition-colors"
				>
					{isLeftOpen ? "←" : "→"}
				</button>
			</div>

			<nav className="flex flex-col gap-1 mt-1">
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						type="button"
						title={!showLabels ? item.label : undefined}
						aria-label={item.label}
						className="flex items-center rounded-md px-2 py-2 text-white/70 hover:bg-white/10 hover:text-white/95 transition-colors"
						style={{
							gap: showLabels ? "0.75rem" : 0,
							justifyContent: showLabels ? "flex-start" : "center",
						}}
					>
						<span className="flex items-center justify-center w-8 h-8 text-lg" aria-hidden="true">
							{item.icon}
						</span>
						{showLabels && <span className="text-sm">{item.label}</span>}
					</button>
				))}
			</nav>

			<div className="mt-auto pt-3 border-t border-white/10">
				<div
					className="flex items-center gap-3 px-2 py-2 text-xs text-white/40"
					style={{ justifyContent: showLabels ? "flex-start" : "center" }}
				>
					<span aria-hidden="true">●</span>
					{showLabels && <span>{isLeftRail ? "Rail mode" : "Open"}</span>}
				</div>
			</div>
		</div>
	);
}

function MainPanel() {
	const { isLeftOpen, isLeftRail } = useSwipeBarContext();
	const mode = isLeftOpen ? "open" : isLeftRail ? "rail" : "closed";

	return (
		<div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-[420px]">
			<p className="text-sm text-white/50 text-center max-w-md">
				Desktop: the sidebar collapses to a 64px rail instead of disappearing. Click the arrow at
				the top of the rail to expand. Resize below 640px to see the traditional overlay close
				behavior.
			</p>
			<div className="flex gap-3 text-xs text-white/40">
				<span>Mode: {mode}</span>
			</div>
		</div>
	);
}

function RailLayout() {
	return (
		<div className="flex h-full w-full">
			<SwipeBarLeft
				showRail
				railWidthPx={64}
				sidebarWidthPx={240}
				className="bg-[#1a1a2e] text-white border-r border-white/10"
			>
				<RailContent />
			</SwipeBarLeft>

			<MainPanel />
		</div>
	);
}

export function RailSidebarDemo() {
	return (
		<SwipeBarProvider transitionMs={250} swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<RailLayout />
			</div>
		</SwipeBarProvider>
	);
}
