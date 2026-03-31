import SubmitForm from '@/components/SubmitForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Ten Perfect Things',
  description: 'Share your picks for ten wardrobe essentials.',
};

export default function SubmitPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ padding: '4rem 0 2rem', borderBottom: '1px solid var(--border)', marginBottom: '3rem' }}>
        <p className="category-number" style={{ marginBottom: '0.75rem' }}>Join the archive</p>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, marginBottom: '0.75rem' }}>
          Submit Your Profile
        </h1>
        <p style={{ color: 'var(--warm-gray)', maxWidth: '500px', lineHeight: 1.7 }}>
          No algorithms, no sponsored picks — just your genuine taste across ten wardrobe categories. Takes about 10–15 minutes.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}