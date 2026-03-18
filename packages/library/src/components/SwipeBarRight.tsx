import { useCallback } from "react";
import { Fragment } from "react/jsx-runtime";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	rightSwipeBarAbsoluteStyle,
	rightSwipeBarInitialTransform,
	swipeBarStyle,
	type TSwipeSidebar,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { ToggleRight } from "../ToggleRight";
import { useDefaultOpen } from "../useDefaultOpen";
import { useFocusTrap } from "../useFocusTrap";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeRightSidebar } from "../useSwipeRightSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarRight({
	className,
	children,
	ToggleComponent,
	ariaLabel,
	defaultOpen,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarRight");
	}

	const {
		isRightOpen,
		closeSidebar,
		openSidebar,
		rightSidebarRef,
		rightToggleRef,
		rightSidebarOptions: providerRightOpts,
	} = useSwipeBarContext();

	const options = useSetMergedOptions("right", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeRightSidebar(options);

	const handleDefaultOpen = useCallback(
		() => openSidebar("right", { skipTransition: true }),
		[openSidebar],
	);
	const { forceOverlayVisible } = useDefaultOpen({
		defaultOpen,
		optionsReady: !!providerRightOpts.sidebarWidthPx,
		onOpen: handleDefaultOpen,
	});

	const handleClose = useCallback(() => closeSidebar("right"), [closeSidebar]);
	useFocusTrap({
		sidebarRef: rightSidebarRef,
		triggerRef: rightToggleRef,
		isOpen: isRightOpen,
		onClose: handleClose,
		transitionMs: options.transitionMs,
	});

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isRightOpen && !forceOverlayVisible}
					setCollapsed={() => closeSidebar("right")}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
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
				id="swipebar-right"
				role="dialog"
				aria-modal={isRightOpen}
				aria-label={ariaLabel ?? "Right sidebar"}
				inert={!isRightOpen}
				style={{
					...swipeBarStyle,
					...rightSwipeBarInitialTransform,
					...(options.isAbsolute || isSmallScreen ? rightSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
					zIndex: options.swipeBarZIndex,
					...(defaultOpen
						? { transform: "translateX(0px)", width: `${options.sidebarWidthPx}px` }
						: {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
