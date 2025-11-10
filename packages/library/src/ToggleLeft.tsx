import type { FunctionComponent } from "react";
import type { SwipePaneContextProps } from "./SwipePaneProvider";
import type { SwipeBarProps } from "./swipePaneShared";
import { useSwipePaneContext } from "./useSwipePaneContext";
import { cn } from "./utils";

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

	const isCollapsed = !isLeftOpen;

	const style = {
		transition: `transform ${options.transitionMsOpen}ms ease, opacity ${options.transitionMsOpen}ms ease`,
		rotationTopIndicator: "rotate(-15deg)",
		rotationBottomIndicator: "rotate(15deg)",
	};

	return (
		// 1px wide container
		<div
			className={cn(
				"z-20 fixed top-1/2 -translate-y-1/2 flex w-px items-center justify-center left-0",
			)}
		>
			<button
				type="button"
				onClick={() => {
					if (isCollapsed) {
						openPane("left", options);
					} else {
						closePane("left", options);
					}
				}}
				className={cn("fixed top-1/2 -translate-y-1/2 cursor-pointer", "ml-12")}
			>
				<div
					className="relative flex h-[72px] w-8 items-center justify-center hover:opacity-100 opacity-50"
					style={{ transition: style.transition }}
				>
					<div className="sm:hidden absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-200" />

					<div className="flex h-6 w-6 flex-col items-center">
						{/* Top bar */}
						<div
							className="h-3 w-1 rounded-full bg-white"
							style={{
								transition: style.transition,
								transform: `translateY(0.15rem) ${style.rotationTopIndicator} translateZ(0px)`,
							}}
						/>
						{/* Bottom bar */}
						<div
							className="h-3 w-1 rounded-full bg-white"
							style={{
								transition: style.transition,
								transform: `translateY(-0.15rem) ${style.rotationBottomIndicator} translateZ(0px)`,
							}}
						/>
					</div>
				</div>
			</button>
		</div>
	);
}
