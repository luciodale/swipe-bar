import { useEffect, useRef } from "react";
import {
	findChangedTouch,
	handleDragCancel,
	handleDragStart,
	hasTrackedTouchEnded,
	isEditableTarget,
	type TDragRefs,
	type TDragState,
	type TSidebarCallbacks,
	type TSwipeBarOptions,
} from "./swipeSidebarShared";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipeBarContext } from "./useSwipeBarContext";

export type HandleLeftDragMoveProps = {
	refs: TDragRefs;
	callbacks: TSidebarCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
	options: Required<TSwipeBarOptions>;
};

export const handleLeftDragMove = ({
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
		callbacks.dragSidebar(null);
		return;
	}

	preventDefault();

	const sidebarWidthPx = options.sidebarWidthPx;

	if (leftOpen) {
		const translateX = Math.min(
			0,
			Math.max(-sidebarWidthPx, swipingDistanceFromInitialDrag + options.dragActivationDeltaPx),
		);
		callbacks.dragSidebar(translateX);
	} else if (refs.draggingRef.current.startX <= options.edgeActivationWidthPx) {
		const translateX = Math.min(
			0,
			Math.max(
				-sidebarWidthPx,
				-sidebarWidthPx + swipingDistanceFromInitialDrag - options.dragActivationDeltaPx,
			),
		);
		callbacks.dragSidebar(translateX);
	}
};

export type HandleLeftDragEndProps = {
	refs: TDragRefs;
	leftSidebarRef: React.RefObject<HTMLDivElement | null>;
	callbacks: TSidebarCallbacks;
	options: Required<TSwipeBarOptions>;
};

export const handleLeftDragEnd = ({ refs, callbacks, options }: HandleLeftDragEndProps) => {
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
		if (swipedLeft && options.swipeToClose) {
			callbacks.closeSidebar();
		} else {
			callbacks.openSidebar();
		}
		callbacks.dragSidebar(null);
	} else if (lessThanEdgeSwipeThreshold && swipedRight) {
		callbacks.openSidebar();
		// Pane opened, keep locked
		callbacks.dragSidebar(null);
	} else {
		callbacks.closeSidebar();
		callbacks.dragSidebar(null);
	}
};

export function useSwipeLeftSidebar(options: Required<TSwipeBarOptions>, id: string) {
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);

	const {
		lockedSidebar,
		setLockedSidebar,
		leftSidebars,
		openSidebar,
		closeSidebar,
		dragSidebar,
		activeLeftDragIdRef,
		leftFocusStackRef,
	} = useSwipeBarContext();

	const isOpen = leftSidebars[id]?.isOpen ?? false;

	const draggingRef = useRef<TDragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedSidebar && lockedSidebar !== "left") return;
		if (options.disabled) return;

		const callbacks: TSidebarCallbacks = {
			getIsOpen: () => isOpen,
			openSidebar: () => openSidebar("left", { id }),
			closeSidebar: () => closeSidebar("left", { id }),
			dragSidebar: (translateX) => dragSidebar("left", translateX, { id }),
		};

		const refs = {
			draggingRef,
			currentXRef,
			prevXRef,
		};

		const isLockedByAnotherLeft = () =>
			activeLeftDragIdRef.current !== null && activeLeftDragIdRef.current !== id;

		const isTopOfFocusStack = () => {
			const stack = leftFocusStackRef.current;
			if (stack.length === 0) return true;
			return stack[stack.length - 1] === id;
		};

		const lockPane = () => {
			if (isLockedByAnotherLeft()) {
				draggingRef.current = null;
				return;
			}
			activeLeftDragIdRef.current = id;
			setLockedSidebar("left");
		};

		const clearDragLock = () => {
			if (activeLeftDragIdRef.current === id) {
				activeLeftDragIdRef.current = null;
			}
		};

		const unlockPane = () => {
			clearDragLock();
			setLockedSidebar(null);
		};

		function onTouchStart(e: TouchEvent) {
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (isLockedByAnotherLeft()) return;
			if (!isTopOfFocusStack()) return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];
			const currentlyOpen = callbacks.getIsOpen();
			const inEdgeRegion = firstTouch.clientX <= options.edgeActivationWidthPx;

			if (options.disableSwipe) return;
			if (!currentlyOpen && !options.swipeToOpen) return;

			if (currentlyOpen || inEdgeRegion) {
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
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (isLockedByAnotherLeft()) {
				draggingRef.current = null;
				return;
			}
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
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			clearDragLock();
			handleLeftDragEnd({
				refs,
				leftSidebarRef: { current: null },
				callbacks,
				options,
			});
		}

		function onTouchCancel() {
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			clearDragLock();
			handleDragCancel({
				refs,
				dragSidebar: callbacks.dragSidebar,
				onDeactivate: unlockPane,
			});
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (isLockedByAnotherLeft()) return;
			if (!isTopOfFocusStack()) return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			const currentlyOpen = callbacks.getIsOpen();
			const inEdgeRegion = e.clientX <= options.edgeActivationWidthPx;

			if (options.disableSwipe) return;
			if (!currentlyOpen && !options.swipeToOpen) return;

			if (currentlyOpen || inEdgeRegion) {
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
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (isLockedByAnotherLeft()) {
				draggingRef.current = null;
				return;
			}
			if (!draggingRef.current?.isMouse) return;

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
			if (lockedSidebar && lockedSidebar !== "left") return;
			if (!draggingRef.current?.isMouse) return;

			clearDragLock();
			handleLeftDragEnd({
				refs,
				leftSidebarRef: { current: null },
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
		id,
		isSmallScreen,
		isOpen,
		openSidebar,
		closeSidebar,
		dragSidebar,
		lockedSidebar,
		setLockedSidebar,
		options,
		activeLeftDragIdRef,
		leftFocusStackRef,
	]);
}
