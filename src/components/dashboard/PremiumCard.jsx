import { motion } from "framer-motion";

const hoverSpring = {
  type: "spring",
  stiffness: 280,
  damping: 20,
  mass: 0.8,
};

const entry = {
  hidden: { opacity: 0, y: 14 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const PremiumCard = ({
  children,
  className = "",
  contentClassName = "",
  interactive = true,
  delay = 0,
  as = "div",
  ...props
}) => {
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      custom={delay}
      variants={entry}
      initial="hidden"
      animate="show"
      whileHover={
        interactive
          ? {
              y: -6,
              scale: 1.01,
              boxShadow:
                "0 36px 64px -38px rgba(8,145,178,0.58), 0 18px 34px -24px rgba(15,23,42,0.2)",
            }
          : undefined
      }
      transition={hoverSpring}
      className={`group relative overflow-hidden rounded-[24px] border border-cyan-100/90 bg-white/88 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.26)] backdrop-blur-xl ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/35 via-transparent to-blue-100/35" />
        <div className="absolute inset-[1px] rounded-[22px] border border-cyan-300/70" />
      </div>

      <div className="pointer-events-none absolute -left-28 top-0 h-full w-20 rotate-12 bg-gradient-to-r from-transparent via-white/85 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[620%]" />

      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </MotionTag>
  );
};

export default PremiumCard;
