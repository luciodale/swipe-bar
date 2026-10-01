import { SwipeBarBottom, useSwipeBarContext } from "@luciodale/swipe-bar";
import { DemoActions, DemoButton, DemoCard, DemoStatus } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody, PaneFacts } from "./page/Pane";

function MultiInstanceControls() {
	const { openSidebar, bottomSidebars } = useSwipeBarContext();
	const isPrimaryOpen = bottomSidebars.primary?.isOpen ?? false;
	const isSecondaryOpen = bottomSidebars.secondary?.isOpen ?? false;

	return (
		<DemoCard
			title="Try it"
			description="Two independent bottom sheets on this page. The secondary opens only programmatically and stacks on top."
		>
			<DemoActions>
				<DemoButton onClick={() => openSidebar("bottom")}>Open primary</DemoButton>
				<DemoButton tone="accent" onClick={() => openSidebar("bottom", { id: "secondary" })}>
					Open secondary
				</DemoButton>
			</DemoActions>
			<DemoStatus
				items={[
					{ label: "primary", value: isPrimaryOpen ? "open" : "closed" },
					{ label: "secondary", value: isSecondaryOpen ? "open" : "closed" },
				]}
			/>
		</DemoCard>
	);
}

function MultiInstanceSheets() {
	const { openSidebar, closeSidebar } = useSwipeBarContext();

	return (
		<PagePortal host="bottom">
			<SwipeBarBottom sidebarHeightPx={400} isAbsolute className={PANE_CLASS.bottom}>
				<PaneBody title="Primary sheet" onClose={() => closeSidebar("bottom")}>
					<PaneFacts
						items={[
							{ label: "Status", value: "Active" },
							{ label: "Items", value: "24" },
						]}
					/>
					<DemoActions>
						<DemoButton tone="accent" onClick={() => openSidebar("bottom", { id: "secondary" })}>
							Open secondary
						</DemoButton>
					</DemoActions>
				</PaneBody>
			</SwipeBarBottom>
			<SwipeBarBottom
				id="secondary"
				sidebarHeightPx={300}
				isAbsolute
				swipeToOpen={false}
				showToggle={false}
				swipeBarZIndex={70}
				overlayZIndex={65}
				className={PANE_CLASS.bottom}
			>
				<PaneBody
					title="Secondary sheet"
					onClose={() => closeSidebar("bottom", { id: "secondary" })}
				>
					<PaneFacts
						tone="accent"
						items={[
							{ label: "Notifications", value: "12" },
							{ label: "Messages", value: "5" },
						]}
					/>
				</PaneBody>
			</SwipeBarBottom>
		</PagePortal>
	);
}

export function MultiInstanceDemo() {
	return (
		<PageDemo>
			<MultiInstanceControls />
			<MultiInstanceSheets />
		</PageDemo>
	);
}
