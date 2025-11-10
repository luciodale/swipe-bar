import type { RefObject } from "react";

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
	transitionMsOpen?: number;
	transitionMsClose?: number;
	paneWidthPx?: number;
	isAbsolute?: boolean;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
	showOverlay?: boolean;
	closeSidebarOnOverlayClick?: boolean;
};

export const TRANSITION_OPEN_MS = 200;
export const TRANSITION_CLOSE_MS = 300;
export const EDGE_ACTIVATION_REGION_PX = 40;
export const DRAG_ACTIVATION_DELTA_PX = 20;
export const PANE_WIDTH_PX = 320;
export const SHOW_OVERLAY = true;
export const CLOSE_SIDEBAR_ON_OVERLAY_CLICK = true;
export const IS_ABSOLUTE = false;

export type ToggleProps = {
	className?: string;
	transitionMs?: number;
};

export type PaneSide = "left" | "right";

type ApplyOpenPaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	options: SwipeBarProps;
	afterApply: () => void;
};

export const applyOpenPaneStyles = ({ ref, options, afterApply }: ApplyOpenPaneStylesProps) => {
	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.transition = `transform ${options.transitionMsOpen}ms ease, width ${options.transitionMsOpen}ms ease`;

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
		ref.current.style.transition = `transform ${options.transitionMsClose}ms ease, width ${options.transitionMsClose}ms ease`;

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
	if (!ref.current) return;
	ref.current.style.transition = "none";

	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.width = `${options.paneWidthPx}px`;
		if (translateX !== null) {
			ref.current.style.transform = `translateX(${translateX}px)`;
		}
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
