import { type ReactNode, createContext, useCallback, useRef, useState } from "react";
import {
	DEFAULT_OVERLAY_BACKGROUND_COLOR,
	DEFAULT_OVERLAY_Z_INDEX,
	DEFAULT_SWIPEBAR_Z_INDEX,
	DEFAULT_TOGGLE_ICON_COLOR,
	DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
	DEFAULT_TOGGLE_ICON_SIZE_PX,
	DEFAULT_TOGGLE_Z_INDEX,
	DRAG_ACTIVATION_DELTA_PX,
	EDGE_ACTIVATION_REGION_PX,
	IS_ABSOLUTE,
	MEDIA_QUERY_WIDTH,
	PANE_HEIGHT_PX,
	PANE_WIDTH_PX,
	SHOW_OVERLAY,
	SHOW_TOGGLE,
	TRANSITION_MS,
	type TSidebarSide,
	type TSwipeBarOptions,
	applyClosePaneStyles,
	applyDragPaneStyles,
	applyDragPaneStylesBottom,
	applyOpenPaneStyles,
} from "./swipeSidebarShared";

type TLockedSidebar = TSidebarSide | null;

type TSwipeSidebarContext = {
	lockedSidebar: TLockedSidebar;
	setLockedSidebar: (side: TLockedSidebar) => void;
	leftSidebarRef: React.RefObject<HTMLDivElement | null>;
	rightSidebarRef: React.RefObject<HTMLDivElement | null>;
	bottomSidebarRef: React.RefObject<HTMLDivElement | null>;
	isLeftOpen: boolean;
	isRightOpen: boolean;
	isBottomOpen: boolean;
	openSidebar: (side: TSidebarSide) => void;
	closeSidebar: (side: TSidebarSide) => void;
	dragSidebar: (side: TSidebarSide, translate: number | null) => void;
	globalOptions: Required<TSwipeBarOptions>;
	setGlobalOptions: (options: Partial<Required<TSwipeBarOptions>>) => void;
	leftSidebarOptions: TSwipeBarOptions;
	rightSidebarOptions: TSwipeBarOptions;
	bottomSidebarOptions: TSwipeBarOptions;
	setLeftSidebarOptions: (options: TSwipeBarOptions) => void;
	setRightSidebarOptions: (options: TSwipeBarOptions) => void;
	setBottomSidebarOptions: (options: TSwipeBarOptions) => void;
	leftToggleRef: React.RefObject<HTMLDivElement | null>;
	rightToggleRef: React.RefObject<HTMLDivElement | null>;
	bottomToggleRef: React.RefObject<HTMLDivElement | null>;
};

export const SwipeSidebarContext = createContext<TSwipeSidebarContext | null>(null);

const assertNever = (side: never): never => {
	throw new Error(`Unhandled sidebar side: ${side}`);
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
}: { children: ReactNode } & TSwipeBarOptions) => {
	const [lockedSidebar, setLockedSidebar] = useState<TLockedSidebar>(null);
	const [isLeftOpen, setIsLeftOpen] = useState(false);
	const [isRightOpen, setIsRightOpen] = useState(false);
	const [isBottomOpen, setIsBottomOpen] = useState(false);
	const [leftSidebarOptions, setLeftSidebarOptions] = useState<TSwipeBarOptions>({});
	const [rightSidebarOptions, setRightSidebarOptions] = useState<TSwipeBarOptions>({});
	const [bottomSidebarOptions, setBottomSidebarOptions] = useState<TSwipeBarOptions>({});
	const leftSidebarRef = useRef<HTMLDivElement>(null);
	const rightSidebarRef = useRef<HTMLDivElement>(null);
	const bottomSidebarRef = useRef<HTMLDivElement>(null);
	const leftToggleRef = useRef<HTMLDivElement>(null);
	const rightToggleRef = useRef<HTMLDivElement>(null);
	const bottomToggleRef = useRef<HTMLDivElement>(null);
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
	});

	const updateGlobalOptions = useCallback((options: Partial<Required<TSwipeBarOptions>>) => {
		setGlobalOptions((prev) => ({ ...prev, ...options }));
	}, []);

	const openSidebar = useCallback(
		(side: TSidebarSide) => {
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
				apply(leftSidebarRef, leftSidebarOptions, leftToggleRef, setIsLeftOpen);
			} else if (side === "right") {
				apply(rightSidebarRef, rightSidebarOptions, rightToggleRef, setIsRightOpen);
			} else if (side === "bottom") {
				apply(bottomSidebarRef, bottomSidebarOptions, bottomToggleRef, setIsBottomOpen);
			} else {
				assertNever(side);
			}
		},
		[leftSidebarOptions, rightSidebarOptions, bottomSidebarOptions],
	);

	const closeSidebar = useCallback(
		(side: TSidebarSide) => {
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
				apply(leftSidebarRef, leftSidebarOptions, leftToggleRef, setIsLeftOpen);
			} else if (side === "right") {
				apply(rightSidebarRef, rightSidebarOptions, rightToggleRef, setIsRightOpen);
			} else if (side === "bottom") {
				apply(bottomSidebarRef, bottomSidebarOptions, bottomToggleRef, setIsBottomOpen);
			} else {
				assertNever(side);
			}
		},
		[leftSidebarOptions, rightSidebarOptions, bottomSidebarOptions],
	);

	const dragSidebar = useCallback(
		(side: TSidebarSide, translate: number | null) => {
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
				applyDragPaneStylesBottom({
					ref: bottomSidebarRef,
					toggleRef: bottomToggleRef,
					options: bottomSidebarOptions,
					translateY: translate,
				});
			} else {
				assertNever(side);
			}
		},
		[leftSidebarOptions, rightSidebarOptions, bottomSidebarOptions],
	);

	return (
		<SwipeSidebarContext.Provider
			value={{
				lockedSidebar,
				setLockedSidebar,
				isLeftOpen,
				isRightOpen,
				isBottomOpen,
				leftSidebarRef,
				rightSidebarRef,
				bottomSidebarRef,
				openSidebar,
				closeSidebar,
				dragSidebar,
				globalOptions,
				setGlobalOptions: updateGlobalOptions,
				leftSidebarOptions,
				rightSidebarOptions,
				bottomSidebarOptions,
				setLeftSidebarOptions,
				setRightSidebarOptions,
				setBottomSidebarOptions,
				leftToggleRef,
				rightToggleRef,
				bottomToggleRef,
			}}
		>
			{children}
		</SwipeSidebarContext.Provider>
	);
};
