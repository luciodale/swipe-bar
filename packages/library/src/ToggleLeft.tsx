import type { FunctionComponent } from "react";
import type { SwipePaneContextProps } from "./SwipePaneProvider";
import { ToggleIcon } from "./components/ToggleIcon";
import { type SwipeBarProps, toggleWrapperStyle } from "./swipePaneShared";
import { useSwipePaneContext } from "./useSwipePaneContext";

type ToggleProps = {
	showToggle?: boolean;
	ToggleComponent?: FunctionComponent<Required<Pick<SwipePaneContextProps, "isLeftOpen">>>;
	options: Required<SwipeBarProps>;
};

export function ToggleLeft({ options, showToggle = true, ToggleComponent }: ToggleProps) {
	const { isLeftOpen, openPane, closePane } = useSwipePaneContext();

	if (!showToggle) return null;

	if (ToggleComponent) {
		return <ToggleComponent isLeftOpen={isLeftOpen} />;
	}

	return (
		<div
			style={{
				...toggleWrapperStyle,
				left: 0,
			}}
		>
			<button
				type="button"
				onClick={() => openPane("left", options)}
				style={{
					marginLeft: `${options.toggleIconEdgeDistancePx}px`,
				}}
			>
				<ToggleIcon size={options.toggleIconSizePx} color={options.toggleIconColor} />
			</button>
		</div>
	);
}
