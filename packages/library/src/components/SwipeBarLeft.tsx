import { useCallback, useEffect, useRef } from "react";
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
	id = "primary",
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
		leftSidebars,
		leftSidebarOptionsMap,
		closeSidebar,
		openSidebar,
		registerLeftSidebar,
		unregisterLeftSidebar,
	} = useSwipeBarContext();

	const sidebarRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		registerLeftSidebar(id, { sidebarRef, toggleRef });
		return () => unregisterLeftSidebar(id);
	}, [id, registerLeftSidebar, unregisterLeftSidebar]);

	const options = useSetMergedOptions("left", currentOptions, id);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeLeftSidebar(options, id);

	const isOpen = leftSidebars[id]?.isOpen ?? false;

	const handleDefaultOpen = useCallback(
		() => openSidebar("left", { id, skipTransition: true }),
		[openSidebar, id],
	);
	const { forceOverlayVisible } = useDefaultOpen({
		defaultOpen,
		optionsReady: !!leftSidebarOptionsMap[id],
		onOpen: handleDefaultOpen,
	});

	const handleClose = useCallback(() => closeSidebar("left", { id }), [closeSidebar, id]);
	useFocusTrap({
		sidebarRef,
		triggerRef: toggleRef,
		isOpen,
		onClose: handleClose,
		transitionMs: options.transitionMs,
	});

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isOpen && !forceOverlayVisible}
					setCollapsed={() => closeSidebar("left", { id })}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleLeft
				id={id}
				toggleRef={toggleRef}
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={sidebarRef}
				id={`swipebar-left-${id}`}
				role="dialog"
				aria-modal={isOpen}
				aria-label={ariaLabel ?? "Left sidebar"}
				inert={!isOpen}
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
