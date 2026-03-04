import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(el) => !el.closest("[inert]"),
	);
}

type TUseFocusTrap = {
	sidebarRef: RefObject<HTMLElement | null>;
	triggerRef: RefObject<HTMLElement | null>;
	isOpen: boolean;
	onClose: () => void;
	transitionMs: number;
};

export function useFocusTrap({
	sidebarRef,
	triggerRef,
	isOpen,
	onClose,
	transitionMs,
}: TUseFocusTrap) {
	const previousFocusRef = useRef<HTMLElement | null>(null);

	// Focus first element on open, restore on close
	useEffect(() => {
		if (isOpen) {
			previousFocusRef.current = document.activeElement as HTMLElement | null;
			const timer = setTimeout(() => {
				if (!sidebarRef.current) return;
				sidebarRef.current.setAttribute("tabindex", "-1");
				sidebarRef.current.focus();
			}, transitionMs);
			return () => clearTimeout(timer);
		}

		// Restore focus on close
		const el = previousFocusRef.current;
		if (el) {
			// Find the button inside the trigger wrapper
			const button = triggerRef.current?.querySelector("button") ?? el;
			requestAnimationFrame(() => {
				(button as HTMLElement).focus();
			});
			previousFocusRef.current = null;
		}
	}, [isOpen, sidebarRef, triggerRef, transitionMs]);

	// Tab trapping + Escape
	useEffect(() => {
		if (!isOpen) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				if (!sidebarRef.current) return;
				// Only close if focus is inside this sidebar or no sidebar has focus
				if (sidebarRef.current.contains(document.activeElement)) {
					e.preventDefault();
					onClose();
				}
				return;
			}

			if (e.key !== "Tab") return;
			if (!sidebarRef.current) return;

			const focusable = getFocusableElements(sidebarRef.current);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, sidebarRef, onClose]);
}
