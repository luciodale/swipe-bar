import { useEffect, useRef } from "react";
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
	id = "primary",
	className,
	children,
	ToggleComponent,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarBottom");
	}

	const { bottomSidebars, closeSidebar, registerBottomSidebar, unregisterBottomSidebar } =
		useSwipeBarContext();

	const sidebarRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		registerBottomSidebar(id, { sidebarRef, toggleRef });
		return () => unregisterBottomSidebar(id);
	}, [id, registerBottomSidebar, unregisterBottomSidebar]);

	const options = useSetMergedOptions("bottom", currentOptions, id);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeBottomSidebar(options, id);

	const isOpen = bottomSidebars[id]?.isOpen ?? false;

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isOpen}
					setCollapsed={() => closeSidebar("bottom", { id })}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleBottom
				id={id}
				toggleRef={toggleRef}
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={sidebarRef}
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
