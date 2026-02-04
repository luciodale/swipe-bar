import { useEffect, useRef } from "react";
import {
  type TDragRefs,
  type TDragState,
  type TSidebarCallbacks,
  type TSwipeBarOptions,
  findChangedTouch,
  handleDragCancel,
  handleDragStart,
  hasTrackedTouchEnded,
  isEditableTarget,
} from "./swipeSidebarShared";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipeBarContext } from "./useSwipeBarContext";

type HandleLeftDragMoveProps = {
  refs: TDragRefs;
  callbacks: TSidebarCallbacks;
  currentX: number;
  preventDefault: () => void;
  lockPane: () => void;
  options: Required<TSwipeBarOptions>;
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

  const swipingDistanceFromInitialDrag =
    currentX - refs.draggingRef.current.startX;

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
      Math.max(
        -sidebarWidthPx,
        swipingDistanceFromInitialDrag + options.dragActivationDeltaPx
      )
    );
    callbacks.dragSidebar(translateX);
  } else if (refs.draggingRef.current.startX <= options.edgeActivationWidthPx) {
    const translateX = Math.min(
      0,
      Math.max(
        -sidebarWidthPx,
        -sidebarWidthPx +
          swipingDistanceFromInitialDrag -
          options.dragActivationDeltaPx
      )
    );
    callbacks.dragSidebar(translateX);
  }
};

type HandleLeftDragEndProps = {
  refs: TDragRefs;
  leftSidebarRef: React.RefObject<HTMLDivElement | null>;
  callbacks: TSidebarCallbacks;
  options: Required<TSwipeBarOptions>;
};

const handleLeftDragEnd = ({
  refs,
  callbacks,
  options,
}: HandleLeftDragEndProps) => {
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

export function useSwipeLeftSidebar(options: Required<TSwipeBarOptions>) {
  const isSmallScreen = useMediaQuery(options.mediaQueryWidth);

  const {
    lockedSidebar,
    setLockedSidebar,
    isLeftOpen,
    openSidebar,
    closeSidebar,
    dragSidebar,
    leftSidebarRef,
  } = useSwipeBarContext();

  const draggingRef = useRef<TDragState | null>(null);
  const currentXRef = useRef<number | null>(null);
  const prevXRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedSidebar === "right") return;
		if (options.disabled) return;

    const callbacks: TSidebarCallbacks = {
      getIsOpen: () => isLeftOpen,
      openSidebar: () => openSidebar("left"),
      closeSidebar: () => closeSidebar("left"),
      dragSidebar: (translateX) => dragSidebar("left", translateX),
    };

    const refs = {
      draggingRef,
      currentXRef,
      prevXRef,
    };

    const lockPane = () => setLockedSidebar("left");
    const unlockPane = () => setLockedSidebar(null);

    function onTouchStart(e: TouchEvent) {
      if (lockedSidebar === "right") return;
      if (isEditableTarget(e.target)) return;
      if (e.changedTouches.length === 0) return;

      const firstTouch = e.changedTouches[0];
      const isOpen = callbacks.getIsOpen();
      const inEdgeRegion = firstTouch.clientX <= options.edgeActivationWidthPx;

      if (isOpen && !options.swipeToClose) return;
      if (!isOpen && !options.swipeToOpen) return;

      if (isOpen || inEdgeRegion) {
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
      if (lockedSidebar === "right") return;
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
      if (lockedSidebar === "right") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;

      const trackedId = draggingRef.current.activeTouchId;
      if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

      handleLeftDragEnd({
        refs,
        leftSidebarRef,
        callbacks,
        options,
      });
    }

    function onTouchCancel() {
      if (lockedSidebar === "right") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;
      handleDragCancel({
        refs,
        dragSidebar: callbacks.dragSidebar,
        onDeactivate: unlockPane,
      });
    }

    function onMouseDown(e: MouseEvent) {
      if (lockedSidebar === "right") return;
      if (isEditableTarget(e.target)) return;
      if (e.button !== 0) return;

      const isOpen = callbacks.getIsOpen();
      const inEdgeRegion = e.clientX <= options.edgeActivationWidthPx;

      if (isOpen && !options.swipeToClose) return;
      if (!isOpen && !options.swipeToOpen) return;

      if (isOpen || inEdgeRegion) {
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
      if (lockedSidebar === "right") return;
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
      if (lockedSidebar === "right") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      handleLeftDragEnd({
        refs,
        leftSidebarRef,
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
    openSidebar,
    closeSidebar,
    dragSidebar,
    lockedSidebar,
    setLockedSidebar,
    leftSidebarRef,
    options,
  ]);
}
