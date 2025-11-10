import { type CSSProperties, type RefObject, useEffect, useMemo } from "react";
import { useSwipePaneContext } from "./useSwipePaneContext";

export type SidebarCallbacks = {
	getIsOpen: () => boolean;
	openPane: () => void;
	closePane: () => void;
	dragPane: (translateX: number | null) => void;
};

export type DragState = {
	startX: number;
	startY: number;
	activeTouchId: number | null;
	isMouse: boolean;
	isActivated: boolean;
};

export type DragRefs = {
	draggingRef: RefObject<DragState | null>;
	currentXRef: RefObject<number | null>;
	prevXRef: RefObject<number | null>;
};

export type SwipeBarProps = {
	transitionMs?: number;
	paneWidthPx?: number;
	isAbsolute?: boolean;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
	showOverlay?: boolean;
	closeSidebarOnOverlayClick?: boolean;
	overlayBackgroundColor?: string;
	toggleIconSizePx?: number;
	toggleIconColor?: string;
	toggleIconEdgeDistancePx?: number;
	showToggle?: boolean;
};

export const TRANSITION_MS = 200;
export const EDGE_ACTIVATION_REGION_PX = 40;
export const DRAG_ACTIVATION_DELTA_PX = 20;
export const PANE_WIDTH_PX = 320;
export const SHOW_OVERLAY = true;
export const CLOSE_SIDEBAR_ON_OVERLAY_CLICK = true;
export const IS_ABSOLUTE = false;
export const DEFAULT_OVERLAY_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.5)";

export const DEFAULT_SIDEBAR_BACKGROUND_COLOR = "rgb(36,36,36)";
export const DEFAULT_TOGGLE_ICON_COLOR = "white";
export const DEFAULT_TOGGLE_ICON_SIZE_PX = 40;
export const DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX = 40;
export const SHOW_TOGGLE = true;

export const swipeBarStyle = {
	zIndex: 30,
	width: 0,
	top: 0,
	bottom: 0,
	flexShrink: 0,
	overflowX: "hidden",
	willChange: "transform",
} satisfies CSSProperties;

export const leftSwipeBarAbsoluteStyle = {
	position: "fixed",
	left: 0,
	top: 0,
	bottom: 0,
} satisfies CSSProperties;

export const rightSwipeBarAbsoluteStyle = {
	position: "fixed",
	right: 0,
	top: 0,
	bottom: 0,
} satisfies CSSProperties;

export const overlayStyle = {
	position: "fixed",
	zIndex: 20,
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	backgroundColor: DEFAULT_OVERLAY_BACKGROUND_COLOR,
	transitionProperty: "opacity",
	pointerEvents: "none",
	opacity: 0,
} satisfies CSSProperties;

export const overlayIsOpenStyle = {
	opacity: 1,
	pointerEvents: "auto",
} satisfies CSSProperties;

export const toggleWrapperStyle = {
	position: "fixed",
	zIndex: 15,
	top: "50%",
	transform: "translateY(-50%)",
	width: "1px",
	display: "flex",
	justifyContent: "center",
} satisfies CSSProperties;

export const toggleIconWrapperStyle = {
	position: "relative",
	cursor: "pointer",
	display: "flex",
	height: "72px",
	alignItems: "center",
	justifyContent: "center",
} satisfies CSSProperties;

export type PaneSide = "left" | "right";

type ApplyOpenPaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	options: SwipeBarProps;
	afterApply: () => void;
};

export const applyOpenPaneStyles = ({ ref, options, afterApply }: ApplyOpenPaneStylesProps) => {
	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.transition = `transform ${options.transitionMs}ms ease, width ${options.transitionMs}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			// clearing transform opens to its natural position for left and right
			ref.current.style.transform = "";
			ref.current.style.width = `${options.paneWidthPx}px`;
			afterApply();
		});
	});

	setTimeout(() => {}, 0);
};

type ApplyClosePaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	side: PaneSide;
	options: SwipeBarProps;
	afterApply: () => void;
};

export const applyClosePaneStyles = ({
	ref,
	options,
	side,
	afterApply,
}: ApplyClosePaneStylesProps) => {
	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.transition = `transform ${options.transitionMs}ms ease, width ${options.transitionMs}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			ref.current.style.transform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
			ref.current.style.width = "0px";
			afterApply();
		});
	});
};

type ApplyDragPaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	options: SwipeBarProps;
	translateX: number | null;
};

export const applyDragPaneStyles = ({ ref, options, translateX }: ApplyDragPaneStylesProps) => {
	if (!ref.current || translateX === null) return;
	ref.current.style.transition = "none";

	requestAnimationFrame(() => {
		if (!ref.current) return;
		const desiredWidth = `${options.paneWidthPx}px`;
		// Apply width only if it changed to avoid unnecessary layout
		if (ref.current.style.width !== desiredWidth) {
			ref.current.style.width = desiredWidth;
		}
		ref.current.style.transform = `translateX(${translateX}px)`;
	});
};

type HandleDragStartProps = {
	refs: DragRefs;
	clientX: number;
	clientY: number;
	touchId: number | null;
	isMouse: boolean;
};

export const handleDragStart = ({
	refs,
	clientX,
	clientY,
	touchId,
	isMouse,
}: HandleDragStartProps) => {
	refs.draggingRef.current = {
		startX: clientX,
		startY: clientY,
		activeTouchId: touchId,
		isMouse,
		isActivated: false,
	};
	refs.currentXRef.current = clientX;
	refs.prevXRef.current = clientX;
};

type HandleDragCancelProps = {
	refs: DragRefs;
	dragPane: (translateX: number | null) => void;
	onDeactivate: () => void;
};

export const handleDragCancel = ({ refs, dragPane, onDeactivate }: HandleDragCancelProps) => {
	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;
	dragPane(null);
	onDeactivate();
};

export const isEditableTarget = (el: EventTarget | null): boolean => {
	if (!(el instanceof Element)) return false;
	const editable = el.closest("input, textarea, [contenteditable='true']");
	return !!editable;
};

export const findChangedTouch = (
	changedTouches: TouchList,
	trackedId: number | null,
): Touch | null => {
	for (let i = 0; i < changedTouches.length; i++) {
		const candidateTouch = changedTouches[i];
		if (trackedId == null || candidateTouch.identifier === trackedId) {
			return candidateTouch;
		}
	}
	return null;
};

export const hasTrackedTouchEnded = (
	changedTouches: TouchList,
	trackedId: number | null,
): boolean => {
	for (let i = 0; i < changedTouches.length; i++) {
		if (changedTouches[i].identifier === trackedId) {
			return true;
		}
	}
	return false;
};

export const useSetMergedOptions = (side: PaneSide, options: SwipeBarProps) => {
	const { globalOptions, setLeftPaneOptions, setRightPaneOptions } = useSwipePaneContext();
	const {
		paneWidthPx,
		transitionMs,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
		showOverlay,
		closeSidebarOnOverlayClick,
		isAbsolute,
		overlayBackgroundColor,
		toggleIconColor,
		toggleIconSizePx,
		toggleIconEdgeDistancePx,
		showToggle,
	} = options;

	const mergedOptions = useMemo(
		() => ({
			paneWidthPx: paneWidthPx ?? globalOptions.paneWidthPx,
			transitionMs: transitionMs ?? globalOptions.transitionMs,
			edgeActivationWidthPx: edgeActivationWidthPx ?? globalOptions.edgeActivationWidthPx,
			dragActivationDeltaPx: dragActivationDeltaPx ?? globalOptions.dragActivationDeltaPx,
			showOverlay: showOverlay ?? globalOptions.showOverlay,
			closeSidebarOnOverlayClick:
				closeSidebarOnOverlayClick ?? globalOptions.closeSidebarOnOverlayClick,
			isAbsolute: isAbsolute ?? globalOptions.isAbsolute,
			overlayBackgroundColor: overlayBackgroundColor ?? globalOptions.overlayBackgroundColor,
			toggleIconColor: toggleIconColor ?? globalOptions.toggleIconColor,
			toggleIconSizePx: toggleIconSizePx ?? globalOptions.toggleIconSizePx,
			toggleIconEdgeDistancePx: toggleIconEdgeDistancePx ?? globalOptions.toggleIconEdgeDistancePx,
			showToggle: showToggle ?? globalOptions.showToggle,
		}),
		[
			paneWidthPx,
			transitionMs,
			edgeActivationWidthPx,
			dragActivationDeltaPx,
			showOverlay,
			closeSidebarOnOverlayClick,
			isAbsolute,
			overlayBackgroundColor,
			toggleIconColor,
			toggleIconSizePx,
			toggleIconEdgeDistancePx,
			showToggle,
			globalOptions,
		],
	) satisfies Required<SwipeBarProps>;

	useEffect(() => {
		if (side === "left") {
			setLeftPaneOptions(mergedOptions);
		} else {
			setRightPaneOptions(mergedOptions);
		}
	}, [side, mergedOptions, setLeftPaneOptions, setRightPaneOptions]);

	return mergedOptions;
};
