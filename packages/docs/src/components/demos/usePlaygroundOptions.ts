import {
	type TSmallScreenMode,
	type TSwipeBarOptions,
	useSwipeBarContext,
} from "@luciodale/swipe-bar";

export const PLAYGROUND_BOOLEAN_OPTIONS = [
	"isAbsolute",
	"showOverlay",
	"fadeContent",
	"showToggle",
	"swipeToOpen",
	"swipeToClose",
	"disableSwipe",
	"touchSwipeOnAllScreens",
	"trackContentOnDrag",
	"disabled",
] as const satisfies ReadonlyArray<keyof TSwipeBarOptions>;

export const PLAYGROUND_NUMBER_OPTIONS = [
	"mediaQueryWidth",
	"sidebarWidthPx",
	"transitionMs",
	"edgeActivationWidthPx",
] as const satisfies ReadonlyArray<keyof TSwipeBarOptions>;

export const SMALL_SCREEN_MODES = [
	"overlay",
	"push",
] as const satisfies ReadonlyArray<TSmallScreenMode>;

type TBooleanOption = (typeof PLAYGROUND_BOOLEAN_OPTIONS)[number];
type TNumberOption = (typeof PLAYGROUND_NUMBER_OPTIONS)[number];

// The provider's globalOptions are the single source of truth for the form.
export function usePlaygroundOptions() {
	const { globalOptions, setGlobalOptions } = useSwipeBarContext();

	function handleToggle(option: TBooleanOption) {
		setGlobalOptions({ [option]: !globalOptions[option] });
	}

	function handleNumber(option: TNumberOption, value: number) {
		setGlobalOptions({ [option]: value });
	}

	function handleSmallScreenMode(mode: TSmallScreenMode) {
		setGlobalOptions({ smallScreenMode: mode });
	}

	return { globalOptions, handleToggle, handleNumber, handleSmallScreenMode };
}
