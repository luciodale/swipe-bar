import {
	type ReactNode,
	type RefObject,
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
	DEFAULT_OVERLAY_BACKGROUND_COLOR,
	DEFAULT_OVERLAY_Z_INDEX,
	DEFAULT_SWIPEBAR_Z_INDEX,
	DEFAULT_TOGGLE_ICON_COLOR,
	DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
	DEFAULT_TOGGLE_ICON_SIZE_PX,
	DEFAULT_TOGGLE_Z_INDEX,
	DRAG_ACTIVATION_DELTA_PX,
	EDGE_ACTIVATION_REGION_PX,
	FADE_CONTENT,
	FADE_CONTENT_TRANSITION_MS,
	IS_ABSOLUTE,
	MEDIA_QUERY_WIDTH,
	MID_ANCHOR_POINT,
	PANE_HEIGHT_PX,
	PANE_WIDTH_PX,
	SHOW_OVERLAY,
	SHOW_TOGGLE,
	SWIPE_TO_CLOSE,
	SWIPE_TO_OPEN,
	type TBottomSidebarState,
	TRANSITION_MS,
	type TSidebarOpts,
	type TSidebarSide,
	type TSwipeBarOptions,
	applyClosePaneStyles,
	applyDragPaneStyles,
	applyDragPaneStylesBottom,
	applyMidAnchorPaneStyles,
	applyOpenPaneStyles,
} from "./swipeSidebarShared";

type TLockedSidebar = TSidebarSide | null;

type TBottomSidebarRefs = {
	sidebarRef: RefObject<HTMLDivElement | null>;
	toggleRef: RefObject<HTMLDivElement | null>;
};

export type TSwipeSidebarContextInternal = {
	lockedSidebar: TLockedSidebar;
	setLockedSidebar: (side: TLockedSidebar) => void;
	leftSidebarRef: React.RefObject<HTMLDivElement | null>;
	rightSidebarRef: React.RefObject<HTMLDivElement | null>;
	isLeftOpen: boolean;
	isRightOpen: boolean;
	// Backwards-compat aliases for primary bottom sidebar
	isBottomOpen: boolean;
	bottomAnchorState: "closed" | "midAnchor" | "open";
	bottomSidebarRef: React.RefObject<HTMLDivElement | null>;
	bottomToggleRef: React.RefObject<HTMLDivElement | null>;
	bottomSidebarOptions: TSwipeBarOptions;
	// Multi-instance bottom sidebar state
	bottomSidebars: Record<string, TBottomSidebarState>;
	bottomSidebarOptionsMap: Record<string, Required<TSwipeBarOptions>>;
	registerBottomSidebar: (id: string, refs: TBottomSidebarRefs) => void;
	unregisterBottomSidebar: (id: string) => void;
	getBottomSidebarRefs: (id: string) => TBottomSidebarRefs | undefined;
	activeBottomDragIdRef: React.RefObject<string | null>;
	bottomFocusStackRef: React.RefObject<string[]>;
	// Context functions with optional { id } for bottom
	openSidebar: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	openSidebarFully: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	openSidebarToMidAnchor: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	closeSidebar: (side: TSidebarSide, opts?: TSidebarOpts) => void;
	dragSidebar: (side: TSidebarSide, translate: number | null, opts?: TSidebarOpts) => void;
	globalOptions: Required<TSwipeBarOptions>;
	setGlobalOptions: (options: Partial<Required<TSwipeBarOptions>>) => void;
	leftSidebarOptions: TSwipeBarOptions;
	rightSidebarOptions: TSwipeBarOptions;
	setLeftSidebarOptions: (options: TSwipeBarOptions) => void;
	setRightSidebarOptions: (options: TSwipeBarOptions) => void;
	setBottomSidebarOptionsById: (id: string, options: Required<TSwipeBarOptions>) => void;
	leftToggleRef: React.RefObject<HTMLDivElement | null>;
	rightToggleRef: React.RefObject<HTMLDivElement | null>;
	leftMeta: unknown;
	rightMeta: unknown;
	setMeta: (side: TSidebarSide, metaOrOpts: unknown) => void;
};

export const SwipeSidebarContext = createContext<TSwipeSidebarContextInternal | null>(null);

const assertNever = (side: never): never => {
	throw new Error(`Unhandled sidebar side: ${side}`);
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
}: { children: ReactNode } & TSwipeBarOptions) => {
	const [lockedSidebar, setLockedSidebar] = useState<TLockedSidebar>(null);
	const [isLeftOpen, setIsLeftOpen] = useState(false);
	const [isRightOpen, setIsRightOpen] = useState(false);
	const [leftSidebarOptions, setLeftSidebarOptions] = useState<TSwipeBarOptions>({});
	const [rightSidebarOptions, setRightSidebarOptions] = useState<TSwipeBarOptions>({});
	const leftSidebarRef = useRef<HTMLDivElement>(null);
	const rightSidebarRef = useRef<HTMLDivElement>(null);
	const leftToggleRef = useRef<HTMLDivElement>(null);
	const rightToggleRef = useRef<HTMLDivElement>(null);
	const [leftMeta, setLeftMeta] = useState<unknown>(null);
	const [rightMeta, setRightMeta] = useState<unknown>(null);

	// --- Multi-instance bottom sidebar state ---
	const [bottomSidebars, setBottomSidebars] = useState<Record<string, TBottomSidebarState>>({});
	const [bottomSidebarOptionsMap, setBottomSidebarOptionsMap] = useState<
		Record<string, Required<TSwipeBarOptions>>
	>({});
	const bottomSidebarRefsMap = useRef(new Map<string, TBottomSidebarRefs>());
	const activeBottomDragIdRef = useRef<string | null>(null);
	const bottomFocusStackRef = useRef<string[]>([]);

	// Backwards-compat: derive primary bottom state
	const isBottomOpen = bottomSidebars.primary?.isOpen ?? false;
	const bottomAnchorState = bottomSidebars.primary?.anchorState ?? "closed";
	const anyBottomOpen = useMemo(
		() => Object.values(bottomSidebars).some((s) => s.isOpen),
		[bottomSidebars],
	);

	// Backwards-compat: refs/options for primary
	const primaryRefs = bottomSidebarRefsMap.current.get("primary");
	const bottomSidebarRef = primaryRefs?.sidebarRef ?? { current: null };
	const bottomToggleRef = primaryRefs?.toggleRef ?? { current: null };
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
		midAnchorPoint: MID_ANCHOR_POINT,
		midAnchorPointPx: PANE_HEIGHT_PX / 3,
		disabled: false,
		closeSidebarOnOverlayClick: closeSidebarOnOverlayClick ?? CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
		resetMetaOnClose: resetMetaOnClose ?? false,
	});

	// --- Registration ---
	const registerBottomSidebar = useCallback((id: string, refs: TBottomSidebarRefs) => {
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
				// Avoid unnecessary state update if options haven't changed
				if (existing === options) return prev;
				return { ...prev, [id]: options };
			});
		},
		[],
	);

	// --- Helpers for bottom state updates ---
	const setBottomSidebarOpen = useCallback((id: string, isOpen: boolean) => {
		setBottomSidebars((prev) => {
			const entry = prev[id] ?? DEFAULT_BOTTOM_STATE;
			if (entry.isOpen === isOpen) return prev;
			return { ...prev, [id]: { ...entry, isOpen } };
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
		const isAnySidebarOpen = isLeftOpen || isRightOpen || anyBottomOpen;
		if (isAnySidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isLeftOpen, isRightOpen, anyBottomOpen]);

	// Ensure child content becomes visible when fading is disabled at runtime
	useEffect(() => {
		if (leftSidebarOptions.fadeContent === false) {
			const child = leftSidebarRef.current?.firstElementChild as HTMLElement | null;
			if (child) child.style.opacity = "1";
		}
	}, [leftSidebarOptions.fadeContent]);

	useEffect(() => {
		if (rightSidebarOptions.fadeContent === false) {
			const child = rightSidebarRef.current?.firstElementChild as HTMLElement | null;
			if (child) child.style.opacity = "1";
		}
	}, [rightSidebarOptions.fadeContent]);

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
	const applyLeftRightMeta = useCallback((side: "left" | "right", opts?: TSidebarOpts) => {
		const setMeta = side === "left" ? setLeftMeta : setRightMeta;
		if (opts?.resetMeta) {
			setMeta(null);
		} else if (opts?.meta !== undefined) {
			setMeta(opts.meta);
		}
	}, []);

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
				setLeftMeta(metaOrOpts);
			} else if (side === "right") {
				setRightMeta(metaOrOpts);
			} else {
				const opts = metaOrOpts as { id: string; meta: unknown };
				setBottomSidebarMeta(opts.id, opts.meta);
			}
		},
		[setBottomSidebarMeta],
	);

	// --- Helpers for bottom focus stack + cross-direction lock ---
	const pushBottomFocus = useCallback((id: string) => {
		const stack = bottomFocusStackRef.current;
		// Remove if already present, then push to top
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		stack.push(id);
		setLockedSidebar("bottom");
	}, []);

	const popBottomFocus = useCallback((id: string) => {
		const stack = bottomFocusStackRef.current;
		const idx = stack.indexOf(id);
		if (idx !== -1) stack.splice(idx, 1);
		// Only clear cross-direction lock if no other bottom sidebar is still open
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
			const apply = (
				ref: React.RefObject<HTMLDivElement | null>,
				options: TSwipeBarOptions,
				toggleRef: React.RefObject<HTMLDivElement | null>,
				setOpen: (open: boolean) => void,
			) => {
				applyOpenPaneStyles({
					side,
					ref,
					options,
					toggleRef,
					afterApply: () => {
						setOpen(true);
						setLockedSidebar(side);
					},
				});
			};

			if (side === "left") {
				if (leftSidebarOptions.disabled) return;
				applyLeftRightMeta("left", opts);
				apply(leftSidebarRef, leftSidebarOptions, leftToggleRef, setIsLeftOpen);
			} else if (side === "right") {
				if (rightSidebarOptions.disabled) return;
				applyLeftRightMeta("right", opts);
				apply(rightSidebarRef, rightSidebarOptions, rightToggleRef, setIsRightOpen);
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
				} else {
					applyOpenPaneStyles({
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
			leftSidebarOptions,
			rightSidebarOptions,
			bottomSidebarOptionsMap,
			setBottomSidebarOpen,
			setBottomAnchorState,
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

			applyOpenPaneStyles({
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

	const closeSidebar = useCallback(
		(side: TSidebarSide, opts?: TSidebarOpts) => {
			const apply = (
				ref: React.RefObject<HTMLDivElement | null>,
				options: TSwipeBarOptions,
				toggleRef: React.RefObject<HTMLDivElement | null>,
				setOpen: (open: boolean) => void,
			) => {
				applyClosePaneStyles({
					ref,
					options,
					toggleRef,
					side,
					afterApply: () => {
						setOpen(false);
						setLockedSidebar(null);
					},
				});
			};

			if (side === "left") {
				if (leftSidebarOptions.disabled) return;
				const effectiveOpts =
					leftSidebarOptions.resetMetaOnClose &&
					opts?.meta === undefined &&
					opts?.resetMeta === undefined
						? { ...opts, resetMeta: true as const }
						: opts;
				applyLeftRightMeta("left", effectiveOpts);
				apply(leftSidebarRef, leftSidebarOptions, leftToggleRef, setIsLeftOpen);
			} else if (side === "right") {
				if (rightSidebarOptions.disabled) return;
				const effectiveOpts =
					rightSidebarOptions.resetMetaOnClose &&
					opts?.meta === undefined &&
					opts?.resetMeta === undefined
						? { ...opts, resetMeta: true as const }
						: opts;
				applyLeftRightMeta("right", effectiveOpts);
				apply(rightSidebarRef, rightSidebarOptions, rightToggleRef, setIsRightOpen);
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

				applyClosePaneStyles({
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
			leftSidebarOptions,
			rightSidebarOptions,
			bottomSidebarOptionsMap,
			setBottomSidebarOpen,
			setBottomAnchorState,
			popBottomFocus,
			applyLeftRightMeta,
			applyBottomMeta,
		],
	);

	const dragSidebar = useCallback(
		(side: TSidebarSide, translate: number | null, opts?: TSidebarOpts) => {
			if (side === "left") {
				applyDragPaneStyles({
					ref: leftSidebarRef,
					toggleRef: leftToggleRef,
					options: leftSidebarOptions,
					translateX: translate,
				});
			} else if (side === "right") {
				applyDragPaneStyles({
					ref: rightSidebarRef,
					toggleRef: rightToggleRef,
					options: rightSidebarOptions,
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
		[leftSidebarOptions, rightSidebarOptions, bottomSidebarOptionsMap],
	);

	return (
		<SwipeSidebarContext.Provider
			value={{
				lockedSidebar,
				setLockedSidebar,
				leftSidebarRef,
				rightSidebarRef,
				isLeftOpen,
				isRightOpen,
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
				leftSidebarOptions,
				rightSidebarOptions,
				setLeftSidebarOptions,
				setRightSidebarOptions,
				setBottomSidebarOptionsById,
				leftToggleRef,
				rightToggleRef,
				leftMeta,
				rightMeta,
				setMeta,
			}}
		>
			{children}
		</SwipeSidebarContext.Provider>
	);
};
