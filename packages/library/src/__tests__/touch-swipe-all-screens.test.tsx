import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeBarLeft } from "../components/SwipeBarLeft";
import { SwipeBarRight } from "../components/SwipeBarRight";
import { SwipeBarProvider } from "../SwipeBarProvider";
import type { TSwipeBarOptions } from "../swipeSidebarShared";

const DESKTOP_INNER_WIDTH = 1024;
const SMALL_INNER_WIDTH = 480;

function setViewportWidth(width: number) {
	Object.defineProperty(window, "innerWidth", {
		value: width,
		configurable: true,
		writable: true,
	});
}

function matchesQuery(query: string): boolean {
	const m = query.match(/max-width:\s*(\d+)px/);
	if (!m) return false;
	return window.innerWidth <= Number(m[1]);
}

beforeEach(() => {
	setViewportWidth(DESKTOP_INNER_WIDTH);
	const matchMediaImpl = (query: string): MediaQueryList =>
		({
			matches: matchesQuery(query),
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => true,
		}) as unknown as MediaQueryList;
	vi.stubGlobal("matchMedia", matchMediaImpl);
	Object.defineProperty(window, "matchMedia", {
		value: matchMediaImpl,
		configurable: true,
		writable: true,
	});
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
		cb(0);
		return 0;
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	setViewportWidth(DESKTOP_INNER_WIDTH);
});

function dispatchTouch(
	type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
	clientX: number,
) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, "changedTouches", {
		value: [{ identifier: 1, clientX, clientY: 300 }],
	});
	act(() => {
		window.dispatchEvent(event);
	});
}

function dispatchMouse(type: "mousedown" | "mousemove" | "mouseup", clientX: number) {
	act(() => {
		window.dispatchEvent(new MouseEvent(type, { clientX, clientY: 300, button: 0 }));
	});
}

// Start at startX, pass the activation delta, then keep moving to endX.
function touchSwipe(startX: number, endX: number) {
	const direction = Math.sign(endX - startX);
	dispatchTouch("touchstart", startX);
	dispatchTouch("touchmove", startX + direction * 30);
	dispatchTouch("touchmove", Math.round((startX + endX) / 2));
	dispatchTouch("touchmove", endX);
	dispatchTouch("touchend", endX);
}

function mouseSwipe(startX: number, endX: number) {
	const direction = Math.sign(endX - startX);
	dispatchMouse("mousedown", startX);
	dispatchMouse("mousemove", startX + direction * 30);
	dispatchMouse("mousemove", Math.round((startX + endX) / 2));
	dispatchMouse("mousemove", endX);
	dispatchMouse("mouseup", endX);
}

function renderLeft(options: TSwipeBarOptions) {
	render(
		<SwipeBarProvider transitionMs={0}>
			<SwipeBarLeft showOverlay={false} {...options}>
				<div>Left content</div>
			</SwipeBarLeft>
		</SwipeBarProvider>,
	);
	return document.getElementById("swipebar-left-primary");
}

function renderRight(options: TSwipeBarOptions) {
	render(
		<SwipeBarProvider transitionMs={0}>
			<SwipeBarRight showOverlay={false} {...options}>
				<div>Right content</div>
			</SwipeBarRight>
		</SwipeBarProvider>,
	);
	return document.getElementById("swipebar-right-primary");
}

const OPEN_WIDTH = "320px";

// aria-modal is only set for floating panes, so open state is read from
// inert plus the settled pane width (rail and closed never reach it).
async function expectOpen(sidebar: HTMLElement | null) {
	await waitFor(() => {
		expect(sidebar).not.toHaveAttribute("inert");
		expect(sidebar?.style.width).toBe(OPEN_WIDTH);
	});
}

function expectClosed(sidebar: HTMLElement | null) {
	expect(sidebar?.style.width).not.toBe(OPEN_WIDTH);
}

describe("touch swipe on large screens", () => {
	it("stays disabled by default", () => {
		const sidebar = renderLeft({});

		touchSwipe(10, 300);

		expectClosed(sidebar);
	});

	it("opens the left sidebar from the edge when touchSwipeOnAllScreens is set", async () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });

		touchSwipe(10, 300);

		await expectOpen(sidebar);
	});

	it("opens the right sidebar from the edge when touchSwipeOnAllScreens is set", async () => {
		const sidebar = renderRight({ touchSwipeOnAllScreens: true });

		touchSwipe(DESKTOP_INNER_WIDTH - 10, DESKTOP_INNER_WIDTH - 300);

		await expectOpen(sidebar);
	});

	it("closes an open left sidebar with a touch swipe", async () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });
		touchSwipe(10, 300);
		await expectOpen(sidebar);

		touchSwipe(300, 10);

		await waitFor(() => expectClosed(sidebar));
	});

	it("can be enabled globally on the provider", async () => {
		render(
			<SwipeBarProvider transitionMs={0} touchSwipeOnAllScreens>
				<SwipeBarLeft showOverlay={false}>
					<div>Left content</div>
				</SwipeBarLeft>
			</SwipeBarProvider>,
		);
		const sidebar = document.getElementById("swipebar-left-primary");

		touchSwipe(10, 300);

		await expectOpen(sidebar);
	});

	it("ignores mouse drags on large screens", () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });

		mouseSwipe(10, 300);

		expectClosed(sidebar);
	});

	it("ignores touch swipes while the rail is showing", () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true, showRail: true });

		touchSwipe(10, 300);

		expectClosed(sidebar);
	});
});

describe("touch swipe on small screens is unchanged", () => {
	beforeEach(() => {
		setViewportWidth(SMALL_INNER_WIDTH);
	});

	it("opens with touch without the option", async () => {
		const sidebar = renderLeft({});

		touchSwipe(10, 300);

		await expectOpen(sidebar);
	});

	it("opens with mouse without the option", async () => {
		const sidebar = renderLeft({});

		mouseSwipe(10, 300);

		await expectOpen(sidebar);
	});
});

describe("in flow drag keeps the content edge next to the pane", () => {
	it("compensates the left drag translate with a negative right margin", () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true, sidebarWidthPx: 320 });

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 150);

		const translateX = Number(sidebar?.style.transform.match(/-?\d+/)?.[0]);
		expect(translateX).toBeLessThan(0);
		expect(sidebar?.style.width).toBe("320px");
		expect(sidebar?.style.marginRight).toBe(`${translateX}px`);
	});

	it("compensates the right drag translate with a negative left margin", () => {
		const sidebar = renderRight({ touchSwipeOnAllScreens: true, sidebarWidthPx: 320 });

		dispatchTouch("touchstart", DESKTOP_INNER_WIDTH - 10);
		dispatchTouch("touchmove", DESKTOP_INNER_WIDTH - 40);
		dispatchTouch("touchmove", DESKTOP_INNER_WIDTH - 150);

		const translateX = Number(sidebar?.style.transform.match(/-?\d+/)?.[0]);
		expect(translateX).toBeGreaterThan(0);
		expect(sidebar?.style.marginLeft).toBe(`${-translateX}px`);
	});

	it("resets the margin once the drag settles open", async () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });

		touchSwipe(10, 300);

		await expectOpen(sidebar);
		expect(sidebar?.style.marginRight).toBe("0px");
	});

	it("leaves the margin alone for absolute panes", () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true, isAbsolute: true });

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 150);

		expect(sidebar?.style.marginRight).toBe("");
	});
});

describe("in flow drag with trackContentOnDrag off freezes the content", () => {
	const options = { touchSwipeOnAllScreens: true, trackContentOnDrag: false, sidebarWidthPx: 320 };

	it("keeps a closed left pane's footprint at 0 while dragging open", () => {
		const sidebar = renderLeft(options);

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 100);
		expect(sidebar?.style.width).toBe("320px");
		expect(sidebar?.style.marginRight).toBe("-320px");

		dispatchTouch("touchmove", 150);
		expect(sidebar?.style.marginRight).toBe("-320px");
		expect(sidebar?.style.transform).toMatch(/translateX\(-\d+px\)/);
	});

	it("keeps a closed right pane's footprint at 0 while dragging open", () => {
		const sidebar = renderRight(options);

		dispatchTouch("touchstart", DESKTOP_INNER_WIDTH - 10);
		dispatchTouch("touchmove", DESKTOP_INNER_WIDTH - 40);
		dispatchTouch("touchmove", DESKTOP_INNER_WIDTH - 150);

		expect(sidebar?.style.marginLeft).toBe("-320px");
	});

	it("leaves an open pane's footprint untouched while dragging closed", async () => {
		const sidebar = renderLeft(options);
		touchSwipe(10, 300);
		await expectOpen(sidebar);

		dispatchTouch("touchstart", 300);
		dispatchTouch("touchmove", 270);
		dispatchTouch("touchmove", 150);

		expect(sidebar?.style.width).toBe(OPEN_WIDTH);
		expect(sidebar?.style.marginRight).toBe("0px");
		expect(sidebar?.style.transform).toMatch(/translateX\(-\d+px\)/);
	});

	it("lets the content catch up once the drag settles open", async () => {
		const sidebar = renderLeft(options);

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 300);
		expect(sidebar?.style.marginRight).toBe("-320px");

		dispatchTouch("touchend", 300);

		await expectOpen(sidebar);
		expect(sidebar?.style.marginRight).toBe("0px");
	});

	it("lets the content catch up once the drag settles closed", async () => {
		const sidebar = renderLeft(options);
		touchSwipe(10, 300);
		await expectOpen(sidebar);

		dispatchTouch("touchstart", 300);
		dispatchTouch("touchmove", 270);
		dispatchTouch("touchmove", 10);
		expect(sidebar?.style.width).toBe(OPEN_WIDTH);
		expect(sidebar?.style.marginRight).toBe("0px");

		dispatchTouch("touchend", 10);

		await waitFor(() => expect(sidebar?.style.width).toBe("0px"));
		expect(sidebar?.style.marginRight).toBe("0px");
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("returns a half opened pane to closed on touchcancel and clears the margin", () => {
		const sidebar = renderLeft(options);

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 150);
		expect(sidebar?.style.marginRight).toBe("-320px");

		dispatchTouch("touchcancel", 150);

		expect(sidebar?.style.transform).toBe("translateX(-100%)");
		expect(sidebar?.style.width).toBe("0px");
		expect(sidebar?.style.marginRight).toBe("0px");
		expectClosed(sidebar);
	});

	it("returns a half closed pane to open on touchcancel with the margin untouched", async () => {
		const sidebar = renderLeft(options);
		touchSwipe(10, 300);
		await expectOpen(sidebar);

		dispatchTouch("touchstart", 300);
		dispatchTouch("touchmove", 270);
		dispatchTouch("touchmove", 150);
		expect(sidebar?.style.marginRight).toBe("0px");

		dispatchTouch("touchcancel", 150);

		await expectOpen(sidebar);
		expect(sidebar?.style.transform).toBe("translateX(0px)");
		expect(sidebar?.style.marginRight).toBe("0px");
	});
});

describe("cancelled touch gestures settle the pane", () => {
	it("returns a half opened in flow pane to closed and clears the margin", () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 150);
		expect(sidebar?.style.marginRight).not.toBe("0px");

		dispatchTouch("touchcancel", 150);

		expect(sidebar?.style.transform).toBe("translateX(-100%)");
		expect(sidebar?.style.width).toBe("0px");
		expect(sidebar?.style.marginRight).toBe("0px");
		expectClosed(sidebar);
	});

	it("returns a half closed in flow pane to open and clears the margin", async () => {
		const sidebar = renderLeft({ touchSwipeOnAllScreens: true });
		touchSwipe(10, 300);
		await expectOpen(sidebar);

		dispatchTouch("touchstart", 300);
		dispatchTouch("touchmove", 270);
		dispatchTouch("touchmove", 150);
		expect(sidebar?.style.marginRight).not.toBe("0px");

		dispatchTouch("touchcancel", 150);

		await expectOpen(sidebar);
		expect(sidebar?.style.transform).toBe("translateX(0px)");
		expect(sidebar?.style.marginRight).toBe("0px");
	});
});
