import { SwipeBarLeft, SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useState } from "react";

function PlaygroundContent() {
	const { openSidebar, closeSidebar, globalOptions, setGlobalOptions, isLeftOpen } =
		useSwipeBarContext();

	const [formValues, setFormValues] = useState({
		transitionMs: globalOptions.transitionMs,
		sidebarWidthPx: globalOptions.sidebarWidthPx,
		edgeActivationWidthPx: globalOptions.edgeActivationWidthPx,
		showOverlay: globalOptions.showOverlay,
		fadeContent: globalOptions.fadeContent,
		showToggle: globalOptions.showToggle,
		swipeToOpen: globalOptions.swipeToOpen,
		swipeToClose: globalOptions.swipeToClose,
		disableSwipe: globalOptions.disableSwipe,
		disabled: globalOptions.disabled,
	});

	function handleNumber(field: keyof typeof formValues, value: string) {
		const num = Number.parseInt(value, 10);
		if (Number.isNaN(num)) return;
		setFormValues((prev) => ({ ...prev, [field]: num }));
		setGlobalOptions({ [field]: num });
	}

	function handleBoolean(field: keyof typeof formValues) {
		const next = !formValues[field];
		setFormValues((prev) => ({ ...prev, [field]: next }));
		setGlobalOptions({ [field]: next });
	}

	return (
		<div className="flex h-full w-full">
			<SwipeBarLeft isAbsolute className="bg-[#1a1a2e] text-white border-r border-white/10">
				<div className="flex h-full flex-col p-4 gap-3">
					<div className="text-sm font-semibold text-white/90">Preview Sidebar</div>
					<p className="text-xs text-white/50">
						Adjust the props on the right to see changes here in real time.
					</p>
					<button
						type="button"
						onClick={() => closeSidebar("left")}
						className="mt-auto w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 border border-white/10"
					>
						Close
					</button>
				</div>
			</SwipeBarLeft>

			<div className="flex-1 flex flex-col gap-4 p-4 min-h-[500px] overflow-y-auto">
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold text-white/90">Props Playground</span>
					<button
						type="button"
						onClick={() => openSidebar("left")}
						className="rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
					>
						{isLeftOpen ? "Sidebar Open" : "Open Sidebar"}
					</button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="rounded-lg border border-white/10 bg-white/5 p-3">
						<label htmlFor="pp-transition" className="block text-xs text-white/50 mb-1">
							transitionMs
						</label>
						<input
							id="pp-transition"
							type="number"
							value={formValues.transitionMs}
							onChange={(e) => handleNumber("transitionMs", e.target.value)}
							className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-sm text-white"
						/>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-3">
						<label htmlFor="pp-width" className="block text-xs text-white/50 mb-1">
							sidebarWidthPx
						</label>
						<input
							id="pp-width"
							type="number"
							value={formValues.sidebarWidthPx}
							onChange={(e) => handleNumber("sidebarWidthPx", e.target.value)}
							className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-sm text-white"
						/>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-3">
						<label htmlFor="pp-edge" className="block text-xs text-white/50 mb-1">
							edgeActivationWidthPx
						</label>
						<input
							id="pp-edge"
							type="number"
							value={formValues.edgeActivationWidthPx}
							onChange={(e) => handleNumber("edgeActivationWidthPx", e.target.value)}
							className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-sm text-white"
						/>
					</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
					<div className="text-xs text-white/50 mb-2">Boolean Options</div>
					{(
						[
							"showOverlay",
							"fadeContent",
							"showToggle",
							"swipeToOpen",
							"swipeToClose",
							"disableSwipe",
							"disabled",
						] as const
					).map((field) => (
						<div key={field} className="flex items-center justify-between">
							<span className="text-sm text-white/70">{field}</span>
							<button
								type="button"
								onClick={() => handleBoolean(field)}
								aria-label={`Toggle ${field}`}
								className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
									formValues[field] ? "bg-emerald-500/50" : "bg-white/10"
								}`}
							>
								<span
									className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
										formValues[field] ? "translate-x-[18px]" : "translate-x-[3px]"
									}`}
								/>
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function PropsPlaygroundDemo() {
	return (
		<SwipeBarProvider toggleIconEdgeDistancePx={60} swipeBarZIndex={60} overlayZIndex={55}>
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d1a]">
				<PlaygroundContent />
			</div>
		</SwipeBarProvider>
	);
}
