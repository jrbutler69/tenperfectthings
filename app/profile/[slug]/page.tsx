import { getSupabaseAdmin } from '@/lib/db';
import { CLOTHING_CATEGORIES, TEN_QUESTIONS, Profile, CategoryKey, ClothingItem } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getProfile(slug: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const profile = await getProfile(params.slug);
  if (!profile) return { title: 'Profile not found' };
  return {
    title: `${profile.name}'s Ten Perfect Things`,
    description: profile.bio?.slice(0, 155),
    openGraph: {
      images: profile.photo_url ? [profile.photo_url] : [],
    },
  };
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getProfile(params.slug);
  if (!profile) notFound();

  const formattedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem' }}>

      <div style={{ padding: '2rem 0 0' }}>
        <Link href="/" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)', textDecoration: 'none' }}>
          ← All Profiles
        </Link>
      </div>

      <header style={{ padding: '3rem 0 2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="category-number" style={{ marginBottom: '0.75rem' }}>Ten Perfect Things</p>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: '0.5rem' }}>
          {profile.name}&apos;s Ten Perfect Things
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>{formattedDate}</p>
      </header>

      <div className="profile-hero">
        <div>
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '4rem', opacity: 0.2 }}>✦</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '0.25rem' }}>
            {profile.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            {profile.occupation}{profile.location ? ` · ${profile.location}` : ''}
            {profile.website && (
              <>
                {' · '}
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
                  Website
                </a>
              </>
            )}
          </p>

          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink)', marginBottom: '2.5rem' }}>
            {profile.bio}
          </p>

          <div>
            <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Ten Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {TEN_QUESTIONS.map((question, i) => {
                const answer = profile.question_answers?.[i];
                if (!answer) return null;
                return (
                  <div key={i}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                      {question}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--warm-gray)', lineHeight: 1.6 }}>
                      {answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section style={{ marginTop: '4rem' }}>
        <div style={{ borderBottom: '2px solid var(--ink)', marginBottom: '0', paddingBottom: '1rem' }}>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700 }}>
            Ten Perfect Things
          </h2>
        </div>

        {CLOTHING_CATEGORIES.map((category, index) => {
          const pick = profile.clothing_picks?.[category.key as CategoryKey] as ClothingItem | undefined;

          return (
            <div key={category.key} className="clothing-item">
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '200px' }}>
                  <p className="category-number" style={{ marginBottom: '0.3rem' }}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>
                    {category.label}
                  </h3>
                </div>

                <div style={{ flex: 1 }}>
                  {pick && (pick.product_name || pick.quote) ? (
                    <>
                      {pick.image_url && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--pale)', padding: '1.5rem' }}>
                          <img
                            src={pick.image_url}
                            alt={pick.product_name}
                            style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)', marginBottom: '0.25rem' }}>
                              {pick.brand_name}
                            </p>
                            {pick.product_url ? (
                              <a href={pick.product_url} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)', textDecoration: 'underline', lineHeight: 1.4 }}>
                                {pick.product_name}
                              </a>
                            ) : (
                              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{pick.product_name}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {!pick.image_url && pick.product_name && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {pick.brand_name}{' '}
                          </span>
                          {pick.product_url ? (
                            <a href={pick.product_url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.95rem', color: 'var(--ink)', textDecoration: 'underline' }}>
                              {pick.product_name}
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.95rem' }}>{pick.product_name}</span>
                          )}
                        </div>
                      )}

                      {pick.quote && (
                        <div className="pull-quote">
                          "{pick.quote}"
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ color: 'var(--warm-gray)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                      "Sorry, I don't really wear them!"
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div style={{ marginTop: '5rem', textAlign: 'center', padding: '3rem', background: 'var(--pale)', borderTop: '1px solid var(--border)' }}>
        <div className="ornament">✦</div>
        <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.75rem' }}>
          What are your ten perfect things?
        </p>
        <p style={{ color: 'var(--warm-gray)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Share your picks with the community.
        </p>
        <Link href="/submit" className="btn-primary">Submit Your Profile</Link>
      </div>
    </article>
  );
}