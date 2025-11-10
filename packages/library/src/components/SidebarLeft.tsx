import { type FunctionComponent, useMemo } from "react";
import type { SwipePaneContextProps } from "../SwipePaneProvider";
import { ToggleLeft } from "../ToggleLeft";
import type { SwipeBarProps } from "../swipePaneShared";
import { useSwipeLeftPane } from "../useSwipeLeftPane";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { cn } from "../utils";
import { Overlay } from "./Overlay";

export function SidebarLeft({
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
	ToggleComponent?: FunctionComponent<Required<Pick<SwipePaneContextProps, "isLeftOpen">>>;
}) {
	const { globalOptions, isLeftOpen, closePane, leftPaneRef } = useSwipePaneContext();
	console.log("globalOptions in sidebar left", globalOptions);
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

	useSwipeLeftPane(options);

	console.log("global options merged in sidebar left", options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isLeftOpen}
					setCollapsed={() => closePane("left", options)}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
				/>
			)}

			<ToggleLeft options={options} showToggle={showToggle} ToggleComponent={ToggleComponent} />

			<div
				ref={leftPaneRef}
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
					<button type="button" onClick={() => closePane("left", options)}>
						toggle
					</button>
				</div>
			</div>
		</>
	);
}
