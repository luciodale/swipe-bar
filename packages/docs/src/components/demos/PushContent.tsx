import { SwipeBarLeft, SwipeBarRight, useSwipeBarContext } from "@luciodale/swipe-bar";
import { DemoActions, DemoButton, DemoCard, DemoStatus } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody, PaneFacts, PaneLinks } from "./page/Pane";

export const PUSH_DEMO_BREAKPOINT_PX = 1024;

function PushControls() {
	const { openSidebar, isLeftOpen, isRightOpen } = useSwipeBarContext();

	return (
		<DemoCard
			title="Try it"
			description={`Below ${PUSH_DEMO_BREAKPOINT_PX}px this whole page slides aside with the sidebar, including while you drag it from the edge. Above it the sidebars sit in the layout as usual. Resize the window to cross the breakpoint.`}
		>
			<DemoActions>
				<DemoButton tone="accent" onClick={() => openSidebar("left")}>
					Push from left
				</DemoButton>
				<DemoButton onClick={() => openSidebar("right")}>Push from right</DemoButton>
			</DemoActions>
			<DemoStatus
				items={[
					{ label: "left", value: isLeftOpen ? "open" : "closed" },
					{ label: "right", value: isRightOpen ? "open" : "closed" },
				]}
			/>
		</DemoCard>
	);
}

function PushPanes() {
	const { closeSidebar } = useSwipeBarContext();

	return (
		<>
			<PagePortal host="left">
				<SwipeBarLeft className={PANE_CLASS.left} ariaLabel="Navigation">
					<PaneBody title="Navigation" onClose={() => closeSidebar("left")}>
						<PaneLinks items={["Inbox", "Starred", "Archive", "Trash"]} />
					</PaneBody>
				</SwipeBarLeft>
			</PagePortal>
			<PagePortal host="right">
				<SwipeBarRight className={PANE_CLASS.right} ariaLabel="Details" sidebarWidthPx={280}>
					<PaneBody title="Details" onClose={() => closeSidebar("right")}>
						<PaneFacts
							items={[
								{ label: "Mode", value: "push" },
								{ label: "Breakpoint", value: `${PUSH_DEMO_BREAKPOINT_PX}px` },
							]}
						/>
					</PaneBody>
				</SwipeBarRight>
			</PagePortal>
		</>
	);
}

export function PushContentDemo() {
	return (
		<PageDemo smallScreenMode="push" mediaQueryWidth={PUSH_DEMO_BREAKPOINT_PX}>
			<PushControls />
			<PushPanes />
		</PageDemo>
	);
}
