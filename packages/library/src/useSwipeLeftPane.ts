import { useEffect, useRef } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
  type LeftPaneCallbacks,
  type DragRefs,
  type DragState,
  EDGE_SWIPE_THRESHOLD_PX,
  ACTIVATION_DELTA_X_PX,
  LEFT_PANE_WIDTH_PX,
  handleDragStart,
  handleDragCancel,
  isEditableTarget,
} from "./swipePaneShared";

const handleLeftDragMove = (
  refs: DragRefs,
  callbacks: LeftPaneCallbacks,
  currentX: number,
  preventDefault: () => void,
  onActivate: () => void
) => {
  if (!refs.draggingRef.current) return;

  const deltaX = currentX - refs.draggingRef.current.startX;

  if (
    !refs.draggingRef.current.isActivated &&
    Math.abs(deltaX) >= ACTIVATION_DELTA_X_PX
  ) {
    refs.draggingRef.current.isActivated = true;
    onActivate();
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
    const translateX = Math.min(0, Math.max(-LEFT_PANE_WIDTH_PX, deltaX));
    callbacks.onLeftDrag?.(translateX);
  } else if (refs.draggingRef.current.startX <= EDGE_SWIPE_THRESHOLD_PX) {
    const translateX = Math.min(
      0,
      Math.max(-LEFT_PANE_WIDTH_PX, -LEFT_PANE_WIDTH_PX + deltaX)
    );
    callbacks.onLeftDrag?.(translateX);
  }
};

const handleLeftDragEnd = (
  refs: DragRefs,
  callbacks: LeftPaneCallbacks,
  onDeactivate: () => void
) => {
  if (!refs.draggingRef.current) return;

  const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
  const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
  const startX = refs.draggingRef.current.startX;
  const leftOpen = callbacks.getIsLeftOpen();

  refs.draggingRef.current = null;
  refs.currentXRef.current = null;
  refs.prevXRef.current = null;

  const swipedRight = currentX > prevX;
  const swipedLeft = currentX < prevX;

  if (leftOpen) {
    if (swipedLeft) {
      callbacks.closeLeft();
      onDeactivate();
    } else {
      callbacks.openLeft();
    }
    callbacks.onLeftDrag?.(null);
  } else if (startX <= EDGE_SWIPE_THRESHOLD_PX && swipedRight) {
    callbacks.openLeft();
    callbacks.onLeftDrag?.(null);
  } else {
    callbacks.onLeftDrag?.(null);
  }
};

export function useSwipeLeftPane() {
  const isSmallScreen = useMediaQuery("small");
  const {
    lockedPane,
    setLockedPane,
    leftDragX,
    isLeftOpen,
    openLeft,
    closeLeft,
    setLeftDragX,
  } = useSwipePaneContext();

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
      onLeftDrag: setLeftDragX,
    };

    const refs: DragRefs = {
      draggingRef,
      currentXRef,
      prevXRef,
    };

    const onActivate = () => setLockedPane("left");
    const onDeactivate = () => setLockedPane(null);

    function onTouchStart(e: TouchEvent) {
      console.log("locked", lockedPane);

      if (lockedPane === "right") return;
      if (isEditableTarget(e.target)) return;
      if (e.changedTouches.length === 0) return;

      const firstTouch = e.changedTouches[0];

      if (
        callbacks.getIsLeftOpen() ||
        firstTouch.clientX <= EDGE_SWIPE_THRESHOLD_PX
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

      handleLeftDragMove(
        refs,
        callbacks,
        changedTouch.clientX,
        () => e.preventDefault(),
        onActivate
      );
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

      handleLeftDragEnd(refs, callbacks, onDeactivate);
    }

    function onTouchCancel() {
      if (lockedPane === "right") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;
      handleDragCancel(refs, callbacks.onLeftDrag, onDeactivate);
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

      handleLeftDragMove(
        refs,
        callbacks,
        e.clientX,
        () => e.preventDefault(),
        onActivate
      );
    }

    function onMouseUp() {
      if (lockedPane === "right") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      handleLeftDragEnd(refs, callbacks, onDeactivate);
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
    openLeft,
    closeLeft,
    setLeftDragX,
    lockedPane,
    setLockedPane,
  ]);

  return {
    isLeftOpen,
    openLeft,
    closeLeft,
    setLeftDragX,
    leftDragX,
    setLockedPane,
  };
}
