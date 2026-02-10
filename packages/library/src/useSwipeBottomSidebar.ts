import { useEffect, useRef } from "react";
import {
	type TDragRefsY,
	type TDragState,
	type TSidebarCallbacks,
	type TSwipeBarOptions,
	findChangedTouch,
	findScrollableAncestor,
	handleDragCancelY,
	handleDragStartY,
	hasTrackedTouchEnded,
	isEditableTarget,
} from "./swipeSidebarShared";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipeBarContext } from "./useSwipeBarContext";

type HandleBottomDragMoveProps = {
	refs: TDragRefsY;
	callbacks: TSidebarCallbacks & { getBottomAnchorState: () => "closed" | "midAnchor" | "open" };
	currentY: number;
	preventDefault: () => void;
	lockPane: () => void;
	options: Required<TSwipeBarOptions>;
	scrollableAncestor: HTMLElement | null;
	initialScrollTop: number;
};

const handleBottomDragMove = ({
	refs,
	callbacks,
	currentY,
	preventDefault,
	lockPane,
	options,
	scrollableAncestor,
	initialScrollTop,
}: HandleBottomDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const swipingDistanceFromInitialDrag = currentY - refs.draggingRef.current.startY;

	if (
		!refs.draggingRef.current.isActivated &&
		Math.abs(swipingDistanceFromInitialDrag) >= options.dragActivationDeltaPx
	) {
		if (scrollableAncestor && callbacks.getIsOpen()) {
			// If native scroll already moved the element, let scroll win
			if (scrollableAncestor.scrollTop !== initialScrollTop) {
				refs.draggingRef.current = null;
				callbacks.dragSidebar(null);
				return;
			}

			// At scroll boundaries scrollTop can't change, so also check direction
			const { scrollTop, scrollHeight, clientHeight } = scrollableAncestor;
			const canScrollUp = scrollTop > 1;
			const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

			if (
				(swipingDistanceFromInitialDrag > 0 && canScrollUp) ||
				(swipingDistanceFromInitialDrag < 0 && canScrollDown)
			) {
				refs.draggingRef.current = null;
				callbacks.dragSidebar(null);
				return;
			}
		}

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
	const midAnchorPx = options.midAnchorPointPx;
	// midAnchor only activates if enabled, swipeToOpen disabled, and midAnchorPointPx < sidebarHeightPx
	const midAnchorActive =
		options.midAnchorPoint && !options.swipeToOpen && midAnchorPx < sidebarHeightPx;

	if (bottomOpen) {
		if (midAnchorActive) {
			const anchorState = callbacks.getBottomAnchorState();

			if (anchorState === "open") {
				// Swipe down from open: translateY goes from 0 (open) to sidebarHeightPx (closed)
				const translateY = Math.max(
					0,
					Math.min(sidebarHeightPx, swipingDistanceFromInitialDrag - options.dragActivationDeltaPx),
				);
				callbacks.dragSidebar(translateY);
			} else if (anchorState === "midAnchor") {
				// From mid-anchor, can swipe up to open or down to close
				const baseTranslate = sidebarHeightPx - midAnchorPx;
				const translateY = Math.max(
					0,
					Math.min(
						sidebarHeightPx,
						baseTranslate + swipingDistanceFromInitialDrag - options.dragActivationDeltaPx,
					),
				);
				callbacks.dragSidebar(translateY);
			}
		} else {
			// Standard 2-state: swipe down to close
			const translateY = Math.max(
				0,
				Math.min(sidebarHeightPx, swipingDistanceFromInitialDrag - options.dragActivationDeltaPx),
			);
			callbacks.dragSidebar(translateY);
		}
	} else if (refs.draggingRef.current.startY >= windowHeight - options.edgeActivationWidthPx) {
		if (midAnchorActive) {
			// Swipe up to mid-anchor: translateY goes from sidebarHeightPx (closed) to (sidebarHeightPx - midAnchorPx) (midAnchor)
			const midAnchorTranslate = sidebarHeightPx - midAnchorPx;
			const translateY = Math.max(
				midAnchorTranslate,
				Math.min(
					sidebarHeightPx,
					sidebarHeightPx + swipingDistanceFromInitialDrag + options.dragActivationDeltaPx,
				),
			);
			callbacks.dragSidebar(translateY);
		} else {
			// Standard 2-state: swipe up to open fully
			const translateY = Math.max(
				0,
				Math.min(
					sidebarHeightPx,
					sidebarHeightPx + swipingDistanceFromInitialDrag + options.dragActivationDeltaPx,
				),
			);
			callbacks.dragSidebar(translateY);
		}
	}
};

type HandleBottomDragEndProps = {
	refs: TDragRefsY;
	callbacks: TSidebarCallbacks & {
		getBottomAnchorState: () => "closed" | "midAnchor" | "open";
		openToMidAnchor: () => void;
		openSidebarFully: () => void;
	};
	options: Required<TSwipeBarOptions>;
	onDragEnd: () => void;
};

const handleBottomDragEnd = ({ refs, callbacks, options, onDragEnd }: HandleBottomDragEndProps) => {
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

	// Clear the per-instance drag lock
	onDragEnd();

	const swipedUp = currentY < prevY;
	const swipedDown = currentY >= prevY;
	const lessThanEdgeSwipeThreshold = startY >= windowHeight - options.edgeActivationWidthPx;
	const midAnchorPx = options.midAnchorPointPx;
	const sidebarHeightPx = options.sidebarHeightPx;
	const midAnchorActive =
		options.midAnchorPoint && !options.swipeToOpen && midAnchorPx < sidebarHeightPx;

	if (bottomOpen) {
		if (midAnchorActive) {
			const anchorState = callbacks.getBottomAnchorState();
			const midThreshold = sidebarHeightPx - midAnchorPx;

			if (anchorState === "open") {
				// Current translateY: how much we've dragged down from open (0)
				const currentTranslateY = Math.max(0, currentY - startY);

				if (swipedDown) {
					// Swipe down from open
					if (currentTranslateY > midThreshold) {
						// User dragged past midpoint, close directly
						callbacks.closeSidebar();
					} else {
						// Go to mid-anchor
						callbacks.openToMidAnchor();
					}
				} else {
					// Final direction is up - check if position is above mid-threshold
					if (currentTranslateY < midThreshold) {
						// Position above midpoint, stay fully open
						callbacks.openSidebarFully();
					} else {
						// Position at or below midpoint, go to mid-anchor
						callbacks.openToMidAnchor();
					}
				}
				callbacks.dragSidebar(null);
			} else if (anchorState === "midAnchor") {
				// Base translate for mid-anchor position
				const baseTranslate = sidebarHeightPx - midAnchorPx;
				// Current translateY relative to mid-anchor
				const currentTranslateY = Math.max(
					0,
					Math.min(sidebarHeightPx, baseTranslate + (currentY - startY)),
				);

				if (swipedUp) {
					// Final direction is up - check if we crossed above mid-threshold
					if (currentTranslateY < midThreshold) {
						// Position above midpoint, open fully
						callbacks.openSidebarFully();
					} else {
						// Position still at or below midpoint, stay at mid-anchor
						callbacks.openToMidAnchor();
					}
				} else {
					// Final direction is down - check if past close threshold
					// Close threshold: past mid-anchor position toward closed
					const closeThreshold = (sidebarHeightPx + baseTranslate) / 2;
					if (currentTranslateY > closeThreshold) {
						// Position past close threshold, close fully
						callbacks.closeSidebar();
					} else {
						// Position above close threshold, stay at mid-anchor
						callbacks.openToMidAnchor();
					}
				}
				callbacks.dragSidebar(null);
			}
		} else {
			// Standard 2-state behavior
			if (swipedDown) {
				callbacks.closeSidebar();
			} else {
				callbacks.openSidebar();
			}
			callbacks.dragSidebar(null);
		}
	} else if (lessThanEdgeSwipeThreshold && swipedUp) {
		if (midAnchorActive) {
			// Open to mid-anchor
			callbacks.openToMidAnchor();
		} else {
			// Standard: open fully
			callbacks.openSidebar();
		}
		callbacks.dragSidebar(null);
	} else {
		callbacks.closeSidebar();
		callbacks.dragSidebar(null);
	}
};

export function useSwipeBottomSidebar(options: Required<TSwipeBarOptions>, id: string) {
	const isSmallScreen = useMediaQuery(options.mediaQueryWidth);

	const {
		lockedSidebar,
		setLockedSidebar,
		bottomSidebars,
		openSidebar,
		openSidebarFully,
		closeSidebar,
		dragSidebar,
		openSidebarToMidAnchor,
		activeBottomDragIdRef,
		bottomFocusStackRef,
	} = useSwipeBarContext();

	const isOpen = bottomSidebars[id]?.isOpen ?? false;
	const anchorState = bottomSidebars[id]?.anchorState ?? "closed";

	const draggingRef = useRef<TDragState | null>(null);
	const currentYRef = useRef<number | null>(null);
	const prevYRef = useRef<number | null>(null);
	const scrollableAncestorRef = useRef<HTMLElement | null>(null);
	const initialScrollTopRef = useRef(0);
	const savedOverflowYRef = useRef<string | null>(null);
	const anchorStateRef = useRef(anchorState);

	useEffect(() => {
		anchorStateRef.current = anchorState;
	}, [anchorState]);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedSidebar && lockedSidebar !== "bottom") return;
		if (options.disabled) return;

		const callbacks = {
			getIsOpen: () => isOpen,
			openSidebar: () => openSidebar("bottom", { id }),
			openSidebarFully: () => openSidebarFully("bottom", { id }),
			closeSidebar: () => closeSidebar("bottom", { id }),
			dragSidebar: (translateY: number | null) => dragSidebar("bottom", translateY, { id }),
			getBottomAnchorState: () => anchorStateRef.current,
			openToMidAnchor: () => openSidebarToMidAnchor("bottom", { id }),
		};

		const refs = {
			draggingRef,
			currentYRef,
			prevYRef,
		};

		const isLockedByAnotherBottom = () =>
			activeBottomDragIdRef.current !== null && activeBottomDragIdRef.current !== id;

		// Only the top-of-stack sidebar handles gestures.
		// When closed (edge swipe to open): only if nothing else is on the stack above.
		// When open: only if this sidebar is the topmost open one.
		const isTopOfFocusStack = () => {
			const stack = bottomFocusStackRef.current;
			if (stack.length === 0) return true; // nothing on stack — edge swipe is fine
			return stack[stack.length - 1] === id;
		};

		const lockPane = () => {
			// Check per-instance drag lock (synchronous ref — no race conditions)
			if (isLockedByAnotherBottom()) {
				// Another bottom instance is being dragged — abort
				draggingRef.current = null;
				return;
			}
			activeBottomDragIdRef.current = id;
			setLockedSidebar("bottom");
			// Disable scroll on the ancestor so the compositor can't scroll mid-gesture
			const el = scrollableAncestorRef.current;
			if (el) {
				savedOverflowYRef.current = el.style.overflowY;
				el.style.overflowY = "hidden";
			}
		};

		const clearDragLock = () => {
			if (activeBottomDragIdRef.current === id) {
				activeBottomDragIdRef.current = null;
			}
			// Restore scroll on the ancestor
			const el = scrollableAncestorRef.current;
			if (el && savedOverflowYRef.current !== null) {
				el.style.overflowY = savedOverflowYRef.current;
				savedOverflowYRef.current = null;
			}
		};

		function onTouchStart(e: TouchEvent) {
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (isLockedByAnotherBottom()) return;
			if (!isTopOfFocusStack()) return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];
			const windowHeight = window.innerHeight;
			const currentlyOpen = callbacks.getIsOpen();
			const inEdgeRegion = firstTouch.clientY >= windowHeight - options.edgeActivationWidthPx;

			if (currentlyOpen && !options.swipeToClose) return;
			if (!currentlyOpen && !options.swipeToOpen) return;

			if (currentlyOpen || inEdgeRegion) {
				scrollableAncestorRef.current = findScrollableAncestor(e.target);
				initialScrollTopRef.current = scrollableAncestorRef.current?.scrollTop ?? 0;
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
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (isLockedByAnotherBottom()) {
				draggingRef.current = null;
				return;
			}
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
				scrollableAncestor: scrollableAncestorRef.current,
				initialScrollTop: initialScrollTopRef.current,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleBottomDragEnd({
				refs,
				callbacks,
				options,
				onDragEnd: clearDragLock,
			});
		}

		function onTouchCancel() {
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			clearDragLock();
			handleDragCancelY({
				refs,
				dragSidebar: callbacks.dragSidebar,
				onDeactivate: () => {},
			});
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (isLockedByAnotherBottom()) return;
			if (!isTopOfFocusStack()) return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			const windowHeight = window.innerHeight;
			const currentlyOpen = callbacks.getIsOpen();
			const inEdgeRegion = e.clientY >= windowHeight - options.edgeActivationWidthPx;

			if (currentlyOpen && !options.swipeToClose) return;
			if (!currentlyOpen && !options.swipeToOpen) return;

			if (currentlyOpen || inEdgeRegion) {
				scrollableAncestorRef.current = findScrollableAncestor(e.target);
				initialScrollTopRef.current = scrollableAncestorRef.current?.scrollTop ?? 0;
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
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (isLockedByAnotherBottom()) {
				draggingRef.current = null;
				return;
			}
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: e.clientY,
				preventDefault: () => e.preventDefault(),
				lockPane,
				options,
				scrollableAncestor: scrollableAncestorRef.current,
				initialScrollTop: initialScrollTopRef.current,
			});
		}

		function onMouseUp() {
			if (lockedSidebar && lockedSidebar !== "bottom") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleBottomDragEnd({
				refs,
				callbacks,
				options,
				onDragEnd: clearDragLock,
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
		openSidebarFully,
		closeSidebar,
		dragSidebar,
		lockedSidebar,
		setLockedSidebar,
		options,
		openSidebarToMidAnchor,
		activeBottomDragIdRef,
		bottomFocusStackRef,
	]);
}
