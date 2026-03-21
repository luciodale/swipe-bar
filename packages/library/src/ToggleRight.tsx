import type { ReactNode, RefObject } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type TSwipeBarOptions, toggleWrapperStyle } from "./swipeSidebarShared";
import { useSwipeBarContext } from "./useSwipeBarContext";

type ToggleProps = {
	id: string;
	toggleRef: RefObject<HTMLDivElement | null>;
	showToggle?: boolean;
	ToggleComponent?: ReactNode;
	options: Required<TSwipeBarOptions>;
};

export function ToggleRight({
	id,
	toggleRef,
	options,
	showToggle = true,
	ToggleComponent,
}: ToggleProps) {
	const { openSidebar, closeSidebar, rightSidebars } = useSwipeBarContext();

	const isOpen = rightSidebars[id]?.isOpen ?? false;

	if (!showToggle) return null;

	return (
		// 1px wide container
		<div
			ref={toggleRef}
			style={{
				...toggleWrapperStyle,
				transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
				right: 0,
				zIndex: options.toggleZIndex,
			}}
		>
			{(!isOpen || (isOpen && !options.showOverlay)) && (
				<button
					type="button"
					aria-expanded={isOpen}
					aria-controls={`swipebar-right-${id}`}
					aria-label={isOpen ? "Close right sidebar" : "Open right sidebar"}
					onClick={() => {
						if (!options.disabled) {
							isOpen ? closeSidebar("right", { id }) : openSidebar("right", { id });
						}
					}}
					disabled={options.disabled}
					style={{
						marginRight: `${options.toggleIconEdgeDistancePx}px`,
						// reverse because we are using the same icon for both left and right
						...(!isOpen ? { transform: "rotate(180deg)" } : {}),
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
