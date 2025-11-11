import type { ReactNode } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import {
  type TSwipeBarOptions,
  toggleWrapperStyle,
} from "./swipeSidebarShared";
import { useSwipeBarContext } from "./useSwipeBarContext";

type ToggleProps = {
  showToggle?: boolean;
  ToggleComponent?: ReactNode;
  options: Required<TSwipeBarOptions>;
};

export function ToggleLeft({
  options,
  showToggle = true,
  ToggleComponent,
}: ToggleProps) {
  const { openSidebar, leftToggleRef, isLeftOpen, closeSidebar } =
    useSwipeBarContext();

  if (!showToggle) return null;

  return (
    <div
      ref={leftToggleRef}
      style={{
        ...toggleWrapperStyle,
        transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
        left: 0,
      }}
    >
      {(!isLeftOpen || (isLeftOpen && !options.showOverlay)) && (
        <button
          type="button"
          onClick={() =>
            isLeftOpen ? closeSidebar("left") : openSidebar("left")
          }
          style={{
            marginLeft: `${options.toggleIconEdgeDistancePx}px`,
            ...(isLeftOpen ? { transform: "rotate(180deg)" } : {}),
          }}
        >
          {ToggleComponent ?? (
            <ToggleIcon
              size={options.toggleIconSizePx}
              color={options.toggleIconColor}
            />
          )}
        </button>
      )}
    </div>
  );
}
