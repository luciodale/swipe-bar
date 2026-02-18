import type { RefObject } from "react";
import { vi } from "vitest";
import type { TDragRefs, TDragRefsY, TDragState, TSwipeBarOptions } from "./swipeSidebarShared";

export function makeDragRefs(overrides?: {
	startX?: number;
	currentX?: number;
	prevX?: number;
	isActivated?: boolean;
}): TDragRefs {
	const startX = overrides?.startX ?? 0;
	const isActivated = overrides?.isActivated ?? true;
	const draggingRef = {
		current: {
			startX,
			startY: 0,
			activeTouchId: null,
			isMouse: true,
			isActivated,
		},
	} as RefObject<TDragState | null>;
	const currentXRef = { current: overrides?.currentX ?? null } as RefObject<number | null>;
	const prevXRef = { current: overrides?.prevX ?? null } as RefObject<number | null>;
	return { draggingRef, currentXRef, prevXRef };
}

export function makeDragRefsY(overrides?: {
	startY?: number;
	currentY?: number;
	prevY?: number;
	isActivated?: boolean;
}): TDragRefsY {
	const startY = overrides?.startY ?? 0;
	const isActivated = overrides?.isActivated ?? true;
	const draggingRef = {
		current: {
			startX: 0,
			startY,
			activeTouchId: null,
			isMouse: true,
			isActivated,
		},
	} as RefObject<TDragState | null>;
	const currentYRef = { current: overrides?.currentY ?? null } as RefObject<number | null>;
	const prevYRef = { current: overrides?.prevY ?? null } as RefObject<number | null>;
	return { draggingRef, currentYRef, prevYRef };
}

export function makeCallbacks() {
	return {
		getIsOpen: vi.fn(() => true),
		openSidebar: vi.fn(),
		closeSidebar: vi.fn(),
		dragSidebar: vi.fn(),
	};
}

export function makeBottomCallbacks() {
	return {
		...makeCallbacks(),
		getBottomAnchorState: vi.fn(() => "open" as "closed" | "midAnchor" | "open"),
		openToMidAnchor: vi.fn(),
		openSidebarFully: vi.fn(),
	};
}

export function makeOptions(overrides?: Partial<TSwipeBarOptions>): Required<TSwipeBarOptions> {
	return {
		transitionMs: 300,
		sidebarWidthPx: 320,
		sidebarHeightPx: 600,
		isAbsolute: false,
		edgeActivationWidthPx: 40,
		dragActivationDeltaPx: 20,
		showOverlay: true,
		overlayBackgroundColor: "rgba(0,0,0,0.5)",
		toggleIconSizePx: 40,
		toggleIconColor: "white",
		toggleIconEdgeDistancePx: 40,
		showToggle: true,
		mediaQueryWidth: 640,
		swipeBarZIndex: 30,
		toggleZIndex: 15,
		overlayZIndex: 20,
		fadeContent: false,
		fadeContentTransitionMs: 100,
		swipeToOpen: false,
		swipeToClose: true,
		midAnchorPoint: true,
		midAnchorPointPx: 200,
		disabled: false,
		closeSidebarOnOverlayClick: true,
		...overrides,
	};
}

export function makeTouchList(
	...touches: Array<{ identifier: number; clientX: number; clientY: number }>
): TouchList {
	const list = touches.map(
		(t) =>
			({
				identifier: t.identifier,
				clientX: t.clientX,
				clientY: t.clientY,
			}) as unknown as Touch,
	);
	return {
		length: list.length,
		item: (i: number) => list[i] ?? null,
		[Symbol.iterator]: function* () {
			for (let i = 0; i < list.length; i++) {
				yield list[i];
			}
		},
		...Object.fromEntries(list.map((t, i) => [i, t])),
	} as unknown as TouchList;
}
