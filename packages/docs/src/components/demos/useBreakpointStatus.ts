import { type TSwipeBarOptions, useMediaQuery } from "@luciodale/swipe-bar";
import { useEffect, useState } from "react";

function useWindowWidth() {
	const [width, setWidth] = useState(() => window.innerWidth);

	useEffect(() => {
		function handleResize() {
			setWidth(window.innerWidth);
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return width;
}

type TBreakpointStatusOptions = Pick<
	Required<TSwipeBarOptions>,
	"mediaQueryWidth" | "smallScreenMode" | "isAbsolute"
>;

// Live explanation of which layout mode the sidebar is in right now, so the
// playground makes clear why push does or does not apply.
export function useBreakpointStatus({
	mediaQueryWidth,
	smallScreenMode,
	isAbsolute,
}: TBreakpointStatusOptions) {
	const windowWidth = useWindowWidth();
	const isSmall = useMediaQuery(mediaQueryWidth);
	const comparison = `window ${windowWidth}px ${isSmall ? "<" : "≥"} breakpoint ${mediaQueryWidth}px`;

	if (isAbsolute) return `${comparison}: isAbsolute is on, the sidebar floats over the page`;
	if (!isSmall) {
		const hint =
			smallScreenMode === "push" ? `; raise mediaQueryWidth above ${windowWidth} to see push` : "";
		return `${comparison}: the sidebar sits in the layout${hint}`;
	}
	if (smallScreenMode === "push") return `${comparison}: the sidebar pushes the page aside`;
	return `${comparison}: the sidebar floats over the page`;
}
