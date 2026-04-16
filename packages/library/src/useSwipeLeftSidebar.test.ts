import { describe, expect, it, vi } from "vitest";
import { makeCallbacks, makeDragRefs, makeOptions } from "./test-utils";
import { handleLeftDragEnd, handleLeftDragMove } from "./useSwipeLeftSidebar";

describe("handleLeftDragEnd", () => {
	it("closes when open and swiped left", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 150, prevX: 180 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("stays open when open and swiped right", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 250, prevX: 220 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
	});

	it("stays open when open and no movement (currentX === prevX)", () => {
		// swipedRight = currentX >= prevX → true when equal
		const refs = makeDragRefs({ startX: 200, currentX: 200, prevX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
	});

	it("opens when closed and edge swipe right", () => {
		// startX=20 <= edgeActivationWidthPx=40, swipedRight
		const refs = makeDragRefs({ startX: 20, currentX: 100, prevX: 80 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("closes when closed and not in edge region (defensive)", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 250, prevX: 220 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
	});

	it("clears refs and does nothing when not activated", () => {
		const refs = makeDragRefs({ startX: 100, currentX: 150, prevX: 120, isActivated: false });
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentXRef.current).toBeNull();
		expect(refs.prevXRef.current).toBeNull();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
	});

	it("clears refs and calls dragSidebar(null) after handling", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 150, prevX: 180 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentXRef.current).toBeNull();
		expect(refs.prevXRef.current).toBeNull();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});
});

describe("handleLeftDragEnd — swipeToClose=false (snap-back)", () => {
	it("snaps back to open when swiped left", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 150, prevX: 180 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions({ swipeToClose: false });
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
	});

	it("stays open when swiped right", () => {
		const refs = makeDragRefs({ startX: 200, currentX: 250, prevX: 220 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions({ swipeToClose: false });
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
	});

	it("still allows edge swipe to open when closed", () => {
		const refs = makeDragRefs({ startX: 20, currentX: 100, prevX: 80 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions({ swipeToClose: false, swipeToOpen: true });
		const leftSidebarRef = { current: null };

		handleLeftDragEnd({ refs, leftSidebarRef, callbacks, options });

		expect(callbacks.openSidebar).toHaveBeenCalled();
	});
});

describe("handleLeftDragMove", () => {
	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleLeftDragMove({ refs, callbacks, currentX: 100, preventDefault, lockPane, options });

		expect(preventDefault).not.toHaveBeenCalled();
		expect(callbacks.dragSidebar).not.toHaveBeenCalled();
	});

	it("activates after exceeding drag threshold and calls lockPane", () => {
		const refs = makeDragRefs({ startX: 10, isActivated: false });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		// currentX=35, distance=25, threshold=20 → activates
		handleLeftDragMove({ refs, callbacks, currentX: 35, preventDefault, lockPane, options });

		expect(refs.draggingRef.current?.isActivated).toBe(true);
		expect(lockPane).toHaveBeenCalled();
	});

	it("does not activate below threshold", () => {
		const refs = makeDragRefs({ startX: 100, isActivated: false });
		const callbacks = makeCallbacks();
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		// currentX=110, distance=10, threshold=20 → no activation
		handleLeftDragMove({ refs, callbacks, currentX: 110, preventDefault, lockPane, options });

		expect(refs.draggingRef.current?.isActivated).toBe(false);
		expect(lockPane).not.toHaveBeenCalled();
		expect(callbacks.dragSidebar).not.toHaveBeenCalled();
	});

	it("clamps translateX in [-sidebarWidthPx, 0] when open", () => {
		// startX=200, currentX=100 → distance=-100, translateX = min(0, max(-320, -100+20)) = min(0,-80) = -80
		const refs = makeDragRefs({ startX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleLeftDragMove({ refs, callbacks, currentX: 100, preventDefault, lockPane, options });

		expect(callbacks.dragSidebar).toHaveBeenCalledWith(-80);
		expect(preventDefault).toHaveBeenCalled();
	});

	it("clamps translateX from edge when closed and in edge region", () => {
		// startX=20 (<=40), currentX=60 → distance=40
		// translateX = min(0, max(-320, -320 + 40 - 20)) = min(0, -300) = -300
		const refs = makeDragRefs({ startX: 20 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleLeftDragMove({ refs, callbacks, currentX: 60, preventDefault, lockPane, options });

		expect(callbacks.dragSidebar).toHaveBeenCalledWith(-300);
		expect(preventDefault).toHaveBeenCalled();
	});

	it("invalidates gesture when not open and not in edge region", () => {
		const refs = makeDragRefs({ startX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleLeftDragMove({ refs, callbacks, currentX: 250, preventDefault, lockPane, options });

		expect(refs.draggingRef.current).toBeNull();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
		expect(preventDefault).not.toHaveBeenCalled();
	});

	it("calls preventDefault on valid gesture", () => {
		const refs = makeDragRefs({ startX: 200 });
		const callbacks = makeCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleLeftDragMove({ refs, callbacks, currentX: 180, preventDefault, lockPane, options });

		expect(preventDefault).toHaveBeenCalled();
	});
});
