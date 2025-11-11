import { useContext } from "react";
import { SwipeSidebarContext } from "./SwipeBarProvider";

export const useSwipeBarContext = () => {
  const context = useContext(SwipeSidebarContext);
  if (!context) {
    throw new Error("useSwipeBarContext must be used within SwipeBarProvider");
  }
  return context;
};
