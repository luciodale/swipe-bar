import { type RefObject, useCallback, useRef } from "react";
import {
	applyContentDragOffset,
	applyContentOffset,
	applyContentOffsetImmediate,
	clearContentOffset,
	collapseClosedPushPane,
	type TContentPush,
	type TPushSide,
} from "./contentPush";
import { isViewportSmall, type TSwipeBarOptions } from "./swipeSidebarShared";

type TPushOwner = {
	side: TPushSide;
	id: string;
};

type TPushTarget = {
	side: TPushSide;
	id: string;
	options: Required<TSwipeBarOptions>;
};

type TReleasePush = {
	side: TPushSide;
	id: string;
	paneRef: RefObject<HTMLDivElement | null>;
	transitionMs: number;
	immediate: boolean;
};

const MISSING_CONTENT_WARNING =
	'[swipe-bar] smallScreenMode="push" needs a registered content element ' +
	"(SwipeBarContent or useSwipeBarContentRef). Falling back to overlay.";

// Owns the single pushed content element of a provider. The first pane that
// pushes owns it until that pane closes; other panes float over it.
export function useContentPush() {
	const contentElRef = useRef<HTMLElement | null>(null);
	const ownerRef = useRef<TPushOwner | null>(null);
	const generationRef = useRef(0);
	const warnedRef = useRef(new Set<string>());

	const registerContent = useCallback((el: HTMLElement | null) => {
		if (!el && contentElRef.current) clearContentOffset(contentElRef.current);
		if (!el) ownerRef.current = null;
		contentElRef.current = el;
	}, []);

	const getOwnedPush = useCallback((side: TPushSide, id: string): TContentPush | null => {
		const owner = ownerRef.current;
		const el = contentElRef.current;
		if (!owner || !el || owner.side !== side || owner.id !== id) return null;
		return { el, side };
	}, []);

	// The pane's push if it owns one, otherwise takes ownership when eligible.
	const acquirePush = useCallback(
		({ side, id, options }: TPushTarget): TContentPush | null => {
			if (ownerRef.current) return getOwnedPush(side, id);
			if (options.smallScreenMode !== "push") return null;
			if (options.isAbsolute || !isViewportSmall(options.mediaQueryWidth)) return null;

			const el = contentElRef.current;
			if (!el) {
				const key = `${side}:${id}`;
				if (!warnedRef.current.has(key)) {
					warnedRef.current.add(key);
					console.warn(MISSING_CONTENT_WARNING);
				}
				return null;
			}
			ownerRef.current = { side, id };
			generationRef.current += 1;
			return { el, side };
		},
		[getOwnedPush],
	);

	const pushContentOpen = useCallback(
		(push: TContentPush, options: Required<TSwipeBarOptions>, immediate: boolean) => {
			if (immediate) applyContentOffsetImmediate(push, options.sidebarWidthPx);
			else applyContentOffset(push, options.sidebarWidthPx, options.transitionMs);
		},
		[],
	);

	const pushContentDrag = useCallback((push: TContentPush, visibleWidthPx: number) => {
		applyContentDragOffset(push, visibleWidthPx);
	}, []);

	const releasePush = useCallback(
		({ side, id, paneRef, transitionMs, immediate }: TReleasePush) => {
			const push = getOwnedPush(side, id);
			if (!push) return;
			ownerRef.current = null;
			const generation = generationRef.current;

			function settle() {
				if (!push) return;
				collapseClosedPushPane(paneRef, side);
				// A newer push took the content meanwhile; it owns the transform now.
				if (generationRef.current !== generation) return;
				clearContentOffset(push.el);
			}

			if (immediate || transitionMs <= 0) {
				applyContentOffsetImmediate(push, 0);
				settle();
				return;
			}
			applyContentOffset(push, 0, transitionMs);
			setTimeout(settle, transitionMs);
		},
		[getOwnedPush],
	);

	const releasePushOnUnmount = useCallback(
		(side: TPushSide, id: string) => {
			const push = getOwnedPush(side, id);
			if (!push) return;
			ownerRef.current = null;
			clearContentOffset(push.el);
		},
		[getOwnedPush],
	);

	return {
		registerContent,
		acquirePush,
		getOwnedPush,
		pushContentOpen,
		pushContentDrag,
		releasePush,
		releasePushOnUnmount,
	};
}
