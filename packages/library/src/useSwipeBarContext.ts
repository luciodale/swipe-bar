import { useContext } from "react";
import { SwipeSidebarContext, type TSwipeSidebarContextInternal } from "./SwipeBarProvider";
import type { TBottomSidebarState, TSidebarMetaMap } from "./swipeSidebarShared";

type TLeftRightOpts<TMap extends TSidebarMetaMap, S extends "left" | "right"> = S extends keyof TMap
	? { meta?: TMap[S]; resetMeta?: boolean }
	: { resetMeta?: boolean };

type TSidebarFn<TMap extends TSidebarMetaMap> = {
	(side: "left", opts?: TLeftRightOpts<TMap, "left">): void;
	(side: "right", opts?: TLeftRightOpts<TMap, "right">): void;
	<K extends string & keyof NonNullable<TMap["bottom"]>>(
		side: "bottom",
		opts: { id: K; meta?: NonNullable<TMap["bottom"]>[K]; resetMeta?: boolean },
	): void;
	(side: "bottom", opts?: { id?: string; resetMeta?: boolean }): void;
};

type TTypedBottomSidebars<TMap extends TSidebarMetaMap> = TMap["bottom"] extends Record<
	string,
	unknown
>
	? {
			[K in keyof TMap["bottom"]]: TBottomSidebarState & { meta: TMap["bottom"][K] | null };
		} & Record<string, TBottomSidebarState>
	: Record<string, TBottomSidebarState>;

type TSwipeSidebarContext<TMap extends TSidebarMetaMap = object> = Omit<
	TSwipeSidebarContextInternal,
	| "openSidebar"
	| "closeSidebar"
	| "openSidebarFully"
	| "openSidebarToMidAnchor"
	| "bottomSidebars"
	| "leftMeta"
	| "rightMeta"
> & {
	openSidebar: TSidebarFn<TMap>;
	closeSidebar: TSidebarFn<TMap>;
	openSidebarFully: TSidebarFn<TMap>;
	openSidebarToMidAnchor: TSidebarFn<TMap>;
	bottomSidebars: TTypedBottomSidebars<TMap>;
	leftMeta: "left" extends keyof TMap ? TMap["left"] | null : null;
	rightMeta: "right" extends keyof TMap ? TMap["right"] | null : null;
};

export function useSwipeBarContext<TMap extends TSidebarMetaMap = object>() {
	const context = useContext(SwipeSidebarContext);
	if (!context) {
		throw new Error("useSwipeBarContext must be used within SwipeBarProvider");
	}
	return context as unknown as TSwipeSidebarContext<TMap>;
}
