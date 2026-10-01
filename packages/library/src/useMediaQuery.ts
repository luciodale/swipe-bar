import { useEffect, useState } from "react";
import { getSmallViewportQuery, MEDIA_QUERY_WIDTH } from "./swipeSidebarShared";

// True when the viewport is strictly narrower than width (the small viewport).
export function useMediaQuery(width = MEDIA_QUERY_WIDTH): boolean {
	const QUERY = getSmallViewportQuery(width);

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
