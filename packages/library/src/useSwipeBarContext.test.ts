import { act, renderHook } from "@testing-library/react";
import { type ReactNode, createElement, useRef } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { SwipeBarProvider } from "./SwipeBarProvider";
import type { TBottomSidebarState } from "./swipeSidebarShared";
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

// ─── Runtime behaviour ───────────────────────────────────────────────

describe("meta – runtime behaviour", () => {
	describe("left/right meta", () => {
		it("defaults to null", () => {
			const { result } = renderHook(() => useSwipeBarContext(), { wrapper });
			expect(result.current.leftMeta).toBe(null);
			expect(result.current.rightMeta).toBe(null);
		});

		it("openSidebar sets leftMeta", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("left", { meta: { page: "home" } });
			});
			expect(result.current.leftMeta).toEqual({ page: "home" });
		});

		it("openSidebar sets rightMeta", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("right", { meta: "settings" });
			});
			expect(result.current.rightMeta).toBe("settings");
		});

		it("closeSidebar sets meta", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.closeSidebar("left", { meta: { reason: "timeout" } });
			});
			expect(result.current.leftMeta).toEqual({ reason: "timeout" });
		});

		it("preserves meta when no meta/resetMeta provided", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("left", { meta: "keep-me" });
			});
			expect(result.current.leftMeta).toBe("keep-me");

			act(() => {
				result.current.closeSidebar("left");
			});
			expect(result.current.leftMeta).toBe("keep-me");
		});

		it("resetMeta clears to null", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("right", { meta: "data" });
			});
			expect(result.current.rightMeta).toBe("data");

			act(() => {
				result.current.closeSidebar("right", { resetMeta: true });
			});
			expect(result.current.rightMeta).toBe(null);
		});

		it("resetMeta takes precedence over meta", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("left", { meta: "initial" });
			});
			act(() => {
				result.current.openSidebar("left", { meta: "ignored", resetMeta: true });
			});
			expect(result.current.leftMeta).toBe(null);
		});

		it("meta overwritten by new value", () => {
			const { result } = renderHook(() => useSwipeBarContext<TRuntimeMeta>(), { wrapper });
			act(() => {
				result.current.openSidebar("left", { meta: "first" });
			});
			act(() => {
				result.current.openSidebar("left", { meta: "second" });
			});
			expect(result.current.leftMeta).toBe("second");
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
		return useSwipeBarContext();
	}
	type TCtxDefault = ReturnType<typeof _callDefault>;

	describe("unparameterized (default)", () => {
		it("leftMeta is null (assignment check)", () => {
			// tsc verifies: TCtxDefault["leftMeta"] is assignable to null and vice versa
			const _toNull: null = null as TCtxDefault["leftMeta"];
			const _fromNull: TCtxDefault["leftMeta"] = null;
			expect(_toNull).toBe(null);
			expect(_fromNull).toBe(null);
		});

		it("rightMeta is null (assignment check)", () => {
			const _toNull: null = null as TCtxDefault["rightMeta"];
			const _fromNull: TCtxDefault["rightMeta"] = null;
			expect(_toNull).toBe(null);
			expect(_fromNull).toBe(null);
		});

		it("openSidebar('left') opts does not accept meta", () => {
			// @ts-expect-error — meta not allowed without generic
			const _opts: Parameters<TCtxDefault["openSidebar"]>[1] = { meta: "x" };
			expect(_opts).toBeTruthy();
		});

		it("bottomSidebars is Record<string, TBottomSidebarState>", () => {
			expectTypeOf<TCtxDefault["bottomSidebars"]>().toExtend<
				Record<string, TBottomSidebarState>
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

	describe("function overload opts", () => {
		it("openSidebar('left') opts accepts typed meta", () => {
			type TLeftOpts = Parameters<TCtx["openSidebar"]>[1];
			expectTypeOf<{ meta?: { page: string }; resetMeta?: boolean }>().toExtend<
				NonNullable<TLeftOpts>
			>();
		});

		it("closeSidebar('right') opts accepts typed meta", () => {
			type TRightOpts = Parameters<TCtx["closeSidebar"]>[1];
			expectTypeOf<{ meta?: number; resetMeta?: boolean }>().toExtend<
				NonNullable<TRightOpts>
			>();
		});
	});
});
