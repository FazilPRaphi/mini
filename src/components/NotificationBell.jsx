import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { supabase } from "../supabaseClient";
import NotificationDropdown from "./notifications/NotificationDropdown";
const MotionButton = motion.button;
const MotionSpan = motion.span;

const sortByDateDesc = (items) =>
  [...items].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 68, left: 16, width: 392 });
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [deletingAll, setDeletingAll] = useState(false);
  const [undoState, setUndoState] = useState({ open: false, items: [], label: "" });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const pendingDeletionRef = useRef(null);
  const isMountedRef = useRef(true);

  const unreadCount = notifications.filter((item) => !item.read).length;

  async function fetchNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (isMountedRef.current) {
      setNotifications(data || []);
    }
  }

  async function finalizeDeletion(items) {
    const ids = items.map((item) => item.id).filter(Boolean);
    if (ids.length === 0) return;
    await supabase.from("notifications").delete().in("id", ids);
  }

  function clearPendingDeletion(commit = false) {
    if (!pendingDeletionRef.current) return;
    clearTimeout(pendingDeletionRef.current.timer);
    const pending = pendingDeletionRef.current.items || [];
    pendingDeletionRef.current = null;
    if (commit && pending.length > 0) {
      finalizeDeletion(pending);
    }
  }

  function queueDeletion(items, label) {
    clearPendingDeletion(true);
    setUndoState({ open: true, items, label });

    const timer = setTimeout(async () => {
      await finalizeDeletion(items);
      if (!isMountedRef.current) return;
      setUndoState((current) => (current.items === items ? { open: false, items: [], label: "" } : current));
      pendingDeletionRef.current = null;
    }, 4200);

    pendingDeletionRef.current = { items, timer };
  }

  function updatePanelPosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isDesktop = viewportWidth >= 1024;
    const minMargin = isDesktop ? 20 : 12;
    const width = Math.min(392, viewportWidth - minMargin * 2);
    const desktopLeftNudge = isDesktop ? 18 : 10;
    const preferredLeft = rect.right - width - desktopLeftNudge;
    const left = Math.max(minMargin, Math.min(preferredLeft, viewportWidth - width - minMargin));
    const top = rect.bottom + (isDesktop ? 14 : 10);

    setPanelStyle({ top, left, width });
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  async function markOneRead(id) {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.read) return;
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  function handleDelete(notification) {
    setDeletingIds((prev) => new Set([...prev, notification.id]));
    setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    queueDeletion([notification], "Notification removed");

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }, 240);
  }

  function handleClearAll() {
    if (notifications.length === 0) return;
    const items = [...notifications];
    setDeletingAll(true);
    setNotifications([]);
    queueDeletion(items, `${items.length} notifications removed`);
    setTimeout(() => {
      if (isMountedRef.current) setDeletingAll(false);
    }, 180);
  }

  function handleUndo() {
    if (!pendingDeletionRef.current) return;
    clearTimeout(pendingDeletionRef.current.timer);
    const items = pendingDeletionRef.current.items || [];
    pendingDeletionRef.current = null;

    setNotifications((prev) => sortByDateDesc([...items, ...prev]));
    setUndoState({ open: false, items: [], label: "" });
  }

  function closePanel() {
    setOpen(false);
  }

  function togglePanel() {
    setOpen((current) => {
      const next = !current;
      if (next) {
        fetchNotifications();
        updatePanelPosition();
      }
      return next;
    });
  }

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pendingDeletionRef.current) {
        clearTimeout(pendingDeletionRef.current.timer);
        const pending = pendingDeletionRef.current.items || [];
        pendingDeletionRef.current = null;
        if (pending.length > 0) {
          const ids = pending.map((item) => item.id).filter(Boolean);
          if (ids.length > 0) {
            supabase.from("notifications").delete().in("id", ids);
          }
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePanel();
    };

    const handlePointerDown = (event) => {
      const target = event.target;
      const clickedPanel = panelRef.current?.contains(target);
      const clickedTrigger = triggerRef.current?.contains(target);
      if (!clickedPanel && !clickedTrigger) closePanel();
    };

    const onViewportChange = () => updatePanelPosition();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open]);

  return (
    <>
      <MotionButton
        ref={triggerRef}
        onClick={togglePanel}
        whileTap={{ scale: 0.96 }}
        className="group relative flex items-center justify-center rounded-xl border border-cyan-100 bg-white/92 p-2.5 text-slate-600 shadow-sm transition hover:border-cyan-200 hover:text-cyan-700"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open notifications"
      >
        <MotionSpan
          animate={open ? { rotate: [0, -12, 8, 0] } : {}}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Bell size={18} />
        </MotionSpan>

        <AnimatePresence>
          {unreadCount > 0 && (
            <MotionSpan
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-white bg-gradient-to-r from-cyan-500 to-sky-500 px-1 text-[10px] font-black text-white shadow-md"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </MotionSpan>
          )}
        </AnimatePresence>
      </MotionButton>

      <NotificationDropdown
        open={open}
        panelRef={panelRef}
        panelStyle={panelStyle}
        notifications={notifications}
        unreadCount={unreadCount}
        deletingIds={deletingIds}
        deletingAll={deletingAll}
        undoState={undoState}
        onMarkRead={markOneRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onUndo={handleUndo}
        onMarkAllRead={markAllRead}
      />
    </>
  );
};

export default NotificationBell;
