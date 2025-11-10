import { type ReactNode, createContext, useCallback, useRef, useState } from "react";
import {
	CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
	DRAG_ACTIVATION_DELTA_PX,
	EDGE_ACTIVATION_REGION_PX,
	IS_ABSOLUTE,
	PANE_WIDTH_PX,
	type PaneSide,
	SHOW_OVERLAY,
	type SwipeBarProps,
	TRANSITION_CLOSE_MS,
	TRANSITION_OPEN_MS,
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
	openPane: (side: PaneSide, options: SwipeBarProps) => void;
	closePane: (side: PaneSide, options: SwipeBarProps) => void;
	dragPane: (side: PaneSide, translateX: number | null, options: SwipeBarProps) => void;
	globalOptions: Required<SwipeBarProps>;
};

export const SwipePaneContext = createContext<SwipePaneContextProps | null>(null);

export const SwipePaneProvider = ({
	children,
	paneWidthPx,
	transitionMsOpen,
	transitionMsClose,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
	showOverlay,
	closeSidebarOnOverlayClick,
	isAbsolute,
}: { children: ReactNode } & SwipeBarProps) => {
	const [lockedPane, setLockedPane] = useState<LockedPane>(null);
	const [isLeftOpen, setIsLeftOpen] = useState(false);
	const [isRightOpen, setIsRightOpen] = useState(false);
	const leftPaneRef = useRef<HTMLDivElement>(null);
	const rightPaneRef = useRef<HTMLDivElement>(null);
	const [globalOptions] = useState<Required<SwipeBarProps>>({
		paneWidthPx: paneWidthPx ?? PANE_WIDTH_PX,
		transitionMsOpen: transitionMsOpen ?? TRANSITION_OPEN_MS,
		transitionMsClose: transitionMsClose ?? TRANSITION_CLOSE_MS,
		edgeActivationWidthPx: edgeActivationWidthPx ?? EDGE_ACTIVATION_REGION_PX,
		dragActivationDeltaPx: dragActivationDeltaPx ?? DRAG_ACTIVATION_DELTA_PX,
		showOverlay: showOverlay ?? SHOW_OVERLAY,
		closeSidebarOnOverlayClick: closeSidebarOnOverlayClick ?? CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
		isAbsolute: isAbsolute ?? IS_ABSOLUTE,
	});

	console.log("globalOptions", globalOptions);

	const openPane = useCallback((side: PaneSide, options: SwipeBarProps) => {
		applyOpenPaneStyles({
			ref: side === "left" ? leftPaneRef : rightPaneRef,
			options,
			afterApply: () => {
				side === "left" ? setIsLeftOpen(true) : setIsRightOpen(true);
				setLockedPane(side);
			},
		});
	}, []);

	const closePane = useCallback((side: PaneSide, options: SwipeBarProps) => {
		applyClosePaneStyles({
			ref: side === "left" ? leftPaneRef : rightPaneRef,
			options,
			side,
			afterApply: () => {
				side === "left" ? setIsLeftOpen(false) : setIsRightOpen(false);
				setLockedPane(null);
			},
		});
	}, []);

	const dragPane = useCallback(
		(side: PaneSide, translateX: number | null, options: SwipeBarProps) => {
			applyDragPaneStyles({
				ref: side === "left" ? leftPaneRef : rightPaneRef,
				options,
				translateX,
			});
		},
		[],
	);

	return (
		<SwipePaneContext.Provider
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
			}}
		>
			{children}
		</SwipePaneContext.Provider>
	);
};
