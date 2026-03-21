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

export function ToggleLeft({
	id,
	toggleRef,
	options,
	showToggle = true,
	ToggleComponent,
}: ToggleProps) {
	const { openSidebar, closeSidebar, leftSidebars } = useSwipeBarContext();

	const isOpen = leftSidebars[id]?.isOpen ?? false;

	if (!showToggle) return null;

	return (
		<div
			ref={toggleRef}
			style={{
				...toggleWrapperStyle,
				transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
				left: 0,
				zIndex: options.toggleZIndex,
			}}
		>
			{(!isOpen || (isOpen && !options.showOverlay)) && (
				<button
					type="button"
					aria-expanded={isOpen}
					aria-controls={`swipebar-left-${id}`}
					aria-label={isOpen ? "Close left sidebar" : "Open left sidebar"}
					onClick={() => {
						if (!options.disabled) {
							isOpen ? closeSidebar("left", { id }) : openSidebar("left", { id });
						}
					}}
					disabled={options.disabled}
					style={{
						marginLeft: `${options.toggleIconEdgeDistancePx}px`,
						...(isOpen ? { transform: "rotate(180deg)" } : {}),
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
