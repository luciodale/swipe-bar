import { useContext } from "react";
import { SwipePaneContext } from "./SwipePaneProvider";

export const useSwipePaneContext = () => {
	const context = useContext(SwipePaneContext);
	if (!context) {
		throw new Error("useSwipePaneContext must be used within SwipePaneProvider");
	}
	return context;
};
