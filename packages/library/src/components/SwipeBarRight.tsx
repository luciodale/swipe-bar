import { useCallback, useEffect, useRef } from "react";
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
	id = "primary",
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
		rightSidebars,
		rightSidebarOptionsMap,
		closeSidebar,
		openSidebar,
		registerRightSidebar,
		unregisterRightSidebar,
	} = useSwipeBarContext();

	const sidebarRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		registerRightSidebar(id, { sidebarRef, toggleRef });
		return () => unregisterRightSidebar(id);
	}, [id, registerRightSidebar, unregisterRightSidebar]);

	const options = useSetMergedOptions("right", currentOptions, id);
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
	useSwipeRightSidebar(options, id);

	const isOpen = rightSidebars[id]?.isOpen ?? false;

	const handleDefaultOpen = useCallback(
		() => openSidebar("right", { id, skipTransition: true }),
		[openSidebar, id],
	);
	const { forceOverlayVisible } = useDefaultOpen({
		defaultOpen,
		optionsReady: !!rightSidebarOptionsMap[id],
		onOpen: handleDefaultOpen,
	});

	const handleClose = useCallback(() => closeSidebar("right", { id }), [closeSidebar, id]);
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
					setCollapsed={() => closeSidebar("right", { id })}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
					overlayBackgroundColor={options.overlayBackgroundColor}
					overlayZIndex={options.overlayZIndex}
				/>
			)}

			<ToggleRight
				id={id}
				toggleRef={toggleRef}
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={ToggleComponent}
			/>

			<div
				ref={sidebarRef}
				id={`swipebar-right-${id}`}
				role="dialog"
				aria-modal={isOpen}
				aria-label={ariaLabel ?? "Right sidebar"}
				inert={!isOpen}
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
