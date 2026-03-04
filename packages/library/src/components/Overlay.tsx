import { overlayIsOpenStyle, overlayStyle } from "../swipeSidebarShared";

type TOverlay = {
	isCollapsed: boolean;
	setCollapsed: () => void;
	closeSidebarOnClick?: boolean;
	overlayBackgroundColor?: string;
	overlayZIndex: number;
	transitionMs?: number;
};

export function Overlay({
	isCollapsed,
	setCollapsed,
	closeSidebarOnClick = true,
	transitionMs,
	overlayBackgroundColor,
	overlayZIndex,
}: TOverlay) {
	return (
		<div
			aria-hidden="true"
			style={{
				transitionDuration: `${transitionMs}ms`,
				...overlayStyle,
				...(!isCollapsed ? overlayIsOpenStyle : {}),
				...(overlayBackgroundColor ? { backgroundColor: overlayBackgroundColor } : {}),
				zIndex: overlayZIndex,
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
