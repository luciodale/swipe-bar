import { SwipeBarLeft, useSwipeBarContext } from "@luciodale/swipe-bar";
import { DemoActions, DemoButton, DemoCard, DemoStatus } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody, PaneFacts, PaneLinks } from "./page/Pane";

function MultiLeftControls() {
	const { openSidebar, leftSidebars } = useSwipeBarContext();
	const isNavOpen = leftSidebars.primary?.isOpen ?? false;
	const isSettingsOpen = leftSidebars.settings?.isOpen ?? false;

	return (
		<DemoCard
			title="Try it"
			description="Two independent left sidebars on this page. The navigation sits in the layout; the settings panel opens only programmatically and floats on top."
		>
			<DemoActions>
				<DemoButton onClick={() => openSidebar("left")}>Open navigation</DemoButton>
				<DemoButton tone="accent" onClick={() => openSidebar("left", { id: "settings" })}>
					Open settings
				</DemoButton>
			</DemoActions>
			<DemoStatus
				items={[
					{ label: "navigation", value: isNavOpen ? "open" : "closed" },
					{ label: "settings", value: isSettingsOpen ? "open" : "closed" },
				]}
			/>
		</DemoCard>
	);
}

function MultiLeftPanes() {
	const { openSidebar, closeSidebar } = useSwipeBarContext();

	return (
		<PagePortal host="left">
			<SwipeBarLeft className={PANE_CLASS.left} ariaLabel="Navigation">
				<PaneBody title="Navigation" onClose={() => closeSidebar("left")}>
					<PaneLinks items={["Dashboard", "Projects", "Analytics"]} />
					<DemoActions>
						<DemoButton tone="accent" onClick={() => openSidebar("left", { id: "settings" })}>
							Open settings
						</DemoButton>
					</DemoActions>
				</PaneBody>
			</SwipeBarLeft>
			<SwipeBarLeft
				id="settings"
				isAbsolute
				swipeToOpen={false}
				showToggle={false}
				swipeBarZIndex={70}
				overlayZIndex={65}
				className={PANE_CLASS.left}
				ariaLabel="Settings"
			>
				<PaneBody title="Settings" onClose={() => closeSidebar("left", { id: "settings" })}>
					<PaneFacts
						tone="accent"
						items={[
							{ label: "Theme", value: "Dark" },
							{ label: "Language", value: "English" },
						]}
					/>
				</PaneBody>
			</SwipeBarLeft>
		</PagePortal>
	);
}

export function MultiInstanceLeftRightDemo() {
	return (
		<PageDemo>
			<MultiLeftControls />
			<MultiLeftPanes />
		</PageDemo>
	);
}
