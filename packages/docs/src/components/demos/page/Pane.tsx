import type { ReactNode } from "react";

// Classes for panes hosted on the whole page. In flow the pane sticks to the
// viewport while the page scrolls; when floating the library's inline
// position: fixed takes over and h-dvh matches its top/bottom of 0.
export const PANE_CLASS = {
	left: "sticky top-0 h-dvh self-start overflow-y-auto border-r border-white/10 bg-neutral-950 text-white",
	right:
		"sticky top-0 h-dvh self-start overflow-y-auto border-l border-white/10 bg-neutral-950 text-white",
	bottom: "overflow-y-auto rounded-t-2xl border-t border-white/10 bg-neutral-950 text-white",
} as const;

type TPaneBody = {
	title: string;
	onClose?: () => void;
	children?: ReactNode;
};

export function PaneBody({ title, onClose, children }: TPaneBody) {
	return (
		<div className="flex h-full flex-col gap-4 p-5">
			<div className="flex items-center justify-between gap-3">
				<span className="text-sm font-semibold text-white">{title}</span>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="cursor-pointer rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
					>
						Close
					</button>
				)}
			</div>
			{children}
		</div>
	);
}

type TPaneLinks = {
	items: ReadonlyArray<string>;
};

export function PaneLinks({ items }: TPaneLinks) {
	return (
		<nav className="flex flex-col gap-1">
			{items.map((item) => (
				<button
					key={item}
					type="button"
					className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
				>
					{item}
				</button>
			))}
		</nav>
	);
}

type TPaneFacts = {
	items: ReadonlyArray<{ label: string; value: string }>;
	tone?: "default" | "accent";
};

export function PaneFacts({ items, tone = "default" }: TPaneFacts) {
	const toneClass =
		tone === "accent" ? "border-accent/30 bg-accent/5" : "border-white/10 bg-white/5";
	return (
		<div className="grid grid-cols-2 gap-2">
			{items.map((item) => (
				<div key={item.label} className={`flex flex-col gap-1 rounded-lg border p-3 ${toneClass}`}>
					<span className="text-xs text-white/40">{item.label}</span>
					<span className="text-sm text-white/90">{item.value}</span>
				</div>
			))}
		</div>
	);
}
