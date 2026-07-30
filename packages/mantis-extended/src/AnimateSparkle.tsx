import { ReactNode } from 'react';

// third-party
import { motion } from 'framer-motion';

interface Props {
  children?: ReactNode;
  triggered?: boolean;
}

// ==============================|| ANIMATION SPARKLE ||============================== //

export default function AnimateSparkle({ children, triggered = false }: Props) {
  return (
    <motion.span
      animate={triggered ? { scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] } : {}}
      transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.span>
  );
}
