import { useEffect, useRef } from "react";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
	ACTIVATION_DELTA_X_PX,
	type DragRefs,
	type DragState,
	EDGE_SWIPE_THRESHOLD_PX,
	LEFT_PANE_WIDTH_PX,
	type LeftPaneCallbacks,
	handleDragCancel,
	handleDragStart,
	isEditableTarget,
} from "./swipePaneShared";
import { useMediaQuery } from "./useMediaQuery";

type HandleLeftDragMoveProps = {
	refs: DragRefs;
	leftPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: LeftPaneCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
};

function openLeftPane(leftPaneRef: React.RefObject<HTMLDivElement | null>, callback: () => void) {
	if (!leftPaneRef.current) return;
	requestAnimationFrame(() => {
		if (leftPaneRef.current) {
			console.log("OPEN add transition");
			leftPaneRef.current.style.transition = "transform 0.2s ease, width 0.2s ease";
		}
	});

	setTimeout(() => {
		requestAnimationFrame(() => {
			if (leftPaneRef.current) {
				console.log("OPEN transform nothing width 320px");

				leftPaneRef.current.style.transform = "";
				leftPaneRef.current.style.width = "320px";
				callback();
			}
		});
	}, 0);
}

function closeLeftPane(leftPaneRef: React.RefObject<HTMLDivElement | null>, callback: () => void) {
	if (!leftPaneRef.current) return;
	requestAnimationFrame(() => {
		if (leftPaneRef.current) {
			console.log("CLOSE add transition");
			leftPaneRef.current.style.transition = "transform 0.3s ease, width 0.3s ease";
		}
	});

	setTimeout(() => {
		requestAnimationFrame(() => {
			if (leftPaneRef.current) {
				console.log("CLOSE transform translateX(-100%) width 0px");
				leftPaneRef.current.style.transform = "translateX(-100%)";
				leftPaneRef.current.style.width = "0px";
				callback();
			}
		});
	}, 0);
}

const handleLeftDragMove = ({
	refs,
	leftPaneRef,
	callbacks,
	currentX,
	preventDefault,
	lockPane,
}: HandleLeftDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const swipingDistanceFromInitialDrag = currentX - refs.draggingRef.current.startX;

	if (
		!refs.draggingRef.current.isActivated &&
		Math.abs(swipingDistanceFromInitialDrag) >= ACTIVATION_DELTA_X_PX
	) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	if (!refs.draggingRef.current.isActivated) return;

	refs.prevXRef.current = refs.currentXRef.current;
	refs.currentXRef.current = currentX;

	const leftOpen = callbacks.getIsLeftOpen();

	let isValidGesture = false;

	if (leftOpen) {
		isValidGesture = true;
	} else if (refs.draggingRef.current.startX <= EDGE_SWIPE_THRESHOLD_PX) {
		isValidGesture = true;
	}

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.onLeftDrag?.(null);
		return;
	}

	preventDefault();

	if (leftOpen) {
		const translateX = Math.min(
			0,
			Math.max(
				-LEFT_PANE_WIDTH_PX,
				// add activation delta to avoid a sudden jump when starting to swipe to close the pane.
				swipingDistanceFromInitialDrag + ACTIVATION_DELTA_X_PX,
			),
		);
		callbacks.onLeftDrag?.(translateX);
	} else if (refs.draggingRef.current.startX <= EDGE_SWIPE_THRESHOLD_PX) {
		const translateX = Math.min(
			0,
			Math.max(-LEFT_PANE_WIDTH_PX, -LEFT_PANE_WIDTH_PX + swipingDistanceFromInitialDrag),
		);
		callbacks.onLeftDrag?.(translateX);
	}
};

type HandleLeftDragEndProps = {
	refs: DragRefs;
	leftPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: LeftPaneCallbacks;
	unlockPane: () => void;
};

const handleLeftDragEnd = ({
	refs,
	leftPaneRef,
	callbacks,
	unlockPane,
}: HandleLeftDragEndProps) => {
	console.log("HANDLE LEFT DRAG END");
	if (!refs.draggingRef.current) return;

	const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
	const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
	const startX = refs.draggingRef.current.startX;
	const leftOpen = callbacks.getIsLeftOpen();

	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;

	const swipedRight = currentX >= prevX;
	const swipedLeft = currentX < prevX;

	const lessThanEdgeSwipeThreshold = startX <= EDGE_SWIPE_THRESHOLD_PX;

	let shouldUnlock = false;

	if (leftOpen) {
		if (swipedLeft) {
			closeLeftPane(leftPaneRef, callbacks.closeLeft);
			shouldUnlock = true; // Pane closed, unlock
		} else {
			openLeftPane(leftPaneRef, callbacks.openLeft);
			// Pane stays open, keep locked
		}
		callbacks.onLeftDrag?.(null);
	} else if (lessThanEdgeSwipeThreshold && swipedRight) {
		openLeftPane(leftPaneRef, callbacks.openLeft);
		// Pane opened, keep locked
		callbacks.onLeftDrag?.(null);
	} else {
		shouldUnlock = true; // Gesture ended without opening
		closeLeftPane(leftPaneRef, callbacks.closeLeft);
		callbacks.onLeftDrag?.(null);
	}

	if (shouldUnlock) {
		unlockPane();
	}
};

export function useSwipeLeftPane() {
	const isSmallScreen = useMediaQuery("small");
	const { lockedPane, setLockedPane, isLeftOpen, openLeft, closeLeft, leftPaneRef } =
		useSwipePaneContext();

	const draggingRef = useRef<DragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedPane === "right") return;

		const callbacks: LeftPaneCallbacks = {
			getIsLeftOpen: () => isLeftOpen,
			openLeft,
			closeLeft,
			onLeftDrag: (px) => {
				if (leftPaneRef.current) {
					console.log("ON LEFT DRAG add transition none width 320px");
					leftPaneRef.current.style.transition = "none";
				}

				requestAnimationFrame(() => {
					if (leftPaneRef.current) {
						leftPaneRef.current.style.width = "320px";
						if (px !== null) leftPaneRef.current.style.transform = `translateX(${px}px)`;
					}
				});
			},
		};

		const refs: DragRefs = {
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

			if (callbacks.getIsLeftOpen() || firstTouch.clientX <= EDGE_SWIPE_THRESHOLD_PX) {
				handleDragStart(refs, firstTouch.clientX, firstTouch.clientY, firstTouch.identifier, false);
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			let changedTouch: Touch | null = null;
			for (let i = 0; i < e.changedTouches.length; i++) {
				const candidateTouch = e.changedTouches[i];
				if (trackedId == null || candidateTouch.identifier === trackedId) {
					changedTouch = candidateTouch;
					break;
				}
			}
			if (!changedTouch) return;

			handleLeftDragMove({
				refs,
				leftPaneRef,
				callbacks,
				currentX: changedTouch.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			let endedTracked = false;
			for (let i = 0; i < e.changedTouches.length; i++) {
				if (e.changedTouches[i].identifier === trackedId) {
					endedTracked = true;
					break;
				}
			}
			if (!endedTracked) return;

			handleLeftDragEnd({ refs, leftPaneRef, callbacks, unlockPane });
		}

		function onTouchCancel() {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancel(refs, callbacks.onLeftDrag, unlockPane);
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedPane === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			if (callbacks.getIsLeftOpen() || e.clientX <= EDGE_SWIPE_THRESHOLD_PX) {
				handleDragStart(refs, e.clientX, e.clientY, null, true);
			}
		}

		function onMouseMove(e: MouseEvent) {
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragMove({
				refs,
				leftPaneRef,
				callbacks,
				currentX: e.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
			});
		}

		function onMouseUp() {
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragEnd({ refs, leftPaneRef, callbacks, unlockPane });
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
	}, [isSmallScreen, isLeftOpen, openLeft, closeLeft, lockedPane, setLockedPane, leftPaneRef]);

	return {
		isLeftOpen,
		openLeft,
		closeLeft,
		leftPaneRef,
		setLockedPane,
	};
}
