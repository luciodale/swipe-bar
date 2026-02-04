import { useSwipeBarContext } from "@luciodale/swipe-bar";
import { useEffect, useState } from "react";

// Helper to convert rgba to hex
const rgbaToHex = (rgba: string): string => {
	const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
	if (!match) return "#000000";
	const r = Number.parseInt(match[1], 10).toString(16).padStart(2, "0");
	const g = Number.parseInt(match[2], 10).toString(16).padStart(2, "0");
	const b = Number.parseInt(match[3], 10).toString(16).padStart(2, "0");
	return `#${r}${g}${b}`;
};

// Helper to extract opacity from rgba
const getOpacityFromRgba = (rgba: string): number => {
	const match = rgba.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
	return match ? Number.parseFloat(match[1]) : 1;
};

// Helper to convert hex and opacity to rgba
const hexToRgba = (hex: string, opacity: number): string => {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

type PropsCustomizationProps = {
	useCustomToggle: boolean;
	setUseCustomToggle: (value: boolean) => void;
};

export function PropsCustomization({
	useCustomToggle,
	setUseCustomToggle,
}: PropsCustomizationProps) {
	const { globalOptions, setGlobalOptions } = useSwipeBarContext();

	const [formValues, setFormValues] = useState({
		transitionMs: globalOptions.transitionMs,
		sidebarWidthPx: globalOptions.sidebarWidthPx,
		edgeActivationWidthPx: globalOptions.edgeActivationWidthPx,
		dragActivationDeltaPx: globalOptions.dragActivationDeltaPx,
		showOverlay: globalOptions.showOverlay,
		fadeContent: globalOptions.fadeContent,
		fadeContentTransitionMs: globalOptions.fadeContentTransitionMs,
		overlayBackgroundColor: globalOptions.overlayBackgroundColor,
		overlayOpacity: getOpacityFromRgba(globalOptions.overlayBackgroundColor),
		toggleIconSizePx: globalOptions.toggleIconSizePx,
		toggleIconColor: globalOptions.toggleIconColor,
		toggleIconEdgeDistancePx: globalOptions.toggleIconEdgeDistancePx,
		showToggle: globalOptions.showToggle,
		mediaQueryWidth: globalOptions.mediaQueryWidth,
		swipeBarZIndex: globalOptions.swipeBarZIndex,
		toggleZIndex: globalOptions.toggleZIndex,
		overlayZIndex: globalOptions.overlayZIndex,
		swipeToOpen: globalOptions.swipeToOpen,
		swipeToClose: globalOptions.swipeToClose,
		disabled: globalOptions.disabled,
	});

	const [useFullWidth, setUseFullWidth] = useState(false);

	// Update sidebar width to window.innerWidth when toggle is on
	useEffect(() => {
		if (!useFullWidth) return;

		const updateWidth = () => {
			const width = window.innerWidth;
			setFormValues((prev) => ({ ...prev, sidebarWidthPx: width }));
			setGlobalOptions({ sidebarWidthPx: width });
		};

		// Set initial width
		updateWidth();

		// Listen for window resize
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, [useFullWidth, setGlobalOptions]);

	const handleNumberChange = (field: keyof typeof formValues, value: string) => {
		// Allow empty string for better UX while typing
		if (value === "") {
			setFormValues((prev) => ({ ...prev, [field]: "" as unknown as number }));
			setGlobalOptions({ [field]: 0 });
			return;
		}

		const numValue = Number.parseInt(value, 10);
		if (!Number.isNaN(numValue)) {
			setFormValues((prev) => ({ ...prev, [field]: numValue }));
			setGlobalOptions({ [field]: numValue });
		}
	};

	const handleNumberBlur = (field: keyof typeof formValues) => {
		// On blur, if the value is empty, set it to 0
		if (formValues[field] === "" || formValues[field] === null || formValues[field] === undefined) {
			setFormValues((prev) => ({ ...prev, [field]: 0 }));
			setGlobalOptions({ [field]: 0 });
		}
	};

	const handleBooleanChange = (field: keyof typeof formValues, value: boolean) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
		setGlobalOptions({ [field]: value });
	};

	const handleOverlayColorChange = (hex: string) => {
		const rgba = hexToRgba(hex, formValues.overlayOpacity);
		setFormValues((prev) => ({ ...prev, overlayBackgroundColor: rgba }));
		setGlobalOptions({ overlayBackgroundColor: rgba });
	};

	const handleOverlayOpacityChange = (opacity: number) => {
		const hex = rgbaToHex(formValues.overlayBackgroundColor);
		const rgba = hexToRgba(hex, opacity);
		setFormValues((prev) => ({
			...prev,
			overlayOpacity: opacity,
			overlayBackgroundColor: rgba,
		}));
		setGlobalOptions({ overlayBackgroundColor: rgba });
	};

	const handleToggleIconColorChange = (color: string) => {
		setFormValues((prev) => ({ ...prev, toggleIconColor: color }));
		setGlobalOptions({ toggleIconColor: color });
	};

	return (
		<div className="h-full rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-white">
			<h2 className="text-xl font-semibold mb-4">Customize Swipe Bar</h2>
			<p className="text-white/70 text-sm mb-6">
				Adjust the swipe bar behavior and appearance in real-time
			</p>

			<div className="space-y-4">
				{/* Toggle Type Selection */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<h3 className="text-sm font-medium text-white/90 mb-3">Toggle Type</h3>
					<div className="flex items-center justify-between">
						<span className="text-sm text-white/80">Use Custom Toggle</span>
						<button
							type="button"
							onClick={() => setUseCustomToggle(!useCustomToggle)}
							aria-label="Toggle custom toggle"
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								useCustomToggle ? "bg-emerald-400" : "bg-white/20"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									useCustomToggle ? "translate-x-6" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
					{useCustomToggle && (
						<p className="mt-2 text-xs text-left text-white/60">
							Toggle icon settings are disabled when using a custom toggle
						</p>
					)}
				</div>

				{/* Disabled */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<h3 className="text-sm font-medium text-white/90 mb-3">Behavior</h3>
					<div className="flex items-center justify-between">
						<span className="text-sm text-white/80">Disabled</span>
						<button
							type="button"
							onClick={() => handleBooleanChange("disabled", !formValues.disabled)}
							aria-label="Toggle disabled"
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								formValues.disabled ? "bg-red-500" : "bg-white/20"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									formValues.disabled ? "translate-x-6" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
					{formValues.disabled && (
						<p className="mt-2 text-xs text-left text-white/60">
							Disables all swipe gestures, toggle buttons, and programmatic control
						</p>
					)}
				</div>

				{/* Transition Duration */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="transitionMs" className="block text-sm font-medium text-white/90 mb-2">
						Transition Duration (ms)
					</label>
					<input
						id="transitionMs"
						type="number"
						value={formValues.transitionMs}
						onChange={(e) => handleNumberChange("transitionMs", e.target.value)}
						onBlur={() => handleNumberBlur("transitionMs")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Sidebar Width */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<div className="flex items-center justify-between mb-2">
						<label htmlFor="sidebarWidthPx" className="block text-sm font-medium text-white/90">
							Sidebar Width (px)
						</label>
						<div className="flex items-center gap-2">
							<span className="text-xs text-white/70">Full Width</span>
							<button
								type="button"
								onClick={() => setUseFullWidth(!useFullWidth)}
								aria-label="Toggle full width"
								className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
									useFullWidth ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
										useFullWidth ? "translate-x-5" : "translate-x-1"
									}`}
								/>
							</button>
						</div>
					</div>
					<input
						id="sidebarWidthPx"
						type="number"
						value={formValues.sidebarWidthPx}
						onChange={(e) => handleNumberChange("sidebarWidthPx", e.target.value)}
						onBlur={() => handleNumberBlur("sidebarWidthPx")}
						disabled={useFullWidth}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					{useFullWidth && (
						<div className="mt-2 text-xs text-white/60">Dynamically set to window width</div>
					)}
				</div>

				{/* Edge Activation Width */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label
						htmlFor="edgeActivationWidthPx"
						className="block text-sm font-medium text-white/90 mb-2"
					>
						Edge Activation Width (px)
					</label>
					<input
						id="edgeActivationWidthPx"
						type="number"
						value={formValues.edgeActivationWidthPx}
						onChange={(e) => handleNumberChange("edgeActivationWidthPx", e.target.value)}
						onBlur={() => handleNumberBlur("edgeActivationWidthPx")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Drag Activation Delta */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label
						htmlFor="dragActivationDeltaPx"
						className="block text-sm font-medium text-white/90 mb-2"
					>
						Drag Activation Delta (px)
					</label>
					<input
						id="dragActivationDeltaPx"
						type="number"
						value={formValues.dragActivationDeltaPx}
						onChange={(e) => handleNumberChange("dragActivationDeltaPx", e.target.value)}
						onBlur={() => handleNumberBlur("dragActivationDeltaPx")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Toggle Icon Size */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label
						htmlFor="toggleIconSizePx"
						className="block text-sm font-medium text-white/90 mb-2"
					>
						Toggle Icon Size (px)
						{useCustomToggle && (
							<span className="ml-2 text-xs text-white/60 font-normal">(Custom toggle active)</span>
						)}
					</label>
					<input
						id="toggleIconSizePx"
						type="number"
						value={formValues.toggleIconSizePx}
						onChange={(e) => handleNumberChange("toggleIconSizePx", e.target.value)}
						onBlur={() => handleNumberBlur("toggleIconSizePx")}
						disabled={useCustomToggle}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
					/>
				</div>

				{/* Toggle Icon Edge Distance */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label
						htmlFor="toggleIconEdgeDistancePx"
						className="block text-sm font-medium text-white/90 mb-2"
					>
						Toggle Icon Edge Distance (px)
					</label>
					<input
						id="toggleIconEdgeDistancePx"
						type="number"
						value={formValues.toggleIconEdgeDistancePx}
						onChange={(e) => handleNumberChange("toggleIconEdgeDistancePx", e.target.value)}
						onBlur={() => handleNumberBlur("toggleIconEdgeDistancePx")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Media Query Width */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="mediaQueryWidth" className="block text-sm font-medium text-white/90 mb-2">
						<div className="flex flex-col items-center justify-between">
							Media Query Width (px)
							<span className="text-xs text-white/60">
								swiping kicks in for widths below this value
							</span>
						</div>
					</label>
					<input
						id="mediaQueryWidth"
						type="number"
						value={formValues.mediaQueryWidth}
						onChange={(e) => handleNumberChange("mediaQueryWidth", e.target.value)}
						onBlur={() => handleNumberBlur("mediaQueryWidth")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Swipe Bar Z-Index */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="swipeBarZIndex" className="block text-sm font-medium text-white/90 mb-2">
						Swipe Bar Z-Index
					</label>
					<input
						id="swipeBarZIndex"
						type="number"
						value={formValues.swipeBarZIndex}
						onChange={(e) => handleNumberChange("swipeBarZIndex", e.target.value)}
						onBlur={() => handleNumberBlur("swipeBarZIndex")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Toggle Z-Index */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="toggleZIndex" className="block text-sm font-medium text-white/90 mb-2">
						Toggle Z-Index
					</label>
					<input
						id="toggleZIndex"
						type="number"
						value={formValues.toggleZIndex}
						onChange={(e) => handleNumberChange("toggleZIndex", e.target.value)}
						onBlur={() => handleNumberBlur("toggleZIndex")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Overlay Z-Index */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="overlayZIndex" className="block text-sm font-medium text-white/90 mb-2">
						Overlay Z-Index
					</label>
					<input
						id="overlayZIndex"
						type="number"
						value={formValues.overlayZIndex}
						onChange={(e) => handleNumberChange("overlayZIndex", e.target.value)}
						onBlur={() => handleNumberBlur("overlayZIndex")}
						className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
					/>
				</div>

				{/* Overlay Background Color */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label
						htmlFor="overlayBackgroundColor"
						className="block text-sm font-medium text-white/90 mb-2"
					>
						Overlay Background Color
					</label>
					<div className="flex items-center gap-3">
						<input
							id="overlayBackgroundColor"
							type="color"
							value={rgbaToHex(formValues.overlayBackgroundColor)}
							onChange={(e) => handleOverlayColorChange(e.target.value)}
							className="h-10 w-16 cursor-pointer rounded-lg border border-white/20 bg-white/10"
						/>
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs text-white/70">Opacity</span>
								<span className="text-xs text-white/90">
									{Math.round(formValues.overlayOpacity * 100)}%
								</span>
							</div>
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								value={formValues.overlayOpacity}
								onChange={(e) => handleOverlayOpacityChange(Number.parseFloat(e.target.value))}
								className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
							/>
						</div>
					</div>
					<div className="mt-2 text-xs text-white/60 font-mono">
						{formValues.overlayBackgroundColor}
					</div>
				</div>

				{/* Toggle Icon Color */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<label htmlFor="toggleIconColor" className="block text-sm font-medium text-white/90 mb-2">
						Toggle Icon Color
						{useCustomToggle && (
							<span className="ml-2 text-xs text-white/60 font-normal">(Custom toggle active)</span>
						)}
					</label>
					<div className="flex items-center gap-3">
						<input
							id="toggleIconColor"
							type="color"
							value={
								formValues.toggleIconColor.startsWith("#") ? formValues.toggleIconColor : "#ffffff"
							}
							onChange={(e) => handleToggleIconColorChange(e.target.value)}
							disabled={useCustomToggle}
							className="h-10 w-16 cursor-pointer rounded-lg border border-white/20 bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
						/>
						<input
							type="text"
							value={formValues.toggleIconColor}
							onChange={(e) => handleToggleIconColorChange(e.target.value)}
							disabled={useCustomToggle}
							className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="#ffffff"
						/>
					</div>
				</div>

				{/* Boolean Toggles */}
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<h3 className="text-sm font-medium text-white/90 mb-3">Options</h3>
					<div className="space-y-3">
						{/* Show Overlay */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/80">Show Overlay</span>
							<button
								type="button"
								onClick={() => handleBooleanChange("showOverlay", !formValues.showOverlay)}
								aria-label="Toggle show overlay"
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									formValues.showOverlay ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										formValues.showOverlay ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>

						{/* Fade Content */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/80">Fade Content</span>
							<button
								type="button"
								onClick={() => handleBooleanChange("fadeContent", !formValues.fadeContent)}
								aria-label="Toggle fade content"
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									formValues.fadeContent ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										formValues.fadeContent ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>

						{/* Fade Content Transition */}
						{formValues.fadeContent && (
							<div className="flex items-center justify-between">
								<span className="text-sm text-white/80">Fade Duration (ms)</span>
								<input
									type="number"
									value={formValues.fadeContentTransitionMs}
									onChange={(e) => handleNumberChange("fadeContentTransitionMs", e.target.value)}
									onBlur={() => handleNumberBlur("fadeContentTransitionMs")}
									className="w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
								/>
							</div>
						)}

						{/* Show Toggle */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/80">Show Toggle</span>
							<button
								type="button"
								onClick={() => handleBooleanChange("showToggle", !formValues.showToggle)}
								aria-label="Toggle show toggle button"
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									formValues.showToggle ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										formValues.showToggle ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>

						{/* Swipe To Open */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/80">Swipe To Open</span>
							<button
								type="button"
								onClick={() => handleBooleanChange("swipeToOpen", !formValues.swipeToOpen)}
								aria-label="Toggle swipe to open"
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									formValues.swipeToOpen ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										formValues.swipeToOpen ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>

						{/* Swipe To Close */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/80">Swipe To Close</span>
							<button
								type="button"
								onClick={() => handleBooleanChange("swipeToClose", !formValues.swipeToClose)}
								aria-label="Toggle swipe to close"
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									formValues.swipeToClose ? "bg-emerald-400" : "bg-white/20"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										formValues.swipeToClose ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
