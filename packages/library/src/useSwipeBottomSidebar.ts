import { useEffect, useRef } from "react";
import {
	type TDragRefsY,
	type TDragState,
	type TSidebarCallbacks,
	type TSwipeBarOptions,
	findChangedTouch,
	handleDragCancelY,
	handleDragStartY,
	hasTrackedTouchEnded,
	isEditableTarget,
} from "./swipeSidebarShared";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipeBarContext } from "./useSwipeBarContext";

type HandleBottomDragMoveProps = {
	refs: TDragRefsY;
	callbacks: TSidebarCallbacks;
	currentY: number;
	preventDefault: () => void;
	lockPane: () => void;
	options: Required<TSwipeBarOptions>;
};

const handleBottomDragMove = ({
	refs,
	callbacks,
	currentY,
	preventDefault,
	lockPane,
	options,
}: HandleBottomDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const swipingDistanceFromInitialDrag = currentY - refs.draggingRef.current.startY;

	if (
		!refs.draggingRef.current.isActivated &&
		Math.abs(swipingDistanceFromInitialDrag) >= options.dragActivationDeltaPx
	) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	if (!refs.draggingRef.current.isActivated) return;

	refs.prevYRef.current = refs.currentYRef.current;
	refs.currentYRef.current = currentY;

	const bottomOpen = callbacks.getIsOpen();
	const windowHeight = window.innerHeight;

	let isValidGesture = false;

	if (bottomOpen) {
		isValidGesture = true;
	} else if (refs.draggingRef.current.startY >= windowHeight - options.edgeActivationWidthPx) {
		isValidGesture = true;
	}

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.dragSidebar(null);
		return;
	}

	preventDefault();

	const sidebarHeightPx = options.sidebarHeightPx;

	if (bottomOpen) {
		// Swipe down to close: translateY goes from 0 (open) to sidebarHeightPx (closed)
		const translateY = Math.max(
			0,
			Math.min(sidebarHeightPx, swipingDistanceFromInitialDrag - options.dragActivationDeltaPx),
		);
		callbacks.dragSidebar(translateY);
	} else if (refs.draggingRef.current.startY >= windowHeight - options.edgeActivationWidthPx) {
		// Swipe up to open: translateY goes from sidebarHeightPx (closed) to 0 (open)
		const translateY = Math.max(
			0,
			Math.min(
				sidebarHeightPx,
				sidebarHeightPx + swipingDistanceFromInitialDrag + options.dragActivationDeltaPx,
			),
		);
		callbacks.dragSidebar(translateY);
	}
};

type HandleBottomDragEndProps = {
	refs: TDragRefsY;
	bottomSidebarRef: React.RefObject<HTMLDivElement | null>;
	callbacks: TSidebarCallbacks;
	options: Required<TSwipeBarOptions>;
};

const handleBottomDragEnd = ({ refs, callbacks, options }: HandleBottomDragEndProps) => {
	if (!refs.draggingRef.current) return;

	if (!refs.draggingRef.current.isActivated) {
		refs.draggingRef.current = null;
		refs.currentYRef.current = null;
		refs.prevYRef.current = null;
		return;
	}

	const currentY = refs.currentYRef.current ?? refs.draggingRef.current.startY;
	const prevY = refs.prevYRef.current ?? refs.draggingRef.current.startY;
	const startY = refs.draggingRef.current.startY;
	const bottomOpen = callbacks.getIsOpen();
	const windowHeight = window.innerHeight;

	refs.draggingRef.current = null;
	refs.currentYRef.current = null;
	refs.prevYRef.current = null;

	const swipedUp = currentY < prevY;
	const swipedDown = currentY >= prevY;

	const lessThanEdgeSwipeThreshold = startY >= windowHeight - options.edgeActivationWidthPx;

	if (bottomOpen) {
		if (swipedDown) {
			callbacks.closeSidebar();
		} else {
			callbacks.openSidebar();
		}
		callbacks.dragSidebar(null);
	} else if (lessThanEdgeSwipeThreshold && swipedUp) {
		callbacks.openSidebar();
		callbacks.dragSidebar(null);
	} else {
		callbacks.closeSidebar();
		callbacks.dragSidebar(null);
	}
};

export function useSwipeBottomSidebar(options: Required<TSwipeBarOptions>) {
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);

	const {
		lockedSidebar,
		setLockedSidebar,
		isBottomOpen,
		openSidebar,
		closeSidebar,
		dragSidebar,
		bottomSidebarRef,
	} = useSwipeBarContext();

	const draggingRef = useRef<TDragState | null>(null);
	const currentYRef = useRef<number | null>(null);
	const prevYRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedSidebar === "left" || lockedSidebar === "right") return;

		const callbacks: TSidebarCallbacks = {
			getIsOpen: () => isBottomOpen,
			openSidebar: () => openSidebar("bottom"),
			closeSidebar: () => closeSidebar("bottom"),
			dragSidebar: (translateY) => dragSidebar("bottom", translateY),
		};

		const refs = {
			draggingRef,
			currentYRef,
			prevYRef,
		};

		const lockPane = () => setLockedSidebar("bottom");
		const unlockPane = () => setLockedSidebar(null);

		function onTouchStart(e: TouchEvent) {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];
			const windowHeight = window.innerHeight;

			if (
				callbacks.getIsOpen() ||
				firstTouch.clientY >= windowHeight - options.edgeActivationWidthPx
			) {
				handleDragStartY({
					refs,
					clientX: firstTouch.clientX,
					clientY: firstTouch.clientY,
					touchId: firstTouch.identifier,
					isMouse: false,
				});
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			const changedTouch = findChangedTouch(e.changedTouches, trackedId);
			if (!changedTouch) return;

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: changedTouch.clientY,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleBottomDragEnd({
				refs,
				bottomSidebarRef,
				callbacks,
				options,
			});
		}

		function onTouchCancel() {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancelY({
				refs,
				dragSidebar: callbacks.dragSidebar,
				onDeactivate: unlockPane,
			});
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			const windowHeight = window.innerHeight;

			if (callbacks.getIsOpen() || e.clientY >= windowHeight - options.edgeActivationWidthPx) {
				handleDragStartY({
					refs,
					clientX: e.clientX,
					clientY: e.clientY,
					touchId: null,
					isMouse: true,
				});
			}
		}

		function onMouseMove(e: MouseEvent) {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: e.clientY,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
			});
		}

		function onMouseUp() {
			if (lockedSidebar === "left" || lockedSidebar === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleBottomDragEnd({
				refs,
				bottomSidebarRef,
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
		isBottomOpen,
		openSidebar,
		closeSidebar,
		dragSidebar,
		lockedSidebar,
		setLockedSidebar,
		bottomSidebarRef,
		options,
	]);
}

