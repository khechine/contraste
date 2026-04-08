import { Locale } from '@/lib/i18n';
import ContactForm from '@/components/ContactForm';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const formLabels = {
  fr: {
    title: 'Contactez-nous',
    subtitle: 'Nous serions ravis de vous entendre. Envoyez-nous un message.',
    name: 'Nom',
    email: 'Email',
    subject: 'Sujet',
    message: 'Message',
    submit: 'Envoyer',
    sending: 'Envoi en cours...',
    success: 'Message envoyé avec succès!',
    error: 'Une erreur est survenue. Veuillez réessayer.',
  },
  en: {
    title: 'Contact Us',
    subtitle: "We'd love to hear from you. Send us a message.",
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'An error occurred. Please try again.',
  },
  ar: {
    title: 'اتصل بنا',
    subtitle: 'يسعدنا سماع رأيك. أرسل لنا رسالة.',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    subject: 'الموضوع',
    message: 'الرسالة',
    submit: 'إرسال',
    sending: 'جار الإرسال...',
    success: 'تم إرسال الرسالة بنجاح!',
    error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
};

export const metadata = {
  fr: { title: 'Contact | Maison d\'Éditions' },
  en: { title: 'Contact | Publishing House' },
  ar: { title: 'اتصل بنا | دار النشر' },
};

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const labels = formLabels[locale];

  return (
    <div className="min-h-screen py-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ContactForm labels={labels} />
      </section>
    </div>
  );
}
