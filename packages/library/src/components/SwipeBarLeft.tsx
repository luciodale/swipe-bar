import { ToggleLeft } from "../ToggleLeft";
import {
  DEFAULT_SIDEBAR_BACKGROUND_COLOR,
  type TSwipeSidebar,
  leftSwipeBarAbsoluteStyle,
  swipeBarStyle,
  useSetMergedOptions,
} from "../swipeSidebarShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeLeftSidebar } from "../useSwipeLeftSidebar";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { Overlay } from "./Overlay";

export function SwipeBarLeft({
  className,
  children,
  ToggleComponent,
  ...currentOptions
}: TSwipeSidebar) {
  const { isLeftOpen, closeSidebar, leftSidebarRef } = useSwipeBarContext();

  const options = useSetMergedOptions("left", currentOptions);
  const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
  useSwipeLeftSidebar(options);

  return (
    <>
      {options.showOverlay && (
        <Overlay
          isCollapsed={!isLeftOpen}
          setCollapsed={() => closeSidebar("left")}
          closeSidebarOnClick={options.closeSidebarOnOverlayClick}
          transitionMs={options.transitionMs}
        />
      )}

      <ToggleLeft
        options={options}
        showToggle={options.showToggle}
        ToggleComponent={ToggleComponent}
      />

      <div
        ref={leftSidebarRef}
        style={{
          ...swipeBarStyle,
          ...(options.isAbsolute || isSmallScreen
            ? leftSwipeBarAbsoluteStyle
            : {}),
          ...(!className
            ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR }
            : {}),
        }}
        className={className}
      >
        {children}
      </div>
    </>
  );
}
