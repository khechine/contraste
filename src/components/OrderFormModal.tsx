'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Author } from '@/lib/types';
import { Locale } from '@/lib/i18n';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  locale: Locale;
  labels: Record<string, string>;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  book,
  locale,
  labels,
}: OrderFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    quantity: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

const title = book.title || book.title_en || book.title_ar || 'Livre';
  const authorName = book.author_name || (book.author as Author)?.name || 'N/A';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Simulate API call
    // In production, send to /api/send-order or EmailJS
    console.log('Order data:', { ...formData, book: title, author: authorName, price_dt: book.price_dt, price_eur: book.price_eur });

    try {
      // Pour passer l'email directement depuis l'environnement
      const targetEmail = process.env.NEXT_PUBLIC_ORDER_EMAIL || 'commandes@contraste-editions.tn';
      
      // Example EmailJS - add your keys
      // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      //   ...formData,
      //   book_title: title,
      //   book_author: authorName,
      //   to_email: targetEmail,
      // }, 'YOUR_PUBLIC_KEY');
      
      // Alternative: fetch to custom API route
      // await fetch('/api/send-order', {
      //   method: 'POST',
      //   body: JSON.stringify({ ...formData, book: title, to: targetEmail })
      // });
      
      setMessage('Commande envoyée ! Merci, nous vous contactons bientôt.');
      setFormData({ name: '', email: '', phone: '', address: '', quantity: '1' });
    } catch (error) {
      setMessage('Erreur lors de l\'envoi. Réessayez ou contactez-nous.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Commander {title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            <h3 className="font-semibold">Livre :</h3>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-gray-600">Auteur : {authorName}</p>
            <p className="text-sm text-gray-600">Prix : {book.price_dt || 0} DT / {book.price_eur || 0} €</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom complet *</label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adresse de livraison *</label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantité</label>
              <select
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10+</option>
              </select>
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {message}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                Annuler
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.02 }}
              >
                {isSubmitting ? 'Envoi...' : 'Commander'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
