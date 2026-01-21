import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QuickStart = () => {
	const snippets = [
		{
			title: "Add Provider",
			code: `import { SwipeBarProvider } from "@luciodale/swipe-bar";

function App() {
  return (
    <SwipeBarProvider>
      {/* Your app content */}
    </SwipeBarProvider>
  );
}`,
		},
		{
			title: "Left Sidebar",
			code: `import { SwipeBarLeft } from "@luciodale/swipe-bar";

<SwipeBarLeft className="bg-blue-500 ...">
  <nav>Your sidebar content</nav>
</SwipeBarLeft>`,
		},
		{
			title: "Right Sidebar",
			code: `import { SwipeBarRight } from "@luciodale/swipe-bar";

<SwipeBarRight className="bg-blue-500 ...">
  <div>Settings panel</div>
</SwipeBarRight>`,
		},
		{
			title: "Bottom Sheet",
			code: `import { SwipeBarBottom } from "@luciodale/swipe-bar";

<SwipeBarBottom sidebarHeightPx={280} isAbsolute className="bg-blue-500 ...">
  <div>Bottom sheet content</div>
</SwipeBarBottom>`,
		},
	];

	return (
		<div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-white">
			<h2 className="text-xl font-semibold mb-4">Quick Start</h2>
			<div className="space-y-3">
				{snippets.map((snippet) => (
					<div
						key={snippet.title}
						className="rounded-lg border border-white/10 bg-black/20 overflow-hidden"
					>
						<div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
							{snippet.title}
						</div>
						<SyntaxHighlighter
							language="typescript"
							style={vscDarkPlus}
							customStyle={{
								margin: 0,
								padding: "0.75rem",
								background: "transparent",
								fontSize: "0.75rem",
								lineHeight: "1.5",
							}}
							codeTagProps={{
								style: {
									fontFamily: "ui-monospace, monospace",
								},
							}}
						>
							{snippet.code}
						</SyntaxHighlighter>
					</div>
				))}
			</div>
		</div>
	);
};

export const PropsConfiguration = () => {
	const propsCode = `// Available props with defaults
<SwipeBarProvider
  sidebarWidthPx={320}      // width for left/right bars
  sidebarHeightPx={300}     // height for bottom bar
  transitionMs={300}
  edgeActivationWidthPx={40}
  dragActivationDeltaPx={20}
  showOverlay={true}
  fadeContent={false}
  fadeContentTransitionMs={100}
  isAbsolute={false}
  overlayBackgroundColor="rgba(0, 0, 0, 0.5)"
  toggleIconColor="white"
  toggleIconSizePx={40}
  toggleIconEdgeDistancePx={40}
  showToggle={true}
  mediaQueryWidth={640}
  swipeBarZIndex={30}
  toggleZIndex={15}
  overlayZIndex={20}
>
  {children}
</SwipeBarProvider>

// Props can also be set on individual sidebars
<SwipeBarLeft showOverlay={false} isAbsolute={true} fadeContent={true}>
  {/* content */}
</SwipeBarLeft>

// Bottom bar with custom height
<SwipeBarBottom sidebarHeightPx={280} isAbsolute>
  {/* content */}
</SwipeBarBottom>`;

	const keyPoints = [
		{
			title: "SwipeBarBottom",
			description:
				"A bottom sheet component with swipe-up/down gestures. Uses sidebarHeightPx instead of sidebarWidthPx. Typically used with isAbsolute={true}.",
		},
		{
			title: "isAbsolute",
			description:
				"Use isAbsolute if you don't want the sidebar to move the content. The sidebar will overlay on top instead of pushing content. On mobile, the sidebar will automatically switch to isAbsolute true.",
		},
		{
			title: "mediaQueryWidth",
			description:
				"Allows you to set a max width threshold for the swiping. You might not want it on desktop. Default is 640px.",
		},
		{
			title: "Single Child Only",
			description:
				"All sidebars only accept a single child. If you need to render multiple children, wrap them in a single parent element.",
		},
		{
			title: "Programmatic Control",
			description:
				"Use closeSidebar('left'|'right'|'bottom') or openSidebar('left'|'right'|'bottom') from the provider context.",
		},
	];

	return (
		<div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-white">
			<h2 className="text-xl font-semibold mb-4">Props & Configuration</h2>

			<div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden mb-4">
				<div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
					All Available Props
				</div>
				<SyntaxHighlighter
					language="typescript"
					style={vscDarkPlus}
					customStyle={{
						margin: 0,
						padding: "0.75rem",
						background: "transparent",
						fontSize: "0.75rem",
						lineHeight: "1.5",
					}}
					codeTagProps={{
						style: {
							fontFamily: "ui-monospace, monospace",
						},
					}}
				>
					{propsCode}
				</SyntaxHighlighter>
			</div>

			<div className="space-y-3">
				<div className="text-white/70 text-xs font-medium mb-2">Key Features</div>
				{keyPoints.map((point) => (
					<div key={point.title} className="rounded-lg border border-white/10 bg-white/5 p-3">
						<div className="text-sm font-medium text-indigo-300/90 mb-1">{point.title}</div>
						<div className="text-xs text-white/70 leading-relaxed">{point.description}</div>
					</div>
				))}
			</div>
		</div>
	);
};
