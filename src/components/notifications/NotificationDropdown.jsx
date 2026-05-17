import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CheckCheck, Inbox, RotateCcw, Trash2 } from "lucide-react";
import NotificationItem from "./NotificationItem";
const MotionSection = motion.section;
const MotionDiv = motion.div;

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

const NotificationDropdown = ({
  open,
  panelRef,
  panelStyle,
  notifications,
  unreadCount,
  deletingIds,
  deletingAll,
  undoState,
  onMarkRead,
  onDelete,
  onClearAll,
  onUndo,
  onMarkAllRead,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <MotionSection
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={panelStyle}
          className="fixed z-[90] overflow-hidden rounded-[24px] border border-cyan-100 bg-white shadow-[0_30px_56px_-30px_rgba(15,23,42,0.42),0_16px_30px_-22px_rgba(8,145,178,0.16)]"
        >
          <header className="relative z-10 border-b border-cyan-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-cyan-100 bg-white p-1.5 text-cyan-700">
                  <BellRing size={15} />
                </div>
                <h3 className="text-[15px] font-black tracking-tight text-slate-900">Notifications</h3>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-700">
                  {unreadCount} unread
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onMarkAllRead}
                  disabled={unreadCount === 0}
                  className="rounded-lg border border-cyan-100 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-700 transition hover:border-cyan-200 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="inline-flex items-center gap-1">
                    <CheckCheck size={12} />
                    Mark read
                  </span>
                </button>
                <button
                  onClick={onClearAll}
                  disabled={notifications.length === 0 || deletingAll}
                  className="rounded-lg border border-cyan-100 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="inline-flex items-center gap-1">
                    <Trash2 size={12} />
                    Clear All
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div className="relative z-10 max-h-[440px] overflow-y-auto px-3 py-3 no-scrollbar">
            {notifications.length === 0 ? (
              <MotionDiv
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[270px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/35 px-6 py-12 text-center"
              >
                <MotionDiv
                  animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl border border-cyan-100 bg-white p-3.5 text-cyan-700"
                >
                  <Inbox size={22} />
                </MotionDiv>
                <p className="text-base font-black tracking-tight text-slate-900">No notifications</p>
                <p className="max-w-[220px] text-xs font-semibold leading-5 text-slate-500">
                  You're fully caught up for now. New updates will appear here.
                </p>
              </MotionDiv>
            ) : (
              <MotionDiv variants={listVariants} initial="hidden" animate="show" className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      deleting={deletingIds.has(notification.id)}
                      onMarkRead={() => onMarkRead(notification.id)}
                      onDelete={() => onDelete(notification)}
                    />
                  ))}
                </AnimatePresence>
              </MotionDiv>
            )}
          </div>

          <AnimatePresence>
            {undoState?.open && (
              <MotionDiv
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 border-t border-cyan-100 bg-cyan-50/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-white px-3 py-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {undoState.label}
                  </p>
                  <button
                    onClick={onUndo}
                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-100"
                  >
                    <RotateCcw size={12} />
                    Undo
                  </button>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionSection>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
