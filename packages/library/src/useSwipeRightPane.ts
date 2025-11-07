import { useEffect, useRef } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
  type RightPaneCallbacks,
  type DragRefs,
  type DragState,
  EDGE_SWIPE_THRESHOLD_PX,
  ACTIVATION_DELTA_X_PX,
  RIGHT_PANE_WIDTH_PX,
  handleDragStart,
  handleDragCancel,
  isEditableTarget,
} from "./swipePaneShared";

const handleRightDragMove = (
  refs: DragRefs,
  callbacks: RightPaneCallbacks,
  currentX: number,
  preventDefault: () => void,
  lockPane: () => void
) => {
  if (!refs.draggingRef.current) return;

  const viewportWidth = window.innerWidth;

  const swipingDistanceFromInitialDrag =
    currentX - refs.draggingRef.current.startX;

  const isLegalSwipeDistanceWhenRightIsClosed =
    refs.draggingRef.current.startX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX;

  const isPaneActiveted = refs.draggingRef.current.isActivated;

  if (
    !isPaneActiveted &&
    Math.abs(swipingDistanceFromInitialDrag) >= ACTIVATION_DELTA_X_PX
  ) {
    refs.draggingRef.current.isActivated = true;
    lockPane();
  }

  // The legal distance for activating the pane has not been reached yet.
  if (!isPaneActiveted) return;

  refs.prevXRef.current = refs.currentXRef.current;
  refs.currentXRef.current = currentX;

  const rightOpen = callbacks.getIsRightOpen();

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
    callbacks.onRightDrag?.(null);
    return;
  }

  // when the gesture is valid, we prevent the default browser behavior
  // to avoid scrolling the page while dragging the pane.
  preventDefault();

  // Closing the pane
  if (rightOpen) {
    const translateX = Math.max(
      0,
      Math.min(
        RIGHT_PANE_WIDTH_PX,
        // we subtract the activation delta to avoid a sudden jump when starting to swipe to close the pane.
        swipingDistanceFromInitialDrag - ACTIVATION_DELTA_X_PX
      )
    );

    callbacks.onRightDrag?.(translateX);

    // Opening the pane
  } else {
    const translateX = Math.max(
      0,
      Math.min(
        RIGHT_PANE_WIDTH_PX,
        RIGHT_PANE_WIDTH_PX + swipingDistanceFromInitialDrag
      )
    );
    callbacks.onRightDrag?.(translateX);
  }
};

const handleRightDragEnd = (
  refs: DragRefs,
  callbacks: RightPaneCallbacks,
  unlockPane: () => void
) => {
  if (!refs.draggingRef.current) return;

  const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
  const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
  const startX = refs.draggingRef.current.startX;
  const rightOpen = callbacks.getIsRightOpen();
  const viewportWidth = window.innerWidth;

  refs.draggingRef.current = null;
  refs.currentXRef.current = null;
  refs.prevXRef.current = null;

  const swipedRight = currentX > prevX;
  const swipedLeft = currentX < prevX;

  const moreThanEdgeSwipeThreshold =
    startX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX;

  let shouldUnlock = false;

  if (rightOpen) {
    if (swipedRight) {
      callbacks.closeRight();
      shouldUnlock = true; // Pane closed, unlock
    } else {
      callbacks.openRight();
      // Pane stays open, keep locked
    }
    callbacks.onRightDrag?.(null);
  } else if (moreThanEdgeSwipeThreshold && swipedLeft) {
    callbacks.openRight();
    // Pane opened, keep locked
    callbacks.onRightDrag?.(null);
  } else {
    shouldUnlock = true; // Gesture ended without opening
    callbacks.onRightDrag?.(null);
  }

  if (shouldUnlock) {
    unlockPane();
  }
};

export function useSwipeRightPane() {
  const isSmallScreen = useMediaQuery("small");
  const {
    lockedPane,
    setLockedPane,
    isRightOpen,
    openRight,
    closeRight,
    setRightDragX,
    rightDragX,
  } = useSwipePaneContext();

  const draggingRef = useRef<DragState | null>(null);
  const currentXRef = useRef<number | null>(null);
  const prevXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSmallScreen) return;
    if (lockedPane === "left") return;

    const callbacks: RightPaneCallbacks = {
      getIsRightOpen: () => isRightOpen,
      openRight,
      closeRight,
      onRightDrag: setRightDragX,
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
        callbacks.getIsRightOpen() ||
        firstTouch.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      ) {
        handleDragStart(
          refs,
          firstTouch.clientX,
          firstTouch.clientY,
          firstTouch.identifier,
          false
        );
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (lockedPane === "left") return;
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

      handleRightDragMove(
        refs,
        callbacks,
        changedTouch.clientX,
        () => e.preventDefault(),
        lockPane
      );
    }

    function onTouchEnd(e: TouchEvent) {
      if (lockedPane === "left") return;
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

      handleRightDragEnd(refs, callbacks, unlockPane);
    }

    function onTouchCancel() {
      if (lockedPane === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;
      handleDragCancel(refs, callbacks.onRightDrag, unlockPane);
    }

    function onMouseDown(e: MouseEvent) {
      if (lockedPane === "left") return;
      if (isEditableTarget(e.target)) return;
      if (e.button !== 0) return;

      const viewportWidth = window.innerWidth;

      if (
        callbacks.getIsRightOpen() ||
        e.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      ) {
        handleDragStart(refs, e.clientX, e.clientY, null, true);
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (lockedPane === "left") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      handleRightDragMove(
        refs,
        callbacks,
        e.clientX,
        () => e.preventDefault(),
        lockPane
      );
    }

    function onMouseUp() {
      if (lockedPane === "left") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      handleRightDragEnd(refs, callbacks, unlockPane);
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
    openRight,
    closeRight,
    setRightDragX,
    lockedPane,
    setLockedPane,
  ]);

  return {
    isRightOpen,
    openRight,
    closeRight,
    setRightDragX,
    setLockedPane,
    rightDragX,
  };
}
