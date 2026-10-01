import { useSwipeBarContext } from "./useSwipeBarContext";

// Callback ref that registers the element pushed aside by panes in
// smallScreenMode="push". Attach it to an element that does not contain the
// panes; an ancestor must clip horizontal overflow (SwipeBarContent does both).
export function useSwipeBarContentRef() {
	const { registerContent } = useSwipeBarContext();
	return registerContent;
}
