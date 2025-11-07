import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type LockedPane = "left" | "right" | null;

type SwipePaneContextType = {
  lockedPane: LockedPane;
  setLockedPane: (pane: LockedPane) => void;
  isLeftOpen: boolean;
  isRightOpen: boolean;
  leftDragX: number | null;
  rightDragX: number | null;
  openLeft: () => void;
  closeLeft: () => void;
  openRight: () => void;
  closeRight: () => void;
  setLeftDragX: (x: number | null) => void;
  setRightDragX: (x: number | null) => void;
};

const SwipePaneContext = createContext<SwipePaneContextType | null>(null);

export const SwipePaneProvider = ({ children }: { children: ReactNode }) => {
  const [lockedPane, setLockedPane] = useState<LockedPane>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [leftDragX, setLeftDragX] = useState<number | null>(null);
  const [rightDragX, setRightDragX] = useState<number | null>(null);

  const openLeft = useCallback(() => setIsLeftOpen(true), []);
  const closeLeft = useCallback(() => {
    setIsLeftOpen(false);
    setLockedPane(null);
  }, []);
  const openRight = useCallback(() => setIsRightOpen(true), []);
  const closeRight = useCallback(() => {
    setIsRightOpen(false);
    setLockedPane(null);
  }, []);

  return (
    <SwipePaneContext.Provider
      value={{
        lockedPane,
        setLockedPane,
        isLeftOpen,
        isRightOpen,
        leftDragX,
        rightDragX,
        openLeft,
        closeLeft,
        openRight,
        closeRight,
        setLeftDragX,
        setRightDragX,
      }}
    >
      {children}
    </SwipePaneContext.Provider>
  );
};

export const useSwipePaneContext = () => {
  const context = useContext(SwipePaneContext);
  if (!context) {
    throw new Error(
      "useSwipePaneContext must be used within SwipePaneProvider"
    );
  }
  return context;
};
