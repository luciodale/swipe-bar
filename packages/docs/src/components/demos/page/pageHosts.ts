export type TPageHost = "left" | "right" | "bottom";

// Element ids rendered by layouts/DemoPage.astro.
export const PAGE_CONTENT_ID = "swipebar-page";

export function getPageHostId(host: TPageHost) {
	return `swipebar-host-${host}`;
}
