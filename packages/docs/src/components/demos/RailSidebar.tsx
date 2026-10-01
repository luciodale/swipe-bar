import { SwipeBarLeft, useSwipeBarContext } from "@luciodale/swipe-bar";
import { DemoActions, DemoButton, DemoCard, DemoStatus } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS } from "./page/Pane";

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

function useRailToggle() {
	const { openSidebar, closeSidebar, isLeftOpen } = useSwipeBarContext();

	function handleToggle() {
		if (isLeftOpen) closeSidebar("left");
		else openSidebar("left");
	}

	return { isExpanded: isLeftOpen, handleToggle };
}

function RailContent() {
	const { isExpanded, handleToggle } = useRailToggle();
	const alignClass = isExpanded ? "justify-start gap-3" : "justify-center";

	return (
		<div className="flex h-full flex-col gap-2 p-2">
			<div
				className={`flex items-center border-b border-white/10 px-2 py-3 ${
					isExpanded ? "justify-between" : "justify-center"
				}`}
			>
				{isExpanded && <span className="text-sm font-semibold text-white">Navigation</span>}
				<button
					type="button"
					onClick={handleToggle}
					aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
					className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
				>
					{isExpanded ? "←" : "→"}
				</button>
			</div>

			<nav className="flex flex-col gap-1">
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						type="button"
						title={isExpanded ? undefined : item.label}
						aria-label={item.label}
						className={`flex cursor-pointer items-center rounded-md px-2 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white ${alignClass}`}
					>
						<span className="flex size-8 items-center justify-center text-lg" aria-hidden="true">
							{item.icon}
						</span>
						{isExpanded && <span className="text-sm">{item.label}</span>}
					</button>
				))}
			</nav>
		</div>
	);
}

function RailControls() {
	const { openSidebar, closeSidebar, isLeftOpen, isLeftRail } = useSwipeBarContext();
	const mode = isLeftOpen ? "open" : isLeftRail ? "rail" : "closed";

	return (
		<DemoCard
			title="Try it"
			description="On desktop the sidebar on the far left of this page collapses to a 64px rail instead of disappearing. Below 640px the rail is suppressed and the sidebar closes fully."
		>
			<DemoActions>
				<DemoButton onClick={() => openSidebar("left")}>Expand</DemoButton>
				<DemoButton onClick={() => closeSidebar("left")}>Collapse</DemoButton>
			</DemoActions>
			<DemoStatus items={[{ label: "mode", value: mode }]} />
		</DemoCard>
	);
}

export function RailSidebarDemo() {
	return (
		<PageDemo transitionMs={250}>
			<RailControls />
			<PagePortal host="left">
				<SwipeBarLeft
					showRail
					railWidthPx={64}
					sidebarWidthPx={240}
					className={PANE_CLASS.left}
					ariaLabel="Navigation"
				>
					<RailContent />
				</SwipeBarLeft>
			</PagePortal>
		</PageDemo>
	);
}
