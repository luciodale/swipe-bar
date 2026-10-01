import { SwipeBarLeft, useSwipeBarContext } from "@luciodale/swipe-bar";
import {
	DemoActions,
	DemoButton,
	DemoCard,
	DemoGroup,
	DemoNote,
	DemoNumber,
	DemoSegment,
	DemoStatus,
	DemoSwitch,
} from "./page/DemoControls";
import { PageDemo } from "./page/PageDemo";
import { PagePortal } from "./page/PagePortal";
import { PANE_CLASS, PaneBody } from "./page/Pane";
import { useBreakpointStatus } from "./useBreakpointStatus";
import {
	PLAYGROUND_BOOLEAN_OPTIONS,
	PLAYGROUND_NUMBER_OPTIONS,
	SMALL_SCREEN_MODES,
	usePlaygroundOptions,
} from "./usePlaygroundOptions";

function PlaygroundControls() {
	const { openSidebar, closeSidebar, isLeftOpen } = useSwipeBarContext();
	const { globalOptions, handleToggle, handleNumber, handleSmallScreenMode } =
		usePlaygroundOptions();
	const breakpointStatus = useBreakpointStatus(globalOptions);

	return (
		<DemoCard
			title="Playground"
			description="Every change applies to the sidebar on the left edge of this page right away. Try smallScreenMode push with a large mediaQueryWidth, then open the sidebar."
		>
			<DemoActions>
				<DemoButton tone="accent" onClick={() => openSidebar("left")}>
					Open sidebar
				</DemoButton>
				<DemoButton onClick={() => closeSidebar("left")}>Close sidebar</DemoButton>
			</DemoActions>
			<DemoStatus items={[{ label: "left", value: isLeftOpen ? "open" : "closed" }]} />

			<DemoGroup>
				<DemoSegment
					label="smallScreenMode"
					value={globalOptions.smallScreenMode}
					options={SMALL_SCREEN_MODES}
					onChange={handleSmallScreenMode}
				/>
				<DemoNote>{breakpointStatus}</DemoNote>
				{PLAYGROUND_NUMBER_OPTIONS.map((option) => (
					<DemoNumber
						key={option}
						id={`playground-${option}`}
						label={option}
						value={globalOptions[option]}
						onChange={(value) => handleNumber(option, value)}
					/>
				))}
			</DemoGroup>

			<DemoGroup>
				{PLAYGROUND_BOOLEAN_OPTIONS.map((option) => (
					<DemoSwitch
						key={option}
						label={option}
						checked={globalOptions[option]}
						onToggle={() => handleToggle(option)}
					/>
				))}
			</DemoGroup>
		</DemoCard>
	);
}

function PlaygroundPane() {
	const { closeSidebar } = useSwipeBarContext();

	return (
		<PagePortal host="left">
			<SwipeBarLeft className={PANE_CLASS.left} ariaLabel="Preview sidebar">
				<PaneBody title="Preview sidebar" onClose={() => closeSidebar("left")}>
					<p className="text-sm text-white/60">
						Adjust the props in the playground to see changes here in real time.
					</p>
				</PaneBody>
			</SwipeBarLeft>
		</PagePortal>
	);
}

export function PropsPlaygroundDemo() {
	return (
		<PageDemo>
			<PlaygroundControls />
			<PlaygroundPane />
		</PageDemo>
	);
}
