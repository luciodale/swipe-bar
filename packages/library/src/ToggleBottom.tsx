import type { ReactNode } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type TSwipeBarOptions, toggleWrapperBottomStyle } from "./swipeSidebarShared";
import { useSwipeBarContext } from "./useSwipeBarContext";

type ToggleProps = {
	showToggle?: boolean;
	ToggleComponent?: ReactNode;
	options: Required<TSwipeBarOptions>;
};

export function ToggleBottom({ options, showToggle = true, ToggleComponent }: ToggleProps) {
	const { openSidebar, bottomToggleRef, isBottomOpen, closeSidebar } = useSwipeBarContext();

	if (!showToggle) return null;

	return (
		<div
			ref={bottomToggleRef}
			style={{
				...toggleWrapperBottomStyle,
				transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
				zIndex: options.toggleZIndex,
			}}
		>
			{(!isBottomOpen || (isBottomOpen && !options.showOverlay)) && (
				<button
					type="button"
					onClick={() => (isBottomOpen ? closeSidebar("bottom") : openSidebar("bottom"))}
					style={{
						marginBottom: `${options.toggleIconEdgeDistancePx}px`,
						// Rotate icon: -90deg points up when closed, 90deg points down when open
						transform: isBottomOpen ? "rotate(90deg)" : "rotate(-90deg)",
					}}
				>
					{ToggleComponent ?? (
						<ToggleIcon size={options.toggleIconSizePx} color={options.toggleIconColor} />
					)}
				</button>
			)}
		</div>
	);
}

