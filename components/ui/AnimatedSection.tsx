'use client';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';

const variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const isDesktop = useIsDesktop();
  if (!isDesktop) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
