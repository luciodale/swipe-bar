import type { ReactNode } from "react";
import { ToggleLeft } from "../ToggleLeft";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type SwipeBarProps,
	leftSwipeBarAbsoluteStyle,
	swipeBarStyle,
	useSetMergedOptions,
} from "../swipePaneShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeLeftPane } from "../useSwipeLeftPane";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { Overlay } from "./Overlay";

export function SidebarLeft({
	className,
	children,
	ToggleComponent,
	...currentOptions
}: SwipeBarProps & {
	className?: string;
	ToggleComponent?: ReactNode;
	children?: ReactNode;
}) {
	const { isLeftOpen, closePane, leftPaneRef } = useSwipePaneContext();

	const options = useSetMergedOptions("left", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeLeftPane(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isLeftOpen}
					setCollapsed={() => closePane("left")}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
				/>
			)}

			<ToggleLeft
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={leftPaneRef}
				style={{
					...swipeBarStyle,
					...(options.isAbsolute || isSmallScreen ? leftSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
