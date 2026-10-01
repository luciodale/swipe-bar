import { useState } from "react";
import { getPageHostId, type TPageHost } from "./pageHosts";

// Demos are client only islands, so the layout's host elements already exist
// on the first render.
export function usePageHost(host: TPageHost) {
	const [element] = useState(() => document.getElementById(getPageHostId(host)));
	return element;
}
