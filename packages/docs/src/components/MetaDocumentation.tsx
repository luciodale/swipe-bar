import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const typeMapCode = `// 1. Define your meta type map
type TSidebarMetaMap = {
  left?: unknown;
  right?: unknown;
  bottom?: Record<string, unknown>;
};

type MyMeta = {
  left: { screen: "settings" | "profile" };
  right: { tab: number };
  bottom: {
    primary: { filter: string };
    secondary: { step: number };
  };
};

// 2. Pass the generic to the hook
const {
  openSidebar,
  closeSidebar,
  openSidebarFully,
  openSidebarToMidAnchor,
  setMeta,         // standalone meta updates
  leftMeta,        // { screen: "settings" | "profile" } | null
  rightMeta,       // { tab: number } | null
  bottomSidebars,  // primary.meta: { filter: string } | null
} = useSwipeBarContext<MyMeta>();

// 3. Pass meta when opening / closing
openSidebar("left", { meta: { screen: "settings" } });
closeSidebar("right", { meta: { tab: 2 } });
openSidebarFully("bottom", { id: "primary", meta: { filter: "active" } });
openSidebarToMidAnchor("bottom", { id: "secondary", meta: { step: 1 } });`;

const setMetaCode = `// Update meta independently — no open/close triggered
setMeta("left", { screen: "profile" });
setMeta("right", { tab: 3 });
setMeta("bottom", { id: "primary", meta: { filter: "active" } });

// Clear meta to null
setMeta("left", null);
setMeta("bottom", { id: "primary", meta: null });`;

const resetMetaCode = `// Clear meta back to null
closeSidebar("left", { resetMeta: true });

// resetMeta takes precedence when both are provided
openSidebar("right", { meta: { tab: 3 }, resetMeta: true }); // meta stays null

// Auto-reset meta on every close (gesture, overlay, toggle, programmatic)
<SwipeBarLeft resetMetaOnClose />
// Explicit meta or resetMeta in closeSidebar opts still takes precedence
closeSidebar("left", { meta: { screen: "profile" } }); // keeps this meta`;

const keyBehaviours = [
	{
		title: "Generic on the hook",
		description: "Strict per-sidebar typing; without the generic, meta is absent from the API.",
	},
	{
		title: "Set on open/close",
		description:
			"Works on all 4 functions: openSidebar, closeSidebar, openSidebarFully, openSidebarToMidAnchor.",
	},
	{
		title: "setMeta (standalone)",
		description:
			"Update meta without triggering open/close. Accepts the sidebar side and a value (or null to clear).",
	},
	{
		title: "Preserved by default",
		description: "Calling without meta/resetMeta leaves the existing meta untouched.",
	},
	{
		title: "resetMeta: true",
		description: "Clears meta to null; takes precedence over meta if both are provided.",
	},
	{
		title: "resetMetaOnClose",
		description:
			"Auto-clears meta to null on every close (gesture, overlay, toggle, programmatic). Explicit meta or resetMeta in closeSidebar opts takes precedence.",
	},
	{
		title: "Drag gestures don't touch meta",
		description: "Swipe and toggle interactions never modify meta.",
	},
	{
		title: "Bottom sidebars",
		description: "Meta is per-instance via bottomSidebars[id].meta; cleaned up on unregister.",
	},
];

const syntaxStyle = {
	margin: 0,
	padding: "0.75rem",
	background: "transparent",
	fontSize: "0.75rem",
	lineHeight: "1.5",
};

const codeTagStyle = {
	fontFamily: "ui-monospace, monospace",
};

export function MetaDocumentation() {
	return (
		<div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-white">
			<h2 className="text-xl font-semibold mb-1">Sidebar Meta</h2>
			<p className="text-sm text-white/70 mb-4">
				Attach typed metadata to any sidebar and read it back from context.
			</p>

			<div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden mb-4">
				<div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
					Type Map & Usage
				</div>
				<SyntaxHighlighter
					language="typescript"
					style={vscDarkPlus}
					customStyle={syntaxStyle}
					codeTagProps={{ style: codeTagStyle }}
				>
					{typeMapCode}
				</SyntaxHighlighter>
			</div>

			<div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden mb-4">
				<div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
					resetMeta
				</div>
				<SyntaxHighlighter
					language="typescript"
					style={vscDarkPlus}
					customStyle={syntaxStyle}
					codeTagProps={{ style: codeTagStyle }}
				>
					{resetMetaCode}
				</SyntaxHighlighter>
			</div>

			<div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden mb-4">
				<div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
					setMeta (standalone)
				</div>
				<SyntaxHighlighter
					language="typescript"
					style={vscDarkPlus}
					customStyle={syntaxStyle}
					codeTagProps={{ style: codeTagStyle }}
				>
					{setMetaCode}
				</SyntaxHighlighter>
			</div>

			<div className="space-y-3">
				<div className="text-white/70 text-xs font-medium mb-2">Key Behaviours</div>
				{keyBehaviours.map((point) => (
					<div key={point.title} className="rounded-lg border border-white/10 bg-white/5 p-3">
						<div className="text-sm font-medium text-indigo-300/90 mb-1">{point.title}</div>
						<div className="text-xs text-white/70 leading-relaxed">{point.description}</div>
					</div>
				))}
			</div>
		</div>
	);
}
