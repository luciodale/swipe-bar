import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeBarBottom } from "../components/SwipeBarBottom";
import { SwipeBarLeft } from "../components/SwipeBarLeft";
import { SwipeBarRight } from "../components/SwipeBarRight";
import { SwipeBarProvider } from "../SwipeBarProvider";

const DESKTOP_INNER_WIDTH = 1024;
const SMALL_INNER_WIDTH = 480;

type TMediaQueryListLike = {
	matches: boolean;
	media: string;
	onchange: null;
	addListener: (cb: () => void) => void;
	removeListener: (cb: () => void) => void;
	addEventListener: (event: string, cb: () => void) => void;
	removeEventListener: (event: string, cb: () => void) => void;
	dispatchEvent: () => boolean;
};

type TMqlRecord = {
	mql: TMediaQueryListLike;
	listeners: Set<() => void>;
};

const mqlRegistry = new Map<string, TMqlRecord>();
let currentInnerWidth = DESKTOP_INNER_WIDTH;

function matchesQuery(query: string, innerWidth: number): boolean {
	const m = query.match(/max-width:\s*(\d+)px/);
	if (!m) return false;
	const max = Number(m[1]);
	return innerWidth <= max;
}

function makeMql(query: string): TMqlRecord {
	const listeners = new Set<() => void>();
	const mql: TMediaQueryListLike = {
		matches: matchesQuery(query, currentInnerWidth),
		media: query,
		onchange: null,
		addListener: (cb) => listeners.add(cb),
		removeListener: (cb) => listeners.delete(cb),
		addEventListener: (_event, cb) => listeners.add(cb),
		removeEventListener: (_event, cb) => listeners.delete(cb),
		dispatchEvent: () => true,
	};
	return { mql, listeners };
}

function setViewportWidth(width: number) {
	currentInnerWidth = width;
	Object.defineProperty(window, "innerWidth", {
		value: width,
		configurable: true,
		writable: true,
	});
	for (const [query, record] of mqlRegistry) {
		const next = matchesQuery(query, width);
		if (record.mql.matches !== next) {
			record.mql.matches = next;
			for (const cb of record.listeners) cb();
		}
	}
}

beforeEach(() => {
	mqlRegistry.clear();
	setViewportWidth(DESKTOP_INNER_WIDTH);
	const matchMediaImpl = (query: string): MediaQueryList => {
		let record = mqlRegistry.get(query);
		if (!record) {
			record = makeMql(query);
			mqlRegistry.set(query, record);
		}
		return record.mql as unknown as MediaQueryList;
	};
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
	mqlRegistry.clear();
	setViewportWidth(DESKTOP_INNER_WIDTH);
});

function renderWithProvider(ui: React.ReactElement) {
	return render(<SwipeBarProvider transitionMs={0}>{ui}</SwipeBarProvider>);
}

describe("Viewport breakpoint crossing should reset open sidebar", () => {
	it("mobile → desktop: open sidebar gets closed automatically", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
	});

	it("desktop → mobile: open sidebar gets closed automatically", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft showOverlay={false}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		act(() => {
			setViewportWidth(SMALL_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
	});

	it("overlay clears (pointer-events:none) when viewport crosses while open", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft showOverlay>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		const overlay = document.querySelector<HTMLElement>("[aria-hidden]");
		expect(overlay?.style.pointerEvents).toBe("auto");

		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});

		const overlayAfter = document.querySelector<HTMLElement>("[aria-hidden]");
		expect(overlayAfter?.style.pointerEvents).toBe("none");
	});

	it("body overflow lock is released after viewport-triggered close", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		await waitFor(() => {
			expect(document.body.style.overflow).toBe("hidden");
		});

		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(document.body.style.overflow).toBe("");
		});
	});

	it("right sidebar: mobile → desktop closes too", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarRight>
				<div>Content</div>
			</SwipeBarRight>,
		);

		const toggle = screen.getByRole("button", { name: /open right sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-right-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
	});

	it("bottom sidebar: mobile → desktop closes", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarBottom>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const toggle = screen.getByRole("button", { name: /open bottom sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "false");
			expect(sidebar).toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateY(100%)");
	});

	it("bottom sidebar: desktop → mobile closes", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarBottom showOverlay={false}>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const toggle = screen.getByRole("button", { name: /open bottom sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		act(() => {
			setViewportWidth(SMALL_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "false");
			expect(sidebar).toHaveAttribute("inert");
		});
	});
});

describe("First mount does not auto-close", () => {
	it("mounting on mobile with defaultOpen keeps the sidebar open", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft defaultOpen>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		// Give effects another tick to run; the breakpoint hook's first valid
		// run must NOT trigger a close.
		await Promise.resolve();
		expect(sidebar).toHaveAttribute("aria-modal", "true");
		expect(sidebar).not.toHaveAttribute("inert");
	});

	it("mounting on desktop with defaultOpen keeps the sidebar open", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft defaultOpen>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		await Promise.resolve();
		expect(sidebar).toHaveAttribute("aria-modal", "true");
		expect(sidebar).not.toHaveAttribute("inert");
	});

	it("bottom sidebar mounting on mobile with defaultOpen keeps the sidebar open", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarBottom defaultOpen>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		await Promise.resolve();
		expect(sidebar).toHaveAttribute("aria-modal", "true");
		expect(sidebar).not.toHaveAttribute("inert");
	});

	it("mounting closed on mobile stays closed (no spurious close-then-open)", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		// Closed by default; verify it stays closed across the first effect phase.
		await Promise.resolve();
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar).toHaveAttribute("aria-modal", "false");
	});
});
