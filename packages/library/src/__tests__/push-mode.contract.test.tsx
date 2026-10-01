import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeBarContent } from "../components/SwipeBarContent";
import { SwipeBarLeft } from "../components/SwipeBarLeft";
import { SwipeBarRight } from "../components/SwipeBarRight";
import { SwipeBarProvider } from "../SwipeBarProvider";
import type { TSwipeBarOptions } from "../swipeSidebarShared";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { dispatchTouch } from "./gestureMock";
import { installViewportMock, setViewportWidth } from "./viewportMock";

const SMALL_INNER_WIDTH = 480;
const DESKTOP_INNER_WIDTH = 1024;
const PANE_WIDTH = 320;
const OVERLAY_COLOR = "rgba(1, 2, 3, 0.4)";

beforeEach(() => {
	installViewportMock(SMALL_INNER_WIDTH);
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
		cb(0);
		return 0;
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function Controls() {
	const { openSidebar, closeSidebar } = useSwipeBarContext();
	return (
		<div>
			<button type="button" onClick={() => openSidebar("left")}>
				open left
			</button>
			<button type="button" onClick={() => closeSidebar("left")}>
				close left
			</button>
			<button type="button" onClick={() => openSidebar("right")}>
				open right
			</button>
			<button type="button" onClick={() => openSidebar("left", { id: "nested" })}>
				open nested
			</button>
			<button type="button" onClick={() => closeSidebar("left", { id: "nested" })}>
				close nested
			</button>
		</div>
	);
}

function renderPush({
	provider,
	panes,
	withContent = true,
}: {
	provider?: TSwipeBarOptions;
	panes?: ReactNode;
	withContent?: boolean;
}) {
	render(
		<SwipeBarProvider
			transitionMs={0}
			smallScreenMode="push"
			sidebarWidthPx={PANE_WIDTH}
			overlayBackgroundColor={OVERLAY_COLOR}
			{...provider}
		>
			<div>
				{panes ?? (
					<>
						<SwipeBarLeft>
							<div>Left pane</div>
						</SwipeBarLeft>
						<SwipeBarRight>
							<div>Right pane</div>
						</SwipeBarRight>
					</>
				)}
				{withContent ? (
					<SwipeBarContent>
						<div data-testid="page">
							<Controls />
						</div>
					</SwipeBarContent>
				) : (
					<Controls />
				)}
			</div>
		</SwipeBarProvider>,
	);
}

function getContent() {
	return screen.getByTestId("page").parentElement;
}

function click(label: string) {
	act(() => screen.getByText(label).click());
}

function parseTranslateX(transform: string | undefined): number {
	const m = transform?.match(/translateX\((-?[\d.]+)(px|%)\)/);
	if (!m) return 0;
	return m[2] === "%" ? (Number(m[1]) / 100) * PANE_WIDTH : Number(m[1]);
}

describe("[spec:sidebar-registration/PushTracksPane]", () => {
	it("left open pushes the content right by the pane width", async () => {
		renderPush({});
		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).toBe(`translateX(${PANE_WIDTH}px)`));
	});

	it("right open pushes the content left by the pane width", async () => {
		renderPush({});
		click("open right");
		await waitFor(() => expect(getContent()?.style.transform).toBe(`translateX(-${PANE_WIDTH}px)`));
	});

	it("mid drag the content offset equals the visible pane width", () => {
		renderPush({});
		const pane = document.getElementById("swipebar-left-primary");

		dispatchTouch("touchstart", 10);
		dispatchTouch("touchmove", 40);
		dispatchTouch("touchmove", 210);

		const visibleWidth = PANE_WIDTH + parseTranslateX(pane?.style.transform);
		expect(visibleWidth).toBeGreaterThan(0);
		expect(visibleWidth).toBeLessThan(PANE_WIDTH);
		expect(parseTranslateX(getContent()?.style.transform)).toBe(visibleWidth);
		expect(pane?.style.width).toBe(`${PANE_WIDTH}px`);
	});

	it("content is clipped by its wrapper so it never scrolls horizontally", () => {
		renderPush({});
		expect(getContent()?.parentElement?.style.overflowX).toBe("clip");
	});
});

describe("[spec:sidebar-registration/PushReleasesOnClose]", () => {
	it("closing settles the content and clears its transform", async () => {
		renderPush({});
		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).not.toBe(""));
		click("close left");
		await waitFor(() => expect(getContent()?.style.transform).toBe(""));
	});

	it("overlay click closes and releases the push", async () => {
		renderPush({});
		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).not.toBe(""));
		const overlay = document.querySelector<HTMLElement>('[aria-hidden="true"]');
		act(() => {
			overlay?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		});
		await waitFor(() => expect(getContent()?.style.transform).toBe(""));
	});

	it("breakpoint auto close releases the push even though the viewport is now large", async () => {
		renderPush({});
		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).not.toBe(""));
		act(() => setViewportWidth(DESKTOP_INNER_WIDTH));
		await waitFor(() => expect(getContent()?.style.transform).toBe(""));
	});

	it("swiping the open pane closed releases the push", async () => {
		renderPush({});
		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).not.toBe(""));

		dispatchTouch("touchstart", 300);
		dispatchTouch("touchmove", 270);
		dispatchTouch("touchmove", 100);
		dispatchTouch("touchend", 100);

		await waitFor(() => expect(getContent()?.style.transform).toBe(""));
	});
});

describe("[spec:sidebar-registration/PushActivation]", () => {
	it("stacked panes: only the first opened pane pushes", async () => {
		renderPush({
			panes: (
				<>
					<SwipeBarLeft>
						<div>Primary</div>
					</SwipeBarLeft>
					<SwipeBarLeft id="nested" sidebarWidthPx={200}>
						<div>Nested</div>
					</SwipeBarLeft>
				</>
			),
		});

		click("open left");
		await waitFor(() => expect(getContent()?.style.transform).toBe(`translateX(${PANE_WIDTH}px)`));

		click("open nested");
		click("close nested");
		expect(getContent()?.style.transform).toBe(`translateX(${PANE_WIDTH}px)`);

		click("close left");
		await waitFor(() => expect(getContent()?.style.transform).toBe(""));
	});

	it("isAbsolute wins: the pane floats over static content", async () => {
		renderPush({ provider: { isAbsolute: true } });
		click("open left");
		const pane = document.getElementById("swipebar-left-primary");
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));
		expect(getContent()?.style.transform).toBe("");
	});

	it("overlay mode (the default) never moves the content", async () => {
		renderPush({ provider: { smallScreenMode: "overlay" } });
		click("open left");
		const pane = document.getElementById("swipebar-left-primary");
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));
		expect(getContent()?.style.transform).toBe("");
	});
});

describe("[spec:sidebar-registration/PushIgnoredOnLargeViewport]", () => {
	it("above the breakpoint the content is not pushed", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);
		renderPush({});
		click("open left");
		const pane = document.getElementById("swipebar-left-primary");
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));
		expect(getContent()?.style.transform).toBe("");
	});
});

describe("[spec:sidebar-registration/PushKeepsOverlay]", () => {
	it("the overlay keeps the user colour and shows while open", async () => {
		renderPush({});
		click("open left");
		const overlay = document.querySelector<HTMLElement>('[aria-hidden="true"]');
		await waitFor(() => expect(overlay?.style.opacity).toBe("1"));
		expect(overlay?.style.backgroundColor).toBe(OVERLAY_COLOR);
	});
});

describe("[spec:sidebar-registration/PushFallsBackWithoutContent]", () => {
	it("opens as an overlay and warns once when no content is registered", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		renderPush({ withContent: false });
		const pane = document.getElementById("swipebar-left-primary");

		click("open left");
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));
		click("close left");
		await waitFor(() => expect(pane).toHaveAttribute("inert"));
		click("open left");
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));

		expect(warn).toHaveBeenCalledTimes(1);
	});
});
