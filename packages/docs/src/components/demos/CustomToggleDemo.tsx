import {
	SwipeBarBottom,
	SwipeBarLeft,
	SwipeBarRight,
	useSwipeBarContext,
} from "@luciodale/swipe-bar";
import { useState } from "react";
import { DemoActions, DemoButton, DemoCard, DemoSwitch } from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody } from "./page/Pane";

function ChevronToggle() {
	return (
		<div className="flex size-10 items-center justify-center rounded-full border border-accent/40 bg-neutral-950 text-accent shadow-lg transition-colors hover:bg-accent/10">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M9 6l6 6-6 6"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function CustomToggleDemoContent() {
	const { openSidebar, closeSidebar } = useSwipeBarContext();
	const [useCustom, setUseCustom] = useState(true);
	const toggle = useCustom ? <ChevronToggle /> : undefined;

	return (
		<>
			<DemoCard
				title="Try it"
				description="The toggles on the left, right and bottom edges of this page are custom React elements. Switch back to the built in icon to compare."
			>
				<DemoSwitch
					label="ToggleComponent"
					hint="Use the custom chevron toggle"
					checked={useCustom}
					onToggle={() => setUseCustom((prev) => !prev)}
				/>
				<DemoActions>
					<DemoButton onClick={() => openSidebar("left")}>Open left</DemoButton>
					<DemoButton onClick={() => openSidebar("right")}>Open right</DemoButton>
					<DemoButton onClick={() => openSidebar("bottom")}>Open bottom</DemoButton>
				</DemoActions>
			</DemoCard>

			<PagePortal host="left">
				<SwipeBarLeft isAbsolute ToggleComponent={toggle} className={PANE_CLASS.left}>
					<PaneBody title="Left sidebar" onClose={() => closeSidebar("left")} />
				</SwipeBarLeft>
			</PagePortal>
			<PagePortal host="right">
				<SwipeBarRight isAbsolute ToggleComponent={toggle} className={PANE_CLASS.right}>
					<PaneBody title="Right sidebar" onClose={() => closeSidebar("right")} />
				</SwipeBarRight>
			</PagePortal>
			<PagePortal host="bottom">
				<SwipeBarBottom
					sidebarHeightPx={300}
					isAbsolute
					ToggleComponent={toggle}
					className={PANE_CLASS.bottom}
				>
					<PaneBody title="Bottom sheet" onClose={() => closeSidebar("bottom")}>
						<p className="text-sm text-white/60">
							The same custom toggle works on all three directions.
						</p>
					</PaneBody>
				</SwipeBarBottom>
			</PagePortal>
		</>
	);
}

export function CustomToggleDemo() {
	return (
		<PageDemo>
			<CustomToggleDemoContent />
		</PageDemo>
	);
}
