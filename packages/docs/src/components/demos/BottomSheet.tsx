import { SwipeBarBottom, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useState } from "react";
import { DemoActions, DemoButton, DemoCard, DemoStatus, DemoSwitch } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody, PaneFacts } from "./page/Pane";

// Mid and full stops far apart so the two open motions read as distinct.
const FULL_HEIGHT_RATIO = 0.85;
const MID_HEIGHT_RATIO = 0.3;

function useSheetHeights() {
	const [heights] = useState(() => ({
		fullPx: Math.round(window.innerHeight * FULL_HEIGHT_RATIO),
		midPx: Math.round(window.innerHeight * MID_HEIGHT_RATIO),
	}));
	return heights;
}

const SHEET_ACTIONS = [
	{ label: "Files", value: "12" },
	{ label: "Stats", value: "4" },
	{ label: "Settings", value: "3" },
	{ label: "Alerts", value: "7" },
];

function BottomSheetDemoContent() {
	const {
		openSidebarFully,
		openSidebarToMidAnchor,
		closeSidebar,
		bottomSidebars,
		bottomAnchorState,
	} = useSwipeBarContext();
	const [useMidAnchor, setUseMidAnchor] = useState(true);
	const { fullPx, midPx } = useSheetHeights();
	const isOpen = bottomSidebars.primary?.isOpen ?? false;

	return (
		<>
			<DemoCard
				title="Try it"
				description="The sheet rises from the bottom of this page. Swipe up from the bottom edge on mobile."
			>
				<DemoActions>
					{useMidAnchor && (
						<DemoButton onClick={() => openSidebarToMidAnchor("bottom")}>Open to mid</DemoButton>
					)}
					<DemoButton onClick={() => openSidebarFully("bottom")}>Open full</DemoButton>
				</DemoActions>
				<DemoSwitch
					label="midAnchorPoint"
					hint="Stop halfway before opening fully"
					checked={useMidAnchor}
					onToggle={() => setUseMidAnchor((prev) => !prev)}
				/>
				<DemoStatus
					items={[
						{ label: "state", value: isOpen ? "open" : "closed" },
						{ label: "anchor", value: bottomAnchorState },
					]}
				/>
			</DemoCard>

			<PagePortal host="bottom">
				<SwipeBarBottom
					sidebarHeightPx={fullPx}
					isAbsolute
					midAnchorPoint={useMidAnchor}
					midAnchorPointPx={midPx}
					swipeToOpen={!useMidAnchor}
					className={PANE_CLASS.bottom}
					ariaLabel="Quick actions"
				>
					<PaneBody title="Quick actions" onClose={() => closeSidebar("bottom")}>
						<PaneFacts items={SHEET_ACTIONS} />
					</PaneBody>
				</SwipeBarBottom>
			</PagePortal>
		</>
	);
}

export function BottomSheetDemo() {
	return (
		<PageDemo>
			<BottomSheetDemoContent />
		</PageDemo>
	);
}
