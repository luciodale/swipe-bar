import { cn } from "../utils";
import { Overlay } from "./Overlay";
import { useSwipeLeftPane } from "../useSwipeLeftPane";

type SidebarProps = {
  className?: string;
};

export function SidebarLeft({ className }: SidebarProps) {
  const { isLeftOpen, openLeft, closeLeft, leftDragX, setLockedPane } =
    useSwipeLeftPane();

  function setIsCollapsedAndUnlockPane(shouldCollapse: boolean) {
    if (shouldCollapse) {
      closeLeft();
    } else {
      openLeft();
    }
    setLockedPane(null);
  }

  const isAbsolute = false;

  return (
    <>
      {/*  overlay */}

      <Overlay
        isCollapsed={!isLeftOpen}
        setIsCollapsed={setIsCollapsedAndUnlockPane}
      />

      <div
        style={{
          willChange: "transform",
          ...(leftDragX != null
            ? {
                transform: `translate3d(${leftDragX}px, 0, 0)`,
                transition: "none",
              }
            : !isLeftOpen
            ? {
                transform: "translateX(-100%)",
                width: "0px",
              }
            : {}),
        }}
        className={cn(
          "z-30 top-0 bottom-0 active w-[320px] md:w-[260px] shrink-0 transform overflow-x-hidden bg-yellow-300 transition-all duration-200 ease-in-out",
          isAbsolute && "fixed left-0 top-0 bottom-0",
          className
        )}
      >
        <div className="flex items-center w-full justify-between gap-4 p-2 h-14">
          <button
            type="button"
            onClick={() => setIsCollapsedAndUnlockPane(!isLeftOpen)}
          >
            toggle
          </button>
        </div>
      </div>
    </>
  );
}
