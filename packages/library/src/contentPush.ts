import type { RefObject } from "react";
import { TRANSFORM_EASING } from "./swipeSidebarShared";

export type TPushSide = "left" | "right";

export type TContentPush = {
	el: HTMLElement;
	side: TPushSide;
};

// Left panes push the content right (positive), right panes push it left.
const toTranslate = (side: TPushSide, visibleWidthPx: number) => {
	const offsetPx = side === "left" ? visibleWidthPx : -visibleWidthPx;
	return `translateX(${offsetPx}px)`;
};

const CLOSED_PANE_TRANSFORM: Record<TPushSide, string> = {
	left: "translateX(-100%)",
	right: "translateX(100%)",
};

export const applyContentOffsetImmediate = (push: TContentPush, visibleWidthPx: number) => {
	push.el.style.transition = "none";
	push.el.style.willChange = "transform";
	push.el.style.transform = toTranslate(push.side, visibleWidthPx);
};

// Mirrors the pane's double rAF so content and pane start animating on the
// same frame with the same duration and easing.
export const applyContentOffset = (
	push: TContentPush,
	visibleWidthPx: number,
	transitionMs: number,
) => {
	requestAnimationFrame(() => {
		push.el.style.willChange = "transform";
		push.el.style.transition = `transform ${transitionMs}ms ${TRANSFORM_EASING}`;
		requestAnimationFrame(() => {
			push.el.style.transform = toTranslate(push.side, visibleWidthPx);
		});
	});
};

// Same single rAF as the pane drag, so the content edge stays flush with the
// visible pane edge on every frame.
export const applyContentDragOffset = (push: TContentPush, visibleWidthPx: number) => {
	push.el.style.transition = "none";
	requestAnimationFrame(() => {
		push.el.style.willChange = "transform";
		push.el.style.transform = toTranslate(push.side, visibleWidthPx);
	});
};

// A transform makes the content the containing block of its fixed
// descendants, so it is removed entirely once the content is back at rest.
export const clearContentOffset = (el: HTMLElement) => {
	el.style.transform = "";
	el.style.transition = "";
	el.style.willChange = "";
};

// Push panes keep their full width while closed so the visible edge is
// driven by transform alone. Once settled closed the width collapses, so the
// pane takes no room if the viewport later grows past the breakpoint.
export const collapseClosedPushPane = (
	paneRef: RefObject<HTMLDivElement | null>,
	side: TPushSide,
) => {
	const pane = paneRef.current;
	if (!pane || pane.style.transform !== CLOSED_PANE_TRANSFORM[side]) return;
	pane.style.transition = "none";
	pane.style.width = "0px";
};

// A pushing pane moves by transform only (fixed width), like an absolute pane.
export const toPaneOptions = <T extends { isAbsolute?: boolean }>(
	push: TContentPush | null,
	options: T,
): T => (push ? { ...options, isAbsolute: true } : options);
