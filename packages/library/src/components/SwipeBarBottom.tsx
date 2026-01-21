import { Fragment } from "react/jsx-runtime";
import { ToggleBottom } from "../ToggleBottom";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type TSwipeSidebar,
	bottomSwipeBarAbsoluteStyle,
	bottomSwipeBarInitialTransform,
	bottomSwipeBarStyle,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeBottomSidebar } from "../useSwipeBottomSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarBottom({
	className,
	children,
	ToggleComponent,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarBottom");
	}

	const { isBottomOpen, closeSidebar, bottomSidebarRef } = useSwipeBarContext();

	const options = useSetMergedOptions("bottom", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeBottomSidebar(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isBottomOpen}
					setCollapsed={() => closeSidebar("bottom")}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleBottom
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={bottomSidebarRef}
				style={{
					...bottomSwipeBarStyle,
					...bottomSwipeBarInitialTransform,
					...(options.isAbsolute || isSmallScreen ? bottomSwipeBarAbsoluteStyle : {}),
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

