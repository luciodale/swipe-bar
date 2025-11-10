import type { FunctionComponent } from "react";
import type { SwipePaneContextProps } from "./SwipePaneProvider";
import { ToggleIcon } from "./components/ToggleIcon";
import { type SwipeBarProps, toggleWrapperStyle } from "./swipePaneShared";
import { useSwipePaneContext } from "./useSwipePaneContext";

type ToggleProps = {
	showToggle?: boolean;
	ToggleComponent?: FunctionComponent<Required<Pick<SwipePaneContextProps, "isRightOpen">>>;
	options: Required<SwipeBarProps>;
};

export function ToggleRight({ options, showToggle = true, ToggleComponent }: ToggleProps) {
	const { isRightOpen, openPane } = useSwipePaneContext();

	if (!showToggle) return null;

	if (ToggleComponent) {
		return <ToggleComponent isRightOpen={isRightOpen} />;
	}

	return (
		// 1px wide container
		<div
			style={{
				...toggleWrapperStyle,
				right: 0,
			}}
		>
			<button
				type="button"
				onClick={() => openPane("right", options)}
				style={{
					marginRight: `${options.toggleIconEdgeDistancePx}px`,
					transform: "rotate(180deg)",
				}}
			>
				<ToggleIcon size={options.toggleIconSizePx} color={options.toggleIconColor} />
			</button>
		</div>
	);
}
