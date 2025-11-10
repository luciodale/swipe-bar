import type { ReactNode } from "react";
import { ToggleRight } from "../ToggleRight";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type SwipeBarProps,
	rightSwipeBarAbsoluteStyle,
	swipeBarStyle,
	useSetMergedOptions,
} from "../swipePaneShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { useSwipeRightPane } from "../useSwipeRightPane";
import { Overlay } from "./Overlay";

export function SidebarRight({
	className,
	children,
	ToggleComponent,
	...currentOptions
}: SwipeBarProps & {
	className?: string;
	children?: ReactNode;
	ToggleComponent?: ReactNode;
}) {
	const { isRightOpen, closePane, rightPaneRef } = useSwipePaneContext();

	const options = useSetMergedOptions("right", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeRightPane(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isRightOpen}
					setCollapsed={() => closePane("right")}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
				/>
			)}

			<ToggleRight
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={rightPaneRef}
				style={{
					...swipeBarStyle,
					...(options.isAbsolute || isSmallScreen ? rightSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
