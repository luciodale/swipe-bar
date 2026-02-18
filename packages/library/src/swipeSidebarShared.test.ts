import { describe, expect, it, vi } from "vitest";
import {
	findChangedTouch,
	findScrollableAncestor,
	handleDragCancel,
	handleDragCancelY,
	handleDragStart,
	handleDragStartY,
	hasTrackedTouchEnded,
	isEditableTarget,
} from "./swipeSidebarShared";
import { makeDragRefs, makeDragRefsY, makeTouchList } from "./test-utils";

describe("handleDragStart", () => {
	it("initializes draggingRef fields", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;

		handleDragStart({ refs, clientX: 100, clientY: 200, touchId: 5, isMouse: false });

		expect(refs.draggingRef.current).toEqual({
			startX: 100,
			startY: 200,
			activeTouchId: 5,
			isMouse: false,
			isActivated: false,
		});
	});

	it("sets currentX and prevX to clientX", () => {
		const refs = makeDragRefs();
		refs.draggingRef.current = null;

		handleDragStart({ refs, clientX: 150, clientY: 0, touchId: null, isMouse: true });

		expect(refs.currentXRef.current).toBe(150);
		expect(refs.prevXRef.current).toBe(150);
	});
});

describe("handleDragStartY", () => {
	it("initializes draggingRef fields for Y axis", () => {
		const refs = makeDragRefsY();
		refs.draggingRef.current = null;

		handleDragStartY({ refs, clientX: 50, clientY: 300, touchId: 3, isMouse: false });

		expect(refs.draggingRef.current).toEqual({
			startX: 50,
			startY: 300,
			activeTouchId: 3,
			isMouse: false,
			isActivated: false,
		});
	});

	it("sets currentY and prevY to clientY", () => {
		const refs = makeDragRefsY();
		refs.draggingRef.current = null;

		handleDragStartY({ refs, clientX: 0, clientY: 250, touchId: null, isMouse: true });

		expect(refs.currentYRef.current).toBe(250);
		expect(refs.prevYRef.current).toBe(250);
	});
});

describe("handleDragCancel", () => {
	it("clears refs and calls dragSidebar(null) and onDeactivate", () => {
		const refs = makeDragRefs({ startX: 100, currentX: 200, prevX: 150 });
		const dragSidebar = vi.fn();
		const onDeactivate = vi.fn();

		handleDragCancel({ refs, dragSidebar, onDeactivate });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentXRef.current).toBeNull();
		expect(refs.prevXRef.current).toBeNull();
		expect(dragSidebar).toHaveBeenCalledWith(null);
		expect(onDeactivate).toHaveBeenCalled();
	});
});

describe("handleDragCancelY", () => {
	it("clears refs and calls dragSidebar(null) and onDeactivate", () => {
		const refs = makeDragRefsY({ startY: 100, currentY: 200, prevY: 150 });
		const dragSidebar = vi.fn();
		const onDeactivate = vi.fn();

		handleDragCancelY({ refs, dragSidebar, onDeactivate });

		expect(refs.draggingRef.current).toBeNull();
		expect(refs.currentYRef.current).toBeNull();
		expect(refs.prevYRef.current).toBeNull();
		expect(dragSidebar).toHaveBeenCalledWith(null);
		expect(onDeactivate).toHaveBeenCalled();
	});
});

describe("isEditableTarget", () => {
	it("returns true for input element", () => {
		const input = document.createElement("input");
		expect(isEditableTarget(input)).toBe(true);
	});

	it("returns true for textarea element", () => {
		const textarea = document.createElement("textarea");
		expect(isEditableTarget(textarea)).toBe(true);
	});

	it("returns true for contenteditable element", () => {
		const div = document.createElement("div");
		div.setAttribute("contenteditable", "true");
		expect(isEditableTarget(div)).toBe(true);
	});

	it("returns false for plain div", () => {
		const div = document.createElement("div");
		expect(isEditableTarget(div)).toBe(false);
	});

	it("returns false for null", () => {
		expect(isEditableTarget(null)).toBe(false);
	});

	it("returns false for non-Element EventTarget", () => {
		const target = new EventTarget();
		expect(isEditableTarget(target)).toBe(false);
	});
});

describe("findChangedTouch", () => {
	it("finds touch by tracked ID", () => {
		const list = makeTouchList(
			{ identifier: 1, clientX: 10, clientY: 20 },
			{ identifier: 2, clientX: 30, clientY: 40 },
		);
		const result = findChangedTouch(list, 2);
		expect(result?.identifier).toBe(2);
	});

	it("returns first touch when trackedId is null", () => {
		const list = makeTouchList(
			{ identifier: 5, clientX: 10, clientY: 20 },
			{ identifier: 6, clientX: 30, clientY: 40 },
		);
		const result = findChangedTouch(list, null);
		expect(result?.identifier).toBe(5);
	});

	it("returns null when tracked touch not found", () => {
		const list = makeTouchList({ identifier: 1, clientX: 10, clientY: 20 });
		const result = findChangedTouch(list, 99);
		expect(result).toBeNull();
	});
});

describe("hasTrackedTouchEnded", () => {
	it("returns true when tracked ID is in the list", () => {
		const list = makeTouchList(
			{ identifier: 1, clientX: 0, clientY: 0 },
			{ identifier: 2, clientX: 0, clientY: 0 },
		);
		expect(hasTrackedTouchEnded(list, 2)).toBe(true);
	});

	it("returns false when tracked ID is not in the list", () => {
		const list = makeTouchList({ identifier: 1, clientX: 0, clientY: 0 });
		expect(hasTrackedTouchEnded(list, 99)).toBe(false);
	});
});

describe("findScrollableAncestor", () => {
	it("returns nearest scrollable ancestor", () => {
		const parent = document.createElement("div");
		Object.defineProperty(parent, "scrollHeight", { value: 500, configurable: true });
		Object.defineProperty(parent, "clientHeight", { value: 200, configurable: true });
		parent.style.overflowY = "auto";
		// jsdom getComputedStyle reads inline styles
		const child = document.createElement("div");
		parent.appendChild(child);
		document.body.appendChild(parent);

		const result = findScrollableAncestor(child);
		expect(result).toBe(parent);

		document.body.removeChild(parent);
	});

	it("returns null when no scrollable ancestor", () => {
		const div = document.createElement("div");
		document.body.appendChild(div);

		const result = findScrollableAncestor(div);
		expect(result).toBeNull();

		document.body.removeChild(div);
	});

	it("returns null for non-HTMLElement target", () => {
		const result = findScrollableAncestor(new EventTarget());
		expect(result).toBeNull();
	});

	it("returns null for null target", () => {
		const result = findScrollableAncestor(null);
		expect(result).toBeNull();
	});
});
