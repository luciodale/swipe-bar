import { cn } from "../utils";
import { Overlay } from "./Overlay";

import { useSwipeRightPane } from "../useSwipeRightPane";
type SidebarProps = {
	className?: string;
};

export function SidebarRight({ className }: SidebarProps) {
	const { isRightOpen, rightDragX, openRight, closeRight, setLockedPane } = useSwipeRightPane();

	function setIsCollapsedAndUnlockPane(shouldCollapse: boolean) {
		if (shouldCollapse) {
			closeRight();
		} else {
			openRight();
		}
		setLockedPane(null);
	}

	const isAbsolute = false;

	return (
		<>
			{/*  overlay */}
			<Overlay isCollapsed={!isRightOpen} setIsCollapsed={setIsCollapsedAndUnlockPane} />

			<div
				style={{
					willChange: "transform",
					...(rightDragX != null
						? {
								transform: `translate3d(${rightDragX}px, 0, 0)`,
								transition: "none",
							}
						: !isRightOpen
							? {
									transform: "translateX(100%)",
									width: "0px",
								}
							: {}),
				}}
				className={cn(
					"z-30 top-0 bottom-0 active w-[320px] md:w-[260px] shrink-0 transform overflow-x-hidden bg-yellow-300 transition-all duration-200 ease-in-out",
					isAbsolute && "fixed left-0 top-0 bottom-0",
					className,
				)}
			>
				<div className="flex items-center w-full justify-between gap-4 p-2 h-14">
					<button type="button" onClick={() => closeRight()}>
						toggle
					</button>
				</div>
			</div>
		</>
	);
}
