import { useEffect, useRef } from "react";
import {
	type DragRefs,
	type DragState,
	type SidebarCallbacks,
	type SwipeBarProps,
	findChangedTouch,
	handleDragCancel,
	handleDragStart,
	hasTrackedTouchEnded,
	isEditableTarget,
} from "./swipePaneShared";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipePaneContext } from "./useSwipePaneContext";

type HandleLeftDragMoveProps = {
	refs: DragRefs;
	callbacks: SidebarCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
	options: Required<SwipeBarProps>;
};

const handleLeftDragMove = ({
	refs,
	callbacks,
	currentX,
	preventDefault,
	lockPane,
	options,
}: HandleLeftDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const swipingDistanceFromInitialDrag = currentX - refs.draggingRef.current.startX;

	if (
		!refs.draggingRef.current.isActivated &&
		Math.abs(swipingDistanceFromInitialDrag) >= options.dragActivationDeltaPx
	) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	if (!refs.draggingRef.current.isActivated) return;

	refs.prevXRef.current = refs.currentXRef.current;
	refs.currentXRef.current = currentX;

	const leftOpen = callbacks.getIsOpen();

	let isValidGesture = false;

	if (leftOpen) {
		isValidGesture = true;
	} else if (refs.draggingRef.current.startX <= options.edgeActivationWidthPx) {
		isValidGesture = true;
	}

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.dragPane(null);
		return;
	}

	preventDefault();

	const paneWidthPx = options.paneWidthPx;

	if (leftOpen) {
		const translateX = Math.min(
			0,
			Math.max(-paneWidthPx, swipingDistanceFromInitialDrag + options.dragActivationDeltaPx),
		);
		callbacks.dragPane(translateX);
	} else if (refs.draggingRef.current.startX <= options.edgeActivationWidthPx) {
		const translateX = Math.min(
			0,
			Math.max(
				-paneWidthPx,
				-paneWidthPx + swipingDistanceFromInitialDrag - options.dragActivationDeltaPx,
			),
		);
		callbacks.dragPane(translateX);
	}
};

type HandleLeftDragEndProps = {
	refs: DragRefs;
	leftPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: SidebarCallbacks;
	options: Required<SwipeBarProps>;
};

const handleLeftDragEnd = ({ refs, callbacks, options }: HandleLeftDragEndProps) => {
	if (!refs.draggingRef.current) return;

	// If the drag never activated (threshold not met), clear state and do nothing.
	if (!refs.draggingRef.current.isActivated) {
		refs.draggingRef.current = null;
		refs.currentXRef.current = null;
		refs.prevXRef.current = null;
		return;
	}

	const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
	const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
	const startX = refs.draggingRef.current.startX;
	const leftOpen = callbacks.getIsOpen();

	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;

	const swipedRight = currentX >= prevX;
	const swipedLeft = currentX < prevX;

	const lessThanEdgeSwipeThreshold = startX <= options.edgeActivationWidthPx;

	if (leftOpen) {
		if (swipedLeft) {
			callbacks.closePane();
		} else {
			callbacks.openPane();
		}
		callbacks.dragPane(null);
	} else if (lessThanEdgeSwipeThreshold && swipedRight) {
		callbacks.openPane();
		// Pane opened, keep locked
		callbacks.dragPane(null);
	} else {
		callbacks.closePane();
		callbacks.dragPane(null);
	}
};

export function useSwipeLeftPane(options: Required<SwipeBarProps>) {
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);

	const { lockedPane, setLockedPane, isLeftOpen, openPane, closePane, dragPane, leftPaneRef } =
		useSwipePaneContext();

	const draggingRef = useRef<DragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedPane === "right") return;

		const callbacks: SidebarCallbacks = {
			getIsOpen: () => isLeftOpen,
			openPane: () => openPane("left"),
			closePane: () => closePane("left"),
			dragPane: (translateX) => dragPane("left", translateX),
		};

		const refs = {
			draggingRef,
			currentXRef,
			prevXRef,
		};

		const lockPane = () => setLockedPane("left");
		const unlockPane = () => setLockedPane(null);

		function onTouchStart(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];

			if (callbacks.getIsOpen() || firstTouch.clientX <= options.edgeActivationWidthPx) {
				handleDragStart({
					refs,
					clientX: firstTouch.clientX,
					clientY: firstTouch.clientY,
					touchId: firstTouch.identifier,
					isMouse: false,
				});
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			const changedTouch = findChangedTouch(e.changedTouches, trackedId);
			if (!changedTouch) return;

			handleLeftDragMove({
				refs,
				callbacks,
				currentX: changedTouch.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleLeftDragEnd({
				refs,
				leftPaneRef,
				callbacks,
				options,
			});
		}

		function onTouchCancel() {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancel({
				refs,
				dragPane: callbacks.dragPane,
				onDeactivate: unlockPane,
			});
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedPane === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			if (callbacks.getIsOpen() || e.clientX <= options.edgeActivationWidthPx) {
				handleDragStart({
					refs,
					clientX: e.clientX,
					clientY: e.clientY,
					touchId: null,
					isMouse: true,
				});
			}
		}

		function onMouseMove(e: MouseEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragMove({
				refs,
				callbacks,
				currentX: e.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onMouseUp() {
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragEnd({
				refs,
				leftPaneRef,
				callbacks,
				options,
			});
		}

		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("touchend", onTouchEnd, { passive: true });
		window.addEventListener("touchcancel", onTouchCancel, { passive: true });

		window.addEventListener("mousedown", onMouseDown, { passive: true });
		window.addEventListener("mousemove", onMouseMove, { passive: false });
		window.addEventListener("mouseup", onMouseUp, { passive: true });

		return () => {
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
			window.removeEventListener("touchcancel", onTouchCancel);

			window.removeEventListener("mousedown", onMouseDown);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [
		isSmallScreen,
		isLeftOpen,
		openPane,
		closePane,
		dragPane,
		lockedPane,
		setLockedPane,
		leftPaneRef,
		options,
	]);
}
