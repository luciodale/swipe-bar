import type { ReactNode } from "react";

type TDemoCard = {
	title: string;
	description?: ReactNode;
	children: ReactNode;
};

export function DemoCard({ title, description, children }: TDemoCard) {
	return (
		<div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-5 md:p-6">
			<div className="flex flex-col gap-1">
				<span className="text-xs font-semibold uppercase tracking-widest text-white/40">
					{title}
				</span>
				{description && <p className="text-sm leading-relaxed text-white/60">{description}</p>}
			</div>
			{children}
		</div>
	);
}

export function DemoActions({ children }: { children: ReactNode }) {
	return <div className="flex flex-wrap gap-3">{children}</div>;
}

type TDemoButton = {
	onClick: () => void;
	children: ReactNode;
	tone?: "default" | "accent";
};

const BUTTON_TONES = {
	default: "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
	accent: "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20",
} as const;

export function DemoButton({ onClick, children, tone = "default" }: TDemoButton) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${BUTTON_TONES[tone]}`}
		>
			{children}
		</button>
	);
}

type TDemoSwitch = {
	label: string;
	hint?: string;
	checked: boolean;
	onToggle: () => void;
};

export function DemoSwitch({ label, hint, checked, onToggle }: TDemoSwitch) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={onToggle}
			className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-1 py-1 text-left"
		>
			<span className="flex flex-col">
				<span className="font-mono text-sm text-white/80">{label}</span>
				{hint && <span className="text-xs text-white/40">{hint}</span>}
			</span>
			<span
				className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
					checked ? "bg-accent" : "bg-white/10"
				}`}
			>
				<span
					className={`size-4 rounded-full bg-white transition-transform ${
						checked ? "translate-x-4" : "translate-x-0"
					}`}
				/>
			</span>
		</button>
	);
}

type TDemoSegment<T extends string> = {
	label: string;
	value: T;
	options: ReadonlyArray<T>;
	onChange: (value: T) => void;
};

export function DemoSegment<T extends string>({
	label,
	value,
	options,
	onChange,
}: TDemoSegment<T>) {
	return (
		<div className="flex items-center justify-between gap-4 px-1">
			<span className="font-mono text-sm text-white/80">{label}</span>
			<div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
				{options.map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={option === value}
						onClick={() => onChange(option)}
						className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							option === value ? "bg-accent text-white" : "text-white/60 hover:text-white"
						}`}
					>
						{option}
					</button>
				))}
			</div>
		</div>
	);
}

type TDemoNumber = {
	id: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
};

export function DemoNumber({ id, label, value, onChange }: TDemoNumber) {
	function handleChange(raw: string) {
		const next = Number.parseInt(raw, 10);
		if (!Number.isNaN(next)) onChange(next);
	}

	return (
		<label htmlFor={id} className="flex items-center justify-between gap-4 px-1">
			<span className="font-mono text-sm text-white/80">{label}</span>
			<input
				id={id}
				type="number"
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				className="max-w-24 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right font-mono text-sm text-white focus:border-accent focus:outline-none"
			/>
		</label>
	);
}

type TDemoStatus = {
	items: ReadonlyArray<{ label: string; value: string }>;
};

export function DemoStatus({ items }: TDemoStatus) {
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((item) => (
				<span
					key={item.label}
					className="rounded-md border border-white/10 px-2 py-1 font-mono text-xs text-white/40"
				>
					{item.label}: <span className="text-white/80">{item.value}</span>
				</span>
			))}
		</div>
	);
}

export function DemoGroup({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-3 border-t border-white/10 pt-4">{children}</div>;
}

export function DemoNote({ children }: { children: ReactNode }) {
	return (
		<p
			aria-live="polite"
			className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs leading-relaxed text-white/60"
		>
			{children}
		</p>
	);
}
