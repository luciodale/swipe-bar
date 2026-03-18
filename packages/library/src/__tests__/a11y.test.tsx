import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeBarBottom } from "../components/SwipeBarBottom";
import { SwipeBarLeft } from "../components/SwipeBarLeft";
import { SwipeBarRight } from "../components/SwipeBarRight";
import { SwipeBarProvider } from "../SwipeBarProvider";

// Stub requestAnimationFrame to run synchronously in tests
beforeEach(() => {
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
		cb(0);
		return 0;
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function renderWithProvider(ui: React.ReactElement) {
	return render(
		<SwipeBarProvider transitionMs={0} isAbsolute>
			{ui}
		</SwipeBarProvider>,
	);
}

describe("Sidebar a11y attributes", () => {
	it("has inert when closed", () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).not.toHaveAttribute("aria-hidden");
		expect(sidebar).toHaveAttribute("inert");
	});

	it("has role=dialog and aria-modal", () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).toHaveAttribute("role", "dialog");
	});

	it("removes inert when open", async () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const toggleButton = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggleButton);

		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).not.toHaveAttribute("aria-hidden");
		expect(sidebar).not.toHaveAttribute("inert");
		expect(sidebar).toHaveAttribute("aria-modal", "true");
	});

	it("right sidebar has correct a11y attrs when closed", () => {
		renderWithProvider(
			<SwipeBarRight>
				<div>Content</div>
			</SwipeBarRight>,
		);
		const sidebar = document.getElementById("swipebar-right");
		expect(sidebar).not.toHaveAttribute("aria-hidden");
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar).toHaveAttribute("role", "dialog");
		expect(sidebar).toHaveAttribute("aria-label", "Right sidebar");
	});

	it("bottom sidebar has correct a11y attrs when closed", () => {
		renderWithProvider(
			<SwipeBarBottom>
				<div>Content</div>
			</SwipeBarBottom>,
		);
		const sidebar = document.getElementById("swipebar-bottom-primary");
		expect(sidebar).not.toHaveAttribute("aria-hidden");
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar).toHaveAttribute("role", "dialog");
		expect(sidebar).toHaveAttribute("aria-label", "Bottom sidebar");
	});

	it("supports custom ariaLabel", () => {
		renderWithProvider(
			<SwipeBarLeft ariaLabel="Navigation menu">
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).toHaveAttribute("aria-label", "Navigation menu");
	});
});

describe("Toggle button a11y attributes", () => {
	it("has aria-expanded=false when sidebar closed", () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(toggle).toHaveAttribute("aria-controls", "swipebar-left");
	});

	it("has aria-expanded=true when sidebar open", async () => {
		// Disable overlay so toggle button stays visible when open
		renderWithProvider(
			<SwipeBarLeft showOverlay={false}>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const openToggle = screen.getByRole("button", { name: /close left sidebar/i });
		expect(openToggle).toHaveAttribute("aria-expanded", "true");
	});

	it("right toggle has correct aria attrs", () => {
		renderWithProvider(
			<SwipeBarRight>
				<div>Content</div>
			</SwipeBarRight>,
		);
		const toggle = screen.getByRole("button", { name: /open right sidebar/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(toggle).toHaveAttribute("aria-controls", "swipebar-right");
	});

	it("bottom toggle has correct aria attrs", () => {
		renderWithProvider(
			<SwipeBarBottom>
				<div>Content</div>
			</SwipeBarBottom>,
		);
		const toggle = screen.getByRole("button", { name: /open bottom sidebar/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(toggle).toHaveAttribute("aria-controls", "swipebar-bottom-primary");
	});
});

describe("Overlay a11y", () => {
	it("has aria-hidden=true", () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>Content</div>
			</SwipeBarLeft>,
		);
		// Overlay has aria-hidden when closed
		const overlays = document.querySelectorAll("[aria-hidden='true']");
		expect(overlays.length).toBeGreaterThan(0);
	});
});

describe("Escape key closes sidebar", () => {
	it("closes left sidebar on Escape", async () => {
		renderWithProvider(
			<SwipeBarLeft>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);
		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).not.toHaveAttribute("inert");

		// Focus inside sidebar then press Escape
		const insideBtn = screen.getByRole("button", { name: "Inside" });
		insideBtn.focus();
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
	});

	it("closes right sidebar on Escape", async () => {
		renderWithProvider(
			<SwipeBarRight>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarRight>,
		);
		const toggle = screen.getByRole("button", { name: /open right sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-right");
		expect(sidebar).not.toHaveAttribute("inert");

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		insideBtn.focus();
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
	});

	it("closes bottom sidebar on Escape", async () => {
		renderWithProvider(
			<SwipeBarBottom>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarBottom>,
		);
		const toggle = screen.getByRole("button", { name: /open bottom sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		expect(sidebar).not.toHaveAttribute("inert");

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		insideBtn.focus();
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});
	});

	it("does not close sidebar when focus is outside it", async () => {
		renderWithProvider(
			<>
				<button type="button">Outside</button>
				<SwipeBarLeft>
					<div>
						<button type="button">Inside</button>
					</div>
				</SwipeBarLeft>
			</>,
		);
		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).not.toHaveAttribute("inert");

		// Focus outside the sidebar
		const outsideBtn = screen.getByRole("button", { name: "Outside" });
		outsideBtn.focus();
		fireEvent.keyDown(document, { key: "Escape" });

		// Should remain open since focus is outside
		expect(sidebar).not.toHaveAttribute("inert");
	});
});

describe("Focus management", () => {
	it("focuses the first focusable child on open", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0}>
				<div>
					<button type="button">Inside button</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const insideBtn = screen.getByRole("button", { name: "Inside button" });
		await waitFor(() => {
			expect(document.activeElement).toBe(insideBtn);
		});
	});

	it("traps focus within open sidebar (Tab wraps)", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0}>
				<div>
					<button type="button">First</button>
					<button type="button">Last</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const firstBtn = screen.getByRole("button", { name: "First" });
		await waitFor(() => {
			expect(document.activeElement).toBe(firstBtn);
		});

		const lastBtn = screen.getByRole("button", { name: "Last" });
		lastBtn.focus();

		// Tab from last should wrap to first
		fireEvent.keyDown(document, { key: "Tab" });

		expect(document.activeElement).toBe(firstBtn);
	});

	it("traps focus within open sidebar (Shift+Tab wraps backwards)", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0}>
				<div>
					<button type="button">First</button>
					<button type="button">Last</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const firstBtn = screen.getByRole("button", { name: "First" });
		await waitFor(() => {
			expect(document.activeElement).toBe(firstBtn);
		});

		// Shift+Tab from first should wrap to last
		fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

		const lastBtn = screen.getByRole("button", { name: "Last" });
		expect(document.activeElement).toBe(lastBtn);
	});

	it("returns focus to toggle button on close", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} showOverlay={false}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarLeft>,
		);

		const toggle = screen.getByRole("button", { name: /open left sidebar/i });
		await userEvent.click(toggle);

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		await waitFor(() => {
			expect(document.activeElement).toBe(insideBtn);
		});

		// Close via toggle
		const closeToggle = screen.getByRole("button", { name: /close left sidebar/i });
		await userEvent.click(closeToggle);

		await waitFor(() => {
			// Focus should return to the toggle button
			const toggleBtn = screen.getByRole("button", { name: /open left sidebar/i });
			expect(document.activeElement).toBe(toggleBtn);
		});
	});

	it("focuses first focusable child in right sidebar on open", async () => {
		renderWithProvider(
			<SwipeBarRight transitionMs={0}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarRight>,
		);

		const toggle = screen.getByRole("button", { name: /open right sidebar/i });
		await userEvent.click(toggle);

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		await waitFor(() => {
			expect(document.activeElement).toBe(insideBtn);
		});
	});

	it("focuses first focusable child in bottom sidebar on open", async () => {
		renderWithProvider(
			<SwipeBarBottom transitionMs={0}>
				<div>
					<button type="button">Inside</button>
				</div>
			</SwipeBarBottom>,
		);

		const toggle = screen.getByRole("button", { name: /open bottom sidebar/i });
		await userEvent.click(toggle);

		const insideBtn = screen.getByRole("button", { name: "Inside" });
		await waitFor(() => {
			expect(document.activeElement).toBe(insideBtn);
		});
	});
});

describe("defaultOpen", () => {
	it("left sidebar renders open immediately", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});
		expect(sidebar?.style.transform).toBe("translateX(0px)");
	});

	it("right sidebar renders open immediately", async () => {
		renderWithProvider(
			<SwipeBarRight transitionMs={0} defaultOpen>
				<div>Content</div>
			</SwipeBarRight>,
		);

		const sidebar = document.getElementById("swipebar-right");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});
		expect(sidebar?.style.transform).toBe("translateX(0px)");
	});

	it("bottom sidebar renders open immediately", async () => {
		renderWithProvider(
			<SwipeBarBottom transitionMs={0} defaultOpen>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "true");
		});
		expect(sidebar?.style.transform).toBe("translateY(0px)");
	});

	it("bottom sidebar opens fully even when midAnchorPoint is enabled", async () => {
		renderWithProvider(
			<SwipeBarBottom
				transitionMs={0}
				defaultOpen
				midAnchorPoint
				sidebarHeightPx={600}
				midAnchorPointPx={200}
			>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.transform).toBe("translateY(0px)");
	});

	it("left sidebar skips transition on defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={300} defaultOpen>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});
		expect(sidebar?.style.transition).toBe("none");
	});

	it("left sidebar can still be closed after defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen showOverlay={false}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		const closeToggle = screen.getByRole("button", { name: /close left sidebar/i });
		await userEvent.click(closeToggle);

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
	});

	it("bottom sidebar can still be closed after defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarBottom transitionMs={0} defaultOpen showOverlay={false}>
				<div>Content</div>
			</SwipeBarBottom>,
		);

		const sidebar = document.getElementById("swipebar-bottom-primary");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		const closeToggle = screen.getByRole("button", { name: /close bottom sidebar/i });
		await userEvent.click(closeToggle);

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
			expect(sidebar).toHaveAttribute("aria-modal", "false");
		});
	});

	it("sidebar without defaultOpen stays closed", () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("locks body scroll when defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		await waitFor(() => {
			expect(document.body.style.overflow).toBe("hidden");
		});
	});

	it("overlay is visible when defaultOpen", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen showOverlay>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		const overlay = document.querySelector<HTMLElement>("[aria-hidden='true']");
		expect(overlay).toBeInTheDocument();
		expect(overlay?.style.pointerEvents).toBe("auto");
	});

	it("defaultOpen={false} behaves same as omitted", () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen={false}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});

	it("defaultOpen only fires once and does not re-open after close", async () => {
		renderWithProvider(
			<SwipeBarLeft transitionMs={0} defaultOpen showOverlay={false}>
				<div>Content</div>
			</SwipeBarLeft>,
		);

		const sidebar = document.getElementById("swipebar-left");
		await waitFor(() => {
			expect(sidebar).not.toHaveAttribute("inert");
		});

		// Close
		const closeToggle = screen.getByRole("button", { name: /close left sidebar/i });
		await userEvent.click(closeToggle);

		await waitFor(() => {
			expect(sidebar).toHaveAttribute("inert");
		});

		// Sidebar should stay closed — defaultOpen doesn't re-trigger
		expect(sidebar).toHaveAttribute("inert");
		expect(sidebar?.style.transform).toBe("translateX(-100%)");
	});
});
