import { useCallback } from "react";
import { Fragment } from "react/jsx-runtime";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	leftSwipeBarAbsoluteStyle,
	leftSwipeBarInitialTransform,
	swipeBarStyle,
	type TSwipeSidebar,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { ToggleLeft } from "../ToggleLeft";
import { useDefaultOpen } from "../useDefaultOpen";
import { useFocusTrap } from "../useFocusTrap";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeLeftSidebar } from "../useSwipeLeftSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarLeft({
	className,
	children,
	ToggleComponent,
	ariaLabel,
	defaultOpen,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarLeft");
	}

	const {
		isLeftOpen,
		closeSidebar,
		openSidebar,
		leftSidebarRef,
		leftToggleRef,
		leftSidebarOptions: providerLeftOpts,
	} = useSwipeBarContext();

	const options = useSetMergedOptions("left", currentOptions);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeLeftSidebar(options);

	const handleDefaultOpen = useCallback(
		() => openSidebar("left", { skipTransition: true }),
		[openSidebar],
	);
	const { forceOverlayVisible } = useDefaultOpen({
		defaultOpen,
		optionsReady: !!providerLeftOpts.sidebarWidthPx,
		onOpen: handleDefaultOpen,
	});

	const handleClose = useCallback(() => closeSidebar("left"), [closeSidebar]);
	useFocusTrap({
		sidebarRef: leftSidebarRef,
		triggerRef: leftToggleRef,
		isOpen: isLeftOpen,
		onClose: handleClose,
		transitionMs: options.transitionMs,
	});

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isLeftOpen && !forceOverlayVisible}
					setCollapsed={() => closeSidebar("left")}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
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
				id="swipebar-left"
				role="dialog"
				aria-modal={isLeftOpen}
				aria-label={ariaLabel ?? "Left sidebar"}
				inert={!isLeftOpen}
				style={{
					...swipeBarStyle,
					...leftSwipeBarInitialTransform,
					...(options.isAbsolute || isSmallScreen ? leftSwipeBarAbsoluteStyle : {}),
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
