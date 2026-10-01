import type { CSSProperties, ReactNode } from "react";
import { useSwipeBarContentRef } from "../useSwipeBarContentRef";

type TSwipeBarContent = {
	children?: ReactNode;
	className?: string;
};

// clip (not hidden) keeps the wrapper from becoming a scroll container, so
// position: sticky inside the content keeps working.
const clipStyle = { overflowX: "clip", minWidth: 0 } satisfies CSSProperties;

export function SwipeBarContent({ children, className }: TSwipeBarContent) {
	const contentRef = useSwipeBarContentRef();
	return (
		<div className={className} style={clipStyle}>
			<div ref={contentRef}>{children}</div>
		</div>
	);
}
