import { useContext } from "react";
import { SwipeSidebarContext, type TSwipeSidebarContextInternal } from "./SwipeBarProvider";
import type {
	TBottomSidebarState,
	TLeftRightSidebarState,
	TSidebarMetaMap,
	TSidebarSide,
} from "./swipeSidebarShared";

type TLeftRightOpts<TMap extends TSidebarMetaMap, S extends "left" | "right"> = S extends keyof TMap
	? TMap[S] extends Record<string, unknown>
		?
				| {
						[K in string & keyof TMap[S]]: {
							id: K;
							meta?: TMap[S][K];
							resetMeta?: boolean;
							skipTransition?: boolean;
						};
				  }[string & keyof TMap[S]]
				| { id?: string; meta?: never; resetMeta?: boolean; skipTransition?: boolean }
		: { id?: string; meta?: TMap[S]; resetMeta?: boolean; skipTransition?: boolean }
	: // biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
		{ id?: string; meta?: any; resetMeta?: boolean; skipTransition?: boolean };

type TBottomSidebarOpts<TMap extends TSidebarMetaMap> =
	TMap["bottom"] extends Record<string, unknown>
		?
				| {
						[K in string & keyof TMap["bottom"]]: {
							id: K;
							meta?: TMap["bottom"][K];
							resetMeta?: boolean;
							skipTransition?: boolean;
						};
				  }[string & keyof TMap["bottom"]]
				| { id?: string; meta?: never; resetMeta?: boolean; skipTransition?: boolean }
		: // biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
			{ id?: string; meta?: any; resetMeta?: boolean; skipTransition?: boolean };

type TSidebarCallOpts<TMap extends TSidebarMetaMap, S extends TSidebarSide> = S extends "left"
	? TLeftRightOpts<TMap, "left">
	: S extends "right"
		? TLeftRightOpts<TMap, "right">
		: TBottomSidebarOpts<TMap>;

type TSidebarFn<TMap extends TSidebarMetaMap> = <S extends TSidebarSide>(
	side: S,
	opts?: TSidebarCallOpts<TMap, S>,
) => void;

type TLeftRightSetMeta<
	TMap extends TSidebarMetaMap,
	S extends "left" | "right",
> = S extends keyof TMap
	? TMap[S] extends Record<string, unknown>
		?
				| {
						[K in string & keyof TMap[S]]: {
							id: K;
							meta: TMap[S][K] | null;
						};
				  }[string & keyof TMap[S]]
				| { id: string; meta: never }
		: TMap[S] | null
	: // biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
		any;

type TBottomSetMetaOpts<TMap extends TSidebarMetaMap> =
	TMap["bottom"] extends Record<string, unknown>
		?
				| {
						[K in string & keyof TMap["bottom"]]: {
							id: K;
							meta: TMap["bottom"][K] | null;
						};
				  }[string & keyof TMap["bottom"]]
				| { id: string; meta: never }
		: // biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
			{ id: string; meta: any };

type TSetMetaCallArg<TMap extends TSidebarMetaMap, S extends TSidebarSide> = S extends "left"
	? TLeftRightSetMeta<TMap, "left">
	: S extends "right"
		? TLeftRightSetMeta<TMap, "right">
		: TBottomSetMetaOpts<TMap>;

type TSetMetaFn<TMap extends TSidebarMetaMap> = <S extends TSidebarSide>(
	side: S,
	metaOrOpts: TSetMetaCallArg<TMap, S>,
) => void;

// Sidebar entries are populated lazily by registerLeftSidebar / registerRightSidebar /
// registerBottomSidebar after the matching SwipeBar* component mounts. Until that runs,
// the entry is missing — so typed access must reflect that lookups can be undefined.
type TTypedLeftRightSidebars<
	TMap extends TSidebarMetaMap,
	S extends "left" | "right",
> = S extends keyof TMap
	? TMap[S] extends Record<string, unknown>
		? {
				[K in keyof TMap[S]]?: TLeftRightSidebarState & {
					meta: TMap[S][K] | null;
				};
			} & Record<string, TLeftRightSidebarState | undefined>
		: Record<string, TLeftRightSidebarState | undefined>
	: Record<string, TLeftRightSidebarState | undefined>;

type TTypedBottomSidebars<TMap extends TSidebarMetaMap> =
	TMap["bottom"] extends Record<string, unknown>
		? {
				[K in keyof TMap["bottom"]]?: TBottomSidebarState & {
					meta: TMap["bottom"][K] | null;
				};
			} & Record<string, TBottomSidebarState | undefined>
		: Record<string, TBottomSidebarState | undefined>;

type TSwipeSidebarContext<TMap extends TSidebarMetaMap = object> = Omit<
	TSwipeSidebarContextInternal,
	| "openSidebar"
	| "closeSidebar"
	| "openSidebarFully"
	| "openSidebarToMidAnchor"
	| "setMeta"
	| "leftSidebars"
	| "rightSidebars"
	| "bottomSidebars"
	| "leftMeta"
	| "rightMeta"
> & {
	openSidebar: TSidebarFn<TMap>;
	closeSidebar: TSidebarFn<TMap>;
	openSidebarFully: TSidebarFn<TMap>;
	openSidebarToMidAnchor: TSidebarFn<TMap>;
	setMeta: TSetMetaFn<TMap>;
	leftSidebars: TTypedLeftRightSidebars<TMap, "left">;
	rightSidebars: TTypedLeftRightSidebars<TMap, "right">;
	bottomSidebars: TTypedBottomSidebars<TMap>;
	// biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
	leftMeta: "left" extends keyof TMap ? TMap["left"] | null : any;
	// biome-ignore lint/suspicious/noExplicitAny: permissive when unparameterized
	rightMeta: "right" extends keyof TMap ? TMap["right"] | null : any;
};

export function useSwipeBarContext<TMap extends TSidebarMetaMap = object>() {
	const context = useContext(SwipeSidebarContext);
	if (!context) {
		throw new Error("useSwipeBarContext must be used within SwipeBarProvider");
	}
	return context as unknown as TSwipeSidebarContext<TMap>;
}
