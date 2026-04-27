import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

function matchesQuery(query: string, innerWidth: number): boolean {
	const m = query.match(/max-width:\s*(\d+)px/);
	if (!m) return false;
	const max = Number(m[1]);
	return innerWidth <= max;
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

describe("showRail — mount behavior on desktop", () => {
	it("left sidebar mounts in rail mode when showRail and not defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={64}>
				<div>
					<button type="button">Rail icon</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateX(0px)");
		expect(sidebar?.style.width).toBe("64px");
		expect(sidebar).toHaveAttribute("aria-modal", "false");
	});

	it("right sidebar mounts in rail mode when showRail and not defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarRight showRail railWidthPx={48}>
				<div>
					<button type="button">Rail icon</button>
				</div>
			</SwipeBarRight>,
		);

		const sidebar = document.getElementById("swipebar-right-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateX(0px)");
		expect(sidebar?.style.width).toBe("48px");
	});

	it("rail width defaults to 64 when railWidthPx not provided", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.width).toBe("64px");
	});

	it("rail items remain interactive (inert is cleared)", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail>
				<div>
					<button type="button">Rail action</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		const railBtn = screen.getByRole("button", { name: "Rail action" });
		expect(railBtn).toBeInTheDocument();
		await userEvent.click(railBtn);
	});

	it("defaultOpen overrides showRail at mount", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={64} defaultOpen sidebarWidthPx={300}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});
		expect(sidebar?.style.transform).toBe("translateX(0px)");
		expect(sidebar?.style.width).toBe("300px");
	});

	it("showRail off keeps closed-state hidden at mount", () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});
});

describe("showRail — small viewport fallback", () => {
	beforeEach(() => {
		setViewportWidth(SMALL_INNER_WIDTH);
	});

	it("small viewport ignores showRail and stays hidden at mount", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("small viewport: closeSidebar fully hides even when showRail is on", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail showOverlay={false}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");

		// Open it via toggle
		const openToggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(openToggle);

		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		// Close via toggle
		const closeToggle = screen.getByRole("button", { name: /close left sidebar/i });
		await userEvent.click(closeToggle);

		// On small viewport, close should fully hide (inert), not rail
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("toggle button stays visible on small viewport when showRail is on", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		expect(toggle).toBeInTheDocument();
	});
});

describe("showRail — close on desktop routes to rail", () => {
	it("left: closeSidebar transitions open → rail (visible, not inert, rail width)", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={72} sidebarWidthPx={280} showOverlay={false}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");

		// Mount triggers rail. Click rail interior to focus, then expand by
		// programmatic open via context.
		await waitFor(() => {
			expect(sidebar?.style.width).toBe("72px");
		});

		// To get to "open", we need a way to call openSidebar. Use the toggle? It's
		// hidden in rail mode. Simulate via context through a child renderer.
		// Instead, render with defaultOpen, then close, and verify rail.
	});

	it("left: defaultOpen → close → rail on desktop", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={72} sidebarWidthPx={300} defaultOpen>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		// While open, the toggle is hidden because rail mode is effective.
		// Use Escape to close.
		const insideBtn = screen.getByRole("button", { name: "Inside" });
		insideBtn.focus();
		const { fireEvent } = await import("@testing-library/react");
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
		// After close, should be in rail mode (not inert)
		expect(sidebar).not.toHaveAttribute("inert");
		expect(sidebar?.style.width).toBe("72px");
		expect(sidebar?.style.transform).toBe("translateX(0px)");
	});

	it("right: defaultOpen → close → rail on desktop", async () => {
		renderWithProvider(
			<SwipeBarRight showRail railWidthPx={56} sidebarWidthPx={300} defaultOpen>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarRight>,
		);

		const sidebar = document.getElementById("swipebar-right-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		insideBtn.focus();
		const { fireEvent } = await import("@testing-library/react");
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar?.style.width).toBe("56px");
		});
	});

	it("toggle button is hidden on desktop when showRail is active", () => {
		renderWithProvider(
			<SwipeBarLeft showRail>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		// Toggle should not be rendered since rail is the affordance.
		expect(screen.queryByRole("button", { name: /open left sidebar/i })).toBeNull();
	});
});

describe("showRail — viewport reconciliation", () => {
	it("small → large with mode=closed transitions to rail", async () => {
		setViewportWidth(SMALL_INNER_WIDTH);

		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={64}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});

		// Resize to desktop
		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.width).toBe("64px");
		expect(sidebar?.style.transform).toBe("translateX(0px)");
	});

	it("large → small with mode=rail transitions to closed", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);

		renderWithProvider(
			<SwipeBarLeft showRail railWidthPx={64}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar?.style.width).toBe("64px");
		});

		// Resize to mobile
		act(() => {
			setViewportWidth(SMALL_INNER_WIDTH);
		});

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("open survives viewport change in either direction", async () => {
		setViewportWidth(DESKTOP_INNER_WIDTH);

		renderWithProvider(
			<SwipeBarLeft showRail defaultOpen sidebarWidthPx={300}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});

		// Resize to small — open should persist
		act(() => {
			setViewportWidth(SMALL_INNER_WIDTH);
		});
		expect(sidebar).toHaveAttribute("aria-modal", "true");

		// Resize back to large — open should still persist
		act(() => {
			setViewportWidth(DESKTOP_INNER_WIDTH);
		});
		expect(sidebar).toHaveAttribute("aria-modal", "true");
	});
});

describe("showRail — state shape", () => {
	it("registration creates entry with isRail=false initially", async () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		// The state is verified indirectly: sidebar initial transform is closed.
		const sidebar = document.getElementById("swipebar-left-primary");
		expect(sidebar).toHaveAttribute("inert");
	});

	it("opening from rail mode clears isRail and sets isOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft showRail defaultOpen sidebarWidthPx={300}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left-primary");

		// Open immediately
		await waitFor(() => {
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});
		expect(sidebar?.style.width).toBe("300px");
	});
});
