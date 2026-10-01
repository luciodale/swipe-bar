import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { TPageHost } from "./pageHosts";
import { usePageHost } from "./usePageHost";

type TPagePortal = {
	host: TPageHost;
	children: ReactNode;
};

export function PagePortal({ host, children }: TPagePortal) {
	const element = usePageHost(host);
	if (!element) return null;
	return createPortal(children, element);
}
