import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeCallbacks, makeDragRefs, makeOptions } from "./test-utils";
import { handleRightDragEnd, handleRightDragMove } from "./useSwipeRightSidebar";

beforeEach(() => {
	Object.defineProperty(window, "innerWidth", { value: 400, writable: true, configurable: true });
});

describe("handleRightDragEnd", () => {
	it("closes when open and swiped right", () => {
		// currentX=250 > prevX=220 → swipedRight
		const refs = makeDragRefs({ startX: 200, currentX: 250, prevX: 220 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("stays open when open and swiped left", () => {
		// currentX=150 < prevX=180 → swipedLeft
		const refs = makeDragRefs({ startX: 200, currentX: 150, prevX: 180 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
	});

	it("stays open when open and no movement (strict > semantics, else branch)", () => {
		// currentX === prevX → swipedRight is false (strict >), swipedLeft is false → else branch → openSidebar
		const refs = makeDragRefs({ startX: 200, currentX: 200, prevX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
	});

	it("opens when closed and edge swipe left", () => {
		// innerWidth=400, edgeActivation=40 → threshold=360
		// startX=370 >= 360, swipedLeft (currentX=330 < prevX=350)
		const refs = makeDragRefs({ startX: 370, currentX: 330, prevX: 350 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("closes when closed and not in edge region (defensive)", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 150, prevX: 180 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
	});

	it("clears refs and does nothing when not activated", () => {
		const refs = makeDragRefs({ startX: 100, currentX: 150, prevX: 120, isActivated: false });
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentXRef.current).toBeNull();
		expect(refs.prevXRef.current).toBeNull();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
	});

	it("clears refs and calls dragSidebar(null) after handling", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 250, prevX: 220 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const rightSidebarRef = { current: null };

		handleRightDragEnd({ refs, rightSidebarRef, callbacks, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentXRef.current).toBeNull();
		expect(refs.prevXRef.current).toBeNull();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});
});

describe("handleRightDragMove", () => {
	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleRightDragMove({ refs, callbacks, currentX: 100, preventDefault, lockPane, options });

		expect(preventDefault).not.toHaveBeenCalled();
		expect(callbacks.dragSidebar).not.toHaveBeenCalled();
	});

	it("activates after exceeding drag threshold", () => {
		const refs = makeDragRefs({ startX: 370, isActivated: false });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		// distance = 345-370 = -25, abs=25 >= 20
		handleRightDragMove({ refs, callbacks, currentX: 345, preventDefault, lockPane, options });

		expect(refs.draggingRef.current?.isActivated).toBe(true);
		expect(lockPane).toHaveBeenCalled();
	});

	it("clamps translateX in [0, sidebarWidthPx] when open", () => {
		// startX=100, currentX=200 → distance=100
		// translateX = max(0, min(320, 100 - 20)) = 80
		const refs = makeDragRefs({ startX: 100 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleRightDragMove({ refs, callbacks, currentX: 200, preventDefault, lockPane, options });

		expect(callbacks.dragSidebar).toHaveBeenCalledWith(80);
		expect(preventDefault).toHaveBeenCalled();
	});

	it("clamps translateX from edge when closed and in edge region", () => {
		// innerWidth=400, edgeActivation=40 → threshold=360
		// startX=370 (>=360), currentX=340 → distance=-30
		// translateX = max(0, min(320, 320 + (-30) + 20)) = max(0, 310) = 310
		const refs = makeDragRefs({ startX: 370 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleRightDragMove({ refs, callbacks, currentX: 340, preventDefault, lockPane, options });

		expect(callbacks.dragSidebar).toHaveBeenCalledWith(310);
		expect(preventDefault).toHaveBeenCalled();
	});

	it("invalidates gesture when not open and not in edge region", () => {
		// startX=200, innerWidth=400, edgeActivation=40 → 200 < 360 → not in edge
		const refs = makeDragRefs({ startX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleRightDragMove({ refs, callbacks, currentX: 150, preventDefault, lockPane, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
		expect(preventDefault).not.toHaveBeenCalled();
	});

	it("calls preventDefault on valid gesture", () => {
		const refs = makeDragRefs({ startX: 100 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleRightDragMove({ refs, callbacks, currentX: 150, preventDefault, lockPane, options });

		expect(preventDefault).toHaveBeenCalled();
	});
});
