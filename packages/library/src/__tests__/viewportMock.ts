import { vi } from "vitest";

// Test double for window.matchMedia + window.innerWidth. Understands the
// small viewport query emitted by the library ("not all and (min-width: Npx)")
// and notifies listeners when setViewportWidth crosses a breakpoint.

type TMediaQueryListLike = {
	matches: boolean;
	media: string;
	onchange: null;
	addListener: (cb: () => void) => void;
	removeListener: (cb: () => void) => void;
	addEventListener: (event: string, cb: () => void) => void;
	removeEventListener: (event: string, cb: () => void) => void;
	dispatchEvent: () => boolean;
};

type TMqlRecord = {
	mql: TMediaQueryListLike;
	listeners: Set<() => void>;
};

const mqlRegistry = new Map<string, TMqlRecord>();
let currentInnerWidth = 1024;

function matchesQuery(query: string, innerWidth: number): boolean {
	const minWidth = query.match(/min-width:\s*([\d.]+)px/);
	if (!minWidth) return false;
	const isAtLeast = innerWidth >= Number(minWidth[1]);
	return query.trim().startsWith("not all and") ? !isAtLeast : isAtLeast;
}

function makeMql(query: string): TMqlRecord {
	const listeners = new Set<() => void>();
	const mql: TMediaQueryListLike = {
		matches: matchesQuery(query, currentInnerWidth),
		media: query,
		onchange: null,
		addListener: (cb) => listeners.add(cb),
		removeListener: (cb) => listeners.delete(cb),
		addEventListener: (_event, cb) => listeners.add(cb),
		removeEventListener: (_event, cb) => listeners.delete(cb),
		dispatchEvent: () => true,
	};
	return { mql, listeners };
}

export function setViewportWidth(width: number) {
	currentInnerWidth = width;
	Object.defineProperty(window, "innerWidth", {
		value: width,
		configurable: true,
		writable: true,
	});
	for (const [query, record] of mqlRegistry) {
		const next = matchesQuery(query, width);
		if (record.mql.matches !== next) {
			record.mql.matches = next;
			for (const cb of record.listeners) cb();
		}
	}
}

export function installViewportMock(initialWidth: number) {
	mqlRegistry.clear();
	setViewportWidth(initialWidth);
	const matchMediaImpl = (query: string): MediaQueryList => {
		let record = mqlRegistry.get(query);
		if (!record) {
			record = makeMql(query);
			mqlRegistry.set(query, record);
		}
		return record.mql as unknown as MediaQueryList;
	};
	vi.stubGlobal("matchMedia", matchMediaImpl);
	Object.defineProperty(window, "matchMedia", {
		value: matchMediaImpl,
		configurable: true,
		writable: true,
	});
}
