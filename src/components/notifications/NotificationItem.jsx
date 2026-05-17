import { motion } from "framer-motion";
import {
  Activity,
  BellRing,
  CalendarClock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
const MotionArticle = motion.article;
const MotionButton = motion.button;

const iconByType = {
  appointment: CalendarClock,
  chat: MessageSquareText,
  security: ShieldCheck,
  insight: Sparkles,
  system: Activity,
};

const fallbackIcon = BellRing;

const getNotificationType = (notification) => {
  const explicit = notification.type?.toLowerCase();
  if (explicit && iconByType[explicit]) return explicit;

  const title = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  if (title.includes("appointment") || title.includes("booking")) return "appointment";
  if (title.includes("chat") || title.includes("message")) return "chat";
  if (title.includes("security") || title.includes("password")) return "security";
  if (title.includes("insight") || title.includes("ai")) return "insight";
  return "system";
};

const NotificationItem = ({ notification, onMarkRead, onDelete, deleting = false }) => {
  const type = getNotificationType(notification);
  const Icon = iconByType[type] || fallbackIcon;
  const isUnread = !notification.read;

  return (
    <MotionArticle
      layout
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -2,
        boxShadow: "0 22px 32px -26px rgba(8,145,178,0.65), 0 12px 24px -20px rgba(15,23,42,0.35)",
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 transition-all ${
        isUnread
          ? "border-cyan-200 bg-cyan-50/55"
          : "border-cyan-100 bg-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-transparent to-blue-100/35" />
        <div className="absolute -left-20 top-0 h-full w-16 rotate-12 bg-gradient-to-r from-transparent via-white/85 to-transparent transition-transform duration-900 ease-out group-hover:translate-x-[480%]" />
      </div>

      <div className="relative z-10 flex items-start gap-3">
        <button
          onClick={onMarkRead}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-label={`Open notification: ${notification.title || "Notification"}`}
        >
          <div className="relative shrink-0">
            {notification.avatar_url ? (
              <img
                src={notification.avatar_url}
                alt={notification.title || "Notification avatar"}
                className="h-10 w-10 rounded-xl border border-cyan-100 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-white text-cyan-700">
                <Icon size={17} />
              </div>
            )}
            {isUnread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-500" />}
          </div>

          <div className="min-w-0 flex-1 pr-1">
            <p className="truncate text-[13px] font-black tracking-tight text-slate-900">{notification.title || "Notification"}</p>
            <p className="mt-1 break-words text-[12px] font-medium leading-[1.45] text-slate-700">
              {notification.message || "You have an update from HealthSync."}
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
              {notification.created_at
                ? new Date(notification.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Now"}
            </p>
          </div>
        </button>

        <MotionButton
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className={`mt-0.5 shrink-0 rounded-xl border p-2 transition ${
            deleting
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-cyan-100 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          }`}
          aria-label="Delete notification"
        >
          <Trash2 size={14} />
        </MotionButton>
      </div>
    </MotionArticle>
  );
};

export default NotificationItem;
