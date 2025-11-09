import { useSwipeLeftPane } from "../useSwipeLeftPane";
import { cn } from "../utils";
import { Overlay } from "./Overlay";

type SidebarProps = {
	className?: string;
};

export function SidebarLeft({ className }: SidebarProps) {
	const { isLeftOpen, openLeft, closeLeft, leftPaneRef, setLockedPane } = useSwipeLeftPane();

	function setIsCollapsedAndUnlockPane(shouldCollapse: boolean) {
		if (shouldCollapse) {
			closeLeft();
		} else {
			openLeft();
		}
		setLockedPane(null);
	}

	const isAbsolute = false;

	return (
		<>
			{/*  overlay */}

			<Overlay
				isCollapsed={!isLeftOpen}
				setIsCollapsed={setIsCollapsedAndUnlockPane}
				closeSidebarOnClick={false}
			/>

			<div
				ref={leftPaneRef}
				style={{
					willChange: "transform",
				}}
				className={cn(
					"z-30 top-0 bottom-0 active w-0 shrink-0 transform overflow-x-hidden bg-yellow-300",
					isAbsolute && "fixed left-0 top-0 bottom-0",
					className,
				)}
			>
				<div className="flex items-center w-full justify-between gap-4 p-2 h-14">
					<button type="button" onClick={() => setIsCollapsedAndUnlockPane(!isLeftOpen)}>
						toggle
					</button>
				</div>
			</div>
		</>
	);
}
