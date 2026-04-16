import { type CSSProperties, type ReactElement, type RefObject, useEffect, useMemo } from "react";
import { useSwipeBarContext } from "./useSwipeBarContext";

export type TSidebarCallbacks = {
	getIsOpen: () => boolean;
	openSidebar: () => void;
	closeSidebar: () => void;
	dragSidebar: (translate: number | null) => void;
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

export type TDragRefsY = {
	draggingRef: RefObject<TDragState | null>;
	currentYRef: RefObject<number | null>;
	prevYRef: RefObject<number | null>;
};

export type TSwipeBarOptions = {
	transitionMs?: number;
	sidebarWidthPx?: number;
	sidebarHeightPx?: number;
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
	fadeContent?: boolean;
	fadeContentTransitionMs?: number;
	swipeToOpen?: boolean;
	swipeToClose?: boolean;
	disableSwipe?: boolean;
	midAnchorPoint?: boolean;
	midAnchorPointPx?: number;
	disabled?: boolean;
	closeSidebarOnOverlayClick?: boolean;
	resetMetaOnClose?: boolean;
};

export type TSwipeSidebar = TSwipeBarOptions & {
	id?: string;
	className?: string;
	ToggleComponent?: ReactElement;
	children?: ReactElement;
	ariaLabel?: string;
	defaultOpen?: boolean;
};

export type TLeftRightSidebarState = {
	isOpen: boolean;
	meta: unknown;
};

export type TBottomSidebarState = {
	isOpen: boolean;
	anchorState: "closed" | "midAnchor" | "open";
	meta: unknown;
};

export type TSidebarMetaMap = {
	left?: unknown;
	right?: unknown;
	bottom?: Record<string, unknown>;
};

export type TSidebarOpts = {
	id?: string;
	meta?: unknown;
	resetMeta?: boolean;
	skipTransition?: boolean;
};

export type TToggle = {
	side: TSidebarSide;
	className?: string;
};

export const TRANSITION_MS = 300;
export const EDGE_ACTIVATION_REGION_PX = 40;
export const DRAG_ACTIVATION_DELTA_PX = 20;
export const PANE_WIDTH_PX = 320;
export const PANE_HEIGHT_PX = window.innerHeight;
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
export const TOGGLE_ICON_OPACITY = 0.6;
export const TOGGLE_ICON_OPACITY_TRANSITION_MS = 200;
export const FADE_CONTENT_TRANSITION_MS = 100;
export const FADE_CONTENT = false;
export const SWIPE_TO_OPEN = true;
export const SWIPE_TO_CLOSE = true;
export const DISABLE_SWIPE = false;
export const MID_ANCHOR_POINT = false;
export const TRANSFORM_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export const swipeBarStyle = {
	width: 0,
	top: 0,
	bottom: 0,
	flexShrink: 0,
	overflowX: "hidden",
	willChange: "transform",
} satisfies CSSProperties;

export const leftSwipeBarInitialTransform = {
	transform: "translateX(-100%)",
} satisfies CSSProperties;

export const rightSwipeBarInitialTransform = {
	transform: "translateX(100%)",
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

export const bottomSwipeBarStyle = {
	height: 0,
	left: 0,
	right: 0,
	flexShrink: 0,
	overflowY: "hidden",
	willChange: "transform",
} satisfies CSSProperties;

export const bottomSwipeBarInitialTransform = {
	transform: "translateY(100%)",
} satisfies CSSProperties;

export const bottomSwipeBarAbsoluteStyle = {
	position: "fixed",
	bottom: 0,
	left: 0,
	right: 0,
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

export const toggleWrapperBottomStyle = {
	position: "fixed",
	bottom: 0,
	left: "50%",
	transform: "translateX(-50%)",
	height: "1px",
	display: "flex",
	alignItems: "center",
} satisfies CSSProperties;

export const toggleIconWrapperStyle = {
	position: "relative",
	cursor: "pointer",
	display: "flex",
	height: "72px",
	alignItems: "center",
	justifyContent: "center",
} satisfies CSSProperties;

export type TSidebarSide = "left" | "right" | "bottom";

const assertNever = (side: never): never => {
	throw new Error(`Unhandled sidebar side: ${side}`);
};

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

const getOpenPaneDimension = (
	side: TSidebarSide,
	options: TSwipeBarOptions,
): { dimension: "width" | "height"; sizePx: number | undefined } => {
	if (side === "left" || side === "right") {
		return { dimension: "width", sizePx: options.sidebarWidthPx };
	}
	if (side === "bottom") {
		return { dimension: "height", sizePx: options.sidebarHeightPx };
	}
	return assertNever(side);
};

const applyToggleOpenPosition = (
	toggleRef: RefObject<HTMLDivElement | null>,
	side: TSidebarSide,
	sizePx: number | undefined,
) => {
	if (!toggleRef.current || !sizePx) return;
	toggleRef.current.style.opacity = "1";
	if (side === "left") {
		toggleRef.current.style.transform = `translateY(-50%) translateX(${sizePx}px)`;
	} else if (side === "right") {
		toggleRef.current.style.transform = `translateY(-50%) translateX(-${sizePx}px)`;
	} else if (side === "bottom") {
		toggleRef.current.style.transform = `translateX(-50%) translateY(-${sizePx}px)`;
	}
};

export const applyOpenPaneStylesImmediate = ({
	ref,
	side,
	options,
	toggleRef,
	afterApply,
}: TApplyOpenPaneStyles) => {
	if (!ref.current) return;
	const child = getChildElement(ref);
	const { dimension, sizePx } = getOpenPaneDimension(side, options);

	if (child && sizePx) {
		child.style[side === "bottom" ? "minHeight" : "minWidth"] = `${sizePx}px`;
	}

	ref.current.style.transition = "none";
	ref.current.style.transform = side === "bottom" ? "translateY(0px)" : "translateX(0px)";
	ref.current.style[dimension] = `${sizePx}px`;
	if (child) child.style.opacity = "1";
	applyToggleOpenPosition(toggleRef, side, sizePx);
	afterApply();
};

export const applyOpenPaneStyles = ({
	ref,
	side,
	options,
	toggleRef,
	afterApply,
}: TApplyOpenPaneStyles) => {
	const child = getChildElement(ref);
	const { dimension, sizePx } = getOpenPaneDimension(side, options);

	if (child && sizePx) {
		child.style[side === "bottom" ? "minHeight" : "minWidth"] = `${sizePx}px`;
	}

	const delayMs = options.transitionMs ? options.transitionMs / 2 : 0;
	if (child && options.fadeContent) {
		child.style.opacity = "0";
	}

	requestAnimationFrame(() => {
		if (!ref.current) return;
		const transformTransition = `transform ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		const dimensionTransition = options.isAbsolute
			? ""
			: `, ${dimension} ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		ref.current.style.transition = `${transformTransition}${dimensionTransition}`;
		if (child && options.fadeContent) {
			child.style.transition = `opacity ${options.fadeContentTransitionMs}ms ease`;
		}

		requestAnimationFrame(() => {
			if (!ref.current) return;
			ref.current.style.transform = side === "bottom" ? "translateY(0px)" : "translateX(0px)";
			if (!options.isAbsolute) {
				ref.current.style[dimension] = `${sizePx}px`;
			} else if (ref.current.style[dimension] !== `${sizePx}px`) {
				const prevTransition = ref.current.style.transition;
				ref.current.style.transition = transformTransition;
				ref.current.style[dimension] = `${sizePx}px`;
				ref.current.style.transition = prevTransition;
			}

			applyToggleOpenPosition(toggleRef, side, sizePx);

			if (child && options.fadeContent) {
				setTimeout(() => {
					child.style.opacity = "1";
				}, delayMs);
			}

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

	let dimension: "height" | "width";

	if (side === "left" || side === "right") {
		dimension = "width";
		// Ensure child keeps fixed width so it doesn't squish during animation
		if (child && options.sidebarWidthPx) child.style.minWidth = `${options.sidebarWidthPx}px`;
	} else if (side === "bottom") {
		dimension = "height";
		// Ensure child keeps fixed height so it doesn't squish during animation
		if (child && options.sidebarHeightPx) child.style.minHeight = `${options.sidebarHeightPx}px`;
	} else {
		assertNever(side);
	}

	requestAnimationFrame(() => {
		if (!ref.current) return;
		const transformTransition = `transform ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		const dimensionTransition = options.isAbsolute
			? ""
			: `, ${dimension} ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		ref.current.style.transition = `${transformTransition}${dimensionTransition}`;
		if (child && options.fadeContent) {
			child.style.transition = `opacity ${options.fadeContentTransitionMs}ms ease`;
		}

		requestAnimationFrame(() => {
			if (!ref.current) return;

			if (side === "left") {
				ref.current.style.transform = "translateX(-100%)";
				if (!options.isAbsolute) {
					ref.current.style.width = "0px";
				}
			} else if (side === "right") {
				ref.current.style.transform = "translateX(100%)";
				if (!options.isAbsolute) {
					ref.current.style.width = "0px";
				}
			} else if (side === "bottom") {
				ref.current.style.transform = "translateY(100%)";
				if (!options.isAbsolute) {
					ref.current.style.height = "0px";
				}
			}

			if (toggleRef.current) {
				toggleRef.current.style.opacity = "1";
				if (side === "left" || side === "right") {
					toggleRef.current.style.transform = "translateY(-50%)";
				} else if (side === "bottom") {
					toggleRef.current.style.transform = "translateX(-50%)";
				}
			}

			if (child && options.fadeContent) {
				child.style.opacity = "0";
			}

			afterApply();
		});
	});
};

type TApplyMidAnchorPaneStyles = {
	ref: RefObject<HTMLDivElement | null>;
	options: TSwipeBarOptions;
	toggleRef: RefObject<HTMLDivElement | null>;
	afterApply: () => void;
};

const getMidAnchorValues = (options: TSwipeBarOptions) => {
	const midAnchorPx = options.midAnchorPointPx ?? 0;
	const sidebarHeightPx = options.sidebarHeightPx ?? 0;
	return { midAnchorPx, sidebarHeightPx, translateY: sidebarHeightPx - midAnchorPx };
};

export const applyMidAnchorPaneStylesImmediate = ({
	ref,
	options,
	toggleRef,
	afterApply,
}: TApplyMidAnchorPaneStyles) => {
	if (!ref.current) return;
	const child = getChildElement(ref);
	const { midAnchorPx, sidebarHeightPx, translateY } = getMidAnchorValues(options);

	if (child && options.midAnchorPointPx) {
		child.style.minHeight = `${sidebarHeightPx}px`;
	}

	ref.current.style.transition = "none";
	ref.current.style.transform = `translateY(${translateY}px)`;
	ref.current.style.height = `${sidebarHeightPx}px`;
	if (child) child.style.opacity = "1";
	if (toggleRef.current) {
		toggleRef.current.style.opacity = "1";
		toggleRef.current.style.transform = `translateX(-50%) translateY(-${midAnchorPx}px)`;
	}
	afterApply();
};

export const applyMidAnchorPaneStyles = ({
	ref,
	options,
	toggleRef,
	afterApply,
}: TApplyMidAnchorPaneStyles) => {
	const child = getChildElement(ref);
	const { midAnchorPx, sidebarHeightPx, translateY } = getMidAnchorValues(options);

	if (child && options.midAnchorPointPx) {
		child.style.minHeight = `${sidebarHeightPx}px`;
	}

	const delayMs = options.transitionMs ? options.transitionMs / 2 : 0;
	if (child && options.fadeContent) {
		child.style.opacity = "0";
	}

	requestAnimationFrame(() => {
		if (!ref.current) return;
		const transformTransition = `transform ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		const dimensionTransition = options.isAbsolute
			? ""
			: `, height ${options.transitionMs}ms ${TRANSFORM_EASING}`;
		ref.current.style.transition = `${transformTransition}${dimensionTransition}`;
		if (child && options.fadeContent) {
			child.style.transition = `opacity ${options.fadeContentTransitionMs}ms ease`;
		}

		requestAnimationFrame(() => {
			if (!ref.current) return;

			ref.current.style.transform = `translateY(${translateY}px)`;
			if (!options.isAbsolute) {
				ref.current.style.height = `${sidebarHeightPx}px`;
			} else if (ref.current.style.height !== `${sidebarHeightPx}px`) {
				const prevTransition = ref.current.style.transition;
				ref.current.style.transition = transformTransition;
				ref.current.style.height = `${sidebarHeightPx}px`;
				ref.current.style.transition = prevTransition;
			}

			if (toggleRef.current) {
				toggleRef.current.style.opacity = "1";
				toggleRef.current.style.transform = `translateX(-50%) translateY(-${midAnchorPx}px)`;
			}

			if (child && options.fadeContent) {
				setTimeout(() => {
					child.style.opacity = "1";
				}, delayMs);
			}

			afterApply();
		});
	});

	setTimeout(() => {}, 0);
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

		if (!ref.current) return;
		if (child && options.fadeContent) {
			child.style.opacity = "0";
		}

		// Ensure child keeps fixed width so it doesn't squish
		if (child && options.sidebarWidthPx) {
			child.style.minWidth = `${options.sidebarWidthPx}px`;
		}

		if (!options.isAbsolute) {
			const desiredWidth = `${options.sidebarWidthPx}px`;
			// Apply width only if it changed to avoid unnecessary layout
			if (ref.current.style.width !== desiredWidth) {
				ref.current.style.width = desiredWidth;
			}
		}
		ref.current.style.transform = `translateX(${translateX}px)`;

		if (toggleRef.current) {
			toggleRef.current.style.opacity = "0";
			toggleRef.current.style.transform = `translateY(-50%) translateX(${translateX}px)`;
		}
	});
};

type TApplyDragPaneStylesBottom = {
	ref: RefObject<HTMLDivElement | null>;
	toggleRef: RefObject<HTMLDivElement | null>;
	options: TSwipeBarOptions;
	translateY: number | null;
};

export const applyDragPaneStylesBottom = ({
	ref,
	toggleRef,
	options,
	translateY,
}: TApplyDragPaneStylesBottom) => {
	if (!ref.current || translateY === null) return;
	ref.current.style.transition = "none";

	requestAnimationFrame(() => {
		const child = getChildElement(ref);

		if (!ref.current) return;
		if (child && options.fadeContent) {
			child.style.opacity = "0";
		}

		// Ensure child keeps fixed height so it doesn't squish
		if (child && options.sidebarHeightPx) {
			child.style.minHeight = `${options.sidebarHeightPx}px`;
		}

		if (!options.isAbsolute) {
			const desiredHeight = `${options.sidebarHeightPx}px`;
			if (ref.current.style.height !== desiredHeight) {
				ref.current.style.height = desiredHeight;
			}
		}
		ref.current.style.transform = `translateY(${translateY}px)`;

		if (toggleRef.current) {
			toggleRef.current.style.opacity = "0";
			toggleRef.current.style.transform = `translateX(-50%) translateY(${translateY}px)`;
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

type THandleDragStartY = {
	refs: TDragRefsY;
	clientX: number;
	clientY: number;
	touchId: number | null;
	isMouse: boolean;
};

export const handleDragStartY = ({
	refs,
	clientX,
	clientY,
	touchId,
	isMouse,
}: THandleDragStartY) => {
	refs.draggingRef.current = {
		startX: clientX,
		startY: clientY,
		activeTouchId: touchId,
		isMouse,
		isActivated: false,
	};
	refs.currentYRef.current = clientY;
	refs.prevYRef.current = clientY;
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

type THandleDragCancelY = {
	refs: TDragRefsY;
	dragSidebar: (translateY: number | null) => void;
	onDeactivate: () => void;
};

export const handleDragCancelY = ({ refs, dragSidebar, onDeactivate }: THandleDragCancelY) => {
	refs.draggingRef.current = null;
	refs.currentYRef.current = null;
	refs.prevYRef.current = null;
	dragSidebar(null);
	onDeactivate();
};

export const isEditableTarget = (el: EventTarget | null): boolean => {
	if (!(el instanceof Element)) return false;
	const editable = el.closest("input, textarea, [contenteditable='true']");
	return !!editable;
};

export function findScrollableAncestor(target: EventTarget | null): HTMLElement | null {
	let el = target instanceof HTMLElement ? target : null;
	while (el) {
		const style = getComputedStyle(el);
		if (
			(style.overflowY === "auto" || style.overflowY === "scroll") &&
			el.scrollHeight > el.clientHeight
		) {
			return el;
		}
		el = el.parentElement;
	}
	return null;
}

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

export const useSetMergedOptions = (side: TSidebarSide, options: TSwipeBarOptions, id?: string) => {
	const {
		globalOptions,
		setLeftSidebarOptionsById,
		setRightSidebarOptionsById,
		setBottomSidebarOptionsById,
	} = useSwipeBarContext();
	const {
		sidebarWidthPx,
		sidebarHeightPx,
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
		fadeContent,
		fadeContentTransitionMs,
		swipeToOpen,
		swipeToClose,
		disableSwipe,
		midAnchorPoint,
		midAnchorPointPx,
		disabled,
		closeSidebarOnOverlayClick,
		resetMetaOnClose,
	} = options;

	const mergedOptions = useMemo(() => {
		const baseHeight = sidebarHeightPx ?? globalOptions.sidebarHeightPx;
		return {
			sidebarWidthPx: sidebarWidthPx ?? globalOptions.sidebarWidthPx,
			sidebarHeightPx: baseHeight,
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
			fadeContent: fadeContent ?? globalOptions.fadeContent,
			fadeContentTransitionMs: fadeContentTransitionMs ?? globalOptions.fadeContentTransitionMs,
			swipeToOpen: swipeToOpen ?? globalOptions.swipeToOpen,
			swipeToClose: swipeToClose ?? globalOptions.swipeToClose,
			disableSwipe: disableSwipe ?? globalOptions.disableSwipe,
			midAnchorPoint: midAnchorPoint ?? globalOptions.midAnchorPoint,
			midAnchorPointPx:
				midAnchorPointPx ?? globalOptions.midAnchorPointPx ?? Math.floor(baseHeight / 3),
			disabled: disabled ?? globalOptions.disabled,
			closeSidebarOnOverlayClick:
				closeSidebarOnOverlayClick ?? globalOptions.closeSidebarOnOverlayClick,
			resetMetaOnClose: resetMetaOnClose ?? globalOptions.resetMetaOnClose,
		};
	}, [
		sidebarWidthPx,
		sidebarHeightPx,
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
		fadeContent,
		fadeContentTransitionMs,
		swipeToOpen,
		swipeToClose,
		disableSwipe,
		midAnchorPoint,
		midAnchorPointPx,
		disabled,
		closeSidebarOnOverlayClick,
		resetMetaOnClose,
	]) satisfies Required<TSwipeBarOptions>;

	useEffect(() => {
		if (side === "left") {
			setLeftSidebarOptionsById(id ?? "primary", mergedOptions);
		} else if (side === "right") {
			setRightSidebarOptionsById(id ?? "primary", mergedOptions);
		} else if (side === "bottom") {
			setBottomSidebarOptionsById(id ?? "primary", mergedOptions);
		} else {
			assertNever(side);
		}
	}, [
		side,
		id,
		mergedOptions,
		setLeftSidebarOptionsById,
		setRightSidebarOptionsById,
		setBottomSidebarOptionsById,
	]);

	return mergedOptions;
};
