import type { RefObject } from "react";

export type LeftPaneCallbacks = {
  getIsLeftOpen: () => boolean;
  openLeft: () => void;
  closeLeft: () => void;
  onLeftDrag?: (translateX: number | null) => void;
};

export type RightPaneCallbacks = {
  getIsRightOpen: () => boolean;
  openRight: () => void;
  closeRight: () => void;
  onRightDrag?: (translateX: number | null) => void;
};

export type DragState = {
  startX: number;
  startY: number;
  activeTouchId: number | null;
  isMouse: boolean;
  isActivated: boolean;
};

export type DragRefs = {
  draggingRef: RefObject<DragState | null>;
  currentXRef: RefObject<number | null>;
  prevXRef: RefObject<number | null>;
};

export const EDGE_SWIPE_THRESHOLD_PX = 40;
export const ACTIVATION_DELTA_X_PX = 20;
export const LEFT_PANE_WIDTH_PX = 320;
export const RIGHT_PANE_WIDTH_PX = 352;

export const handleDragStart = (
  refs: DragRefs,
  clientX: number,
  clientY: number,
  touchId: number | null,
  isMouse: boolean
) => {
  refs.draggingRef.current = {
    startX: clientX,
    startY: clientY,
    activeTouchId: touchId,
    isMouse,
    isActivated: false,
  };
  refs.currentXRef.current = clientX;
  refs.prevXRef.current = clientX;
};

export const handleDragCancel = (
  refs: DragRefs,
  onDrag: ((translateX: number | null) => void) | undefined,
  onDeactivate: () => void
) => {
  refs.draggingRef.current = null;
  refs.currentXRef.current = null;
  refs.prevXRef.current = null;
  onDrag?.(null);
  onDeactivate();
};

export const isEditableTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof Element)) return false;
  const editable = el.closest("input, textarea, [contenteditable='true']");
  return !!editable;
};
