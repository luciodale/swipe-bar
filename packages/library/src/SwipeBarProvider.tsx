import {
	createContext,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	applyClosePaneStyles,
	applyClosePaneStylesImmediate,
	applyDragPaneStyles,
	applyDragPaneStylesBottom,
	applyMidAnchorPaneStyles,
	applyMidAnchorPaneStylesImmediate,
	applyOpenPaneStyles,
	applyOpenPaneStylesImmediate,
	applyRailPaneStyles,
	applyRailPaneStylesImmediate,
	CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
	DEFAULT_OVERLAY_BACKGROUND_COLOR,
	DEFAULT_OVERLAY_Z_INDEX,
	DEFAULT_SWIPEBAR_Z_INDEX,
	DEFAULT_TOGGLE_ICON_COLOR,
	DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
	DEFAULT_TOGGLE_ICON_SIZE_PX,
	DEFAULT_TOGGLE_Z_INDEX,
	DISABLE_SWIPE,
	DRAG_ACTIVATION_DELTA_PX,
	EDGE_ACTIVATION_REGION_PX,
	FADE_CONTENT,
	FADE_CONTENT_TRANSITION_MS,
	IS_ABSOLUTE,
	MEDIA_QUERY_WIDTH,
	MID_ANCHOR_POINT,
	PANE_HEIGHT_PX,
	PANE_WIDTH_PX,
	RAIL_WIDTH_PX,
	SHOW_OVERLAY,
	SHOW_RAIL,
	SHOW_TOGGLE,
	SWIPE_TO_CLOSE,
	SWIPE_TO_OPEN,
	type TBottomSidebarState,
	type TLeftRightSidebarState,
	TRANSITION_MS,
	type TSidebarOpts,
	type TSidebarSide,
	type TSwipeBarOptions,
} from "./swipeSidebarShared";

type TLockedSidebar = TSidebarSide | null;

type TSidebarRefs = {
	sidebarRef: RefObject<HTMLDivElement | null>;
	toggleRef: RefObject<HTMLDivElement | null>;
};

export type TSwipeSidebarContextInternal = {
	lockedSidebar: TLockedSidebar;
	setLockedSidebar: (side: TLockedSidebar) => void;
	// Backwards-compat aliases for primary left/right
	leftSidebarRef: React.RefObject<HTMLDivElement | null>;
	rightSidebarRef: React.RefObject<HTMLDivElement | null>;
	isLeftOpen: boolean;
	isRightOpen: boolean;
	isLeftRail: boolean;
	isRightRail: boolean;
	leftSidebarOptions: TSwipeBarOptions;
	rightSidebarOptions: TSwipeBarOptions;
	leftToggleRef: React.RefObject<HTMLDivElement | null>;
	rightToggleRef: React.RefObject<HTMLDivElement | null>;
	leftMeta: unknown;
	rightMeta: unknown;
	// Multi-instance left sidebar state
	leftSidebars: Record<string, TLeftRightSidebarState>;
	leftSidebarOptionsMap: Record<string, Required<TSwipeBarOptions>>;
	registerLeftSidebar: (id: string, refs: TSidebarRefs) => void;
	unregisterLeftSidebar: (id: string) => void;
	getLeftSidebarRefs: (id: string) => TSidebarRefs | undefined;
	activeLeftDragIdRef: React.RefObject<string | null>;
	leftFocusStackRef: React.RefObject<string[]>;
	// Multi-instance right sidebar state
	rightSidebars: Record<string, TLeftRightSidebarState>;
	rightSidebarOptionsMap: Record<string, Required<TSwipeBarOptions>>;
	registerRightSidebar: (id: string, refs: TSidebarRefs) => void;
	unregisterRightSidebar: (id: string) => void;
	getRightSidebarRefs: (id: string) => TSidebarRefs | undefined;
	activeRightDragIdRef: React.RefObject<string | null>;
	rightFocusStackRef: React.RefObject<string[]>;
	// Backwards-compat aliases for primary bottom sidebar
	isBottomOpen: boolean;
	bottomAnchorState: "closed" | "midAnchor" | "open";
	bottomSidebarRef: React.RefObject<HTMLDivElement | null>;
	bottomToggleRef: React.RefObject<HTMLDivElement | null>;
	bottomSidebarOptions: TSwipeBarOptions;
	// Multi-instance bottom sidebar state
	bottomSidebars: Record<string, TBottomSidebarState>;
	bottomSidebarOptionsMap: Record<string, Required<TSwipeBarOptions>>;
	registerBottomSidebar: (id: string, refs: TSidebarRefs) => void;
	unregisterBottomSidebar: (id: string) => void;
	getBottomSidebarRefs: (id: string) => TSidebarRefs | undefined;
	activeBottomDragIdRef: React.RefObject<string | null>;
	bottomFocusStackRef: React.RefObject<string[]>;
	// Context functions with optional { id }
	openSidebar: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	openSidebarFully: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	openSidebarToMidAnchor: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	closeSidebar: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	dragSidebar: (side: TSidebarSide, translate: number | null, opts?: TSidebarOpts) => void;
	globalOptions: Required<TSwipeBarOptions>;
	setGlobalOptions: (options: Partial<Required<TSwipeBarOptions>>) => void;
	setLeftSidebarOptionsById: (id: string, options: Required<TSwipeBarOptions>) => void;
	setRightSidebarOptionsById: (id: string, options: Required<TSwipeBarOptions>) => void;
	setBottomSidebarOptionsById: (id: string, options: Required<TSwipeBarOptions>) => void;
	setMeta: (side: TSidebarSide, metaOrOpts: unknown) => void;
};

export const SwipeSidebarContext = createContext<TSwipeSidebarContextInternal | null>(null);

const assertNever = (side: never): never => {
	throw new Error(`Unhandled sidebar side: ${side}`);
};

const DEFAULT_LEFT_RIGHT_STATE: TLeftRightSidebarState = {
	isOpen: false,
	isRail: false,
	meta: null,
};

const DEFAULT_BOTTOM_STATE: TBottomSidebarState = {
	isOpen: false,
	anchorState: "closed",
	meta: null,
};

export const SwipeBarProvider = ({
	children,
	sidebarWidthPx,
	transitionMs,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
	showOverlay,
	isAbsolute,
	overlayBackgroundColor,
	toggleIconColor,
	toggleIconSizePx,
	toggleIconEdgeDistancePx,
	showToggle,
	mediaQueryWidth,
	swipeBarZIndex,
	toggleZIndex,
	overlayZIndex,
	fadeContent,
	fadeContentTransitionMs,
	closeSidebarOnOverlayClick,
	resetMetaOnClose,
	showRail,
	railWidthPx,
}: { children: ReactNode } & TSwipeBarOptions) => {
	const [lockedSidebar, setLockedSidebar] = useState<TLockedSidebar>(null);

	// --- Multi-instance left sidebar state ---
	const [leftSidebars, setLeftSidebars] = useState<Record<string, TLeftRightSidebarState>>({});
	const [leftSidebarOptionsMap, setLeftSidebarOptionsMap] = useState<
		Record<string, Required<TSwipeBarOptions>>
	>({});
	const leftSidebarRefsMap = useRef(new Map<string, TSidebarRefs>());
	const activeLeftDragIdRef = useRef<string | null>(null);
	const leftFocusStackRef = useRef<string[]>([]);

	// --- Multi-instance right sidebar state ---
	const [rightSidebars, setRightSidebars] = useState<Record<string, TLeftRightSidebarState>>({});
	const [rightSidebarOptionsMap, setRightSidebarOptionsMap] = useState<
		Record<string, Required<TSwipeBarOptions>>
	>({});
	const rightSidebarRefsMap = useRef(new Map<string, TSidebarRefs>());
	const activeRightDragIdRef = useRef<string | null>(null);
	const rightFocusStackRef = useRef<string[]>([]);

	// --- Multi-instance bottom sidebar state ---
	const [bottomSidebars, setBottomSidebars] = useState<Record<string, TBottomSidebarState>>({});
	const [bottomSidebarOptionsMap, setBottomSidebarOptionsMap] = useState<
		Record<string, Required<TSwipeBarOptions>>
	>({});
	const bottomSidebarRefsMap = useRef(new Map<string, TSidebarRefs>());
	const activeBottomDragIdRef = useRef<string | null>(null);
	const bottomFocusStackRef = useRef<string[]>([]);

	// Backwards-compat: derive primary left state
	const isLeftOpen = leftSidebars.primary?.isOpen ?? false;
	const isLeftRail = leftSidebars.primary?.isRail ?? false;
	const leftMeta = leftSidebars.primary?.meta ?? null;
	const anyLeftOpen = useMemo(
		() => Object.values(leftSidebars).some((s) => s.isOpen),
		[leftSidebars],
	);

	// Backwards-compat: refs/options for primary left
	const primaryLeftRefs = leftSidebarRefsMap.current.get("primary");
	const leftSidebarRef = primaryLeftRefs?.sidebarRef ?? { current: null };
	const leftToggleRef = primaryLeftRefs?.toggleRef ?? { current: null };
	const leftSidebarOptions = leftSidebarOptionsMap.primary ?? {};

	// Backwards-compat: derive primary right state
	const isRightOpen = rightSidebars.primary?.isOpen ?? false;
	const isRightRail = rightSidebars.primary?.isRail ?? false;
	const rightMeta = rightSidebars.primary?.meta ?? null;
	const anyRightOpen = useMemo(
		() => Object.values(rightSidebars).some((s) => s.isOpen),
		[rightSidebars],
	);

	// Backwards-compat: refs/options for primary right
	const primaryRightRefs = rightSidebarRefsMap.current.get("primary");
	const rightSidebarRef = primaryRightRefs?.sidebarRef ?? { current: null };
	const rightToggleRef = primaryRightRefs?.toggleRef ?? { current: null };
	const rightSidebarOptions = rightSidebarOptionsMap.primary ?? {};

	// Backwards-compat: derive primary bottom state
	const isBottomOpen = bottomSidebars.primary?.isOpen ?? false;
	const bottomAnchorState = bottomSidebars.primary?.anchorState ?? "closed";
	const anyBottomOpen = useMemo(
		() => Object.values(bottomSidebars).some((s) => s.isOpen),
		[bottomSidebars],
	);

	// Backwards-compat: refs/options for primary bottom
	const primaryBottomRefs = bottomSidebarRefsMap.current.get("primary");
	const bottomSidebarRef = primaryBottomRefs?.sidebarRef ?? { current: null };
	const bottomToggleRef = primaryBottomRefs?.toggleRef ?? { current: null };
	const bottomSidebarOptions = bottomSidebarOptionsMap.primary ?? {};

	const [globalOptions, setGlobalOptions] = useState<Required<TSwipeBarOptions>>({
		sidebarWidthPx: sidebarWidthPx ?? PANE_WIDTH_PX,
		sidebarHeightPx: PANE_HEIGHT_PX,
		transitionMs: transitionMs ?? TRANSITION_MS,
		edgeActivationWidthPx: edgeActivationWidthPx ?? EDGE_ACTIVATION_REGION_PX,
		dragActivationDeltaPx: dragActivationDeltaPx ?? DRAG_ACTIVATION_DELTA_PX,
		showOverlay: showOverlay ?? SHOW_OVERLAY,
		isAbsolute: isAbsolute ?? IS_ABSOLUTE,
		overlayBackgroundColor: overlayBackgroundColor ?? DEFAULT_OVERLAY_BACKGROUND_COLOR,
		toggleIconColor: toggleIconColor ?? DEFAULT_TOGGLE_ICON_COLOR,
		toggleIconSizePx: toggleIconSizePx ?? DEFAULT_TOGGLE_ICON_SIZE_PX,
		toggleIconEdgeDistancePx: toggleIconEdgeDistancePx ?? DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
		showToggle: showToggle ?? SHOW_TOGGLE,
		mediaQueryWidth: mediaQueryWidth ?? MEDIA_QUERY_WIDTH,
		swipeBarZIndex: swipeBarZIndex ?? DEFAULT_SWIPEBAR_Z_INDEX,
		toggleZIndex: toggleZIndex ?? DEFAULT_TOGGLE_Z_INDEX,
		overlayZIndex: overlayZIndex ?? DEFAULT_OVERLAY_Z_INDEX,
		fadeContent: fadeContent ?? FADE_CONTENT,
		fadeContentTransitionMs: fadeContentTransitionMs ?? FADE_CONTENT_TRANSITION_MS,
		swipeToOpen: SWIPE_TO_OPEN,
		swipeToClose: SWIPE_TO_CLOSE,
		disableSwipe: DISABLE_SWIPE,
		midAnchorPoint: MID_ANCHOR_POINT,
		midAnchorPointPx: PANE_HEIGHT_PX / 3,
		disabled: false,
		closeSidebarOnOverlayClick: closeSidebarOnOverlayClick ?? CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
		resetMetaOnClose: resetMetaOnClose ?? false,
		showRail: showRail ?? SHOW_RAIL,
		railWidthPx: railWidthPx ?? RAIL_WIDTH_PX,
	});

	// --- Left registration ---
	const registerLeftSidebar = useCallback((id: string, refs: TSidebarRefs) => {
		leftSidebarRefsMap.current.set(id, refs);
		setLeftSidebars((prev) => {
			if (prev[id]) return prev;
			return { ...prev, [id]: { ...DEFAULT_LEFT_RIGHT_STATE } };
		});
	}, []);

	const unregisterLeftSidebar = useCallback((id: string) => {
		leftSidebarRefsMap.current.delete(id);
		setLeftSidebars((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setLeftSidebarOptionsMap((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}, []);

	const getLeftSidebarRefs = useCallback((id: string) => {
		return leftSidebarRefsMap.current.get(id);
	}, []);

	const setLeftSidebarOptionsById = useCallback(
		(id: string, options: Required<TSwipeBarOptions>) => {
			setLeftSidebarOptionsMap((prev) => {
				const existing = prev[id];
				if (existing === options) return prev;
				return { ...prev, [id]: options };
			});
		},
		[],
	);

	// --- Right registration ---
	const registerRightSidebar = useCallback((id: string, refs: TSidebarRefs) => {
		rightSidebarRefsMap.current.set(id, refs);
		setRightSidebars((prev) => {
			if (prev[id]) return prev;
			return { ...prev, [id]: { ...DEFAULT_LEFT_RIGHT_STATE } };
		});
	}, []);

	const unregisterRightSidebar = useCallback((id: string) => {
		rightSidebarRefsMap.current.delete(id);
		setRightSidebars((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setRightSidebarOptionsMap((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}, []);

	const getRightSidebarRefs = useCallback((id: string) => {
		return rightSidebarRefsMap.current.get(id);
	}, []);

	const setRightSidebarOptionsById = useCallback(
		(id: string, options: Required<TSwipeBarOptions>) => {
			setRightSidebarOptionsMap((prev) => {
				const existing = prev[id];
				if (existing === options) return prev;
				return { ...prev, [id]: options };
			});
		},
		[],
	);

	// --- Bottom registration ---
	const registerBottomSidebar = useCallback((id: string, refs: TSidebarRefs) => {
		bottomSidebarRefsMap.current.set(id, refs);
		setBottomSidebars((prev) => {
			if (prev[id]) return prev;
			return { ...prev, [id]: { ...DEFAULT_BOTTOM_STATE } };
		});
	}, []);

	const unregisterBottomSidebar = useCallback((id: string) => {
		bottomSidebarRefsMap.current.delete(id);
		setBottomSidebars((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setBottomSidebarOptionsMap((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}, []);

	const getBottomSidebarRefs = useCallback((id: string) => {
		return bottomSidebarRefsMap.current.get(id);
	}, []);

	const setBottomSidebarOptionsById = useCallback(
		(id: string, options: Required<TSwipeBarOptions>) => {
			setBottomSidebarOptionsMap((prev) => {
				const existing = prev[id];
				if (existing === options) return prev;
				return { ...prev, [id]: options };
			});
		},
		[],
	);

	// --- Helpers for left state updates ---
	const setLeftSidebarOpen = useCallback((id: string, open: boolean) => {
		setLeftSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (entry.isOpen === open && !entry.isRail) return prev;
			return { ...prev, [id]: { ...entry, isOpen: open, isRail: false } };
		});
	}, []);

	const setLeftSidebarRail = useCallback((id: string) => {
		setLeftSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (!entry.isOpen && entry.isRail) return prev;
			return { ...prev, [id]: { ...entry, isOpen: false, isRail: true } };
		});
	}, []);

	const setLeftSidebarMeta = useCallback((id: string, meta: unknown) => {
		setLeftSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (entry.meta === meta) return prev;
			return { ...prev, [id]: { ...entry, meta } };
		});
	}, []);

	// --- Helpers for right state updates ---
	const setRightSidebarOpen = useCallback((id: string, open: boolean) => {
		setRightSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (entry.isOpen === open && !entry.isRail) return prev;
			return { ...prev, [id]: { ...entry, isOpen: open, isRail: false } };
		});
	}, []);

	const setRightSidebarRail = useCallback((id: string) => {
		setRightSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (!entry.isOpen && entry.isRail) return prev;
			return { ...prev, [id]: { ...entry, isOpen: false, isRail: true } };
		});
	}, []);

	const setRightSidebarMeta = useCallback((id: string, meta: unknown) => {
		setRightSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_LEFT_RIGHT_STATE;
			if (entry.meta === meta) return prev;
			return { ...prev, [id]: { ...entry, meta } };
		});
	}, []);

	// --- Helpers for bottom state updates ---
	const setBottomSidebarOpen = useCallback((id: string, open: boolean) => {
		setBottomSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_BOTTOM_STATE;
			if (entry.isOpen === open) return prev;
			return { ...prev, [id]: { ...entry, isOpen: open } };
		});
	}, []);

	const setBottomAnchorState = useCallback(
		(id: string, anchorState: TBottomSidebarState["anchorState"]) => {
			setBottomSidebars((prev) => {
				const entry = prev[id] ?? DEFAULT_BOTTOM_STATE;
				if (entry.anchorState === anchorState) return prev;
				return { ...prev, [id]: { ...entry, anchorState } };
			});
		},
		[],
	);

	const setBottomSidebarMeta = useCallback((id: string, meta: unknown) => {
		setBottomSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_BOTTOM_STATE;
			if (entry.meta === meta) return prev;
			return { ...prev, [id]: { ...entry, meta } };
		});
	}, []);

	// Lock body scroll when any sidebar is open
	useEffect(() => {
		const isAnySidebarOpen = anyLeftOpen || anyRightOpen || anyBottomOpen;
		if (isAnySidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [anyLeftOpen, anyRightOpen, anyBottomOpen]);

	// FadeContent for all left sidebar instances
	useEffect(() => {
		for (const [id, opts] of Object.entries(leftSidebarOptionsMap)) {
			if (opts.fadeContent === false) {
				const refs = leftSidebarRefsMap.current.get(id);
				const child = refs?.sidebarRef.current?.firstElementChild as HTMLElement | null;
				if (child) child.style.opacity = "1";
			}
		}
	}, [leftSidebarOptionsMap]);

	// FadeContent for all right sidebar instances
	useEffect(() => {
		for (const [id, opts] of Object.entries(rightSidebarOptionsMap)) {
			if (opts.fadeContent === false) {
				const refs = rightSidebarRefsMap.current.get(id);
				const child = refs?.sidebarRef.current?.firstElementChild as HTMLElement | null;
				if (child) child.style.opacity = "1";
			}
		}
	}, [rightSidebarOptionsMap]);

	// FadeContent for all bottom sidebar instances
	useEffect(() => {
		for (const [id, opts] of Object.entries(bottomSidebarOptionsMap)) {
			if (opts.fadeContent === false) {
				const refs = bottomSidebarRefsMap.current.get(id);
				const child = refs?.sidebarRef.current?.firstElementChild as HTMLElement | null;
				if (child) child.style.opacity = "1";
			}
		}
	}, [bottomSidebarOptionsMap]);

	const updateGlobalOptions = useCallback((options: Partial<Required<TSwipeBarOptions>>) => {
		setGlobalOptions((prev) => ({ ...prev, ...options }));
	}, []);

	// --- Meta helpers ---
	const applyLeftRightMeta = useCallback(
		(side: "left" | "right", id: string, opts?: TSidebarOpts) => {
			const setMetaFn = side === "left" ? setLeftSidebarMeta : setRightSidebarMeta;
			if (opts?.resetMeta) {
				setMetaFn(id, null);
			} else if (opts?.meta !== undefined) {
				setMetaFn(id, opts.meta);
			}
		},
		[setLeftSidebarMeta, setRightSidebarMeta],
	);

	const applyBottomMeta = useCallback(
		(id: string, opts?: TSidebarOpts) => {
			if (opts?.resetMeta) {
				setBottomSidebarMeta(id, null);
			} else if (opts?.meta !== undefined) {
				setBottomSidebarMeta(id, opts.meta);
			}
		},
		[setBottomSidebarMeta],
	);

	const setMeta = useCallback(
		(side: TSidebarSide, metaOrOpts: unknown) => {
			if (side === "left") {
				const opts = metaOrOpts as { id?: string; meta: unknown };
				if (opts && typeof opts === "object" && "id" in opts) {
					setLeftSidebarMeta(opts.id ?? "primary", opts.meta);
				} else {
					setLeftSidebarMeta("primary", metaOrOpts);
				}
			} else if (side === "right") {
				const opts = metaOrOpts as { id?: string; meta: unknown };
				if (opts && typeof opts === "object" && "id" in opts) {
					setRightSidebarMeta(opts.id ?? "primary", opts.meta);
				} else {
					setRightSidebarMeta("primary", metaOrOpts);
				}
			} else {
				const opts = metaOrOpts as { id: string; meta: unknown };
				setBottomSidebarMeta(opts.id, opts.meta);
			}
		},
		[setLeftSidebarMeta, setRightSidebarMeta, setBottomSidebarMeta],
	);

	// --- Helpers for left focus stack + cross-direction lock ---
	const pushLeftFocus = useCallback((id: string) => {
		const stack = leftFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		stack.push(id);
		setLockedSidebar("left");
	}, []);

	const popLeftFocus = useCallback((id: string) => {
		const stack = leftFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		setLeftSidebars((prev) => {
			const anyStillOpen = Object.entries(prev).some(([entryId, s]) => entryId !== id && s.isOpen);
			if (!anyStillOpen) {
				setLockedSidebar(null);
			}
			return prev;
		});
	}, []);

	// --- Helpers for right focus stack + cross-direction lock ---
	const pushRightFocus = useCallback((id: string) => {
		const stack = rightFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		stack.push(id);
		setLockedSidebar("right");
	}, []);

	const popRightFocus = useCallback((id: string) => {
		const stack = rightFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		setRightSidebars((prev) => {
			const anyStillOpen = Object.entries(prev).some(([entryId, s]) => entryId !== id && s.isOpen);
			if (!anyStillOpen) {
				setLockedSidebar(null);
			}
			return prev;
		});
	}, []);

	// --- Helpers for bottom focus stack + cross-direction lock ---
	const pushBottomFocus = useCallback((id: string) => {
		const stack = bottomFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		stack.push(id);
		setLockedSidebar("bottom");
	}, []);

	const popBottomFocus = useCallback((id: string) => {
		const stack = bottomFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		setBottomSidebars((prev) => {
			const anyStillOpen = Object.entries(prev).some(([entryId, s]) => entryId !== id && s.isOpen);
			if (!anyStillOpen) {
				setLockedSidebar(null);
			}
			return prev;
		});
	}, []);

	const openSidebar = useCallback(
		(side: TSidebarSide, opts?: TSidebarOpts) => {
			const applyOpen = opts?.skipTransition ? applyOpenPaneStylesImmediate : applyOpenPaneStyles;
			const applyMid = opts?.skipTransition
				? applyMidAnchorPaneStylesImmediate
				: applyMidAnchorPaneStyles;

			if (side === "left") {
				const id = opts?.id ?? "primary";
				const lOpts = leftSidebarOptionsMap[id];
				const lRefs = leftSidebarRefsMap.current.get(id);
				if (!lOpts || !lRefs) return;
				if (lOpts.disabled) return;
				applyLeftRightMeta("left", id, opts);

				applyOpen({
					side,
					ref: lRefs.sidebarRef,
					options: lOpts,
					toggleRef: lRefs.toggleRef,
					afterApply: () => {
						setLeftSidebarOpen(id, true);
						pushLeftFocus(id);
					},
				});
			} else if (side === "right") {
				const id = opts?.id ?? "primary";
				const rOpts = rightSidebarOptionsMap[id];
				const rRefs = rightSidebarRefsMap.current.get(id);
				if (!rOpts || !rRefs) return;
				if (rOpts.disabled) return;
				applyLeftRightMeta("right", id, opts);

				applyOpen({
					side,
					ref: rRefs.sidebarRef,
					options: rOpts,
					toggleRef: rRefs.toggleRef,
					afterApply: () => {
						setRightSidebarOpen(id, true);
						pushRightFocus(id);
					},
				});
			} else if (side === "bottom") {
				const id = opts?.id ?? "primary";
				const bOpts = bottomSidebarOptionsMap[id];
				const bRefs = bottomSidebarRefsMap.current.get(id);
				if (!bOpts || !bRefs) return;
				if (bOpts.disabled) return;
				applyBottomMeta(id, opts);

				const sidebarHeightPx = bOpts.sidebarHeightPx ?? 0;
				const mqWidth = bOpts.mediaQueryWidth ?? 640;
				const isSmallScreen = window.innerWidth < mqWidth;
				const midAnchorPx = isSmallScreen ? (bOpts.midAnchorPointPx ?? 0) : sidebarHeightPx;

				const midAnchorActive =
					isSmallScreen &&
					bOpts.midAnchorPoint &&
					!bOpts.swipeToOpen &&
					midAnchorPx < sidebarHeightPx;

				if (midAnchorActive) {
					applyMid({
						ref: bRefs.sidebarRef,
						options: bOpts,
						toggleRef: bRefs.toggleRef,
						afterApply: () => {
							setBottomSidebarOpen(id, true);
							setBottomAnchorState(id, "midAnchor");
							pushBottomFocus(id);
						},
					});
				} else {
					applyOpen({
						side,
						ref: bRefs.sidebarRef,
						options: bOpts,
						toggleRef: bRefs.toggleRef,
						afterApply: () => {
							setBottomSidebarOpen(id, true);
							setBottomAnchorState(id, "open");
							pushBottomFocus(id);
						},
					});
				}
			} else {
				assertNever(side);
			}
		},
		[
			leftSidebarOptionsMap,
			rightSidebarOptionsMap,
			bottomSidebarOptionsMap,
			setLeftSidebarOpen,
			setRightSidebarOpen,
			setBottomSidebarOpen,
			setBottomAnchorState,
			pushLeftFocus,
			pushRightFocus,
			pushBottomFocus,
			applyLeftRightMeta,
			applyBottomMeta,
		],
	);

	const openSidebarToMidAnchor = useCallback(
		(side: TSidebarSide, opts?: TSidebarOpts) => {
			if (side !== "bottom") return;
			const id = opts?.id ?? "primary";
			const bOpts = bottomSidebarOptionsMap[id];
			const bRefs = bottomSidebarRefsMap.current.get(id);
			if (!bOpts || !bRefs) return;
			if (bOpts.disabled) return;
			applyBottomMeta(id, opts);

			applyMidAnchorPaneStyles({
				ref: bRefs.sidebarRef,
				options: bOpts,
				toggleRef: bRefs.toggleRef,
				afterApply: () => {
					setBottomSidebarOpen(id, true);
					setBottomAnchorState(id, "midAnchor");
					pushBottomFocus(id);
				},
			});
		},
		[
			bottomSidebarOptionsMap,
			setBottomSidebarOpen,
			setBottomAnchorState,
			pushBottomFocus,
			applyBottomMeta,
		],
	);

	const openSidebarFully = useCallback(
		(side: TSidebarSide, opts?: TSidebarOpts) => {
			if (side !== "bottom") return;
			const id = opts?.id ?? "primary";
			const bOpts = bottomSidebarOptionsMap[id];
			const bRefs = bottomSidebarRefsMap.current.get(id);
			if (!bOpts || !bRefs) return;
			if (bOpts.disabled) return;
			applyBottomMeta(id, opts);

			const applyOpen = opts?.skipTransition ? applyOpenPaneStylesImmediate : applyOpenPaneStyles;
			applyOpen({
				side,
				ref: bRefs.sidebarRef,
				options: bOpts,
				toggleRef: bRefs.toggleRef,
				afterApply: () => {
					setBottomSidebarOpen(id, true);
					setBottomAnchorState(id, "open");
					pushBottomFocus(id);
				},
			});
		},
		[
			bottomSidebarOptionsMap,
			setBottomSidebarOpen,
			setBottomAnchorState,
			pushBottomFocus,
			applyBottomMeta,
		],
	);

	const isViewportSmall = useCallback((mqWidth: number) => {
		if (typeof window === "undefined") return false;
		return window.innerWidth < mqWidth;
	}, []);

	const closeSidebar = useCallback(
		(side: TSidebarSide, opts?: TSidebarOpts) => {
			if (side === "left") {
				const id = opts?.id ?? "primary";
				const lOpts = leftSidebarOptionsMap[id];
				const lRefs = leftSidebarRefsMap.current.get(id);
				if (!lOpts || !lRefs) return;
				if (lOpts.disabled) return;
				const effectiveOpts =
					lOpts.resetMetaOnClose && opts?.meta === undefined && opts?.resetMeta === undefined
						? { ...opts, resetMeta: true as const }
						: opts;
				applyLeftRightMeta("left", id, effectiveOpts);

				const shouldRail = lOpts.showRail && !isViewportSmall(lOpts.mediaQueryWidth);
				if (shouldRail) {
					const applyRail = opts?.skipTransition
						? applyRailPaneStylesImmediate
						: applyRailPaneStyles;
					applyRail({
						ref: lRefs.sidebarRef,
						side: "left",
						options: lOpts,
						toggleRef: lRefs.toggleRef,
						afterApply: () => {
							setLeftSidebarRail(id);
							popLeftFocus(id);
						},
					});
				} else {
					const applyClose = opts?.skipTransition
						? applyClosePaneStylesImmediate
						: applyClosePaneStyles;
					applyClose({
						ref: lRefs.sidebarRef,
						options: lOpts,
						toggleRef: lRefs.toggleRef,
						side,
						afterApply: () => {
							setLeftSidebarOpen(id, false);
							popLeftFocus(id);
						},
					});
				}
			} else if (side === "right") {
				const id = opts?.id ?? "primary";
				const rOpts = rightSidebarOptionsMap[id];
				const rRefs = rightSidebarRefsMap.current.get(id);
				if (!rOpts || !rRefs) return;
				if (rOpts.disabled) return;
				const effectiveOpts =
					rOpts.resetMetaOnClose && opts?.meta === undefined && opts?.resetMeta === undefined
						? { ...opts, resetMeta: true as const }
						: opts;
				applyLeftRightMeta("right", id, effectiveOpts);

				const shouldRail = rOpts.showRail && !isViewportSmall(rOpts.mediaQueryWidth);
				if (shouldRail) {
					const applyRail = opts?.skipTransition
						? applyRailPaneStylesImmediate
						: applyRailPaneStyles;
					applyRail({
						ref: rRefs.sidebarRef,
						side: "right",
						options: rOpts,
						toggleRef: rRefs.toggleRef,
						afterApply: () => {
							setRightSidebarRail(id);
							popRightFocus(id);
						},
					});
				} else {
					const applyClose = opts?.skipTransition
						? applyClosePaneStylesImmediate
						: applyClosePaneStyles;
					applyClose({
						ref: rRefs.sidebarRef,
						options: rOpts,
						toggleRef: rRefs.toggleRef,
						side,
						afterApply: () => {
							setRightSidebarOpen(id, false);
							popRightFocus(id);
						},
					});
				}
			} else if (side === "bottom") {
				const id = opts?.id ?? "primary";
				const bOpts = bottomSidebarOptionsMap[id];
				const bRefs = bottomSidebarRefsMap.current.get(id);
				if (!bOpts || !bRefs) return;
				if (bOpts.disabled) return;
				const effectiveOpts =
					bOpts.resetMetaOnClose && opts?.meta === undefined && opts?.resetMeta === undefined
						? { ...opts, resetMeta: true as const }
						: opts;
				applyBottomMeta(id, effectiveOpts);

				const applyClose = opts?.skipTransition
					? applyClosePaneStylesImmediate
					: applyClosePaneStyles;
				applyClose({
					ref: bRefs.sidebarRef,
					options: bOpts,
					toggleRef: bRefs.toggleRef,
					side,
					afterApply: () => {
						setBottomSidebarOpen(id, false);
						setBottomAnchorState(id, "closed");
						popBottomFocus(id);
					},
				});
			} else {
				assertNever(side);
			}
		},
		[
			leftSidebarOptionsMap,
			rightSidebarOptionsMap,
			bottomSidebarOptionsMap,
			setLeftSidebarOpen,
			setRightSidebarOpen,
			setBottomSidebarOpen,
			setBottomAnchorState,
			setLeftSidebarRail,
			setRightSidebarRail,
			popLeftFocus,
			popRightFocus,
			popBottomFocus,
			applyLeftRightMeta,
			applyBottomMeta,
			isViewportSmall,
		],
	);

	const dragSidebar = useCallback(
		(side: TSidebarSide, translate: number | null, opts?: TSidebarOpts) => {
			if (side === "left") {
				const id = opts?.id ?? "primary";
				const lOpts = leftSidebarOptionsMap[id];
				const lRefs = leftSidebarRefsMap.current.get(id);
				if (!lOpts || !lRefs) return;

				applyDragPaneStyles({
					ref: lRefs.sidebarRef,
					toggleRef: lRefs.toggleRef,
					options: lOpts,
					translateX: translate,
				});
			} else if (side === "right") {
				const id = opts?.id ?? "primary";
				const rOpts = rightSidebarOptionsMap[id];
				const rRefs = rightSidebarRefsMap.current.get(id);
				if (!rOpts || !rRefs) return;

				applyDragPaneStyles({
					ref: rRefs.sidebarRef,
					toggleRef: rRefs.toggleRef,
					options: rOpts,
					translateX: translate,
				});
			} else if (side === "bottom") {
				const id = opts?.id ?? "primary";
				const bOpts = bottomSidebarOptionsMap[id];
				const bRefs = bottomSidebarRefsMap.current.get(id);
				if (!bOpts || !bRefs) return;

				applyDragPaneStylesBottom({
					ref: bRefs.sidebarRef,
					toggleRef: bRefs.toggleRef,
					options: bOpts,
					translateY: translate,
				});
			} else {
				assertNever(side);
			}
		},
		[leftSidebarOptionsMap, rightSidebarOptionsMap, bottomSidebarOptionsMap],
	);

	return (
		<SwipeSidebarContext.Provider
			value={{
				lockedSidebar,
				setLockedSidebar,
				// Backwards-compat aliases for primary left
				leftSidebarRef,
				rightSidebarRef,
				isLeftOpen,
				isRightOpen,
				isLeftRail,
				isRightRail,
				leftSidebarOptions,
				rightSidebarOptions,
				leftToggleRef,
				rightToggleRef,
				leftMeta,
				rightMeta,
				// Multi-instance left sidebar
				leftSidebars,
				leftSidebarOptionsMap,
				registerLeftSidebar,
				unregisterLeftSidebar,
				getLeftSidebarRefs,
				activeLeftDragIdRef,
				leftFocusStackRef,
				// Multi-instance right sidebar
				rightSidebars,
				rightSidebarOptionsMap,
				registerRightSidebar,
				unregisterRightSidebar,
				getRightSidebarRefs,
				activeRightDragIdRef,
				rightFocusStackRef,
				// Backwards-compat aliases for primary bottom sidebar
				isBottomOpen,
				bottomAnchorState,
				bottomSidebarRef,
				bottomToggleRef,
				bottomSidebarOptions,
				// Multi-instance bottom sidebar
				bottomSidebars,
				bottomSidebarOptionsMap,
				registerBottomSidebar,
				unregisterBottomSidebar,
				getBottomSidebarRefs,
				activeBottomDragIdRef,
				bottomFocusStackRef,
				// Functions
				openSidebar,
				openSidebarFully,
				openSidebarToMidAnchor,
				closeSidebar,
				dragSidebar,
				globalOptions,
				setGlobalOptions: updateGlobalOptions,
				setLeftSidebarOptionsById,
				setRightSidebarOptionsById,
				setBottomSidebarOptionsById,
				setMeta,
			}}
		>
			{children}
		</SwipeSidebarContext.Provider>
	);
};
