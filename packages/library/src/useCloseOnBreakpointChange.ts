import { useEffect, useRef } from "react";

type TUseCloseOnBreakpointChange = {
	isSmallScreen: boolean;
	isOpen: boolean;
	optionsReady: boolean;
	onClose: () => void;
};

// Closes the sidebar whenever the viewport crosses the small-screen
// breakpoint. Reuses the matchMedia listener already running inside
// useMediaQuery — adds no DOM listener, just one ref and one effect per
// sidebar instance. Skips the first valid run so mounting on either side of
// the breakpoint never triggers a spurious close.
export function useCloseOnBreakpointChange({
	isSmallScreen,
	isOpen,
	optionsReady,
	onClose,
}: TUseCloseOnBreakpointChange) {
	const previousSmall = useRef<boolean | undefined>(undefined);

	useEffect(() => {
		if (!optionsReady) return;
		if (previousSmall.current === undefined) {
			previousSmall.current = isSmallScreen;
			return;
		}
		if (previousSmall.current === isSmallScreen) return;
		previousSmall.current = isSmallScreen;
		if (isOpen) onClose();
	}, [isSmallScreen, isOpen, optionsReady, onClose]);
}
