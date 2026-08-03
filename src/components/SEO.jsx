import { Helmet } from 'react-helmet-async';

export default function SEO({
    title,
    description,
    keywords,
}) {
    const siteName = 'Weather STA - TNA';
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    const pageDescription = description || 'Colección de herramientas útiles para desarrolladores y operaciones.';
    const pageKeywords = keywords || 'developer tools, herramientas online, crypto, jwt, aes, base64';

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />

            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:type" content="website" />

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
        </Helmet>
    );
}
