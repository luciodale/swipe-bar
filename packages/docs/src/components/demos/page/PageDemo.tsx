import { SwipeBarProvider, type TSwipeBarOptions } from "@luciodale/swipe-bar";
import type { ReactNode } from "react";
import { useRegisterPageContent } from "./useRegisterPageContent";

type TPageDemo = TSwipeBarOptions & {
	children: ReactNode;
};

function PageContentRegistration() {
	useRegisterPageContent();
	return null;
}

// Provider for demos that act on the whole docs page. Panes sit above the
// sticky navbar (z-50) so they cover it when floating.
export function PageDemo({ children, ...options }: TPageDemo) {
	return (
		<SwipeBarProvider swipeBarZIndex={60} overlayZIndex={55} toggleZIndex={40} {...options}>
			<PageContentRegistration />
			{children}
		</SwipeBarProvider>
	);
}
