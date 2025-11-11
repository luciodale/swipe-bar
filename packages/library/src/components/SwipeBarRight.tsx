import { ToggleRight } from "../ToggleRight";
import {
  DEFAULT_SIDEBAR_BACKGROUND_COLOR,
  type TSwipeSidebar,
  rightSwipeBarAbsoluteStyle,
  swipeBarStyle,
  useSetMergedOptions,
} from "../swipeSidebarShared";
import { useMediaQuery } from "../useMediaQuery";
import { useSwipeBarContext } from "../useSwipeBarContext";
import { useSwipeRightSidebar } from "../useSwipeRightSidebar";
import { Overlay } from "./Overlay";

export function SwipeBarRight({
  className,
  children,
  ToggleComponent,
  ...currentOptions
}: TSwipeSidebar) {
  const { isRightOpen, closeSidebar, rightSidebarRef } = useSwipeBarContext();

  const options = useSetMergedOptions("right", currentOptions);
  const isSmallScreen = useMediaQuery(options.mediaQueryWidth);
  useSwipeRightSidebar(options);

  return (
    <>
      {options.showOverlay && (
        <Overlay
          isCollapsed={!isRightOpen}
          setCollapsed={() => closeSidebar("right")}
          closeSidebarOnClick={options.closeSidebarOnOverlayClick}
          transitionMs={options.transitionMs}
        />
      )}

      <ToggleRight
        options={options}
        showToggle={options.showToggle}
        ToggleComponent={ToggleComponent}
      />

      <div
        ref={rightSidebarRef}
        style={{
          ...swipeBarStyle,
          ...(options.isAbsolute || isSmallScreen
            ? rightSwipeBarAbsoluteStyle
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
