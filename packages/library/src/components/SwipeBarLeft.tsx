import { Fragment } from "react/jsx-runtime";
import { ToggleLeft } from "../ToggleLeft";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type TSwipeSidebar,
	leftSwipeBarAbsoluteStyle,
	leftSwipeBarInitialTransform,
	swipeBarStyle,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeLeftSidebar } from "../useSwipeLeftSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarLeft({
	className,
	children,
	ToggleComponent,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarLeft");
	}

	const { isLeftOpen, closeSidebar, leftSidebarRef } = useSwipeBarContext();

	const options = useSetMergedOptions("left", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeLeftSidebar(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isLeftOpen}
					setCollapsed={() => closeSidebar("left")}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleLeft
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={leftSidebarRef}
				style={{
					...swipeBarStyle,
					...leftSwipeBarInitialTransform,
					...(options.isAbsolute || isSmallScreen ? leftSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
					zIndex: options.swipeBarZIndex,
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
