import { useEffect, useState } from "react";

export function useMediaQuery(width: number): boolean {
	const QUERY = `(max-width: ${width}px)`;

	const getMatches = (): boolean => {
		if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
			return false;
		}
		return window.matchMedia(QUERY).matches;
	};

	const [matches, setMatches] = useState<boolean>(getMatches);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
			return;
		}
		const mql = window.matchMedia(QUERY);
		const onChange = () => setMatches(mql.matches);
		onChange();
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, [QUERY]);

	return matches;
}
