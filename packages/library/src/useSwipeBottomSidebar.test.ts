import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeBottomCallbacks, makeDragRefsY, makeOptions } from "./test-utils";
import { handleBottomDragEnd, handleBottomDragMove } from "./useSwipeBottomSidebar";

describe("handleBottomDragEnd", () => {
	describe("midAnchor active, anchorState=open", () => {
		it("closes when swiped down past midThreshold", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midThreshold=400
			// startY=100, currentY=600 → currentTranslateY=500 > 400 → close
			const refs = makeDragRefsY({ startY: 100, currentY: 600, prevY: 500 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("open");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
			expect(callbacks.openToMidAnchor).not.toHaveBeenCalled();
		});

		it("goes to midAnchor when swiped down but above midThreshold", () => {
			// startY=100, currentY=300 → currentTranslateY=200 < 400 → midAnchor
			const refs = makeDragRefsY({ startY: 100, currentY: 300, prevY: 200 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("open");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openToMidAnchor).toHaveBeenCalled();
			expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		});

		it("stays fully open when swiped up and above midThreshold", () => {
			// startY=300, currentY=200 → currentTranslateY=max(0,-100)=0 < 400 → openFully
			const refs = makeDragRefsY({ startY: 300, currentY: 200, prevY: 250 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("open");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openSidebarFully).toHaveBeenCalled();
			expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		});

		it("closes when swiped up but still below midThreshold", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midThreshold=400
			// startY=100, currentY=590 → currentTranslateY=490 >= 400 → close
			// prevY=600 → currentY < prevY → swipedUp
			const refs = makeDragRefsY({ startY: 100, currentY: 590, prevY: 600 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("open");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
			expect(callbacks.openToMidAnchor).not.toHaveBeenCalled();
		});
	});

	describe("midAnchor active, anchorState=midAnchor", () => {
		it("opens fully when swiped up and above midThreshold", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midThreshold=400, baseTranslate=400
			// startY=500, currentY=200 → translateY = max(0, min(600, 400+(200-500))) = max(0,100) = 100 < 400
			const refs = makeDragRefsY({ startY: 500, currentY: 200, prevY: 250 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openSidebarFully).toHaveBeenCalled();
			expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		});

		it("snaps to midAnchor when swiped up but still below midThreshold", () => {
			// startY=500, currentY=501, prevY=502 → swipedUp (501 < 502)
			// translateY = max(0, min(600, 400+(501-500))) = 401 >= 400 → midAnchor
			const refs = makeDragRefsY({ startY: 500, currentY: 501, prevY: 502 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openToMidAnchor).toHaveBeenCalled();
			expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		});

		it("closes immediately when swiped down (no threshold required)", () => {
			// startY=500, currentY=550, prevY=540 → swipedDown
			const refs = makeDragRefsY({ startY: 500, currentY: 550, prevY: 540 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
			expect(callbacks.openToMidAnchor).not.toHaveBeenCalled();
		});

		it("closes when dragged below midAnchor and final direction is still down", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midThreshold=400, baseTranslate=400
			// startY=400, currentY=480, prevY=470 → swipedDown (480 >= 470)
			// translateY = max(0, min(600, 400+(480-400))) = 480 >= 400 → close
			const refs = makeDragRefsY({ startY: 400, currentY: 480, prevY: 470 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
			expect(callbacks.openToMidAnchor).not.toHaveBeenCalled();
		});

		it("snaps to midAnchor when dragged below midAnchor but reversed direction upward", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midThreshold=400, baseTranslate=400
			// startY=400, currentY=480, prevY=490 → swipedUp (480 < 490)
			// translateY = max(0, min(600, 400+(480-400))) = 480 >= 400 → midAnchor (not close)
			const refs = makeDragRefsY({ startY: 400, currentY: 480, prevY: 490 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openToMidAnchor).toHaveBeenCalled();
			expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		});

		it("closes on tiny downward swipe from midAnchor", () => {
			// Even a 1px downward swipe should close
			const refs = makeDragRefsY({ startY: 500, currentY: 501, prevY: 500 });
			const callbacks = makeBottomCallbacks();
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
		});
	});

	describe("standard 2-state (no midAnchor)", () => {
		it("closes when swiped down", () => {
			const refs = makeDragRefsY({ startY: 100, currentY: 300, prevY: 250 });
			const callbacks = makeBottomCallbacks();
			const options = makeOptions({ midAnchorPoint: false });
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.closeSidebar).toHaveBeenCalled();
		});

		it("opens when swiped up", () => {
			const refs = makeDragRefsY({ startY: 300, currentY: 200, prevY: 250 });
			const callbacks = makeBottomCallbacks();
			const options = makeOptions({ midAnchorPoint: false });
			const onDragEnd = vi.fn();

			handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

			expect(callbacks.openSidebar).toHaveBeenCalled();
		});
	});

	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefsY();
		refs.draggingRef.current = null;
		const callbacks = makeBottomCallbacks();
		const options = makeOptions();
		const onDragEnd = vi.fn();

		handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
		expect(onDragEnd).not.toHaveBeenCalled();
	});

	it("does nothing when drag was not activated", () => {
		const refs = makeDragRefsY({ startY: 100, currentY: 200, prevY: 150 });
		const drag = refs.draggingRef.current;
		if (drag) drag.isActivated = false;
		const callbacks = makeBottomCallbacks();
		const options = makeOptions();
		const onDragEnd = vi.fn();

		handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

		expect(callbacks.closeSidebar).not.toHaveBeenCalled();
		expect(callbacks.openSidebar).not.toHaveBeenCalled();
		expect(onDragEnd).not.toHaveBeenCalled();
	});

	it("clears refs after handling", () => {
		const refs = makeDragRefsY({ startY: 100, currentY: 300, prevY: 250 });
		const callbacks = makeBottomCallbacks();
		const options = makeOptions({ midAnchorPoint: false });
		const onDragEnd = vi.fn();

		handleBottomDragEnd({ refs, callbacks, options, onDragEnd });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentYRef.current).toBeNull();
		expect(refs.prevYRef.current).toBeNull();
		expect(onDragEnd).toHaveBeenCalled();
	});
});

describe("handleBottomDragMove", () => {
	beforeEach(() => {
		Object.defineProperty(window, "innerHeight", {
			value: 800,
			writable: true,
			configurable: true,
		});
	});

	it("does nothing when draggingRef is null", () => {
		const refs = makeDragRefsY();
		refs.draggingRef.current = null;
		const callbacks = makeBottomCallbacks();
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 100,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(preventDefault).not.toHaveBeenCalled();
		expect(callbacks.dragSidebar).not.toHaveBeenCalled();
	});

	it("activates after exceeding drag threshold", () => {
		const refs = makeDragRefsY({ startY: 500, isActivated: false });
		const callbacks = makeBottomCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions();
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		// distance = 475-500 = -25, abs=25 >= 20
		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 475,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(refs.draggingRef.current?.isActivated).toBe(true);
		expect(lockPane).toHaveBeenCalled();
	});

	it("validates when open (any start position)", () => {
		const refs = makeDragRefsY({ startY: 100 });
		const callbacks = makeBottomCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions({ midAnchorPoint: false });
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 200,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(preventDefault).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalled();
	});

	it("validates when closed and in bottom edge region", () => {
		// innerHeight=800, edgeActivation=40 → threshold=760
		// startY=770 >= 760 → in edge
		const refs = makeDragRefsY({ startY: 770 });
		const callbacks = makeBottomCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions({ midAnchorPoint: false });
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 750,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(preventDefault).toHaveBeenCalled();
		expect(callbacks.dragSidebar).toHaveBeenCalled();
	});

	it("invalidates when closed and not in bottom edge region", () => {
		const refs = makeDragRefsY({ startY: 400 });
		const callbacks = makeBottomCallbacks();
		callbacks.getIsOpen.mockReturnValue(false);
		const options = makeOptions({ midAnchorPoint: false });
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 350,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(refs.draggingRef.current).toBeNull();
		expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
		expect(preventDefault).not.toHaveBeenCalled();
	});

	describe("standard 2-state (midAnchorPoint=false)", () => {
		it("clamps translateY in [0, sidebarHeightPx] when open", () => {
			// startY=200, currentY=300 → distance=100
			// translateY = max(0, min(600, 100 - 20)) = 80
			const refs = makeDragRefsY({ startY: 200 });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			const options = makeOptions({ midAnchorPoint: false });
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 300,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: null,
				initialScrollTop: 0,
			});

			expect(callbacks.dragSidebar).toHaveBeenCalledWith(80);
		});

		it("clamps translateY when closed and edge swipe up", () => {
			// startY=770 (in edge), currentY=720 → distance=-50
			// translateY = max(0, min(600, 600 + (-50) + 20)) = max(0, 570) = 570
			const refs = makeDragRefsY({ startY: 770 });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(false);
			const options = makeOptions({ midAnchorPoint: false });
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 720,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: null,
				initialScrollTop: 0,
			});

			expect(callbacks.dragSidebar).toHaveBeenCalledWith(570);
		});
	});

	describe("mid-anchor (midAnchorPoint=true, swipeToOpen=false)", () => {
		it("maps 0 to sidebarHeightPx when anchorState=open", () => {
			// startY=200, currentY=350 → distance=150
			// translateY = max(0, min(600, 150 - 20)) = 130
			const refs = makeDragRefsY({ startY: 200 });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			callbacks.getBottomAnchorState.mockReturnValue("open");
			const options = makeOptions();
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 350,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: null,
				initialScrollTop: 0,
			});

			expect(callbacks.dragSidebar).toHaveBeenCalledWith(130);
		});

		it("maps relative to baseTranslate when anchorState=midAnchor", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → baseTranslate=400
			// startY=500, currentY=550 → distance=50
			// translateY = max(0, min(600, 400 + 50 - 20)) = 430
			const refs = makeDragRefsY({ startY: 500 });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			callbacks.getBottomAnchorState.mockReturnValue("midAnchor");
			const options = makeOptions();
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 550,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: null,
				initialScrollTop: 0,
			});

			expect(callbacks.dragSidebar).toHaveBeenCalledWith(430);
		});

		it("clamps to [midAnchorTranslate, sidebarHeightPx] when closed and in edge", () => {
			// sidebarHeightPx=600, midAnchorPx=200 → midAnchorTranslate=400
			// startY=770 (in edge), currentY=720 → distance=-50
			// translateY = max(400, min(600, 600 + (-50) + 20)) = max(400, 570) = 570
			const refs = makeDragRefsY({ startY: 770 });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(false);
			const options = makeOptions();
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 720,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: null,
				initialScrollTop: 0,
			});

			expect(callbacks.dragSidebar).toHaveBeenCalledWith(570);
		});
	});

	describe("scroll conflict resolution", () => {
		it("yields when scrollTop changed from initial", () => {
			const refs = makeDragRefsY({ startY: 500, isActivated: false });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			const options = makeOptions();
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			const scrollableEl = document.createElement("div");
			Object.defineProperty(scrollableEl, "scrollTop", { value: 50, configurable: true });
			Object.defineProperty(scrollableEl, "scrollHeight", { value: 500, configurable: true });
			Object.defineProperty(scrollableEl, "clientHeight", { value: 200, configurable: true });

			// distance = 475-500 = -25, abs=25 >= 20 → tries to activate
			// scrollTop=50 !== initialScrollTop=0 → yields
			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 475,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: scrollableEl,
				initialScrollTop: 0,
			});

			expect(refs.draggingRef.current).toBeNull();
			expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
			expect(lockPane).not.toHaveBeenCalled();
		});

		it("yields when scrollable can scroll in gesture direction", () => {
			const refs = makeDragRefsY({ startY: 500, isActivated: false });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			const options = makeOptions();
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			const scrollableEl = document.createElement("div");
			// scrollTop=0, same as initial → passes first check
			// swiping down (positive distance) → canScrollUp = scrollTop > 1 = false
			// Actually need to make it scroll in the direction: swiping down means canScrollUp
			// distance = 525-500 = 25 > 0 → checks canScrollUp
			// scrollTop=100 > 1 → canScrollUp=true → yields
			Object.defineProperty(scrollableEl, "scrollTop", { value: 100, configurable: true });
			Object.defineProperty(scrollableEl, "scrollHeight", { value: 500, configurable: true });
			Object.defineProperty(scrollableEl, "clientHeight", { value: 200, configurable: true });

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 525,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: scrollableEl,
				initialScrollTop: 100,
			});

			expect(refs.draggingRef.current).toBeNull();
			expect(callbacks.dragSidebar).toHaveBeenCalledWith(null);
			expect(lockPane).not.toHaveBeenCalled();
		});

		it("proceeds when at scroll boundary", () => {
			const refs = makeDragRefsY({ startY: 500, isActivated: false });
			const callbacks = makeBottomCallbacks();
			callbacks.getIsOpen.mockReturnValue(true);
			const options = makeOptions({ midAnchorPoint: false });
			const preventDefault = vi.fn();
			const lockPane = vi.fn();

			const scrollableEl = document.createElement("div");
			// scrollTop=0 → canScrollUp = false, swiping down → distance > 0
			// canScrollUp = 0 > 1 = false → does NOT yield
			Object.defineProperty(scrollableEl, "scrollTop", { value: 0, configurable: true });
			Object.defineProperty(scrollableEl, "scrollHeight", { value: 500, configurable: true });
			Object.defineProperty(scrollableEl, "clientHeight", { value: 200, configurable: true });

			handleBottomDragMove({
				refs,
				callbacks,
				currentY: 525,
				preventDefault,
				lockPane,
				options,
				scrollableAncestor: scrollableEl,
				initialScrollTop: 0,
			});

			expect(refs.draggingRef.current?.isActivated).toBe(true);
			expect(lockPane).toHaveBeenCalled();
		});
	});

	it("calls preventDefault on valid gesture", () => {
		const refs = makeDragRefsY({ startY: 200 });
		const callbacks = makeBottomCallbacks();
		callbacks.getIsOpen.mockReturnValue(true);
		const options = makeOptions({ midAnchorPoint: false });
		const preventDefault = vi.fn();
		const lockPane = vi.fn();

		handleBottomDragMove({
			refs,
			callbacks,
			currentY: 300,
			preventDefault,
			lockPane,
			options,
			scrollableAncestor: null,
			initialScrollTop: 0,
		});

		expect(preventDefault).toHaveBeenCalled();
	});
});
