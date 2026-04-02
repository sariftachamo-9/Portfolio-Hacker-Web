import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import Magnetic from './Magnetic';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('EMAIL_REQUIRED: Field cannot be empty');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('INVALID_EMAIL: Format check failed');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, just simulate subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('SUBSCRIBED: Check your email for confirmation');
      setSubscribed(true);
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('SUBSCRIPTION_FAILED: Try again later');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-neon-green font-mono text-sm"
      >
        <Check size={16} />
        SUBSCRIBED
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-black border border-neon-green/30 text-neon-green placeholder:text-neon-green/30 font-mono text-sm outline-none focus:border-neon-green transition-colors disabled:opacity-50"
        />
        <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neon-green/30 pointer-events-none" />
      </div>
      <Magnetic>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
        >
          <Send size={14} />
          {loading ? 'SENDING...' : 'SUBSCRIBE'}
        </motion.button>
      </Magnetic>
    </form>
  );
}
