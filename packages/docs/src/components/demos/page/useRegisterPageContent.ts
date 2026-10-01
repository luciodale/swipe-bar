import { useSwipeBarContentRef } from "@luciodale/swipe-bar";
import { useEffect } from "react";
import { PAGE_CONTENT_ID } from "./pageHosts";

// The docs page is server rendered Astro markup, so the content element is
// registered by id instead of through <SwipeBarContent>.
export function useRegisterPageContent() {
	const contentRef = useSwipeBarContentRef();
	useEffect(() => {
		contentRef(document.getElementById(PAGE_CONTENT_ID));
		return () => contentRef(null);
	}, [contentRef]);
}
