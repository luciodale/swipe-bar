import {
  type ReactNode,
  createContext,
  useCallback,
  useRef,
  useState,
} from "react";
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
  type TSidebarSide,
  SHOW_OVERLAY,
  SHOW_TOGGLE,
  type TSwipeBarOptions,
  TRANSITION_MS,
  applyClosePaneStyles,
  applyDragPaneStyles,
  applyOpenPaneStyles,
} from "./swipeSidebarShared";

type TLockedSidebar = TSidebarSide | null;

type TSwipeSidebarContext = {
  lockedSidebar: TLockedSidebar;
  setLockedSidebar: (side: TLockedSidebar) => void;
  leftSidebarRef: React.RefObject<HTMLDivElement | null>;
  rightSidebarRef: React.RefObject<HTMLDivElement | null>;
  isLeftOpen: boolean;
  isRightOpen: boolean;
  openSidebar: (side: TSidebarSide) => void;
  closeSidebar: (side: TSidebarSide) => void;
  dragSidebar: (side: TSidebarSide, translateX: number | null) => void;
  globalOptions: Required<TSwipeBarOptions>;
  leftSidebarOptions: TSwipeBarOptions;
  rightSidebarOptions: TSwipeBarOptions;
  setLeftSidebarOptions: (options: TSwipeBarOptions) => void;
  setRightSidebarOptions: (options: TSwipeBarOptions) => void;
  leftToggleRef: React.RefObject<HTMLDivElement | null>;
  rightToggleRef: React.RefObject<HTMLDivElement | null>;
};

export const SwipeSidebarContext = createContext<TSwipeSidebarContext | null>(
  null
);

export const SwipeBarProvider = ({
  children,
  sidebarWidthPx,
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
}: { children: ReactNode } & TSwipeBarOptions) => {
  const [lockedSidebar, setLockedSidebar] = useState<TLockedSidebar>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [leftSidebarOptions, setLeftSidebarOptions] =
    useState<TSwipeBarOptions>({});
  const [rightSidebarOptions, setRightSidebarOptions] =
    useState<TSwipeBarOptions>({});
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const leftToggleRef = useRef<HTMLDivElement>(null);
  const rightToggleRef = useRef<HTMLDivElement>(null);
  const [globalOptions] = useState<Required<TSwipeBarOptions>>({
    sidebarWidthPx: sidebarWidthPx ?? PANE_WIDTH_PX,
    transitionMs: transitionMs ?? TRANSITION_MS,
    edgeActivationWidthPx: edgeActivationWidthPx ?? EDGE_ACTIVATION_REGION_PX,
    dragActivationDeltaPx: dragActivationDeltaPx ?? DRAG_ACTIVATION_DELTA_PX,
    showOverlay: showOverlay ?? SHOW_OVERLAY,
    closeSidebarOnOverlayClick:
      closeSidebarOnOverlayClick ?? CLOSE_SIDEBAR_ON_OVERLAY_CLICK,
    isAbsolute: isAbsolute ?? IS_ABSOLUTE,
    overlayBackgroundColor:
      overlayBackgroundColor ?? DEFAULT_OVERLAY_BACKGROUND_COLOR,
    toggleIconColor: toggleIconColor ?? DEFAULT_TOGGLE_ICON_COLOR,
    toggleIconSizePx: toggleIconSizePx ?? DEFAULT_TOGGLE_ICON_SIZE_PX,
    toggleIconEdgeDistancePx:
      toggleIconEdgeDistancePx ?? DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
    showToggle: showToggle ?? SHOW_TOGGLE,
    mediaQueryWidth: mediaQueryWidth ?? MEDIA_QUERY_WIDTH,
  });

  const openSidebar = useCallback(
    (side: TSidebarSide) => {
      applyOpenPaneStyles({
        side,
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        afterApply: () => {
          side === "left" ? setIsLeftOpen(true) : setIsRightOpen(true);
          setLockedSidebar(side);
        },
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  const closeSidebar = useCallback(
    (side: TSidebarSide) => {
      applyClosePaneStyles({
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        side,
        afterApply: () => {
          side === "left" ? setIsLeftOpen(false) : setIsRightOpen(false);
          setLockedSidebar(null);
        },
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  const dragSidebar = useCallback(
    (side: TSidebarSide, translateX: number | null) => {
      applyDragPaneStyles({
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        translateX,
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  return (
    <SwipeSidebarContext.Provider
      value={{
        lockedSidebar,
        setLockedSidebar,
        isLeftOpen,
        isRightOpen,
        leftSidebarRef,
        rightSidebarRef,
        openSidebar,
        closeSidebar,
        dragSidebar,
        globalOptions,
        leftSidebarOptions,
        rightSidebarOptions,
        setLeftSidebarOptions,
        setRightSidebarOptions,
        leftToggleRef,
        rightToggleRef,
      }}
    >
      {children}
    </SwipeSidebarContext.Provider>
  );
};
