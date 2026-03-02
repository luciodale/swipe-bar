import type { ReactNode, RefObject } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type TSwipeBarOptions, toggleWrapperBottomStyle } from "./swipeSidebarShared";
import { useSwipeBarContext } from "./useSwipeBarContext";

type ToggleProps = {
	id: string;
	toggleRef: RefObject<HTMLDivElement | null>;
	showToggle?: boolean;
	ToggleComponent?: ReactNode;
	options: Required<TSwipeBarOptions>;
};

export function ToggleBottom({
	id,
	toggleRef,
	options,
	showToggle = true,
	ToggleComponent,
}: ToggleProps) {
	const { openSidebar, closeSidebar, bottomSidebars } = useSwipeBarContext();

	const isOpen = bottomSidebars[id]?.isOpen ?? false;

	if (!showToggle) return null;

	return (
		<div
			ref={toggleRef}
			style={{
				...toggleWrapperBottomStyle,
				transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
				zIndex: options.toggleZIndex,
			}}
		>
			{(!isOpen || (isOpen && !options.showOverlay)) && (
				<button
					type="button"
					onClick={() => {
						if (!options.disabled) {
							isOpen ? closeSidebar("bottom", { id }) : openSidebar("bottom", { id });
						}
					}}
					disabled={options.disabled}
					style={{
						marginBottom: `${options.toggleIconEdgeDistancePx}px`,
						// Rotate icon: -90deg points up when closed, 90deg points down when open
						transform: isOpen ? "rotate(90deg)" : "rotate(-90deg)",
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
