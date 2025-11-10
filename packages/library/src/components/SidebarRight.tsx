import { type FunctionComponent, useMemo } from "react";
import type { SwipePaneContextProps } from "../SwipePaneProvider";
import { ToggleRight } from "../ToggleRight";
import type { SwipeBarProps } from "../swipePaneShared";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { useSwipeRightPane } from "../useSwipeRightPane";
import { cn } from "../utils";
import { Overlay } from "./Overlay";

export function SidebarRight({
	className,
	transitionMsOpen,
	transitionMsClose,
	paneWidthPx,
	isAbsolute,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
	showOverlay,
	closeSidebarOnOverlayClick,
	showToggle,
	ToggleComponent,
}: SwipeBarProps & {
	className?: string;
	showToggle?: boolean;
	ToggleComponent?: FunctionComponent<Required<Pick<SwipePaneContextProps, "isRightOpen">>>;
}) {
	const { globalOptions, isRightOpen, closePane, rightPaneRef } = useSwipePaneContext();

	const options = useMemo(
		() => ({
			paneWidthPx: paneWidthPx ?? globalOptions.paneWidthPx,
			transitionMsOpen: transitionMsOpen ?? globalOptions.transitionMsOpen,
			transitionMsClose: transitionMsClose ?? globalOptions.transitionMsClose,
			edgeActivationWidthPx: edgeActivationWidthPx ?? globalOptions.edgeActivationWidthPx,
			dragActivationDeltaPx: dragActivationDeltaPx ?? globalOptions.dragActivationDeltaPx,
			showOverlay: showOverlay ?? globalOptions.showOverlay,
			closeSidebarOnOverlayClick:
				closeSidebarOnOverlayClick ?? globalOptions.closeSidebarOnOverlayClick,
			isAbsolute: isAbsolute ?? globalOptions.isAbsolute,
			showToggle,
			ToggleComponent,
		}),
		[
			paneWidthPx,
			transitionMsOpen,
			transitionMsClose,
			edgeActivationWidthPx,
			dragActivationDeltaPx,
			showOverlay,
			closeSidebarOnOverlayClick,
			isAbsolute,
			showToggle,
			ToggleComponent,
			globalOptions,
		],
	);

	useSwipeRightPane(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isRightOpen}
					setCollapsed={() => closePane("right", options)}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
				/>
			)}

			<ToggleRight options={options} showToggle={showToggle} ToggleComponent={ToggleComponent} />

			<div
				ref={rightPaneRef}
				style={{
					willChange: "transform",
				}}
				className={cn(
					"z-30 top-0 bottom-0 active w-0 shrink-0 transform overflow-x-hidden bg-yellow-300",
					options.isAbsolute && "fixed left-0 top-0 bottom-0",
					className,
				)}
			>
				<div className="flex items-center w-full justify-between gap-4 p-2 h-14">
					<button type="button" onClick={() => closePane("right", options)}>
						toggle
					</button>
				</div>
			</div>
		</>
	);
}
