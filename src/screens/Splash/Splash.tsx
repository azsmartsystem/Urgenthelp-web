import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/onboarding'), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-[240px] h-[240px] flex items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full border-2 border-white/15" />
        <span className="absolute inset-6 rounded-full border-2 border-white/25" />
        <span className="absolute inset-12 rounded-full border-2 border-white/40" />
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-brand font-black text-2xl font-display">
          UH
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-display font-semibold text-[40px] leading-[44px] tracking-[-0.0375em] text-white mt-5"
      >
        Urgent Help
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="text-white text-base mt-2"
      >
        Trusted help, right when you need it
      </motion.p>
    </div>
  );
}
