import { SidebarLeft, SidebarRight, useSwipePaneContext } from "@luciodale/swipe-pane";
import { useMemo } from "react";

export function App() {
	const { openPane } = useSwipePaneContext();

	const ToggleComponent = useMemo(
		() => (
			<button
				type="button"
				onClick={() => {
					openPane("left");
				}}
				className="bg-blue-800 fixed top-1/2 left-10 w-10 h-10
      -translate-y-1/2
      "
			>
				open
			</button>
		),
		[openPane],
	);

	return (
		<>
			<div className="flex" style={{ height: "100dvh" }}>
				<div className="relative flex h-full w-full overflow-hidden">
					<SidebarLeft ToggleComponent={ToggleComponent} className="bg-red-800" />
					<div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
						<div className="h-full relative flex w-full grow overflow-hidden">
							<div className="flex flex-col transition-width relative h-full w-full flex-1 overflow-auto bg-presentation">
								{/* main chat */}
								<main className="flex h-full flex-col overflow-y-auto overscroll-contain">
									<div className="flex h-full w-full flex-col">
										{/* HEADER */}
										<div className="sticky top-0 z-10 flex justify-between h-14 w-full items-center gap-2 p-2 bg-black">
											<div>header</div>
											<div>end</div>
										</div>

										<div className="flex flex-col h-full overflow-y-auto justify-between">
											<span className="text-white">content</span>
											<span className="text-white">content</span>
											<span className="text-white">content</span>
											<span className="text-white">content</span>
										</div>
									</div>
								</main>
							</div>
						</div>
					</div>
					<SidebarRight />
				</div>
			</div>
		</>
	);
}
