import { type CSSProperties, type ReactElement, type RefObject, useEffect, useMemo } from "react";
import { useSwipeBarContext } from "./useSwipeBarContext";

export type TSidebarCallbacks = {
	getIsOpen: () => boolean;
	openSidebar: () => void;
	closeSidebar: () => void;
	dragSidebar: (translateX: number | null) => void;
};

export type TDragState = {
	startX: number;
	startY: number;
	activeTouchId: number | null;
	isMouse: boolean;
	isActivated: boolean;
};

export type TDragRefs = {
	draggingRef: RefObject<TDragState | null>;
	currentXRef: RefObject<number | null>;
	prevXRef: RefObject<number | null>;
};

export type TSwipeBarOptions = {
	transitionMs?: number;
	sidebarWidthPx?: number;
	isAbsolute?: boolean;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
	showOverlay?: boolean;
	overlayBackgroundColor?: string;
	toggleIconSizePx?: number;
	toggleIconColor?: string;
	toggleIconEdgeDistancePx?: number;
	showToggle?: boolean;
	mediaQueryWidth?: number;
	swipeBarZIndex?: number;
	toggleZIndex?: number;
	overlayZIndex?: number;
};

export type TSwipeSidebar = TSwipeBarOptions & {
	className?: string;
	ToggleComponent?: ReactElement;
	children?: ReactElement;
};

export type TToggle = {
	side: TSidebarSide;
	className?: string;
};

export const TRANSITION_MS = 300;
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
export const MEDIA_QUERY_WIDTH = 640;
export const LATENCY_OPACITY_TRANSITION_MS = 100;
export const DEFAULT_SWIPEBAR_Z_INDEX = 30;
export const DEFAULT_TOGGLE_Z_INDEX = 15;
export const DEFAULT_OVERLAY_Z_INDEX = 20;
export const DEFAULT_TOGGLE_ICON_OPACITY = 0.6;
export const DEFAULT_TOGGLE_ICON_OPACITY_TRANSITION_MS = 200;

export const swipeBarStyle = {
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

export type TSidebarSide = "left" | "right";

const getChildElement = (ref: RefObject<HTMLDivElement | null>): HTMLElement | null => {
	return ref.current?.firstElementChild as HTMLElement | null;
};

type TApplyOpenPaneStyles = {
	ref: RefObject<HTMLDivElement | null>;
	side: TSidebarSide;
	options: TSwipeBarOptions;
	toggleRef: RefObject<HTMLDivElement | null>;
	afterApply: () => void;
};

export const applyOpenPaneStyles = ({
	ref,
	side,
	options,
	toggleRef,
	afterApply,
}: TApplyOpenPaneStyles) => {
	const child = getChildElement(ref);
	const delayMs = options.transitionMs ? options.transitionMs / 2 : 0;
	if (child) {
		child.style.opacity = "0";
	}

	requestAnimationFrame(() => {
		// Hide child content initially

		if (!ref.current || !child) return;
		ref.current.style.transition = `transform ${options.transitionMs}ms ease, width ${options.transitionMs}ms ease`;
		child.style.transition = `opacity ${delayMs}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			// clearing transform opens to its natural position for left and right
			ref.current.style.transform = "";
			ref.current.style.width = `${options.sidebarWidthPx}px`;

			if (toggleRef.current && options.sidebarWidthPx) {
				toggleRef.current.style.opacity = "1";
				toggleRef.current.style.transform = `translateY(-50%) translateX(${
					side === "left" ? options.sidebarWidthPx : -options.sidebarWidthPx
				}px)`;
			}

			setTimeout(() => {
				child.style.opacity = "1";
			}, delayMs);

			afterApply();
		});
	});

	setTimeout(() => {}, 0);
};

type TApplyClosePaneStyles = {
	ref: RefObject<HTMLDivElement | null>;
	side: TSidebarSide;
	options: TSwipeBarOptions;
	toggleRef: RefObject<HTMLDivElement | null>;
	afterApply: () => void;
};

export const applyClosePaneStyles = ({
	ref,
	options,
	side,
	toggleRef,
	afterApply,
}: TApplyClosePaneStyles) => {
	const child = getChildElement(ref);
	const delayMs = options.transitionMs ? (options.transitionMs * 1) / 3 : 0;

	requestAnimationFrame(() => {
		if (!ref.current || !child) return;
		ref.current.style.transition = `transform ${options.transitionMs}ms ease, width ${options.transitionMs}ms ease`;
		child.style.transition = `opacity ${delayMs}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			ref.current.style.transform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
			ref.current.style.width = "0px";

			if (toggleRef.current) {
				toggleRef.current.style.opacity = "1";
				toggleRef.current.style.transform = "translateY(-50%)";
			}

			child.style.opacity = "0";

			afterApply();
		});
	});
};

type TApplyDragPaneStyles = {
	ref: RefObject<HTMLDivElement | null>;
	toggleRef: RefObject<HTMLDivElement | null>;
	options: TSwipeBarOptions;
	translateX: number | null;
};

export const applyDragPaneStyles = ({
	ref,
	toggleRef,
	options,
	translateX,
}: TApplyDragPaneStyles) => {
	if (!ref.current || translateX === null) return;
	ref.current.style.transition = "none";

	requestAnimationFrame(() => {
		const child = getChildElement(ref);

		if (!ref.current || !child) return;
		child.style.opacity = "0";

		const desiredWidth = `${options.sidebarWidthPx}px`;
		// Apply width only if it changed to avoid unnecessary layout
		if (ref.current.style.width !== desiredWidth) {
			ref.current.style.width = desiredWidth;
		}
		ref.current.style.transform = `translateX(${translateX}px)`;

		if (toggleRef.current) {
			toggleRef.current.style.opacity = "0";
			toggleRef.current.style.transform = `translateY(-50%) translateX(${translateX}px)`;
		}
	});
};

type THandleDragStart = {
	refs: TDragRefs;
	clientX: number;
	clientY: number;
	touchId: number | null;
	isMouse: boolean;
};

export const handleDragStart = ({ refs, clientX, clientY, touchId, isMouse }: THandleDragStart) => {
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

type THandleDragCancel = {
	refs: TDragRefs;
	dragSidebar: (translateX: number | null) => void;
	onDeactivate: () => void;
};

export const handleDragCancel = ({ refs, dragSidebar, onDeactivate }: THandleDragCancel) => {
	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;
	dragSidebar(null);
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

export const useSetMergedOptions = (side: TSidebarSide, options: TSwipeBarOptions) => {
	const { globalOptions, setLeftSidebarOptions, setRightSidebarOptions } = useSwipeBarContext();
	const {
		sidebarWidthPx,
		transitionMs,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
		showOverlay,
		isAbsolute,
		overlayBackgroundColor,
		toggleIconColor,
		toggleIconSizePx,
		toggleIconEdgeDistancePx,
		showToggle,
		mediaQueryWidth,
		swipeBarZIndex,
		toggleZIndex,
		overlayZIndex,
	} = options;

	const mergedOptions = useMemo(
		() => ({
			sidebarWidthPx: sidebarWidthPx ?? globalOptions.sidebarWidthPx,
			transitionMs: transitionMs ?? globalOptions.transitionMs,
			edgeActivationWidthPx: edgeActivationWidthPx ?? globalOptions.edgeActivationWidthPx,
			dragActivationDeltaPx: dragActivationDeltaPx ?? globalOptions.dragActivationDeltaPx,
			showOverlay: showOverlay ?? globalOptions.showOverlay,
			isAbsolute: isAbsolute ?? globalOptions.isAbsolute,
			overlayBackgroundColor: overlayBackgroundColor ?? globalOptions.overlayBackgroundColor,
			toggleIconColor: toggleIconColor ?? globalOptions.toggleIconColor,
			toggleIconSizePx: toggleIconSizePx ?? globalOptions.toggleIconSizePx,
			toggleIconEdgeDistancePx: toggleIconEdgeDistancePx ?? globalOptions.toggleIconEdgeDistancePx,
			showToggle: showToggle ?? globalOptions.showToggle,
			mediaQueryWidth: mediaQueryWidth ?? globalOptions.mediaQueryWidth,
			swipeBarZIndex: swipeBarZIndex ?? globalOptions.swipeBarZIndex,
			toggleZIndex: toggleZIndex ?? globalOptions.toggleZIndex,
			overlayZIndex: overlayZIndex ?? globalOptions.overlayZIndex,
		}),
		[
			sidebarWidthPx,
			transitionMs,
			edgeActivationWidthPx,
			dragActivationDeltaPx,
			showOverlay,
			isAbsolute,
			overlayBackgroundColor,
			toggleIconColor,
			toggleIconSizePx,
			toggleIconEdgeDistancePx,
			showToggle,
			globalOptions,
			mediaQueryWidth,
			swipeBarZIndex,
			toggleZIndex,
			overlayZIndex,
		],
	) satisfies Required<TSwipeBarOptions>;

	useEffect(() => {
		if (side === "left") {
			setLeftSidebarOptions(mergedOptions);
		} else {
			setRightSidebarOptions(mergedOptions);
		}
	}, [side, mergedOptions, setLeftSidebarOptions, setRightSidebarOptions]);

	return mergedOptions;
};
