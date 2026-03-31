import { getSupabaseAdmin } from '@/lib/db';
import Link from 'next/link';
import { Profile } from '@/types';

export const dynamic = 'force-dynamic';

async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  const profiles = await getProfiles();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ padding: '5rem 0 3rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <p className="category-number" style={{ marginBottom: '1rem' }}>A style guide from real people</p>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Ten Perfect Things
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--warm-gray)', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Interesting people share their picks for ten wardrobe essentials — no algorithms, no sponsorships, just genuine taste.
        </p>
        <Link href="/submit" className="btn-primary">Share Your Ten Things</Link>
      </div>

      {profiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className="ornament">✦ ✦ ✦</div>
          <p style={{ color: 'var(--warm-gray)', fontSize: '1.1rem' }}>
            The first profiles are coming soon.
          </p>
          <Link href="/submit" className="btn-secondary" style={{ marginTop: '2rem', display: 'inline-block' }}>
            Be the first to submit
          </Link>
        </div>
      ) : (
        <div style={{ padding: '4rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5px', background: 'var(--border)' }}>
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/profile/${profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="profile-card" style={{ background: 'var(--cream)' }}>
        <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--pale)', position: 'relative' }}>
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem', opacity: 0.3 }}>✦</span>
            </div>
          )}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0.25rem' }}>
            {profile.name}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', letterSpacing: '0.05em' }}>
            {profile.occupation}{profile.location ? ` · ${profile.location}` : ''}
          </p>
          {profile.bio && (
            <p style={{ fontSize: '0.9rem', color: 'var(--warm-gray)', marginTop: '0.75rem', lineHeight: 1.6,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>
              {profile.bio}
            </p>
          )}
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>
              View ten things
            </span>
            <span style={{ color: 'var(--gold)' }}>→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}