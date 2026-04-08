import { Locale } from '@/lib/i18n';
import ManuscriptForm from '@/components/ManuscriptForm';

export default async function ManuscriptSubmission({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;

  const title = locale === 'fr' ? 'Envoyer votre manuscrit' : locale === 'en' ? 'Submit Your Manuscript' : 'إرسال مخطوطتك';
  const subtitle = locale === 'fr' ? 'Nous lisons tous les manuscrits soumis.' : locale === 'en' ? 'We read all submitted manuscripts.' : 'نقرأ جميع المخطوطات المرسلة.';

  const formLabels = {
    fr: {
      authorName: 'Nom de l\'auteur',
      email: 'Email',
      manuscriptTitle: 'Titre du manuscrit',
      description: 'Courte présentation',
      fileLabel: 'Votre manuscrit (PDF, DOC)',
      submit: 'Envoyer',
      sending: 'Envoi en cours...',
      success: 'Manuscrit envoyé avec succès !',
      error: 'Une erreur est survenue.',
    },
    en: {
      authorName: 'Author Name',
      email: 'Email',
      manuscriptTitle: 'Manuscript Title',
      description: 'Short Synopsis',
      fileLabel: 'Your Manuscript (PDF, DOC)',
      submit: 'Submit',
      sending: 'Sending...',
      success: 'Manuscript sent successfully!',
      error: 'An error occurred.',
    },
    ar: {
      authorName: 'اسم المؤلف',
      email: 'البريد الإلكتروني',
      manuscriptTitle: 'عنوان المخطوطة',
      description: 'نبذة قصيرة',
      fileLabel: 'مخطوطتك (PDF, DOC)',
      submit: 'إرسال',
      sending: 'جاري الإرسال...',
      success: 'تم إرسال المخطوطة بنجاح!',
      error: 'حدث خطأ.',
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-2xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            {subtitle}
          </p>
        </div>
        <ManuscriptForm labels={formLabels[locale]} />
      </section>
    </div>
  );
}

