import Script from 'next/script';

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

export const OrganizationJsonLd = ({
  name,
  url,
  logo,
  sameAs = [],
}: OrganizationJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

interface JobPostingJsonLdProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough: string;
  employmentType: string;
  hiringOrganization: {
    name: string;
    sameAs: string;
    logo: string;
  };
  jobLocation: {
    addressCountry: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  baseSalary?: {
    currency: string;
    value: {
      minValue?: number;
      maxValue?: number;
      value?: number;
      unitText: string;
    };
  };
  skills?: string[];
}

export const JobPostingJsonLd = ({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
  baseSalary,
  skills = [],
}: JobPostingJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    validThrough,
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      ...hiringOrganization,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...jobLocation,
      },
    },
    ...(baseSalary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: baseSalary.currency,
        value: {
          '@type': 'QuantitativeValue',
          ...baseSalary.value,
        },
      },
    }),
    ...(skills.length > 0 && { skills }),
  };

  return (
    <Script
      id="jobposting-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

interface PersonJsonLdProps {
  name: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
  url?: string;
}

export const PersonJsonLd = ({
  name,
  jobTitle,
  image,
  sameAs = [],
  url,
}: PersonJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    ...(jobTitle && { jobTitle }),
    ...(image && { image }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(url && { url }),
  };

  return (
    <Script
      id="person-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

interface FAQJsonLdProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQJsonLd = ({ questions }: FAQJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

interface WebsiteJsonLdProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

export const WebsiteJsonLd = ({
  name,
  url,
  description,
  searchUrl,
}: WebsiteJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(description && { description }),
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: searchUrl,
        },
        'query-input': 'required name=search_term',
      },
    }),
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
