import {
	SwipeBarBottom,
	SwipeBarLeft,
	SwipeBarRight,
	useSwipeBarContext,
} from "@luciodale/swipe-bar";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PropsConfiguration, QuickStart } from "./components/CodeSnippets";
import { CustomToggle } from "./components/CustomToggle";
import { PropsCustomization } from "./components/PropsCustomization";
import { QuickSettings } from "./components/QuickSettings";
import { cn } from "./utils";

export function App() {
	const {
		openSidebar,
		openSidebarToMidAnchor,
		closeSidebar,
		isLeftOpen,
		isRightOpen,
		isBottomOpen,
	} = useSwipeBarContext();
	const [useCustomToggle, setUseCustomToggle] = useState(true);
	const [useMidAnchor, setUseMidAnchor] = useState(true);

	// Check if on mobile (matches library default of 640px)
	const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
	useEffect(() => {
		const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			<div className="flex" style={{ height: "100dvh" }}>
				<div className="relative flex h-full w-full overflow-hidden">
					{/* Ambient gradient background */}
					<div className="pointer-events-none absolute inset-0 -z-10">
						<div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(88,101,242,0.25),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(16,185,129,0.2),transparent_60%),linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.6))]" />
						{/* soft blobs */}
						<div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
						<div className="absolute top-1/3 -right-24 h-122 w-md rounded-full bg-indigo-500/20 blur-3xl" />
						<div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-120 w-120 rounded-full bg-fuchsia-400/10 blur-3xl" />
					</div>

					{/* Left sidebar with glass content */}

					<SwipeBarLeft
						ToggleComponent={useCustomToggle ? <CustomToggle /> : undefined}
						className={cn("bg-black/90 text-white", isLeftOpen && "border-r border-white/20")}
					>
						<div className={cn("flex h-full flex-col p-4 gap-4")}>
							<div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
								<div className="relative">
									<div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-400 to-indigo-400" />
									<div className="absolute -inset-0.5 rounded-full bg-linear-to-br from-emerald-400/30 to-indigo-400/30 blur-md" />
								</div>
								<div className="relative">
									<div className="text-sm/5 text-white/80">Welcome back</div>
									<div className="text-base font-semibold">Liquid Glass UI</div>
								</div>
							</div>

							<nav className="mt-2 flex flex-col gap-2">
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left  text-white/90 hover:bg-white/10 border border-white/10"
								>
									Dashboard
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Projects
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Analytics
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Settings
								</button>
								<button
									type="button"
									onClick={() => closeSidebar("left")}
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Close Sidebar
								</button>
							</nav>

							<div className="mt-auto rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Storage</div>
								<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
									<div className="h-full w-2/3 rounded-full bg-linear-to-r from-emerald-400 to-indigo-400" />
								</div>
								<div className="mt-2 text-xs text-white/60">66% used • 34 GB free</div>
							</div>
						</div>
					</SwipeBarLeft>

					<div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
						<div className="h-full relative flex w-full grow overflow-hidden">
							<div className="flex flex-col transition-width relative h-full w-full flex-1 overflow-auto">
								{/* main content */}
								<main className="flex h-full flex-col overflow-y-auto overscroll-contain">
									{/* sticky glass header */}
									<div
										className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4
									backdrop-blur-xl"
									>
										<div
											className="absolute bottom-0 left-0 right-0 h-[0.5px]"
											style={{
												background:
													"linear-gradient(to right, rgba(255,255,255,0.85), rgba(203,213,224,0.5), rgba(160,174,192,0.55), rgba(226,232,240,0.5), rgba(255,255,255,0.8))",
											}}
										/>
										<div className="flex items-center gap-3">
											<img src="/logo.svg" alt="Touch Slide Logo" className="h-8 w-8" />
											<div className="text-white/90 font-medium">SwipeBar</div>
										</div>
										<a
											href="https://github.com/luciodale/swipe-bar"
											target="_blank"
											rel="noopener noreferrer"
											className="text-white"
											title="View on GitHub"
										>
											<span className="sr-only">View on GitHub</span>
											<svg
												className="h-6 w-6"
												fill="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
													clipRule="evenodd"
												/>
											</svg>
										</a>
									</div>

									<div className="text-center relative mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-2">
										{/* hero card */}
										<section className="col-span-1 md:col-span-2 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
											<img src="/logo.svg" alt="Touch Slide Logo" className="w-52 mx-auto" />
											<div className="text-4xl font-bold mb-2 bg-linear-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
												SwipeBar
											</div>

											<div className="my-4 inline-block rounded-lg bg-black/20 border border-white/10 overflow-hidden">
												<SyntaxHighlighter
													language="bash"
													style={vscDarkPlus}
													customStyle={{
														margin: 0,
														padding: "0.5rem 0.75rem",
														background: "transparent",
														fontSize: "0.875rem",
														lineHeight: "1.5",
													}}
													codeTagProps={{
														style: {
															fontFamily: "ui-monospace, monospace",
														},
													}}
												>
													npm install @luciodale/swipe-bar
												</SyntaxHighlighter>
											</div>
											<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
												A native swipe bar experience <br /> with zero dependencies
											</h1>
											<p className="mt-2 text-white/80">
												Responsive, swipeable side bars with a modern glassmorphism aesthetic.
											</p>
											<p className="mt-2 text-sm text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 inline-block">
												📱 <strong>Swipe gestures are mobile-only</strong> (screen width &lt;
												640px).
												{!isSmallScreen && "Resize your browser to try swiping!"}
											</p>
											<div className="mt-10 flex flex-col items-center gap-8">
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
													<button
														onClick={() => openSidebar("left")}
														type="button"
														className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.1)] transition-all group cursor-pointer"
													>
														<div className="p-3 rounded-xl bg-white/5 group-hover:bg-emerald-400/10 transition-colors">
															<svg
																width="24"
																height="24"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="text-emerald-400"
															>
																<title>Arrow Left</title>
																<path d="M19 12H5M5 12L12 19M5 12L12 5" />
															</svg>
														</div>
														<span className="font-medium text-sm">Left Bar</span>
													</button>

													<button
														onClick={() =>
															useMidAnchor && isSmallScreen
																? openSidebarToMidAnchor("bottom")
																: openSidebar("bottom")
														}
														type="button"
														className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.1)] transition-all group cursor-pointer"
													>
														<div className="p-3 rounded-xl bg-white/5 group-hover:bg-indigo-400/10 transition-colors">
															<svg
																width="24"
																height="24"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="text-indigo-400"
															>
																<title>Arrow Down</title>
																<path d="M12 5v14M12 19l7-7M12 19l-7-7" />
															</svg>
														</div>
														<span className="font-medium text-sm text-center">
															Bottom Bar
															{useMidAnchor && (
																<span className="block text-[10px] text-white/50 mt-1 uppercase tracking-wider">
																	Mid-Anchor
																</span>
															)}
														</span>
													</button>

													<button
														onClick={() => openSidebar("right")}
														type="button"
														className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-400/50 hover:shadow-[0_0_20px_rgba(232,121,249,0.1)] transition-all group cursor-pointer"
													>
														<div className="p-3 rounded-xl bg-white/5 group-hover:bg-fuchsia-400/10 transition-colors">
															<svg
																width="24"
																height="24"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="text-fuchsia-400"
															>
																<title>Arrow Right</title>
																<path d="M5 12h14M19 12l-7-7M19 12l-7 7" />
															</svg>
														</div>
														<span className="font-medium text-sm">Right Bar</span>
													</button>
												</div>

												<div className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-sm">
													<label className="relative inline-flex items-center cursor-pointer group">
														<input
															type="checkbox"
															className="sr-only peer"
															checked={useMidAnchor}
															onChange={() => setUseMidAnchor(!useMidAnchor)}
														/>
														<div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/50 transition-colors" />
														<span className="ms-3 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
															Mid-Anchor (Mobile)
														</span>
													</label>
													{!isSmallScreen && (
														<span className="text-[10px] uppercase tracking-widest text-white/30 text-center leading-relaxed">
															Resize browser &lt; 640px <br /> to try swipe gestures
														</span>
													)}
												</div>
											</div>
										</section>

										{/* content cards - use grid subgrid pattern */}
										<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
											<PropsCustomization
												useCustomToggle={useCustomToggle}
												setUseCustomToggle={setUseCustomToggle}
											/>
											<div className="flex flex-col gap-6">
												<QuickStart />
												<PropsConfiguration />
											</div>
										</div>

										<div className="col-span-1 md:col-span-2">
											<QuickSettings />
										</div>
									</div>
								</main>
							</div>
						</div>
					</div>

					{/* Right sidebar */}
					<SwipeBarRight
						ToggleComponent={useCustomToggle ? <CustomToggle /> : undefined}
						className={cn("bg-black/90 text-white", isRightOpen && "border-l border-white/20")}
					>
						<div className={cn("flex h-full flex-col p-4 gap-4")}>
							<div className="rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Quick Settings</div>
								<div className="mt-3 space-y-3">
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										Dark Mode
									</button>
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										Reduce Motion
									</button>
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										High Contrast
									</button>
								</div>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Accent</div>
								<div className="mt-3 flex gap-2">
									<div className="h-7 w-7 rounded-full bg-emerald-400" />
									<div className="h-7 w-7 rounded-full bg-indigo-400" />
									<div className="h-7 w-7 rounded-full bg-fuchsia-400" />
									<div className="h-7 w-7 rounded-full bg-amber-400" />
								</div>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/5 p-4">
								<button
									type="button"
									onClick={() => closeSidebar("right")}
									className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
								>
									Close Sidebar
								</button>
							</div>
							<div className="mt-auto rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">About</div>
								<p className="mt-2 text-sm text-white/80">
									This bar demonstrates swipe interactions with a liquid glass theme.
								</p>
							</div>
						</div>
					</SwipeBarRight>

					{/* Bottom bar */}
					<SwipeBarBottom
						sidebarHeightPx={Math.floor(window.innerHeight * 0.9)}
						isAbsolute
						midAnchorPoint={useMidAnchor}
						swipeToOpen={!useMidAnchor}
						ToggleComponent={useCustomToggle ? <CustomToggle /> : undefined}
						className={cn("bg-black/90 text-white", isBottomOpen && "border-t border-white/20")}
					>
						<div className="flex h-full flex-col p-4 gap-4">
							<div className="flex items-center justify-between">
								<div className="text-lg font-semibold">Quick Actions</div>
								<button
									type="button"
									onClick={() => closeSidebar("bottom")}
									className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm hover:bg-white/15"
								>
									Close
								</button>
							</div>
							<div className="grid grid-cols-4 gap-3">
								<button
									type="button"
									className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
								>
									<div className="h-10 w-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
										<span className="text-emerald-400">📁</span>
									</div>
									<span className="text-xs text-white/80">Files</span>
								</button>
								<button
									type="button"
									className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
								>
									<div className="h-10 w-10 rounded-full bg-indigo-400/20 flex items-center justify-center">
										<span className="text-indigo-400">📊</span>
									</div>
									<span className="text-xs text-white/80">Stats</span>
								</button>
								<button
									type="button"
									className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
								>
									<div className="h-10 w-10 rounded-full bg-fuchsia-400/20 flex items-center justify-center">
										<span className="text-fuchsia-400">⚙️</span>
									</div>
									<span className="text-xs text-white/80">Settings</span>
								</button>
								<button
									type="button"
									className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
								>
									<div className="h-10 w-10 rounded-full bg-amber-400/20 flex items-center justify-center">
										<span className="text-amber-400">🔔</span>
									</div>
									<span className="text-xs text-white/80">Alerts</span>
								</button>
							</div>
							<div className="mt-auto text-center text-xs text-white/50">
								{useMidAnchor
									? "Swipe up from bottom edge to mid-anchor, swipe again to fully open"
									: "Swipe down to close"}
							</div>
						</div>
					</SwipeBarBottom>
				</div>
			</div>
		</>
	);
}
