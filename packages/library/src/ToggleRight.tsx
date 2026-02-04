import type { ReactNode } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type TSwipeBarOptions, toggleWrapperStyle } from "./swipeSidebarShared";
import { useSwipeBarContext } from "./useSwipeBarContext";

type ToggleProps = {
	showToggle?: boolean;
	ToggleComponent?: ReactNode;
	options: Required<TSwipeBarOptions>;
};

export function ToggleRight({ options, showToggle = true, ToggleComponent }: ToggleProps) {
	const { openSidebar, rightToggleRef, isRightOpen, closeSidebar } = useSwipeBarContext();

	if (!showToggle) return null;

	return (
		// 1px wide container
		<div
			ref={rightToggleRef}
			style={{
				...toggleWrapperStyle,
				transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
				right: 0,
				zIndex: options.toggleZIndex,
			}}
		>
			{(!isRightOpen || (isRightOpen && !options.showOverlay)) && (
				<button
					type="button"
					onClick={() => {
						if (!options.disabled) {
							isRightOpen ? closeSidebar("right") : openSidebar("right");
						}
					}}
					disabled={options.disabled}
					style={{
						marginRight: `${options.toggleIconEdgeDistancePx}px`,
						// reverse because we are using the same icon for both left and right
						...(!isRightOpen ? { transform: "rotate(180deg)" } : {}),
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
