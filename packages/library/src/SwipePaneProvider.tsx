import { type ReactNode, createContext, useCallback, useRef, useState } from "react";
import {
	CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
	DEFAULT_OVERLAY_BACKGROUND_COLOR,
	DEFAULT_TOGGLE_ICON_COLOR,
	DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
	DEFAULT_TOGGLE_ICON_SIZE_PX,
	DRAG_ACTIVATION_DELTA_PX,
	EDGE_ACTIVATION_REGION_PX,
	IS_ABSOLUTE,
	MEDIA_QUERY_WIDTH,
	PANE_WIDTH_PX,
	type PaneSide,
	SHOW_OVERLAY,
	SHOW_TOGGLE,
	type SwipeBarProps,
	TRANSITION_MS,
	applyClosePaneStyles,
	applyDragPaneStyles,
	applyOpenPaneStyles,
} from "./swipePaneShared";

type LockedPane = PaneSide | null;

export type SwipePaneContextProps = {
	lockedPane: LockedPane;
	setLockedPane: (pane: LockedPane) => void;
	leftPaneRef: React.RefObject<HTMLDivElement | null>;
	rightPaneRef: React.RefObject<HTMLDivElement | null>;
	isLeftOpen: boolean;
	isRightOpen: boolean;
	openPane: (side: PaneSide) => void;
	closePane: (side: PaneSide) => void;
	dragPane: (side: PaneSide, translateX: number | null) => void;
	globalOptions: Required<SwipeBarProps>;
	leftPaneOptions: SwipeBarProps;
	rightPaneOptions: SwipeBarProps;
	setLeftPaneOptions: (options: SwipeBarProps) => void;
	setRightPaneOptions: (options: SwipeBarProps) => void;
};

export const SwipeBarContext = createContext<SwipePaneContextProps | null>(null);

export const SwipeBarProvider = ({
	children,
	paneWidthPx,
	transitionMs,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
	showOverlay,
	closeSidebarOnOverlayClick,
	isAbsolute,
	overlayBackgroundColor,
	toggleIconColor,
	toggleIconSizePx,
	toggleIconEdgeDistancePx,
	showToggle,
	mediaQueryWidth,
}: { children: ReactNode } & SwipeBarProps) => {
	const [lockedPane, setLockedPane] = useState<LockedPane>(null);
	const [isLeftOpen, setIsLeftOpen] = useState(false);
	const [isRightOpen, setIsRightOpen] = useState(false);
	const [leftPaneOptions, setLeftPaneOptions] = useState<SwipeBarProps>({});
	const [rightPaneOptions, setRightPaneOptions] = useState<SwipeBarProps>({});
	const leftPaneRef = useRef<HTMLDivElement>(null);
	const rightPaneRef = useRef<HTMLDivElement>(null);
	const [globalOptions] = useState<Required<SwipeBarProps>>({
		paneWidthPx: paneWidthPx ?? PANE_WIDTH_PX,
		transitionMs: transitionMs ?? TRANSITION_MS,
		edgeActivationWidthPx: edgeActivationWidthPx ?? EDGE_ACTIVATION_REGION_PX,
		dragActivationDeltaPx: dragActivationDeltaPx ?? DRAG_ACTIVATION_DELTA_PX,
		showOverlay: showOverlay ?? SHOW_OVERLAY,
		closeSidebarOnOverlayClick: closeSidebarOnOverlayClick ?? CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
		isAbsolute: isAbsolute ?? IS_ABSOLUTE,
		overlayBackgroundColor: overlayBackgroundColor ?? DEFAULT_OVERLAY_BACKGROUND_COLOR,
		toggleIconColor: toggleIconColor ?? DEFAULT_TOGGLE_ICON_COLOR,
		toggleIconSizePx: toggleIconSizePx ?? DEFAULT_TOGGLE_ICON_SIZE_PX,
		toggleIconEdgeDistancePx: toggleIconEdgeDistancePx ?? DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
		showToggle: showToggle ?? SHOW_TOGGLE,
		mediaQueryWidth: mediaQueryWidth ?? MEDIA_QUERY_WIDTH,
	});

	const openPane = useCallback(
		(side: PaneSide) => {
			applyOpenPaneStyles({
				ref: side === "left" ? leftPaneRef : rightPaneRef,
				options: side === "left" ? leftPaneOptions : rightPaneOptions,
				afterApply: () => {
					side === "left" ? setIsLeftOpen(true) : setIsRightOpen(true);
					setLockedPane(side);
				},
			});
		},
		[leftPaneOptions, rightPaneOptions],
	);

	const closePane = useCallback(
		(side: PaneSide) => {
			applyClosePaneStyles({
				ref: side === "left" ? leftPaneRef : rightPaneRef,
				options: side === "left" ? leftPaneOptions : rightPaneOptions,
				side,
				afterApply: () => {
					side === "left" ? setIsLeftOpen(false) : setIsRightOpen(false);
					setLockedPane(null);
				},
			});
		},
		[leftPaneOptions, rightPaneOptions],
	);

	const dragPane = useCallback(
		(side: PaneSide, translateX: number | null) => {
			applyDragPaneStyles({
				ref: side === "left" ? leftPaneRef : rightPaneRef,
				options: side === "left" ? leftPaneOptions : rightPaneOptions,
				translateX,
			});
		},
		[leftPaneOptions, rightPaneOptions],
	);

	return (
		<SwipeBarContext.Provider
			value={{
				lockedPane,
				setLockedPane,
				isLeftOpen,
				isRightOpen,
				leftPaneRef,
				rightPaneRef,
				openPane,
				closePane,
				dragPane,
				globalOptions,
				leftPaneOptions,
				rightPaneOptions,
				setLeftPaneOptions,
				setRightPaneOptions,
			}}
		>
			{children}
		</SwipeBarContext.Provider>
	);
};
