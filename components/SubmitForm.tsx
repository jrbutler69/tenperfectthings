'use client';

import { useState, useCallback } from 'react';
import { CLOTHING_CATEGORIES, TEN_QUESTIONS } from '@/types';

interface ClothingPick {
  product_url: string;
  product_name: string;
  brand_name: string;
  image_url: string;
  quote: string;
  loading?: boolean;
  skipped?: boolean;
}

interface FormState {
  name: string;
  email: string;
  location: string;
  occupation: string;
  website: string;
  bio: string;
  photo: File | null;
  photoPreview: string;
  question_answers: string[];
  clothing_picks: Record<string, ClothingPick>;
}

const TOTAL_STEPS = 4;

export default function SubmitForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    location: '',
    occupation: '',
    website: '',
    bio: '',
    photo: null,
    photoPreview: '',
    question_answers: Array(TEN_QUESTIONS.length).fill(''),
    clothing_picks: Object.fromEntries(
      CLOTHING_CATEGORIES.map(c => [c.key, { product_url: '', product_name: '', brand_name: '', image_url: '', quote: '' }])
    ),
  });

  const updateField = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateField('photo', file);
    const reader = new FileReader();
    reader.onloadend = () => updateField('photoPreview', reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateAnswer = (index: number, value: string) => {
    const answers = [...form.question_answers];
    answers[index] = value;
    updateField('question_answers', answers);
  };

  const updatePick = (key: string, field: keyof ClothingPick, value: any) => {
    setForm(prev => ({
      ...prev,
      clothing_picks: {
        ...prev.clothing_picks,
        [key]: { ...prev.clothing_picks[key], [field]: value },
      },
    }));
  };

  const fetchProduct = useCallback(async (key: string, url: string) => {
    if (!url.startsWith('http')) return;
    updatePick(key, 'loading', true);
    try {
      const res = await fetch(`/api/scrape-product?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        clothing_picks: {
          ...prev.clothing_picks,
          [key]: {
            ...prev.clothing_picks[key],
            product_name: data.product_name || prev.clothing_picks[key].product_name,
            brand_name: data.brand_name || prev.clothing_picks[key].brand_name,
            image_url: data.image_url || prev.clothing_picks[key].image_url,
            loading: false,
          },
        },
      }));
    } catch {
      updatePick(key, 'loading', false);
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('bio', form.bio);
      fd.append('location', form.location);
      fd.append('occupation', form.occupation);
      fd.append('website', form.website);
      if (form.photo) fd.append('photo', form.photo);
      fd.append('question_answers', JSON.stringify(form.question_answers));

      const cleanPicks = Object.fromEntries(
        Object.entries(form.clothing_picks).map(([key, pick]) => [
          key,
          { product_url: pick.product_url, product_name: pick.product_name,
            brand_name: pick.brand_name, image_url: pick.image_url, quote: pick.quote }
        ])
      );
      fd.append('clothing_picks', JSON.stringify(cleanPicks));

      const res = await fetch('/api/submit', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✦</div>
        <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '1rem' }}>
          Thank you, {form.name.split(' ')[0]}!
        </h2>
        <p style={{ color: 'var(--warm-gray)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your submission has been received. We'll review it and publish your profile soon.
          You'll hear from us at {form.email}.
        </p>
        <a href="/" className="btn-secondary">Back to Home</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="step-indicator">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i + 1 < step ? 'completed' : i + 1 === step ? 'active' : ''}`}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {step === 1 && (
        <div>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem' }}>About You</h2>
          <p style={{ color: 'var(--warm-gray)', marginBottom: '2rem' }}>Tell us a bit about yourself.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" placeholder="Your name" value={form.name}
                onChange={e => updateField('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => updateField('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Location *</label>
              <input className="form-input" type="text" placeholder="Brooklyn, NY" value={form.location}
                onChange={e => updateField('location', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Occupation *</label>
              <input className="form-input" type="text" placeholder="What do you do?" value={form.occupation}
                onChange={e => updateField('occupation', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Website / Instagram</label>
              <input className="form-input" type="text" placeholder="https://yoursite.com or @handle" value={form.website}
                onChange={e => updateField('website', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Your Bio *</label>
              <textarea className="form-input" placeholder="Tell us who you are..." value={form.bio}
                onChange={e => updateField('bio', e.target.value)} rows={5} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Your Photo *</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginBottom: '0.75rem' }}>
                A clear photo of you — doesn't need to be professional, just genuine.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {form.photoPreview && (
                  <img src={form.photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange}
                  style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary"
              disabled={!form.name || !form.email || !form.bio || !form.location || !form.occupation}
              onClick={() => setStep(2)}>
              Next: Ten Questions →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem' }}>Ten Questions</h2>
          <p style={{ color: 'var(--warm-gray)', marginBottom: '2rem' }}>Quick answers, honest answers.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {TEN_QUESTIONS.map((question, i) => (
              <div key={i}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '0.4rem' }}>
                  {question}
                </label>
                <textarea className="form-input" rows={2}
                  placeholder="Your answer..."
                  value={form.question_answers[i]}
                  onChange={e => updateAnswer(i, e.target.value)} />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Next: Your Ten Picks →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem' }}>Your Ten Perfect Things</h2>
          <p style={{ color: 'var(--warm-gray)', marginBottom: '0.5rem' }}>
            For each category, paste a product URL and add your take. Skip any that don't apply.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '2rem' }}>
            ✦ Paste a URL and we'll auto-fetch the product name and image
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {CLOTHING_CATEGORIES.map((category, index) => {
              const pick = form.clothing_picks[category.key];
              return (
                <div key={category.key} style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                    <div>
                      <span className="category-number">{String(index + 1).padStart(2, '0')} / </span>
                      <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        {category.label}
                      </span>
                    </div>
                    <button
                      onClick={() => updatePick(category.key, 'skipped', !pick.skipped)}
                      style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {pick.skipped ? '+ Add pick' : 'Skip'}
                    </button>
                  </div>

                  {!pick.skipped && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label className="form-label">Product URL</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input className="form-input" type="url" placeholder="https://..."
                            value={pick.product_url}
                            onChange={e => updatePick(category.key, 'product_url', e.target.value)}
                            onBlur={e => { if (e.target.value) fetchProduct(category.key, e.target.value); }}
                          />
                          {pick.loading && (
                            <div style={{ padding: '0.7rem', color: 'var(--warm-gray)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              Fetching...
                            </div>
                          )}
                        </div>
                      </div>

                      {(pick.product_name || pick.image_url) && (
                        <div className="product-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          {pick.image_url && (
                            <img src={pick.image_url} alt={pick.product_name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pick.brand_name}</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{pick.product_name}</p>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="form-label">Brand Name</label>
                          <input className="form-input" type="text" placeholder="e.g. J. Crew"
                            value={pick.brand_name}
                            onChange={e => updatePick(category.key, 'brand_name', e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Product Name</label>
                          <input className="form-input" type="text" placeholder="e.g. Giant-fit Chino"
                            value={pick.product_name}
                            onChange={e => updatePick(category.key, 'product_name', e.target.value)} />
                        </div>
                      </div>

                      {!pick.image_url && (
                        <div>
                          <label className="form-label">Product Image URL (optional)</label>
                          <input className="form-input" type="url" placeholder="Direct image URL..."
                            value={pick.image_url}
                            onChange={e => updatePick(category.key, 'image_url', e.target.value)} />
                        </div>
                      )}

                      <div>
                        <label className="form-label">Your Take *</label>
                        <textarea className="form-input" rows={2}
                          placeholder="Why is this your perfect pick?"
                          value={pick.quote}
                          onChange={e => updatePick(category.key, 'quote', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-primary" onClick={() => setStep(4)}>Review & Submit →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem' }}>Review & Submit</h2>
          <p style={{ color: 'var(--warm-gray)', marginBottom: '2rem' }}>
            Take a look before we send it off.
          </p>

          <div style={{ background: 'var(--pale)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              {form.photoPreview && (
                <img src={form.photoPreview} alt="" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
              )}
              <div>
                <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 400 }}>{form.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>{form.occupation} · {form.location}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--warm-gray)', lineHeight: 1.6 }}>{form.bio}</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-gray)', marginBottom: '0.75rem' }}>
              Your Picks
            </p>
            {CLOTHING_CATEGORIES.map((cat) => {
              const pick = form.clothing_picks[cat.key];
              if (pick.skipped || !pick.quote) return null;
              return (
                <div key={cat.key} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', minWidth: '180px' }}>{cat.label}</span>
                  <span style={{ fontSize: '0.85rem' }}>{pick.brand_name} {pick.product_name}</span>
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={() => setStep(3)}>← Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit My Profile ✦'}
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', marginTop: '1rem', textAlign: 'center' }}>
            Your profile will be reviewed before publishing. We'll email you when it's live.
          </p>
        </div>
      )}
    </div>
  );
}