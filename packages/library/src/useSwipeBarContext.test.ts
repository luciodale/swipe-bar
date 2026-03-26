import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode, useRef } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { SwipeBarProvider } from "./SwipeBarProvider";
import type { TBottomSidebarState, TLeftRightSidebarState } from "./swipeSidebarShared";
import { makeOptions } from "./test-utils";
import { useSwipeBarContext } from "./useSwipeBarContext";

function wrapper({ children }: { children: ReactNode }) {
	return createElement(SwipeBarProvider, null, children);
}

// Typed meta map used by runtime tests so the overloads accept `meta`
type TRuntimeMeta = {
	left: unknown;
	right: unknown;
	bottom: Record<string, unknown>;
};

// Helper: renders hook with left sidebar registered as "primary"
function setupLeft() {
	const hookResult = renderHook(
		() => {
			const ctx = useSwipeBarContext<TRuntimeMeta>();
			const sidebarRef = useRef<HTMLDivElement>(null);
			const toggleRef = useRef<HTMLDivElement>(null);
			return { ctx, sidebarRef, toggleRef };
		},
		{ wrapper },
	);

	const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

	act(() => {
		ctx.registerLeftSidebar("primary", { sidebarRef, toggleRef });
		ctx.setLeftSidebarOptionsById("primary", makeOptions());
	});

	return hookResult;
}

// Helper: renders hook with right sidebar registered as "primary"
function setupRight() {
	const hookResult = renderHook(
		() => {
			const ctx = useSwipeBarContext<TRuntimeMeta>();
			const sidebarRef = useRef<HTMLDivElement>(null);
			const toggleRef = useRef<HTMLDivElement>(null);
			return { ctx, sidebarRef, toggleRef };
		},
		{ wrapper },
	);

	const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

	act(() => {
		ctx.registerRightSidebar("primary", { sidebarRef, toggleRef });
		ctx.setRightSidebarOptionsById("primary", makeOptions());
	});

	return hookResult;
}

// ─── Runtime behaviour ───────────────────────────────────────────────

describe("meta – runtime behaviour", () => {
	describe("left/right meta", () => {
		it("defaults to null", () => {
			const { result } = renderHook(() => useSwipeBarContext(), { wrapper });
			expect(result.current.leftMeta).toBe(null);
			expect(result.current.rightMeta).toBe(null);
		});

		it("openSidebar sets leftMeta", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.openSidebar("left", { meta: { page: "home" } });
			});
			expect(result.current.ctx.leftMeta).toEqual({ page: "home" });
		});

		it("openSidebar sets rightMeta", () => {
			const { result } = setupRight();
			act(() => {
				result.current.ctx.openSidebar("right", { meta: "settings" });
			});
			expect(result.current.ctx.rightMeta).toBe("settings");
		});

		it("closeSidebar sets meta", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.closeSidebar("left", { meta: { reason: "timeout" } });
			});
			expect(result.current.ctx.leftMeta).toEqual({ reason: "timeout" });
		});

		it("preserves meta when no meta/resetMeta provided", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.openSidebar("left", { meta: "keep-me" });
			});
			expect(result.current.ctx.leftMeta).toBe("keep-me");

			act(() => {
				result.current.ctx.closeSidebar("left");
			});
			expect(result.current.ctx.leftMeta).toBe("keep-me");
		});

		it("resetMeta clears to null", () => {
			const { result } = setupRight();
			act(() => {
				result.current.ctx.openSidebar("right", { meta: "data" });
			});
			expect(result.current.ctx.rightMeta).toBe("data");

			act(() => {
				result.current.ctx.closeSidebar("right", { resetMeta: true });
			});
			expect(result.current.ctx.rightMeta).toBe(null);
		});

		it("resetMeta takes precedence over meta", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.openSidebar("left", { meta: "initial" });
			});
			act(() => {
				result.current.ctx.openSidebar("left", { meta: "ignored", resetMeta: true });
			});
			expect(result.current.ctx.leftMeta).toBe(null);
		});

		it("meta overwritten by new value", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.openSidebar("left", { meta: "first" });
			});
			act(() => {
				result.current.ctx.openSidebar("left", { meta: "second" });
			});
			expect(result.current.ctx.leftMeta).toBe("second");
		});
	});

	describe("bottom meta", () => {
		function setupBottom() {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const sidebarRef = useRef<HTMLDivElement>(null);
					const toggleRef = useRef<HTMLDivElement>(null);
					return { ctx, sidebarRef, toggleRef };
				},
				{ wrapper },
			);

			const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

			act(() => {
				ctx.registerBottomSidebar("sheet", { sidebarRef, toggleRef });
				ctx.setBottomSidebarOptionsById("sheet", makeOptions());
			});

			return hookResult;
		}

		it("defaults to null on registration", () => {
			const { result } = setupBottom();
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe(null);
		});

		it("openSidebar sets bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebar("bottom", { id: "sheet", meta: { type: "confirm" } });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toEqual({ type: "confirm" });
		});

		it("closeSidebar sets bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.closeSidebar("bottom", { id: "sheet", meta: "closing-data" });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe("closing-data");
		});

		it("preserves bottom meta when no meta/resetMeta provided", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebar("bottom", { id: "sheet", meta: "keep" });
			});
			act(() => {
				result.current.ctx.closeSidebar("bottom", { id: "sheet" });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe("keep");
		});

		it("resetMeta clears bottom meta to null", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebar("bottom", { id: "sheet", meta: "data" });
			});
			act(() => {
				result.current.ctx.closeSidebar("bottom", { id: "sheet", resetMeta: true });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe(null);
		});

		it("unregister removes bottom entry including meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebar("bottom", { id: "sheet", meta: "gone" });
			});
			act(() => {
				result.current.ctx.unregisterBottomSidebar("sheet");
			});
			expect(result.current.ctx.bottomSidebars.sheet).toBeUndefined();
		});

		it("openSidebarToMidAnchor sets bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebarToMidAnchor("bottom", { id: "sheet", meta: "mid" });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe("mid");
		});

		it("openSidebarFully sets bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.openSidebarFully("bottom", { id: "sheet", meta: "full" });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe("full");
		});
	});
});

describe("setMeta – runtime behaviour", () => {
	describe("left/right", () => {
		it("setMeta('left', value) sets leftMeta", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.setMeta("left", { page: "profile" });
			});
			expect(result.current.ctx.leftMeta).toEqual({ page: "profile" });
		});

		it("setMeta('right', value) sets rightMeta", () => {
			const { result } = setupRight();
			act(() => {
				result.current.ctx.setMeta("right", 42);
			});
			expect(result.current.ctx.rightMeta).toBe(42);
		});

		it("setMeta('left', null) clears leftMeta", () => {
			const { result } = setupLeft();
			act(() => {
				result.current.ctx.setMeta("left", "initial");
			});
			expect(result.current.ctx.leftMeta).toBe("initial");
			act(() => {
				result.current.ctx.setMeta("left", null);
			});
			expect(result.current.ctx.leftMeta).toBe(null);
		});

		it("setMeta('right', null) clears rightMeta", () => {
			const { result } = setupRight();
			act(() => {
				result.current.ctx.setMeta("right", "initial");
			});
			expect(result.current.ctx.rightMeta).toBe("initial");
			act(() => {
				result.current.ctx.setMeta("right", null);
			});
			expect(result.current.ctx.rightMeta).toBe(null);
		});
	});

	describe("bottom", () => {
		function setupBottom() {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const sidebarRef = useRef<HTMLDivElement>(null);
					const toggleRef = useRef<HTMLDivElement>(null);
					return { ctx, sidebarRef, toggleRef };
				},
				{ wrapper },
			);

			const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

			act(() => {
				ctx.registerBottomSidebar("sheet", { sidebarRef, toggleRef });
				ctx.setBottomSidebarOptionsById("sheet", makeOptions());
			});

			return hookResult;
		}

		it("setMeta('bottom', { id, meta }) sets bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.setMeta("bottom", { id: "sheet", meta: { filter: "active" } });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toEqual({ filter: "active" });
		});

		it("setMeta('bottom', { id, meta: null }) clears bottom meta", () => {
			const { result } = setupBottom();
			act(() => {
				result.current.ctx.setMeta("bottom", { id: "sheet", meta: "data" });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe("data");
			act(() => {
				result.current.ctx.setMeta("bottom", { id: "sheet", meta: null });
			});
			expect(result.current.ctx.bottomSidebars.sheet.meta).toBe(null);
		});
	});
});

// ─── resetMetaOnClose ─────────────────────────────────────────────────

describe("resetMetaOnClose", () => {
	it("left: meta resets on close when option set", () => {
		const { result } = setupLeft();

		// Set options with resetMetaOnClose
		act(() => {
			result.current.ctx.setLeftSidebarOptionsById(
				"primary",
				makeOptions({ resetMetaOnClose: true }),
			);
		});

		// Open with meta
		act(() => {
			result.current.ctx.openSidebar("left", { meta: "keep" });
		});
		expect(result.current.ctx.leftMeta).toBe("keep");

		// Close without explicit meta/resetMeta — should auto-reset
		act(() => {
			result.current.ctx.closeSidebar("left");
		});
		expect(result.current.ctx.leftMeta).toBe(null);
	});

	it("right: meta resets on close when option set", () => {
		const { result } = setupRight();

		act(() => {
			result.current.ctx.setRightSidebarOptionsById(
				"primary",
				makeOptions({ resetMetaOnClose: true }),
			);
		});

		act(() => {
			result.current.ctx.openSidebar("right", { meta: 42 });
		});
		expect(result.current.ctx.rightMeta).toBe(42);

		act(() => {
			result.current.ctx.closeSidebar("right");
		});
		expect(result.current.ctx.rightMeta).toBe(null);
	});

	it("bottom: meta resets on close when option set", () => {
		const hookResult = renderHook(
			() => {
				const ctx = useSwipeBarContext<TRuntimeMeta>();
				const sidebarRef = useRef<HTMLDivElement>(null);
				const toggleRef = useRef<HTMLDivElement>(null);
				return { ctx, sidebarRef, toggleRef };
			},
			{ wrapper },
		);

		const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

		act(() => {
			ctx.registerBottomSidebar("sheet", { sidebarRef, toggleRef });
			ctx.setBottomSidebarOptionsById("sheet", makeOptions({ resetMetaOnClose: true }));
		});

		act(() => {
			hookResult.result.current.ctx.openSidebar("bottom", { id: "sheet", meta: "data" });
		});
		expect(hookResult.result.current.ctx.bottomSidebars.sheet.meta).toBe("data");

		act(() => {
			hookResult.result.current.ctx.closeSidebar("bottom", { id: "sheet" });
		});
		expect(hookResult.result.current.ctx.bottomSidebars.sheet.meta).toBe(null);
	});

	it("explicit meta in closeSidebar opts overrides resetMetaOnClose", () => {
		const { result } = setupLeft();

		act(() => {
			result.current.ctx.setLeftSidebarOptionsById(
				"primary",
				makeOptions({ resetMetaOnClose: true }),
			);
		});

		act(() => {
			result.current.ctx.openSidebar("left", { meta: "initial" });
		});

		// Explicit meta should take precedence — no auto-reset
		act(() => {
			result.current.ctx.closeSidebar("left", { meta: "override" });
		});
		expect(result.current.ctx.leftMeta).toBe("override");
	});

	it("explicit resetMeta: false overrides resetMetaOnClose", () => {
		const { result } = setupLeft();

		act(() => {
			result.current.ctx.setLeftSidebarOptionsById(
				"primary",
				makeOptions({ resetMetaOnClose: true }),
			);
		});

		act(() => {
			result.current.ctx.openSidebar("left", { meta: "keep-me" });
		});

		// Explicit resetMeta: false should prevent auto-reset
		act(() => {
			result.current.ctx.closeSidebar("left", { resetMeta: false });
		});
		expect(result.current.ctx.leftMeta).toBe("keep-me");
	});
});

// ─── Type-level assertions ───────────────────────────────────────────

describe("meta – type narrowing", () => {
	type TTestMap = {
		left: { page: string };
		right: number;
		bottom: {
			sheet: { action: string };
			picker: boolean;
		};
	};

	type TCtx = ReturnType<typeof useSwipeBarContext<TTestMap>>;

	// Wrapper forces TS to resolve with the default type parameter (object),
	// unlike ReturnType<typeof useSwipeBarContext> which uses the constraint.
	function _callDefault() {
		// biome-ignore lint/correctness/useHookAtTopLevel: type-level only, never called at runtime
		return useSwipeBarContext();
	}
	type TCtxDefault = ReturnType<typeof _callDefault>;

	describe("unparameterized (default)", () => {
		it("leftMeta is any", () => {
			expectTypeOf<TCtxDefault["leftMeta"]>().toBeAny();
		});

		it("rightMeta is any", () => {
			expectTypeOf<TCtxDefault["rightMeta"]>().toBeAny();
		});

		it("openSidebar('left') opts accepts any meta without generic", () => {
			const _opts: NonNullable<Parameters<TCtxDefault["openSidebar"]>[1]> = { meta: "x" };
			expect(_opts).toBeTruthy();
		});

		it("bottomSidebars is Record<string, TBottomSidebarState>", () => {
			expectTypeOf<TCtxDefault["bottomSidebars"]>().toExtend<Record<string, TBottomSidebarState>>();
		});

		it("leftSidebars is Record<string, TLeftRightSidebarState>", () => {
			expectTypeOf<TCtxDefault["leftSidebars"]>().toExtend<
				Record<string, TLeftRightSidebarState>
			>();
		});

		it("rightSidebars is Record<string, TLeftRightSidebarState>", () => {
			expectTypeOf<TCtxDefault["rightSidebars"]>().toExtend<
				Record<string, TLeftRightSidebarState>
			>();
		});
	});

	describe("parameterized", () => {
		it("leftMeta is typed | null", () => {
			expectTypeOf<TCtx["leftMeta"]>().toEqualTypeOf<{ page: string } | null>();
		});

		it("rightMeta is typed | null", () => {
			expectTypeOf<TCtx["rightMeta"]>().toEqualTypeOf<number | null>();
		});

		it("known bottom key has typed meta", () => {
			expectTypeOf<TCtx["bottomSidebars"]["sheet"]["meta"]>().toEqualTypeOf<{
				action: string;
			} | null>();
		});

		it("known bottom key (picker) has typed meta", () => {
			expectTypeOf<TCtx["bottomSidebars"]["picker"]["meta"]>().toEqualTypeOf<boolean | null>();
		});

		it("unknown bottom key falls back to TBottomSidebarState", () => {
			expectTypeOf<TCtx["bottomSidebars"]["unknown"]>().toExtend<TBottomSidebarState>();
		});
	});

	describe("setMeta", () => {
		it("setMeta is a function", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeFunction();
		});

		it("left overload accepts id-typed meta", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("left", {
				id: "page" as const,
				meta: "profile",
			});
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("left", {
				id: "page" as const,
				meta: null,
			});
		});

		it("right overload accepts number | null", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("right", 42);
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("right", null);
		});

		it("bottom overload accepts typed meta for known key", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("bottom", {
				id: "sheet" as const,
				meta: { action: "click" },
			});
		});

		it("bottom overload accepts typed meta for picker key", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("bottom", {
				id: "picker" as const,
				meta: true,
			});
		});

		it("bottom overload accepts null meta for known key", () => {
			expectTypeOf<TCtx["setMeta"]>().toBeCallableWith("bottom", {
				id: "sheet" as const,
				meta: null,
			});
		});

		it("default context setMeta exists as a function", () => {
			expectTypeOf<TCtxDefault["setMeta"]>().toBeFunction();
		});

		it("default context setMeta accepts any left value", () => {
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("left", "anything");
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("left", 123);
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("left", null);
		});

		it("default context setMeta accepts any right value", () => {
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("right", { arbitrary: true });
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("right", null);
		});

		it("default context setMeta accepts any bottom meta", () => {
			expectTypeOf<TCtxDefault["setMeta"]>().toBeCallableWith("bottom", {
				id: "any-id",
				meta: "whatever",
			});
		});
	});

	describe("sidebar fn opts", () => {
		it("openSidebar('left') opts accepts typed meta with id", () => {
			type TLeftOpts = Parameters<TCtx["openSidebar"]>[1];
			expectTypeOf<{ id: "page"; meta?: string; resetMeta?: boolean }>().toExtend<
				NonNullable<TLeftOpts>
			>();
		});

		it("closeSidebar('right') opts accepts typed meta", () => {
			type TRightOpts = Parameters<TCtx["closeSidebar"]>[1];
			expectTypeOf<{ meta?: number; resetMeta?: boolean }>().toExtend<NonNullable<TRightOpts>>();
		});
	});
});

// ─── Multi-instance left/right ───────────────────────────────────────

describe("multi-instance left/right", () => {
	function setupMultiLeft() {
		const hookResult = renderHook(
			() => {
				const ctx = useSwipeBarContext<TRuntimeMeta>();
				const navSidebarRef = useRef<HTMLDivElement>(null);
				const navToggleRef = useRef<HTMLDivElement>(null);
				const settingsSidebarRef = useRef<HTMLDivElement>(null);
				const settingsToggleRef = useRef<HTMLDivElement>(null);
				return {
					ctx,
					navSidebarRef,
					navToggleRef,
					settingsSidebarRef,
					settingsToggleRef,
				};
			},
			{ wrapper },
		);

		const { ctx, navSidebarRef, navToggleRef, settingsSidebarRef, settingsToggleRef } =
			hookResult.result.current;

		act(() => {
			ctx.registerLeftSidebar("nav", {
				sidebarRef: navSidebarRef,
				toggleRef: navToggleRef,
			});
			ctx.setLeftSidebarOptionsById("nav", makeOptions());
			ctx.registerLeftSidebar("settings", {
				sidebarRef: settingsSidebarRef,
				toggleRef: settingsToggleRef,
			});
			ctx.setLeftSidebarOptionsById("settings", makeOptions());
		});

		return hookResult;
	}

	function setupMultiRight() {
		const hookResult = renderHook(
			() => {
				const ctx = useSwipeBarContext<TRuntimeMeta>();
				const panelASidebarRef = useRef<HTMLDivElement>(null);
				const panelAToggleRef = useRef<HTMLDivElement>(null);
				const panelBSidebarRef = useRef<HTMLDivElement>(null);
				const panelBToggleRef = useRef<HTMLDivElement>(null);
				return {
					ctx,
					panelASidebarRef,
					panelAToggleRef,
					panelBSidebarRef,
					panelBToggleRef,
				};
			},
			{ wrapper },
		);

		const { ctx, panelASidebarRef, panelAToggleRef, panelBSidebarRef, panelBToggleRef } =
			hookResult.result.current;

		act(() => {
			ctx.registerRightSidebar("panel-a", {
				sidebarRef: panelASidebarRef,
				toggleRef: panelAToggleRef,
			});
			ctx.setRightSidebarOptionsById("panel-a", makeOptions());
			ctx.registerRightSidebar("panel-b", {
				sidebarRef: panelBSidebarRef,
				toggleRef: panelBToggleRef,
			});
			ctx.setRightSidebarOptionsById("panel-b", makeOptions());
		});

		return hookResult;
	}

	describe("registration & state", () => {
		it("registering a left sidebar creates entry in leftSidebars", () => {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const sidebarRef = useRef<HTMLDivElement>(null);
					const toggleRef = useRef<HTMLDivElement>(null);
					return { ctx, sidebarRef, toggleRef };
				},
				{ wrapper },
			);

			const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

			act(() => {
				ctx.registerLeftSidebar("nav", { sidebarRef, toggleRef });
			});

			expect(hookResult.result.current.ctx.leftSidebars.nav).toBeDefined();
			expect(hookResult.result.current.ctx.leftSidebars.nav.isOpen).toBe(false);
			expect(hookResult.result.current.ctx.leftSidebars.nav.meta).toBe(null);
		});

		it("registering two left sidebars creates independent entries", () => {
			const { result } = setupMultiLeft();

			expect(result.current.ctx.leftSidebars.nav).toBeDefined();
			expect(result.current.ctx.leftSidebars.settings).toBeDefined();
			expect(result.current.ctx.leftSidebars.nav).not.toBe(
				result.current.ctx.leftSidebars.settings,
			);
		});

		it("unregistering removes entry from leftSidebars", () => {
			const { result } = setupMultiLeft();

			expect(result.current.ctx.leftSidebars.nav).toBeDefined();

			act(() => {
				result.current.ctx.unregisterLeftSidebar("nav");
			});

			expect(result.current.ctx.leftSidebars.nav).toBeUndefined();
			expect(result.current.ctx.leftSidebars.settings).toBeDefined();
		});

		it("registering a right sidebar creates entry in rightSidebars", () => {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const sidebarRef = useRef<HTMLDivElement>(null);
					const toggleRef = useRef<HTMLDivElement>(null);
					return { ctx, sidebarRef, toggleRef };
				},
				{ wrapper },
			);

			const { ctx, sidebarRef, toggleRef } = hookResult.result.current;

			act(() => {
				ctx.registerRightSidebar("panel-a", { sidebarRef, toggleRef });
			});

			expect(hookResult.result.current.ctx.rightSidebars["panel-a"]).toBeDefined();
			expect(hookResult.result.current.ctx.rightSidebars["panel-a"].isOpen).toBe(false);
			expect(hookResult.result.current.ctx.rightSidebars["panel-a"].meta).toBe(null);
		});

		it("unregistering removes entry from rightSidebars", () => {
			const { result } = setupMultiRight();

			expect(result.current.ctx.rightSidebars["panel-a"]).toBeDefined();

			act(() => {
				result.current.ctx.unregisterRightSidebar("panel-a");
			});

			expect(result.current.ctx.rightSidebars["panel-a"]).toBeUndefined();
			expect(result.current.ctx.rightSidebars["panel-b"]).toBeDefined();
		});
	});

	describe("open/close independence", () => {
		it("opening left nav meta does not affect left settings meta", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: "nav-data" });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toBe("nav-data");
			expect(result.current.ctx.leftSidebars.settings.meta).toBe(null);
		});

		it("opening left nav and left settings independently, both receive meta", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: "nav-meta" });
			});
			act(() => {
				result.current.ctx.openSidebar("left", { id: "settings", meta: "settings-meta" });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toBe("nav-meta");
			expect(result.current.ctx.leftSidebars.settings.meta).toBe("settings-meta");
		});

		it("closing left nav with resetMeta does not affect left settings meta", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: "nav-data" });
			});
			act(() => {
				result.current.ctx.openSidebar("left", { id: "settings", meta: "settings-data" });
			});
			act(() => {
				result.current.ctx.closeSidebar("left", { id: "nav", resetMeta: true });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toBe(null);
			expect(result.current.ctx.leftSidebars.settings.meta).toBe("settings-data");
		});

		it("opening right panel-a meta does not affect right panel-b meta", () => {
			const { result } = setupMultiRight();

			act(() => {
				result.current.ctx.openSidebar("right", { id: "panel-a", meta: "a-data" });
			});

			expect(result.current.ctx.rightSidebars["panel-a"].meta).toBe("a-data");
			expect(result.current.ctx.rightSidebars["panel-b"].meta).toBe(null);
		});

		it("closing right panel-a with resetMeta does not affect right panel-b meta", () => {
			const { result } = setupMultiRight();

			act(() => {
				result.current.ctx.openSidebar("right", { id: "panel-a", meta: "a-data" });
			});
			act(() => {
				result.current.ctx.openSidebar("right", { id: "panel-b", meta: "b-data" });
			});
			act(() => {
				result.current.ctx.closeSidebar("right", { id: "panel-a", resetMeta: true });
			});

			expect(result.current.ctx.rightSidebars["panel-a"].meta).toBe(null);
			expect(result.current.ctx.rightSidebars["panel-b"].meta).toBe("b-data");
		});
	});

	describe("per-instance meta", () => {
		it("openSidebar sets meta on specific left instance by id", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: { route: "/home" } });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toEqual({ route: "/home" });
		});

		it("openSidebar sets meta on specific right instance by id", () => {
			const { result } = setupMultiRight();

			act(() => {
				result.current.ctx.openSidebar("right", { id: "panel-b", meta: 99 });
			});

			expect(result.current.ctx.rightSidebars["panel-b"].meta).toBe(99);
		});

		it("meta on one left instance does not affect another", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: "nav-only" });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toBe("nav-only");
			expect(result.current.ctx.leftSidebars.settings.meta).toBe(null);
		});

		it("closeSidebar with resetMeta only resets targeted instance", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { id: "nav", meta: "nav-m" });
			});
			act(() => {
				result.current.ctx.openSidebar("left", { id: "settings", meta: "settings-m" });
			});
			act(() => {
				result.current.ctx.closeSidebar("left", { id: "settings", resetMeta: true });
			});

			expect(result.current.ctx.leftSidebars.nav.meta).toBe("nav-m");
			expect(result.current.ctx.leftSidebars.settings.meta).toBe(null);
		});

		it("setMeta with id targets specific left instance", () => {
			const { result } = setupMultiLeft();

			act(() => {
				result.current.ctx.setMeta("left", { id: "settings", meta: "targeted" });
			});

			expect(result.current.ctx.leftSidebars.settings.meta).toBe("targeted");
			expect(result.current.ctx.leftSidebars.nav.meta).toBe(null);
		});

		it("setMeta with id targets specific right instance", () => {
			const { result } = setupMultiRight();

			act(() => {
				result.current.ctx.setMeta("right", { id: "panel-a", meta: "targeted-right" });
			});

			expect(result.current.ctx.rightSidebars["panel-a"].meta).toBe("targeted-right");
			expect(result.current.ctx.rightSidebars["panel-b"].meta).toBe(null);
		});
	});

	describe("backwards compatibility", () => {
		it("isLeftOpen reflects primary instance state", () => {
			const { result } = setupLeft();
			expect(result.current.ctx.isLeftOpen).toBe(false);
		});

		it("isRightOpen reflects primary instance state", () => {
			const { result } = setupRight();
			expect(result.current.ctx.isRightOpen).toBe(false);
		});

		it("leftMeta reflects primary instance meta", () => {
			const { result } = setupLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { meta: "primary-meta" });
			});

			expect(result.current.ctx.leftMeta).toBe("primary-meta");
		});

		it("rightMeta reflects primary instance meta", () => {
			const { result } = setupRight();

			act(() => {
				result.current.ctx.openSidebar("right", { meta: "primary-right" });
			});

			expect(result.current.ctx.rightMeta).toBe("primary-right");
		});

		it("openSidebar left without id targets primary", () => {
			const { result } = setupLeft();

			act(() => {
				result.current.ctx.openSidebar("left", { meta: "no-id" });
			});

			expect(result.current.ctx.leftSidebars.primary.meta).toBe("no-id");
			expect(result.current.ctx.leftMeta).toBe("no-id");
		});

		it("closeSidebar right without id targets primary", () => {
			const { result } = setupRight();

			act(() => {
				result.current.ctx.openSidebar("right", { meta: "before-close" });
			});
			act(() => {
				result.current.ctx.closeSidebar("right", { resetMeta: true });
			});

			expect(result.current.ctx.rightSidebars.primary.meta).toBe(null);
			expect(result.current.ctx.rightMeta).toBe(null);
		});
	});

	describe("cross-instance independence", () => {
		it("left instance nav meta does not affect any right instance", () => {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const leftSidebarRef = useRef<HTMLDivElement>(null);
					const leftToggleRef = useRef<HTMLDivElement>(null);
					const rightSidebarRef = useRef<HTMLDivElement>(null);
					const rightToggleRef = useRef<HTMLDivElement>(null);
					return {
						ctx,
						leftSidebarRef,
						leftToggleRef,
						rightSidebarRef,
						rightToggleRef,
					};
				},
				{ wrapper },
			);

			const { ctx, leftSidebarRef, leftToggleRef, rightSidebarRef, rightToggleRef } =
				hookResult.result.current;

			act(() => {
				ctx.registerLeftSidebar("nav", {
					sidebarRef: leftSidebarRef,
					toggleRef: leftToggleRef,
				});
				ctx.setLeftSidebarOptionsById("nav", makeOptions());
				ctx.registerRightSidebar("panel", {
					sidebarRef: rightSidebarRef,
					toggleRef: rightToggleRef,
				});
				ctx.setRightSidebarOptionsById("panel", makeOptions());
			});

			act(() => {
				hookResult.result.current.ctx.openSidebar("left", { id: "nav", meta: "left-nav" });
			});

			expect(hookResult.result.current.ctx.leftSidebars.nav.meta).toBe("left-nav");
			expect(hookResult.result.current.ctx.rightSidebars.panel.meta).toBe(null);
		});

		it("bottom instance meta does not affect left instances", () => {
			const hookResult = renderHook(
				() => {
					const ctx = useSwipeBarContext<TRuntimeMeta>();
					const leftSidebarRef = useRef<HTMLDivElement>(null);
					const leftToggleRef = useRef<HTMLDivElement>(null);
					const bottomSidebarRef = useRef<HTMLDivElement>(null);
					const bottomToggleRef = useRef<HTMLDivElement>(null);
					return {
						ctx,
						leftSidebarRef,
						leftToggleRef,
						bottomSidebarRef,
						bottomToggleRef,
					};
				},
				{ wrapper },
			);

			const { ctx, leftSidebarRef, leftToggleRef, bottomSidebarRef, bottomToggleRef } =
				hookResult.result.current;

			act(() => {
				ctx.registerLeftSidebar("nav", {
					sidebarRef: leftSidebarRef,
					toggleRef: leftToggleRef,
				});
				ctx.setLeftSidebarOptionsById("nav", makeOptions());
				ctx.registerBottomSidebar("sheet", {
					sidebarRef: bottomSidebarRef,
					toggleRef: bottomToggleRef,
				});
				ctx.setBottomSidebarOptionsById("sheet", makeOptions());
			});

			act(() => {
				hookResult.result.current.ctx.openSidebar("bottom", {
					id: "sheet",
					meta: "bottom-data",
				});
			});

			expect(hookResult.result.current.ctx.bottomSidebars.sheet.meta).toBe("bottom-data");
			expect(hookResult.result.current.ctx.leftSidebars.nav.meta).toBe(null);
		});
	});
});
