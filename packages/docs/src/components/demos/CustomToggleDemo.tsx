import {
	SwipeBarBottom,
	SwipeBarLeft,
	SwipeBarProvider,
	SwipeBarRight,
	useSwipeBarContext,
} from "@luciodale/swipe-bar";
import { useState } from "react";

function ChevronToggle() {
	return (
		<div
			className="rounded-full bg-[#1a1a2e] border border-white/20 text-white
				shadow-lg hover:bg-[#252540] transition-colors
				w-10 h-10 flex items-center justify-center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M9 6l6 6-6 6"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function ToggleContent() {
	const { openSidebar, closeSidebar } = useSwipeBarContext();
	const [useCustom, setUseCustom] = useState(true);

	const toggle = useCustom ? <ChevronToggle /> : undefined;

	return (
		<div className="flex h-full w-full">
			<SwipeBarLeft
				isAbsolute
				ToggleComponent={toggle}
				className="bg-[#1a1a2e] text-white border-r border-white/10"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="text-sm font-semibold text-white/90">Left Sidebar</div>
					<button
						type="button"
						onClick={() => closeSidebar("left")}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarLeft>

			<div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-[400px]">
				<p className="text-sm text-white/50 mb-2">
					Replace the default toggle with any React element.
				</p>
				<div className="flex items-center gap-2">
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="sr-only peer"
							checked={useCustom}
							onChange={() => setUseCustom(!useCustom)}
						/>
						<div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-emerald-500/50 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
						<span className="ms-2 text-xs text-white/60">Custom toggle</span>
					</label>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => openSidebar("left")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Left
					</button>
					<button
						type="button"
						onClick={() => openSidebar("right")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Right
					</button>
					<button
						type="button"
						onClick={() => openSidebar("bottom")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						Open Bottom
					</button>
				</div>
			</div>

			<SwipeBarRight
				isAbsolute
				ToggleComponent={toggle}
				className="bg-[#1a1a2e] text-white border-l border-white/10"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="text-sm font-semibold text-white/90">Right Sidebar</div>
					<button
						type="button"
						onClick={() => closeSidebar("right")}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarRight>

			<SwipeBarBottom
				sidebarHeightPx={300}
				isAbsolute
				ToggleComponent={toggle}
				className="bg-[#1a1a2e] text-white border-t border-white/10"
			>
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-white/90">Bottom Sheet</span>
						<button
							type="button"
							onClick={() => closeSidebar("bottom")}
							className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
						>
							Close
						</button>
					</div>
					<p className="text-xs text-white/50">
						The same custom toggle component works on all three sidebar directions.
					</p>
				</div>
			</SwipeBarBottom>
		</div>
	);
}

export function CustomToggleDemo() {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<ToggleContent />
			</div>
		</SwipeBarProvider>
	);
}
