import { overlayIsOpenStyle, overlayStyle } from "../swipeSidebarShared";

type TOverlay = {
  isCollapsed: boolean;
  setCollapsed: () => void;
  closeSidebarOnClick?: boolean;
  transitionMs?: number;
};

export function Overlay({
  isCollapsed,
  setCollapsed,
  closeSidebarOnClick = true,
  transitionMs,
}: TOverlay) {
  return (
    <div
      style={{
        transitionDuration: `${transitionMs}ms`,
        ...overlayStyle,
        ...(!isCollapsed ? overlayIsOpenStyle : {}),
      }}
      onMouseDown={(e) => {
        if (closeSidebarOnClick) {
          e.stopPropagation();
          setCollapsed();
        }
      }}
    />
  );
}
