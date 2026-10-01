import { act } from "@testing-library/react";

export function dispatchTouch(
	type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
	clientX: number,
) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, "changedTouches", {
		value: [{ identifier: 1, clientX, clientY: 300 }],
	});
	act(() => {
		window.dispatchEvent(event);
	});
}
