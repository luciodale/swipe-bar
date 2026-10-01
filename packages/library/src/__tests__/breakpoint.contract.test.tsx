import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeBarBottom } from "../components/SwipeBarBottom";
import { SwipeBarLeft } from "../components/SwipeBarLeft";
import { SwipeBarProvider } from "../SwipeBarProvider";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { installViewportMock, setViewportWidth } from "./viewportMock";

const CUSTOM_BREAKPOINT = 1024;

beforeEach(() => {
	installViewportMock(800);
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

function Controls({ side }: { side: "left" | "bottom" }) {
	const { openSidebar, closeSidebar, bottomAnchorState } = useSwipeBarContext();
	return (
		<>
			<button type="button" onClick={() => openSidebar(side)}>
				open
			</button>
			<button type="button" onClick={() => closeSidebar(side)}>
				close
			</button>
			<span data-testid="anchor">{bottomAnchorState}</span>
		</>
	);
}

function renderLeft(showRail = false) {
	render(
		<SwipeBarProvider transitionMs={0} mediaQueryWidth={CUSTOM_BREAKPOINT}>
			<SwipeBarLeft showRail={showRail} showOverlay={false}>
				<div>
					<button type="button">Pane item</button>
				</div>
			</SwipeBarLeft>
			<Controls side="left" />
		</SwipeBarProvider>,
	);
	return document.getElementById("swipebar-left-primary");
}

describe("[spec:sidebar-registration/SingleBreakpoint]", () => {
	it("honours a mediaQueryWidth above 640: 800px is small, so the pane floats", () => {
		const pane = renderLeft();
		expect(pane?.style.position).toBe("fixed");
		expect(pane).toHaveAttribute("role", "dialog");
	});

	it("treats a viewport exactly mediaQueryWidth wide as large", () => {
		setViewportWidth(CUSTOM_BREAKPOINT);
		const pane = renderLeft();
		expect(pane?.style.position).not.toBe("fixed");
		expect(pane).toHaveAttribute("role", "complementary");
	});

	it("treats one pixel below mediaQueryWidth as small", () => {
		setViewportWidth(CUSTOM_BREAKPOINT - 1);
		const pane = renderLeft();
		expect(pane?.style.position).toBe("fixed");
	});

	it("rail decisions agree with the pane: no rail on a small viewport, close fully hides", async () => {
		const pane = renderLeft(true);
		await waitFor(() => expect(pane).toHaveAttribute("inert"));

		act(() => screen.getByText("open").click());
		await waitFor(() => expect(pane).not.toHaveAttribute("inert"));

		act(() => screen.getByText("close").click());
		await waitFor(() => expect(pane).toHaveAttribute("inert"));
		expect(pane?.style.width).not.toBe("64px");
	});

	it("bottom mid anchor uses the same breakpoint", async () => {
		render(
			<SwipeBarProvider transitionMs={0} mediaQueryWidth={CUSTOM_BREAKPOINT}>
				<SwipeBarBottom midAnchorPoint swipeToOpen={false} sidebarHeightPx={600}>
					<div>Sheet</div>
				</SwipeBarBottom>
				<Controls side="bottom" />
			</SwipeBarProvider>,
		);

		act(() => screen.getByText("open").click());
		await waitFor(() => expect(screen.getByTestId("anchor")).toHaveTextContent("midAnchor"));
	});
});
