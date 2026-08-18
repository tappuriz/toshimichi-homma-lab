const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getSiteUrl = () => {
  const script = document.currentScript ||
    [...document.scripts].find((item) => item.src.endsWith('/script.js'));

  return new URL('.', script?.src || window.location.href).href;
};

const addOrganizationStructuredData = () => {
  const siteUrl = getSiteUrl();
  const aboutUrl = new URL('about.html', siteUrl).href;
  const seminarUrl = new URL('seminar.html', siteUrl).href;
  const commonsUrl = new URL('commons.html', siteUrl).href;
  const currentUrl = new URL(window.location.href);

  currentUrl.search = '';
  currentUrl.hash = '';

  const pageName = currentUrl.pathname.split('/').pop() || 'index.html';
  const pageTitle = document.title;
  const pageDescription = document
    .querySelector('meta[name="description"]')
    ?.getAttribute('content');
  const hommaId = `${siteUrl}#toshimichi-homma`;
  const labId = `${siteUrl}#toshimichi-homma-lab`;
  const seminarId = `${seminarUrl}#organization`;
  const commonsId = `${commonsUrl}#organization`;
  const person = {
    '@type': 'Person',
    '@id': hommaId,
    name: '本間 利通',
    alternateName: 'Toshimichi Homma',
    url: aboutUrl,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: '大阪経済大学',
      alternateName: 'Osaka University of Economics',
      url: 'https://www.osaka-ue.ac.jp/'
    },
    sameAs: [
      'https://researchmap.jp/read0143234',
      'https://webj8.osaka-ue.ac.jp/ouehp/KgApp?resId=S000129'
    ]
  };
  const graph = [person];

  if (pageName === 'about.html') {
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${currentUrl.href}#webpage`,
      url: currentUrl.href,
      name: pageTitle,
      mainEntity: { '@id': hommaId }
    });
  } else if (pageName === 'research.html') {
    graph.push({
      '@type': 'WebPage',
      '@id': `${currentUrl.href}#webpage`,
      url: currentUrl.href,
      name: pageTitle,
      description: pageDescription,
      author: { '@id': hommaId }
    });
  } else if (pageName === 'seminar.html') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': seminarId,
        name: '大阪経済大学 本間利通ゼミ',
        alternateName: 'Toshimichi Homma Seminar',
        url: seminarUrl,
        founder: { '@id': hommaId },
        sameAs: ['https://x.com/hommasemi7']
      },
      {
        '@type': 'WebPage',
        '@id': `${currentUrl.href}#webpage`,
        url: currentUrl.href,
        name: pageTitle,
        description: pageDescription,
        mainEntity: { '@id': seminarId },
        author: { '@id': hommaId }
      }
    );
  } else if (pageName === 'commons.html') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': commonsId,
        name: 'Management & AI Commons Osaka',
        alternateName: 'MACO',
        url: commonsUrl,
        description: pageDescription,
        founder: { '@id': hommaId },
        areaServed: {
          '@type': 'City',
          name: '大阪市',
          alternateName: 'Osaka'
        },
        sameAs: ['https://oue-meetup.connpass.com/']
      },
      {
        '@type': 'WebPage',
        '@id': `${currentUrl.href}#webpage`,
        url: currentUrl.href,
        name: pageTitle,
        description: pageDescription,
        mainEntity: { '@id': commonsId },
        author: { '@id': hommaId }
      }
    );
  } else if (pageName === 'index.html') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': labId,
        name: 'Toshimichi Homma Lab.',
        alternateName: '本間利通研究室',
        url: siteUrl,
        founder: { '@id': hommaId }
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'Toshimichi Homma Lab.',
        alternateName: '本間利通研究室',
        publisher: { '@id': labId },
        author: { '@id': hommaId }
      }
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': graph
  };
  const script = document.createElement('script');

  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.append(script);
};

addOrganizationStructuredData();

let entryInitialized = false;
let pagerevealSeen = false;
let heroMotionTimer = 0;

const showAllReveals = () => {
  document.querySelectorAll('.reveal').forEach((item) => {
    item.classList.add('is-visible');
  });
};

const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
};

const startHeroMotion = (delay = 0) => {
  if (!document.querySelector('.hero-line')) {
    return;
  }

  window.clearTimeout(heroMotionTimer);
  heroMotionTimer = window.setTimeout(() => {
    const root = document.documentElement;
    root.classList.remove('with-hero-motion');
    void root.offsetWidth;
    root.classList.add('with-hero-motion');
  }, delay);
};

const initScrollReveal = (keepInViewVisible = false) => {
  const revealItems = document.querySelectorAll('.reveal');

  if (!revealItems.length) {
    return;
  }

  document.documentElement.classList.add('with-entry-motion');

  if (!('IntersectionObserver' in window)) {
    showAllReveals();
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach((item) => {
    if (keepInViewVisible && isInViewport(item)) {
      item.classList.add('is-visible');
      return;
    }

    observer.observe(item);
  });
};

const onDirectLoad = () => {
  if (entryInitialized) {
    return;
  }

  entryInitialized = true;

  if (prefersReducedMotion()) {
    showAllReveals();
    return;
  }

  startHeroMotion(80);
  initScrollReveal(false);
};

const onViewTransitionComplete = () => {
  document.documentElement.classList.remove('skip-entry-motion');

  if (prefersReducedMotion()) {
    if (!entryInitialized) {
      entryInitialized = true;
      showAllReveals();
    }
    return;
  }

  startHeroMotion(120);

  if (entryInitialized) {
    return;
  }

  entryInitialized = true;
  initScrollReveal(true);
};

if ('onpagereveal' in window) {
  window.addEventListener('pagereveal', (event) => {
    pagerevealSeen = true;

    if (event.viewTransition) {
      document.documentElement.classList.add('skip-entry-motion');
      // finished can reject if the transition is skipped/aborted; still init in that case.
      event.viewTransition.finished.then(onViewTransitionComplete, onViewTransitionComplete);
      return;
    }

    onDirectLoad();
  });

  // Fallback in case pagereveal never fires (observed intermittently on cold Chrome starts).
  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => {
      if (pagerevealSeen || document.documentElement.classList.contains('skip-entry-motion')) {
        return;
      }

      onDirectLoad();
    }, 300);
  });
} else {
  document.addEventListener('DOMContentLoaded', onDirectLoad);
}
