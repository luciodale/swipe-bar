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

type HandleRightDragMoveProps = {
	refs: DragRefs;
	callbacks: SidebarCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
	options: Required<SwipeBarProps>;
};

const handleRightDragMove = ({
	refs,
	callbacks,
	currentX,
	preventDefault,
	lockPane,
	options,
}: HandleRightDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const viewportWidth = window.innerWidth;

	const swipingDistanceFromInitialDrag = currentX - refs.draggingRef.current.startX;

	const isLegalSwipeDistanceWhenRightIsClosed =
		refs.draggingRef.current.startX >= viewportWidth - options.edgeActivationWidthPx;

	const isPaneActiveted = refs.draggingRef.current.isActivated;

	if (
		!isPaneActiveted &&
		Math.abs(swipingDistanceFromInitialDrag) >= options.dragActivationDeltaPx
	) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	// The legal distance for activating the pane has not been reached yet.
	if (!isPaneActiveted) return;

	refs.prevXRef.current = refs.currentXRef.current;
	refs.currentXRef.current = currentX;

	const rightOpen = callbacks.getIsOpen();

	let isValidGesture = false;

	if (rightOpen) {
		isValidGesture = true;
	} else if (isLegalSwipeDistanceWhenRightIsClosed) {
		isValidGesture = true;
	}

	// defensive case:
	// The user starts dragging when the right pane is open
	// (from anywhere on screen), but then during the drag,
	// the right pane gets programmatically closed by something else.
	// This is defensive code protecting against:
	// - Race conditions where the pane state changes during an active drag
	// - Programmatic pane closes while user is dragging
	// - External state mutations

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.dragPane(null);
		return;
	}

	// when the gesture is valid, we prevent the default browser behavior
	// to avoid scrolling the page while dragging the pane.
	preventDefault();

	const paneWidthPx = options.paneWidthPx;

	// Closing the pane
	if (rightOpen) {
		const translateX = Math.max(
			0,
			Math.min(paneWidthPx, swipingDistanceFromInitialDrag - options.dragActivationDeltaPx),
		);

		callbacks.dragPane(translateX);

		// Opening the pane
	} else {
		const translateX = Math.max(
			0,
			Math.min(
				paneWidthPx,
				paneWidthPx + swipingDistanceFromInitialDrag + options.dragActivationDeltaPx,
			),
		);
		callbacks.dragPane(translateX);
	}
};

type HandleRightDragEndProps = {
	refs: DragRefs;
	rightPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: SidebarCallbacks;
	options: Required<SwipeBarProps>;
};

const handleRightDragEnd = ({ refs, callbacks, options }: HandleRightDragEndProps) => {
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
	const rightOpen = callbacks.getIsOpen();
	const viewportWidth = window.innerWidth;

	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;

	const swipedRight = currentX > prevX;
	const swipedLeft = currentX < prevX;

	const moreThanEdgeSwipeThreshold = startX >= viewportWidth - options.edgeActivationWidthPx;

	if (rightOpen) {
		if (swipedRight) {
			callbacks.closePane();
		} else {
			callbacks.openPane();
			// Pane stays open, keep locked
		}
		callbacks.dragPane(null);
	} else if (moreThanEdgeSwipeThreshold && swipedLeft) {
		callbacks.openPane();
		// Pane opened, keep locked
		callbacks.dragPane(null);
	} else {
		callbacks.closePane();
		callbacks.dragPane(null);
	}
};

export function useSwipeRightPane(options: Required<SwipeBarProps>) {
	const isSmallScreen = useMediaQuery("small");
	const { lockedPane, setLockedPane, isRightOpen, openPane, closePane, dragPane, rightPaneRef } =
		useSwipePaneContext();

	const draggingRef = useRef<DragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedPane === "left") return;

		const callbacks: SidebarCallbacks = {
			getIsOpen: () => isRightOpen,
			openPane: () => openPane("right"),
			closePane: () => closePane("right"),
			dragPane: (translateX) => dragPane("right", translateX),
		};

		const refs: DragRefs = {
			draggingRef,
			currentXRef,
			prevXRef,
		};

		const lockPane = () => setLockedPane("right");
		const unlockPane = () => setLockedPane(null);

		function onTouchStart(e: TouchEvent) {
			if (lockedPane === "left") return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];
			const viewportWidth = window.innerWidth;

			if (
				callbacks.getIsOpen() ||
				firstTouch.clientX >= viewportWidth - options.edgeActivationWidthPx
			) {
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
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			const changedTouch = findChangedTouch(e.changedTouches, trackedId);
			if (!changedTouch) return;

			handleRightDragMove({
				refs,
				callbacks,
				currentX: changedTouch.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleRightDragEnd({
				refs,
				rightPaneRef,
				callbacks,
				options,
			});
		}

		function onTouchCancel() {
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancel({
				refs,
				dragPane: callbacks.dragPane,
				onDeactivate: unlockPane,
			});
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedPane === "left") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			const viewportWidth = window.innerWidth;

			if (callbacks.getIsOpen() || e.clientX >= viewportWidth - options.edgeActivationWidthPx) {
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
			if (lockedPane === "left") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleRightDragMove({
				refs,
				callbacks,
				currentX: e.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onMouseUp() {
			if (lockedPane === "left") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleRightDragEnd({
				refs,
				rightPaneRef,
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
		isRightOpen,
		openPane,
		closePane,
		dragPane,
		lockedPane,
		setLockedPane,
		rightPaneRef,
		options,
	]);
}
