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

type HandleRightDragMoveProps = {
  refs: TDragRefs;
  callbacks: TSidebarCallbacks;
  currentX: number;
  preventDefault: () => void;
  lockPane: () => void;
  options: Required<TSwipeBarOptions>;
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

  const swipingDistanceFromInitialDrag =
    currentX - refs.draggingRef.current.startX;

  const isLegalSwipeDistanceWhenRightIsClosed =
    refs.draggingRef.current.startX >=
    viewportWidth - options.edgeActivationWidthPx;

  const isPaneActiveted = refs.draggingRef.current.isActivated;

  if (
    !isPaneActiveted &&
    Math.abs(swipingDistanceFromInitialDrag) >= options.dragActivationDeltaPx
  ) {
    refs.draggingRef.current.isActivated = true;
    lockPane();
  }

  // The legal distance for activating the bar has not been reached yet.
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
  // The user starts dragging when the right bar is open
  // (from anywhere on screen), but then during the drag,
  // the right bar gets programmatically closed by something else.
  // This is defensive code protecting against:
  // - Race conditions where the bar state changes during an active drag
  // - Programmatic bar closes while user is dragging
  // - External state mutations

  if (!isValidGesture) {
    refs.draggingRef.current = null;
    callbacks.dragSidebar(null);
    return;
  }

  // when the gesture is valid, we prevent the default browser behavior
  // to avoid scrolling the page while dragging the bar.
  preventDefault();

  const sidebarWidthPx = options.sidebarWidthPx;

  // Closing the bar
  if (rightOpen) {
    const translateX = Math.max(
      0,
      Math.min(
        sidebarWidthPx,
        swipingDistanceFromInitialDrag - options.dragActivationDeltaPx
      )
    );

    callbacks.dragSidebar(translateX);

    // Opening the bar
  } else {
    const translateX = Math.max(
      0,
      Math.min(
        sidebarWidthPx,
        sidebarWidthPx +
          swipingDistanceFromInitialDrag +
          options.dragActivationDeltaPx
      )
    );
    callbacks.dragSidebar(translateX);
  }
};

type HandleRightDragEndProps = {
  refs: TDragRefs;
  rightSidebarRef: React.RefObject<HTMLDivElement | null>;
  callbacks: TSidebarCallbacks;
  options: Required<TSwipeBarOptions>;
};

const handleRightDragEnd = ({
  refs,
  callbacks,
  options,
}: HandleRightDragEndProps) => {
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

  const moreThanEdgeSwipeThreshold =
    startX >= viewportWidth - options.edgeActivationWidthPx;

  if (rightOpen) {
    if (swipedRight) {
      callbacks.closeSidebar();
    } else {
      callbacks.openSidebar();
      // Pane stays open, keep locked
    }
    callbacks.dragSidebar(null);
  } else if (moreThanEdgeSwipeThreshold && swipedLeft) {
    callbacks.openSidebar();
    // Pane opened, keep locked
    callbacks.dragSidebar(null);
  } else {
    callbacks.closeSidebar();
    callbacks.dragSidebar(null);
  }
};

export function useSwipeRightSidebar(options: Required<TSwipeBarOptions>) {
  const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
  const {
    lockedSidebar,
    setLockedSidebar,
    isRightOpen,
    openSidebar,
    closeSidebar,
    dragSidebar,
    rightSidebarRef,
  } = useSwipeBarContext();

  const draggingRef = useRef<TDragState | null>(null);
  const currentXRef = useRef<number | null>(null);
  const prevXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSmallScreen) return;
    if (lockedSidebar === "left") return;

    const callbacks: TSidebarCallbacks = {
      getIsOpen: () => isRightOpen,
      openSidebar: () => openSidebar("right"),
      closeSidebar: () => closeSidebar("right"),
      dragSidebar: (translateX) => dragSidebar("right", translateX),
    };

    const refs: TDragRefs = {
      draggingRef,
      currentXRef,
      prevXRef,
    };

    const lockPane = () => setLockedSidebar("right");
    const unlockPane = () => setLockedSidebar(null);

    function onTouchStart(e: TouchEvent) {
      if (lockedSidebar === "left") return;
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
      if (lockedSidebar === "left") return;
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
      if (lockedSidebar === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;

      const trackedId = draggingRef.current.activeTouchId;
      if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

      handleRightDragEnd({
        refs,
        rightSidebarRef,
        callbacks,
        options,
      });
    }

    function onTouchCancel() {
      if (lockedSidebar === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;
      handleDragCancel({
        refs,
        dragSidebar: callbacks.dragSidebar,
        onDeactivate: unlockPane,
      });
    }

    function onMouseDown(e: MouseEvent) {
      if (lockedSidebar === "left") return;
      if (isEditableTarget(e.target)) return;
      if (e.button !== 0) return;

      const viewportWidth = window.innerWidth;

      if (
        callbacks.getIsOpen() ||
        e.clientX >= viewportWidth - options.edgeActivationWidthPx
      ) {
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
      if (lockedSidebar === "left") return;
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
      if (lockedSidebar === "left") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      handleRightDragEnd({
        refs,
        rightSidebarRef,
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
    openSidebar,
    closeSidebar,
    dragSidebar,
    lockedSidebar,
    setLockedSidebar,
    rightSidebarRef,
    options,
  ]);
}
