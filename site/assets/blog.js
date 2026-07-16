function getBlogConfig() {
  return window.MD_BLOG_CONFIG || { wpSite: '' };
}

function stripHtml(html) {
  const el = document.createElement('div');
  el.innerHTML = html || '';
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function postUrl(slug) {
  return `/blog/${encodeURIComponent(slug)}`;
}

async function fetchBlogPosts(limit = 12) {
  const { wpSite } = getBlogConfig();
  if (!wpSite) return null;

  const url = `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(wpSite)}/posts/?number=${limit}&fields=ID,title,excerpt,slug,date,featured_image`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load posts (${res.status})`);
  const data = await res.json();
  return data.posts || [];
}

async function fetchBlogPost(slug) {
  const { wpSite } = getBlogConfig();
  if (!wpSite || !slug) return null;

  const url = `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(wpSite)}/posts/slug:${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Could not load post (${res.status})`);
  return res.json();
}

function renderPostCard(post) {
  const title = stripHtml(post.title);
  const excerpt = stripHtml(post.excerpt);
  const date = formatDate(post.date);
  const img = post.featured_image
    ? `<img src="${post.featured_image}" alt="" class="w-full h-44 object-cover" loading="lazy">`
    : `<div class="h-44 bg-gradient-to-br from-brand-dark/20 to-brand/10 flex items-center justify-center"><i class="fas fa-wrench text-brand/40 text-3xl" aria-hidden="true"></i></div>`;

  return `
    <article class="blog-card group bg-white border border-cream-dark rounded-3xl overflow-hidden hover:border-brand/30 transition-colors">
      <a href="${postUrl(post.slug)}" class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-3xl">
        ${img}
        <div class="p-6">
          ${date ? `<time class="text-xs font-medium text-slate-500 uppercase tracking-wide" datetime="${post.date}">${date}</time>` : ''}
          <h2 class="heading-font text-xl font-semibold text-ink mt-2 mb-2 group-hover:text-brand-dark transition-colors">${title}</h2>
          <p class="text-sm text-slate-600 leading-relaxed line-clamp-3">${excerpt}</p>
          <span class="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark mt-4">Read article <i class="fas fa-arrow-right text-[10px]"></i></span>
        </div>
      </a>
    </article>
  `;
}

function renderPlaceholderCards() {
  const topics = [
    {
      title: 'Why local shops still lose calls without a real website',
      excerpt: 'Facebook and Google listings help — but they are not a substitute for a site you control.',
    },
    {
      title: 'What “mobile-first” actually means for a mechanic or contractor',
      excerpt: 'Most of your customers are searching on a phone. Here is what that should change on your site.',
    },
    {
      title: 'Essential vs Growth: which package fits a one-location trade?',
      excerpt: 'A plain breakdown of scope, pages, and when the bigger tier is worth it.',
    },
  ];

  return topics
    .map(
      (t) => `
    <article class="bg-white border border-dashed border-slate-200 rounded-3xl p-6">
      <span class="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark bg-brand/10 px-2.5 py-1 rounded-full mb-3">Coming soon</span>
      <h2 class="heading-font text-lg font-semibold text-ink mb-2">${t.title}</h2>
      <p class="text-sm text-slate-600 leading-relaxed">${t.excerpt}</p>
    </article>
  `
    )
    .join('');
}