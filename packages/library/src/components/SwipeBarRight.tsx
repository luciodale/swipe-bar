import { Fragment } from "react/jsx-runtime";
import { ToggleRight } from "../ToggleRight";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type TSwipeSidebar,
	rightSwipeBarAbsoluteStyle,
	rightSwipeBarInitialTransform,
	swipeBarStyle,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeRightSidebar } from "../useSwipeRightSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarRight({
	className,
	children,
	ToggleComponent,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarRight");
	}

	const { isRightOpen, closeSidebar, rightSidebarRef } = useSwipeBarContext();

	const options = useSetMergedOptions("right", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeRightSidebar(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isRightOpen}
					setCollapsed={() => closeSidebar("right")}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleRight
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={rightSidebarRef}
				style={{
					...swipeBarStyle,
					...rightSwipeBarInitialTransform,
					...(options.isAbsolute || isSmallScreen ? rightSwipeBarAbsoluteStyle : {}),
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
