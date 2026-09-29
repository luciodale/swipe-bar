import { useCallback, useEffect, useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import {
	bottomSwipeBarAbsoluteStyle,
	bottomSwipeBarInitialTransform,
	bottomSwipeBarStyle,
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	getPaneA11yProps,
	type TSwipeSidebar,
	useSetMergedOptions,
} from "../swipeSidebarShared";
import { ToggleBottom } from "../ToggleBottom";
import { useCloseOnBreakpointChange } from "../useCloseOnBreakpointChange";
import { useDefaultOpen } from "../useDefaultOpen";
import { useFocusTrap } from "../useFocusTrap";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeBottomSidebar } from "../useSwipeBottomSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarBottom({
	id = "primary",
	className,
	children,
	ToggleComponent,
	ariaLabel,
	defaultOpen,
	...currentOptions
}: TSwipeSidebar) {
	if (children?.type === Fragment) {
		throw new Error("Fragments is not allowed in SwipeBarBottom");
	}

	const {
		bottomSidebars,
		bottomSidebarOptionsMap,
		closeSidebar,
		openSidebarFully,
		registerBottomSidebar,
		unregisterBottomSidebar,
	} = useSwipeBarContext();

	const sidebarRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		registerBottomSidebar(id, { sidebarRef, toggleRef });
		return () => unregisterBottomSidebar(id);
	}, [id, registerBottomSidebar, unregisterBottomSidebar]);

	const options = useSetMergedOptions("bottom", currentOptions, id);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	const isFloating = options.isAbsolute || isSmallScreen;
	// Floating panes and panes behind an overlay block the page, so they act as dialogs.
	const isModal = isFloating || options.showOverlay;
	useSwipeBottomSidebar(options, id);

	const isOpen = bottomSidebars[id]?.isOpen ?? false;

	const handleDefaultOpen = useCallback(
		() => openSidebarFully("bottom", { id, skipTransition: true }),
		[openSidebarFully, id],
	);
	const optionsReady = !!bottomSidebarOptionsMap[id];
	const { forceOverlayVisible } = useDefaultOpen({
		defaultOpen,
		optionsReady,
		onOpen: handleDefaultOpen,
	});

	const handleViewportClose = useCallback(
		() => closeSidebar("bottom", { id, skipTransition: true }),
		[closeSidebar, id],
	);
	useCloseOnBreakpointChange({
		isSmallScreen,
		isOpen,
		optionsReady,
		onClose: handleViewportClose,
	});

	const handleClose = useCallback(() => closeSidebar("bottom", { id }), [closeSidebar, id]);
	useFocusTrap({
		sidebarRef: sidebarRef,
		triggerRef: toggleRef,
		isOpen,
		isModal,
		onClose: handleClose,
		transitionMs: options.transitionMs,
	});

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isOpen && !forceOverlayVisible}
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
				id={`swipebar-bottom-${id}`}
				{...getPaneA11yProps(isModal, isOpen, ariaLabel ?? "Bottom sidebar")}
				inert={!isOpen}
				style={{
					...bottomSwipeBarStyle,
					...bottomSwipeBarInitialTransform,
					...(isFloating ? bottomSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
					zIndex: options.swipeBarZIndex,
					...(defaultOpen
						? { transform: "translateY(0px)", height: `${options.sidebarHeightPx}px` }
						: {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
