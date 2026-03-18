import { useEffect, useLayoutEffect, useRef } from "react";

type TUseDefaultOpen = {
	defaultOpen: boolean | undefined;
	optionsReady: boolean;
	onOpen: () => void;
};

export function useDefaultOpen({ defaultOpen, optionsReady, onOpen }: TUseDefaultOpen) {
	const applied = useRef(false);

	// Lock body scroll before first paint
	useLayoutEffect(() => {
		if (defaultOpen) {
			document.body.style.overflow = "hidden";
		}
	}, [defaultOpen]);

	// Open sidebar once provider options are registered
	useEffect(() => {
		if (defaultOpen && !applied.current && optionsReady) {
			applied.current = true;
			onOpen();
		}
	}, [defaultOpen, onOpen, optionsReady]);

	// Before state catches up, force overlay visible so it never transitions in
	const forceOverlayVisible = !!defaultOpen && !applied.current;

	return { forceOverlayVisible };
}
