import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { usePublishedProperties } from './hooks/usePublishedProperties'
import { usePropertySearch } from './hooks/usePropertySearch'
import { useWhatsAppNumber } from './hooks/useWhatsAppNumber'
import { usePropertyFeatures } from './hooks/usePropertyFeatures'
import { uploadPropertyImage } from './services/imageService'
import { createProperty, getAdminDashboard, updateInquiryStatus, updateProperty, updatePropertyStatus, type AdminDashboardSummary, type InquirySummary } from './services/adminPropertyService'
import { login, restoreSession } from './services/authService'
import { getPublishedProperty } from './services/propertyService'
import { getContactMessages, getSeoMetadata, getSocialLinks, getWebsiteSettings, saveSeoMetadata, saveWebsiteSetting, submitContactMessage, type ContactMessage, type SeoMetadata, type SocialLink, type WebsiteSetting } from './services/contentAdminService'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useLocalizedProperty } from './hooks/useLocalizedProperty'
import { InstallAppButton } from './components/InstallAppButton'
import { OfflineStatus } from './components/OfflineStatus'
import axios from 'axios'
import { ArrowRight, BarChart3, BedDouble, Building2, ChevronDown, Eye, Home as HomeIcon, Mail, MapPin, Menu, MessageCircle, Phone, Plus, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import './App.css'

const agencyEmail = 'Jeffersonservicefaso@gmail.com'
const whatsappNumber = '22655773241'
const socialLinks = {
  facebook: 'https://www.facebook.com/share/19jAWp4cDZ/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/jeffersonfaso?igsi=MXM1bTU0ZTQxNGRoaA%3D%3D&utm_source=qr',
  tiktok: 'https://www.tiktok.com/@jefferson.services?_r=1&_t=ZS-99AziupipCC',
}
const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://jefferson-immobilier.example'
type PropertyCardData = { id: string; reference: string; type: string; title: string; titleFr?: string; titleEn?: string; location: string; price: string; image: string; beds: number; area: string; imageUrls?: string[] }

function Seo({ title, description, path = '/', image, structuredData }: { title: string; description: string; path?: string; image?: string; structuredData?: Record<string, unknown> }) {
  const { i18n } = useTranslation()
  useEffect(() => {
    const canonicalUrl = `${siteUrl}${path}`
    document.title = title
    const setMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${selector}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, selector)
        document.head.appendChild(element)
      }
      element.content = value
    }
    setMeta('description', 'name', description)
    setMeta('og:title', 'property', title)
    setMeta('og:description', 'property', description)
    setMeta('og:url', 'property', canonicalUrl)
    setMeta('og:type', 'property', 'website')
    if (image) setMeta('og:image', 'property', image)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl;
    const alternateLinks = [
      ['fr', `${siteUrl}/fr${path}`],
      ['en', `${siteUrl}/en${path}`],
      ['x-default', canonicalUrl],
    ];
    alternateLinks.forEach(([language, href]) => {
      let alternate = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${language}"]`);
      if (!alternate) {
        alternate = document.createElement('link');
        alternate.rel = 'alternate';
        alternate.hreflang = language;
        document.head.appendChild(alternate);
      }
      alternate.href = href;
    });
    const schemaData = structuredData ?? { '@context': 'https://schema.org', '@type': ['RealEstateAgent', 'LocalBusiness'], name: 'Jefferson Immobilier', description, url: siteUrl, inLanguage: i18n.language === 'en' ? 'en-US' : 'fr-FR', email: agencyEmail, telephone: '+22655773241', areaServed: 'Burkina Faso', sameAs: [socialLinks.facebook, socialLinks.instagram, socialLinks.tiktok] }
    let schema = document.head.querySelector<HTMLScriptElement>('script[data-jefferson-schema]')
    if (!schema) {
      schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.jeffersonSchema = 'true'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(schemaData)
  }, [description, i18n.language, image, path, structuredData, title])
  return null
}

const properties: PropertyCardData[] = [
  { id: 'villa-ouaga', reference: 'JEF-VIL-001', type: 'Villa contemporaine', title: 'Ligne claire, jardin secret', location: 'Ouaga 2000, Ouagadougou', price: '185 000 000 FCFA', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', beds: 4, area: '420 m²' },
  { id: 'apartment-ouaga', reference: 'JEF-APP-002', type: 'Appartement premium', title: 'La ville à vos fenêtres', location: 'Zone du Bois, Ouagadougou', price: '950 000 FCFA / mois', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', beds: 3, area: '168 m²' },
  { id: 'land-bobo', reference: 'JEF-TER-003', type: 'Terrain à bâtir', title: 'Le bon endroit pour demain', location: 'Belle Ville, Bobo-Dioulasso', price: '32 000 000 FCFA', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85', beds: 0, area: '1 200 m²' },
]

function Brand() { return <><OfflineStatus /><Link to="/" className="brand" aria-label="Jefferson Immobilier, accueil"><span className="brand-mark">J</span><span>JEFFERSON <b>IMMOBILIER</b></span></Link><InstallAppButton /></> }

function SocialIcon({ name }: { name: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' }) {
  const paths = { facebook: 'M14 8h3V5h-3c-2.8 0-5 2.2-5 5v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-1.1.9-2 2-2Z', instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5ZM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z', tiktok: 'M15 3h3c.2 1.7 1.2 3 3 3v3c-1.1 0-2.1-.3-3-1v7.2A5.8 5.8 0 1 1 13 9v3.1a2.8 2.8 0 1 0 2 2.7V3Z', whatsapp: 'M12 3a9 9 0 0 0-7.7 13.7L3 21l4.5-1.3A9 9 0 1 0 12 3Zm0 2a7 7 0 0 1 5.9 10.7l-.3.5.3 2.1-2-.6-.5.3A7 7 0 1 1 12 5Zm-3 3c-.4 0-.8.2-1 .6-.3.5-.4 1.1-.1 1.7.7 1.8 2.1 3.2 3.8 4 .7.3 1.3.2 1.8-.2l.7-.6-.9-1.1-.8.4c-.8-.4-1.4-.9-1.9-1.6l.3-.7-1-1.8-.9-.1Z' } as const
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d={paths[name]} /></svg>
}

function Home() {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [operation, setOperation] = useState<'acheter' | 'louer'>('acheter')
  const navigate = useNavigate()
  const whatsappNumber = useWhatsAppNumber()
  const salesProperties = usePublishedProperties('VENTE')
  const rentalProperties = usePublishedProperties('LOCATION')
  const publishedProperties = [...(salesProperties.data ?? []), ...(rentalProperties.data ?? [])]
  const visibleProperties = publishedProperties.length
    ? publishedProperties.map((property) => ({
      id: property.slug,
      reference: property.reference,
      type: property.propertyType,
      title: property.title,
      titleFr: property.titleFr,
      titleEn: property.titleEn,
      location: [property.district, property.city].filter(Boolean).join(', '),
      price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`,
      image: property.imageUrls?.[0] ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      imageUrls: property.imageUrls,
      beds: property.bedrooms ?? 0,
      area: property.area ? `${property.area} m²` : t('properties.areaToSpecify'),
    }))
    : properties
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const params = new URLSearchParams()
    const type = String(form.get('type') ?? '')
    const location = String(form.get('location') ?? '')
    const budget = String(form.get('budget') ?? '')
    if (type) params.set('type', type)
    if (location) params.set('location', location)
    if (budget) params.set('maxPrice', budget)
    navigate(`/${operation}${params.toString() ? `?${params}` : ''}`)
  }
  return <main>
    <Seo title={t('seo.homeTitle')} description={t('seo.homeDescription')} />
    <section className="hero-section">
      <header className="site-header"><Brand /><nav className={mobileMenuOpen ? 'main-nav is-open' : 'main-nav'}><NavLink to="/acheter" onClick={() => setMobileMenuOpen(false)}>{t('navigation.buy')}</NavLink><NavLink to="/louer" onClick={() => setMobileMenuOpen(false)}>{t('navigation.rent')}</NavLink><NavLink to="/terrains" onClick={() => setMobileMenuOpen(false)}>{t('navigation.land')}</NavLink><NavLink to="/a-propos" onClick={() => setMobileMenuOpen(false)}>{t('navigation.agency')}</NavLink></nav><LanguageSwitcher /><Link to="/contact" className="header-contact">{t('common.contactProject')} <ArrowRight size={16} /></Link><button className="menu-toggle" aria-label={mobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button></header>
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> {t('home.eyebrow')}</p><h1>{t('home.title')}<br /><em>{t('home.titleEmphasis')}</em></h1><p className="hero-intro">{t('home.intro')}</p></div>
      <form className="search-panel" onSubmit={handleSearch}><div className="search-tabs"><button type="button" className={operation === 'acheter' ? 'active' : ''} onClick={() => setOperation('acheter')}>{t('home.buy')}</button><button type="button" className={operation === 'louer' ? 'active' : ''} onClick={() => setOperation('louer')}>{t('home.rent')}</button></div><label><span>{t('home.propertyType')}</span><select name="type" defaultValue=""><option value="">{t('home.allTypes')}</option><option value="Maison">{t('properties.house')}</option><option value="Appartement">{t('properties.apartment')}</option><option value="Terrain">{t('properties.land')}</option><option value="Villa">{t('properties.villa')}</option></select><ChevronDown size={15} /></label><label><span>{t('home.location')}</span><input name="location" placeholder={t('home.locationPlaceholder')} /><MapPin size={15} /></label><label><span>{t('home.budget')}</span><select name="budget" defaultValue=""><option value="">{t('home.allBudgets')}</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select><ChevronDown size={15} /></label><button className="search-submit" type="submit"><Search size={18} /> {t('common.search')}</button></form>
      <div className="hero-note"><span>01</span><span className="note-line" /><span>{t('home.heroNote')}</span></div>
    </section>
    <section className="content-section featured-section"><div className="section-heading"><div><p className="eyebrow dark">{t('home.featuredLabel')}</p><h2>{t('home.featuredTitle')}<br /><em>{t('home.featuredTitleEmphasis')}</em></h2></div><Link to="/acheter" className="text-link">{t('common.viewAll')} <ArrowRight size={16} /></Link></div><div className="property-grid">{visibleProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />)}</div></section>
    <section className="manifesto-section"><div className="manifesto-number">02</div><div><p className="eyebrow">{t('home.manifestoLabel')}</p><h2>{t('home.manifestoTitle')}<br /><em>{t('home.manifestoTitleEmphasis')}</em></h2></div><p>{t('home.manifestoText')}</p><Link to="/a-propos" className="circle-link" aria-label={t('about.label')}><ArrowRight /></Link></section>
    <section className="content-section cities-section"><div className="section-heading"><div><p className="eyebrow dark">{t('home.citiesLabel')}</p><h2>{t('home.citiesTitle')}<br /><em>{t('home.citiesTitleEmphasis')}</em></h2></div><Link to="/ville/ouagadougou" className="text-link">{t('common.exploreCities')} <ArrowRight size={16} /></Link></div><div className="city-grid"><Link to="/ville/ouagadougou" className="city-card city-ouaga"><span>{t('home.cityOuaga')}</span><small>{t('home.cityOugaText')}</small></Link><Link to="/ville/bobo-dioulasso" className="city-card city-bobo"><span>{t('home.cityBobo')}</span><small>{t('home.cityBoboText')}</small></Link></div></section>
    <footer className="site-footer"><Brand /><div className="footer-contact"><p>{t('home.footerMessage')}</p><a href={`mailto:${agencyEmail}`} className="email-link" aria-label={`Send an email to ${agencyEmail}`}><Mail size={16} /> {agencyEmail}</a><a href="tel:+22650776868" className="email-link" aria-label="Call Jefferson Immobilier"><Phone size={16} /> +226 50 77 68 68</a></div><div className="social-links"><a href={socialLinks.tiktok} aria-label="TikTok"><SocialIcon name="tiktok" /></a><a href={socialLinks.facebook} aria-label="Facebook"><SocialIcon name="facebook" /></a><a href={socialLinks.instagram} aria-label="Instagram"><SocialIcon name="instagram" /></a><a href={`https://wa.me/${whatsappNumber}`} className="whatsapp-link" aria-label="Contact Jefferson Immobilier on WhatsApp"><span className="social-circle"><SocialIcon name="whatsapp" /></span> WhatsApp</a></div></footer>
  </main>
}

function PropertyCard({ property, featured }: { property: PropertyCardData; featured?: boolean }) {
  const { t } = useTranslation()
  const localized = useLocalizedProperty({ title: property.title, description: '', titleFr: property.titleFr, titleEn: property.titleEn, descriptionFr: '', descriptionEn: '' })
  const whatsappNumber = useWhatsAppNumber()
  const propertyUrl = `${window.location.origin}/biens/${property.id}`
  const whatsappText = encodeURIComponent(`Bonjour Jefferson Immobilier,

Je suis intéressé par ce bien :
- Bien : ${property.title}
- Référence : ${property.reference}
- Type : ${property.type}
- Localisation : ${property.location}
- Prix : ${property.price}

Voici l'annonce : ${propertyUrl}
Photo principale : ${property.image}

Je souhaite recevoir plus d'informations et convenir d'une visite.`)
  return <article className={featured ? 'property-card featured' : 'property-card'}><Link to={`/biens/${property.id}`}><div className="property-image"><img src={property.image} alt={localized.title} /><span className="property-badge">{property.type}</span><span className="property-arrow"><ArrowRight size={17} /></span></div></Link><div className="property-info"><Link to={`/biens/${property.id}`}><h3>{localized.title}</h3></Link><p><MapPin size={13} /> {property.location}</p><strong>{property.price}</strong><div className="property-meta"><span>{property.area}</span>{property.beds > 0 && <span><BedDouble size={14} /> {property.beds} {t('properties.bedrooms')}</span>}<span><Building2 size={14} /> {property.type.includes('Terrain') ? t('properties.land') : t('properties.available')}</span></div><a className="property-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={15} /> {t('properties.requestOnWhatsApp')}</a></div></article>
}

function PropertyDetail({ slug }: { slug: string }) {
  const { i18n, t } = useTranslation()
  const whatsappNumber = useWhatsAppNumber()
  const property = properties.find((item) => item.id === slug)
  const apiProperty = usePublishedProperty(slug)
  if (!property && apiProperty.isLoading) return <main className="placeholder-page"><Brand /><p>{t('common.loading')}</p></main>
  if (!property && (!apiProperty.data || apiProperty.isError)) return <PlaceholderPage />
  const detail = apiProperty.data
  const displayProperty = detail ? {
    id: detail.slug,
    reference: detail.reference,
    type: detail.propertyType,
    title: (i18n.language === 'en' ? detail.titleEn : detail.titleFr) || detail.title,
    location: [detail.district, detail.city].filter(Boolean).join(', '),
    price: `${detail.price.toLocaleString('fr-FR')} ${detail.currency}`,
    image: detail.imageUrls?.[0] ?? properties[0].image,
    beds: detail.bedrooms ?? 0,
    area: detail.area ? `${detail.area} m²` : t('properties.areaToSpecify'),
    imageUrls: detail.imageUrls,
  } : property!
  const images = displayProperty.imageUrls?.length ? displayProperty.imageUrls : [displayProperty.image]
  const whatsappText = encodeURIComponent(`Bonjour Jefferson Immobilier,
Je suis intéressé par le bien ${displayProperty.title}, référence ${displayProperty.reference}.
Localisation : ${displayProperty.location}
Prix : ${displayProperty.price}
Je souhaite recevoir plus d'informations et convenir d'une visite.
Photo : ${images[0]}`)
  const detailDescription = detail ? ((i18n.language === 'en' ? detail.descriptionEn : detail.descriptionFr) || detail.description) : t('properties.fallbackDescription')
  const detailSeoDescription = t('properties.seoDescription', { type: displayProperty.type, location: displayProperty.location, price: displayProperty.price })
  const detailStructuredData = { '@context': 'https://schema.org', '@type': 'Residence', name: displayProperty.title, description: detailDescription, url: `${siteUrl}/biens/${displayProperty.id}`, image: images, address: { '@type': 'PostalAddress', addressLocality: displayProperty.location, addressCountry: 'BF' }, offers: { '@type': 'Offer', price: detail?.price ?? 0, priceCurrency: detail?.currency ?? 'XOF', availability: 'https://schema.org/InStock', url: `${siteUrl}/biens/${displayProperty.id}` }, provider: { '@type': 'RealEstateAgent', name: 'Jefferson Immobilier', telephone: '+22655773241' }, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Biens', item: `${siteUrl}/acheter` }, { '@type': 'ListItem', position: 3, name: displayProperty.title, item: `${siteUrl}/biens/${displayProperty.id}` }] } }
  return <main className="property-detail-page"><header className="detail-header"><Brand /><Link to="/acheter" className="text-link">{t('common.backToListings')} <ArrowRight size={15} /></Link></header><div className="detail-gallery">{images.slice(0, 4).map((image, index) => <img key={image} className={index === 0 ? 'detail-cover' : ''} src={image} alt={`${displayProperty.title}, photo ${index + 1}`} />)}</div><section className="detail-content"><div className="detail-main"><p className="eyebrow dark">{displayProperty.type} · {displayProperty.reference}</p><h1>{displayProperty.title}</h1><p className="detail-location"><MapPin size={15} /> {displayProperty.location}</p><strong className="detail-price">{displayProperty.price}</strong><div className="detail-facts"><span>{displayProperty.area}</span>{displayProperty.beds > 0 && <span><BedDouble size={16} /> {displayProperty.beds} {t('properties.bedrooms')}</span>}<span><Building2 size={16} /> {t('properties.available')}</span></div><h2>{t('properties.aboutThisProperty')}</h2><p className="detail-description">{detailDescription}</p></div><aside className="contact-panel"><p className="eyebrow dark">{t('properties.askAboutProperty')}</p><h2>{t('properties.talkAboutIt')}</h2><p>{t('properties.teamAnswer')}</p><a className="detail-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={20} /> {t('properties.writeOnWhatsApp')}</a><a className="detail-email" href={`mailto:${agencyEmail}`}>{t('properties.orWriteAt', { email: agencyEmail })}</a></aside></section><Seo title={`${displayProperty.title} | Jefferson Immobilier`} description={detailSeoDescription} path={`/biens/${displayProperty.id}`} image={images[0]} structuredData={detailStructuredData} /></main>
}

function usePublishedProperty(slug: string) {
  return useQuery({ queryKey: ['property', 'published', slug], queryFn: () => getPublishedProperty(slug), retry: 1, staleTime: 60_000 })
}

function PropertyCatalog({ mode }: { mode: 'acheter' | 'louer' | 'terrains' }) {
  const { t } = useTranslation()
  const params = new URLSearchParams(window.location.search)
  const [search, setSearch] = useState(params.get('location') ?? '')
  const [type, setType] = useState(params.get('type') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '')
  const [page, setPage] = useState(0)
  const operation = mode === 'louer' ? 'LOCATION' : 'VENTE'
  const query = usePropertySearch({ operationType: operation, location: search || undefined, propertyType: mode === 'terrains' ? 'TERRAIN' : type.toUpperCase() || undefined, maxPrice: maxPrice || undefined, page, size: 12 }) as ReturnType<typeof usePropertySearch> & { data: NonNullable<ReturnType<typeof usePropertySearch>['data']> }
  const title = mode === 'acheter' ? t('catalog.buy') : mode === 'louer' ? t('catalog.rent') : t('catalog.land')
  const description = mode === 'acheter' ? t('catalog.buyDescription') : mode === 'louer' ? t('catalog.rentDescription') : t('catalog.landDescription')
  const apiCatalog: PropertyCardData[] = (query.data?.content ?? []).map((property) => ({ id: property.slug, reference: property.reference, type: property.propertyType, title: property.title, titleFr: property.titleFr, titleEn: property.titleEn, location: [property.district, property.city].filter(Boolean).join(', '), price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`, image: property.imageUrls?.[0] ?? properties[0].image, beds: property.bedrooms ?? 0, area: property.area ? `${property.area} m²` : t('properties.areaToSpecify'), imageUrls: property.imageUrls }))
  const sourceCatalog = apiCatalog
  const catalog = mode === 'terrains' ? sourceCatalog.filter((property) => property.type.includes('TERRAIN') || property.type.includes('Terrain')) : sourceCatalog
  const filteredCatalog = catalog
  if (!query.data) return <main className="placeholder-page"><Brand /><p>{t('common.loadingProperties')}</p></main>
  return <main className="catalog-page"><header className="catalog-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="catalog-intro"><p className="eyebrow dark">{t('catalog.catalogue')}</p><h1>{title}<br /><em>{t('catalog.forProjects')}</em></h1><p>{description}</p></section><div className="catalog-toolbar"><span>{t('common.propertyCount', { count: query.data?.totalElements ?? filteredCatalog.length })}</span><div className="catalog-filters"><label><Search size={14} /><input value={search} onChange={(event) => { setPage(0); setSearch(event.target.value) }} placeholder={t('catalog.cityOrDistrict')} /></label><select value={type} onChange={(event) => { setPage(0); setType(event.target.value) }}><option value="">{t('catalog.allTypes')}</option><option value="maison">{t('properties.house')}</option><option value="villa">{t('properties.villa')}</option><option value="appartement">{t('properties.apartment')}</option><option value="terrain">{t('properties.land')}</option></select><select value={maxPrice} onChange={(event) => { setPage(0); setMaxPrice(event.target.value) }}><option value="">{t('catalog.allBudgets')}</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select></div></div><section className="catalog-grid">{filteredCatalog.length ? filteredCatalog.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">{t('common.noResults')}</p>}</section>{query.data && query.data.totalPages > 1 && <div className="catalog-pagination"><button className="button-dark" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>{t('common.previousPage')}</button><span>{t('common.pageOf', { current: page + 1, total: query.data.totalPages })}</span><button className="button-dark" disabled={page + 1 >= query.data.totalPages} onClick={() => setPage((current) => current + 1)}>{t('common.nextPage')}</button></div>}<Seo title={`${title} | Jefferson Immobilier`} description={description} path={`/${mode}`} /></main>
  return <main className="catalog-page"><header className="catalog-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="catalog-intro"><p className="eyebrow dark">Catalogue Jefferson</p><h1>{title}<br /><em>pour vos projets.</em></h1><p>{description}</p></section><div className="catalog-toolbar"><span>{query.data?.totalElements ?? filteredCatalog.length} annonce(s) disponible(s)</span><div className="catalog-filters"><label><Search size={14} /><input value={search} onChange={(event) => { setPage(0); setSearch(event.target.value) }} placeholder="Ville ou quartier" /></label><select value={type} onChange={(event) => { setPage(0); setType(event.target.value) }}><option value="">Tous les types</option><option value="maison">Maison</option><option value="villa">Villa</option><option value="appartement">Appartement</option><option value="terrain">Terrain</option></select><select value={maxPrice} onChange={(event) => { setPage(0); setMaxPrice(event.target.value) }}><option value="">Budget maximum</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select></div></div><section className="catalog-grid">{filteredCatalog.length ? filteredCatalog.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">Aucune annonce réelle ne correspond à votre recherche.</p>}</section>{query.data && query.data.totalPages > 1 && <div className="catalog-pagination"><button className="button-dark" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Page précédente</button><span>Page {page + 1} sur {query.data.totalPages}</span><button className="button-dark" disabled={page + 1 >= query.data.totalPages} onClick={() => setPage((current) => current + 1)}>Page suivante</button></div>}<Seo title={`${title} | Jefferson Immobilier`} description={description} path={`/${mode}`} /></main>
}

function CityPage({ city }: { city: string }) {
  const { t } = useTranslation()
  const cityName = city === 'bobo-dioulasso' ? 'Bobo-Dioulasso' : 'Ouagadougou'
  const sales = usePublishedProperties('VENTE')
  const rentals = usePublishedProperties('LOCATION')
  const cityProperties: PropertyCardData[] = [...(sales.data ?? []), ...(rentals.data ?? [])]
    .filter((property) => `${property.city} ${property.district ?? ''}`.toLowerCase().includes(cityName.toLowerCase()))
    .map((property) => ({ id: property.slug, reference: property.reference, type: property.propertyType, title: property.title, titleFr: property.titleFr, titleEn: property.titleEn, location: [property.district, property.city].filter(Boolean).join(', '), price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`, image: property.imageUrls?.[0] ?? properties[0].image, beds: property.bedrooms ?? 0, area: property.area ? `${property.area} m²` : t('properties.areaToSpecify'), imageUrls: property.imageUrls }))
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="editorial-hero city-hero"><p className="eyebrow dark">{t('city.exploreDestination')}</p><h1>{t('city.immobilierAt')}<br /><em>{cityName}.</em></h1><p>{t('city.availableInCity', { city: cityName })}</p></section><section className="editorial-list"><div className="section-heading"><div><p className="eyebrow dark">{t('city.localSelection')}</p><h2>{t('city.ourAddresses')}<br /><em>{t('city.atCity', { city: cityName })}</em></h2></div><Link to="/acheter" className="text-link">{t('city.seeCatalog')} <ArrowRight size={15} /></Link></div><div className="catalog-grid">{cityProperties.length ? cityProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">{t('common.noCityResults')}</p>}</div></section><Seo title={t('city.seoTitle', { city: cityName })} description={t('city.seoDescription', { city: cityName })} path={`/ville/${city}`} /></main>
}

function AboutPage() {
  const { t } = useTranslation()
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="editorial-hero about-hero"><p className="eyebrow dark">{t('about.label')}</p><h1>{t('about.title')}<br /><em>{t('about.titleEmphasis')}</em></h1><p>{t('about.intro')}</p></section><section className="about-grid"><div><p className="eyebrow dark">{t('about.conviction')}</p><h2>{t('about.convictionTitle')}<br /><em>{t('about.convictionTitleEmphasis')}</em></h2></div><p>{t('about.convictionText')}</p></section><section className="values-grid"><div><span>01</span><h3>{t('about.look')}</h3><p>{t('about.lookText')}</p></div><div><span>02</span><h3>{t('about.listen')}</h3><p>{t('about.listenText')}</p></div><div><span>03</span><h3>{t('about.trust')}</h3><p>{t('about.trustText')}</p></div></section><ContactCta /><Seo title={t('about.seoTitle')} description={t('about.seoDescription')} path="/a-propos" /></main>
}

function ContactPage() {
  const { t } = useTranslation()
  const whatsappNumber = useWhatsAppNumber()
  const [status, setStatus] = useState('')
  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await submitContactMessage({ fullName: String(form.get('name')), email: String(form.get('email')), project: String(form.get('project')), message: String(form.get('message')) })
      const message = encodeURIComponent(`Bonjour Jefferson Immobilier,\n\nJe souhaite parler de mon projet immobilier.\nNom : ${form.get('name')}\nE-mail : ${form.get('email')}\nProjet : ${form.get('project')}\nMessage : ${form.get('message')}`)
      setStatus(t('contact.statusSent'))
      window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`
    } catch { setStatus(t('contact.statusError')) }
  }
  return <main className="contact-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="contact-layout"><div><p className="eyebrow dark">{t('contact.projectHeadline')}</p><h1>{t('contact.title')}<br /><em>{t('contact.titleEmphasis')}</em></h1><p>{t('contact.intro')}</p><div className="contact-details"><a href={`mailto:${agencyEmail}`}><Mail size={17} /> {agencyEmail}</a><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle size={17} /> +226 55 77 32 41</a></div></div><form className="project-form" onSubmit={handleContact}><label>{t('contact.yourName')}<input name="name" required placeholder={t('contact.fullName')} /></label><label>{t('contact.yourEmail')}<input name="email" type="email" required placeholder="vous@exemple.com" /></label><label>{t('contact.project')}<select name="project" defaultValue={t('contact.projectBuy')}><option>{t('contact.projectBuy')}</option><option>{t('contact.projectRent')}</option><option>{t('contact.projectSell')}</option><option>{t('contact.projectInvest')}</option></select></label><label>{t('contact.message')}<textarea name="message" required rows={5} placeholder={t('contact.messagePlaceholder')} /></label><button className="button-dark" type="submit">{t('contact.sendWhatsapp')} <MessageCircle size={17} /></button>{status && <small className="upload-status">{status}</small>}</form></section><Seo title="Contact | Jefferson Immobilier" description="Contactez Jefferson Immobilier par WhatsApp ou e-mail pour votre projet immobilier." path="/contact" /></main>
}

function LegacyContactPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const message = encodeURIComponent(`Bonjour Jefferson Immobilier,\n\nJe souhaite parler de mon projet immobilier.\nNom : ${form.get('name')}\nE-mail : ${form.get('email')}\nProjet : ${form.get('project')}\nMessage : ${form.get('message')}`)
    window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`
    setSent(true)
  }
  return <main className="contact-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="contact-layout"><div><p className="eyebrow dark">{t('contact.projectHeadline')}</p><h1>{t('contact.title')}<br /><em>{t('contact.titleEmphasis')}</em></h1><p>{t('contact.intro')}</p><div className="contact-details"><a href={`mailto:${agencyEmail}`}><Mail size={17} /> {agencyEmail}</a><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle size={17} /> +226 55 77 32 41</a></div></div><form className="project-form" onSubmit={handleContact}><label>{t('contact.yourName')}<input name="name" required placeholder={t('contact.fullName')} /></label><label>{t('contact.yourEmail')}<input name="email" type="email" required placeholder="vous@exemple.com" /></label><label>{t('contact.project')}<select name="project" defaultValue={t('contact.projectBuy')}><option>{t('contact.projectBuy')}</option><option>{t('contact.projectRent')}</option><option>{t('contact.projectSell')}</option><option>{t('contact.projectInvest')}</option></select></label><label>{t('contact.message')}<textarea name="message" required rows={5} placeholder={t('contact.messagePlaceholder')} /></label><button className="button-dark" type="submit">{t('contact.sendWhatsapp')} <MessageCircle size={17} /></button>{sent && <small className="upload-status">{t('contact.whatsappReady')}</small>}</form></section><Seo title="Contact | Jefferson Immobilier" description="Contactez Jefferson Immobilier par WhatsApp ou e-mail pour votre projet immobilier." path="/contact" /></main>
}

function ContactCta() {
  const { t } = useTranslation()
  return <section className="contact-cta"><div><p className="eyebrow">{t('contact.projectHeadline')}</p><h2>{t('contact.ctaTitle')}<br /><em>{t('contact.ctaTitleEmphasis')}</em></h2></div><Link to="/contact" className="circle-link" aria-label={t('contact.ctaAria')}><ArrowRight /></Link></section>
}

function AdminListingForm() {
  const { t } = useTranslation()
  const featureQuery = usePropertyFeatures()
  void featureQuery
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [saveStatus, setSaveStatus] = useState('')
  const [saveSucceeded, setSaveSucceeded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) navigate('/admin/login', { replace: true })
  }, [navigate])
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.admin-page')
    if (!page || page.querySelector('.admin-dashboard-link')) return
    const dashboardLink = document.createElement('a')
    dashboardLink.href = '/admin'
    dashboardLink.className = 'button-dark admin-dashboard-link'
    dashboardLink.textContent = t('common.backToDashboard')
    page.insertBefore(dashboardLink, page.querySelector('.listing-form'))
    return () => dashboardLink.remove()
  }, [t])
  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('.listing-form input[type="url"][readonly]'))
    inputs.forEach((input) => {
      if (input.nextElementSibling?.classList.contains('remove-uploaded-image')) return
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'remove-uploaded-image'
      button.textContent = t('admin.deletePhoto')
      button.onclick = () => setUploadedImages((current) => current.filter((url) => url !== input.value))
      input.insertAdjacentElement('afterend', button)
    })
    const form = document.querySelector<HTMLFormElement>('.listing-form')
    const uploadInput = form?.querySelector<HTMLInputElement>('input[type="file"]')
    if (form && !form.querySelector('[name="titleFr"]')) {
      const title = form.querySelector<HTMLInputElement>('[name="title"]')
      const description = form.querySelector<HTMLTextAreaElement>('[name="description"]')
      const translations = document.createElement('div')
      translations.className = 'listing-translations'
      translations.innerHTML = `<p class="eyebrow dark">${t('admin.englishVersions')}</p><label>${t('admin.frenchTitle')}<input name="titleFr" placeholder="${t('admin.frenchTitlePlaceholder')}"></label><label>${t('admin.englishTitle')}<input name="titleEn" placeholder="${t('admin.englishTitlePlaceholder')}"></label><label>${t('admin.frenchDescription')}<textarea name="descriptionFr" rows="4" placeholder="${t('admin.frenchDescriptionPlaceholder')}"></textarea></label><label>${t('admin.englishDescription')}<textarea name="descriptionEn" rows="4" placeholder="${t('admin.englishDescriptionPlaceholder')}"></textarea></label>`
      title?.closest('label')?.insertAdjacentElement('afterend', translations)
      if (description) {
        description.addEventListener('input', () => {
          const frenchDescription = form.querySelector<HTMLTextAreaElement>('[name="descriptionFr"]')
          if (frenchDescription && !frenchDescription.value) frenchDescription.value = description.value
        })
      }
    }
    if (form && uploadInput && featureQuery.data?.length && !form.querySelector('.property-features-field')) {
      const fieldset = document.createElement('fieldset')
      fieldset.className = 'property-features-field'
      const legend = document.createElement('legend')
      legend.textContent = t('admin.facilities')
      fieldset.appendChild(legend)
      featureQuery.data.forEach((feature) => {
        const label = document.createElement('label')
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.name = 'featureIds'
        checkbox.value = String(feature.id)
        label.append(checkbox, ` ${feature.name}`)
        fieldset.appendChild(label)
      })
      uploadInput.closest('label')?.insertAdjacentElement('beforebegin', fieldset)
    }
  }, [featureQuery.data, uploadedImages])
  useEffect(() => {
    if (!saveSucceeded) return
    const form = document.querySelector<HTMLFormElement>('.admin-page .listing-form')
    if (!form || form.querySelector('.admin-return-link')) return
    const returnLink = document.createElement('a')
    returnLink.href = '/admin'
    returnLink.className = 'button-dark admin-return-link'
    returnLink.textContent = t('common.backToDashboard')
    form.appendChild(returnLink)
    return () => returnLink.remove()
  }, [saveSucceeded])
  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setUploadStatus(t('admin.uploadPhotos'))
    try {
      const urls = await Promise.all(files.map(uploadPropertyImage))
      setUploadedImages((current) => [...current, ...urls])
      setUploadStatus(t('admin.uploadSuccess', { count: urls.length }))
    } catch {
      setUploadStatus(t('admin.uploadError'))
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
    if (isSaving) return
    const form = new FormData(event.currentTarget)
    const reference = String(form.get('reference'))
    setIsSaving(true)
    setSaveSucceeded(false)
      setSaveStatus(t('admin.saveProperty'))
    try {
      await createProperty({
        title: String(form.get('title')),
        titleFr: String(form.get('titleFr') || form.get('title')),
        titleEn: String(form.get('titleEn') || ''),
        reference,
        slug: String(form.get('title')).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        description: String(form.get('description')),
        descriptionFr: String(form.get('descriptionFr') || form.get('description')),
        descriptionEn: String(form.get('descriptionEn') || ''),
        propertyType: String(form.get('propertyType')).toUpperCase(),
        operationType: String(form.get('operationType')) === 'Location' ? 'LOCATION' : 'VENTE',
        price: Number(form.get('price')),
        currency: 'XOF',
        city: String(form.get('city')),
        district: String(form.get('district')),
        area: Number(form.get('area')) || undefined,
        bedrooms: Number(form.get('bedrooms')) || undefined,
        address: String(form.get('address')),
        imageUrls: uploadedImages,
        featureIds: form.getAll('featureIds').map((value) => Number(value)),
      })
        setSaveStatus('Annonce enregistrée avec succès !')
        setSaveSucceeded(true)
      event.currentTarget.reset()
      setUploadedImages([])
    } catch (error) {
        try {
          const dashboard = await getAdminDashboard()
          if (dashboard.properties.some((property) => property.reference === reference)) {
            setSaveStatus(t('admin.propertySaved'))
            setSaveSucceeded(true)
            event.currentTarget.reset()
            setUploadedImages([])
            return
          }
        } catch {
          // Conserve l'erreur initiale si le contrôle de confirmation échoue.
        }
      const message = axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
        ? `${t('admin.saveErrorPrefix')} ${error.response.data.message}`
        : t('admin.saveError')
      setSaveSucceeded(false)
      setSaveStatus(message)
    } finally {
      setIsSaving(false)
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Espace agence privé</div><h1>Publier une<br /><em>nouvelle annonce.</em></h1><p>Réservé à l'équipe Jefferson Immobilier. Les visiteurs peuvent uniquement consulter les publications.</p><form className="listing-form" onSubmit={handleSubmit}><label>Titre de l'annonce<input name="title" required placeholder="Ex. Villa contemporaine avec piscine" /></label><div className="form-row"><label>Type<select name="propertyType" defaultValue="MAISON"><option value="MAISON">Maison</option><option value="VILLA">Villa</option><option value="APPARTEMENT">Appartement</option><option value="TERRAIN">Terrain</option></select></label><label>Opération<select name="operationType" defaultValue="Vente"><option>Vente</option><option>Location</option></select></label></div><div className="form-row"><label>Prix<input name="price" type="number" required placeholder="Ex. 185000000" /></label><label>Référence<input name="reference" required placeholder="Ex. JEF-VIL-004" /></label></div><div className="form-row"><label>Ville<input name="city" required placeholder="Ouagadougou" /></label><label>Quartier<input name="district" placeholder="Ouaga 2000" /></label></div><div className="form-row"><label>Superficie<input name="area" type="number" min="0" placeholder="Ex. 420" /></label><label>Chambres<input name="bedrooms" type="number" min="0" placeholder="Ex. 4" /></label></div><label>Adresse complète<input name="address" placeholder="Adresse du bien" /></label><label>Description détaillée<textarea name="description" required placeholder="Présentez les caractéristiques du bien, les équipements et les conditions" rows={6} /></label><label>Photos du bien<input type="file" accept="image/*" multiple onChange={handleImages} />{uploadStatus && <small className="upload-status">{uploadStatus}</small>}{uploadedImages.map((url) => <input key={url} type="url" value={url} readOnly />)}</label>{saveStatus && <small className="upload-status">{saveStatus}</small>}<button className="button-dark" type="submit">Enregistrer l'annonce <ArrowRight size={17} /></button></form><Link to="/" className="back-link">Retour au site public</Link></main>
}

function AdminPropertyEditPage({ id }: { id: number }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const featureQuery = usePropertyFeatures()
  const [property, setProperty] = useState<AdminDashboardSummary['properties'][number] | null>(null)
  const [status, setStatus] = useState('')
  useEffect(() => {
    getAdminDashboard().then((data) => setProperty(data.properties.find((item) => item.id === id) ?? null)).catch(() => setStatus(t('admin.propertyError')))
  }, [id, t])
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>('.admin-page .listing-form')
    if (!form || !property || !featureQuery.data?.length || form.querySelector('.property-features-field')) return
    const fieldset = document.createElement('fieldset')
    fieldset.className = 'property-features-field'
    const legend = document.createElement('legend')
    legend.textContent = t('admin.facilities')
    fieldset.appendChild(legend)
    featureQuery.data.forEach((feature) => {
      const label = document.createElement('label')
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.name = 'featureIds'
      checkbox.value = String(feature.id)
      checkbox.checked = property.featureIds?.includes(feature.id) ?? false
      label.append(checkbox, ` ${feature.name}`)
      fieldset.appendChild(label)
    })
    form.querySelector('textarea[name="description"]')?.closest('label')?.insertAdjacentElement('afterend', fieldset)
  }, [featureQuery.data, property, t])
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!property) return
    const form = new FormData(event.currentTarget)
    try {
      await updateProperty(id, { reference: String(form.get('reference')), title: String(form.get('title')), slug: property.slug, description: String(form.get('description')), propertyType: String(form.get('propertyType')), operationType: property.operationType, price: Number(form.get('price')), currency: property.currency, city: String(form.get('city')), district: String(form.get('district')), address: String(form.get('address')), area: Number(form.get('area')) || undefined, bedrooms: Number(form.get('bedrooms')) || undefined, imageUrls: property.imageUrls, featureIds: property.featureIds })
      setStatus(t('admin.updatePropertyStatus'))
      navigate('/admin/biens')
    } catch { setStatus(t('admin.cannotUpdateProperty')) }
  }
  if (status && !property) return <main className="admin-section-page"><Brand /><p className="form-error">{status}</p></main>
  if (!property) return <main className="admin-section-page"><Brand /><p>{t('admin.loadingProperty')}</p></main>
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> {t('admin.editProperty')}</div><h1>{t('admin.editingProperty')}<br /><em>{t('admin.propertyEdition')}</em></h1>{status && <p className="upload-status">{status}</p>}<form className="listing-form" onSubmit={handleSubmit}><label>{t('admin.propertyTitle')}<input name="title" defaultValue={property.title} required /></label><div className="form-row"><label>{t('admin.type')}<select name="propertyType" defaultValue={property.propertyType}><option value="MAISON">Maison</option><option value="VILLA">Villa</option><option value="APPARTEMENT">Appartement</option><option value="TERRAIN">Terrain</option></select></label><label>{t('admin.reference')}<input name="reference" defaultValue={property.reference} required /></label></div><div className="form-row"><label>{t('admin.price')}<input name="price" type="number" defaultValue={property.price} required /></label><label>{t('admin.city')}<input name="city" defaultValue={property.city} required /></label></div><div className="form-row"><label>{t('admin.district')}<input name="district" defaultValue={property.district ?? ''} /></label><label>{t('admin.area')}<input name="area" type="number" defaultValue={property.area ?? ''} /></label></div><label>{t('admin.bedrooms')}<input name="bedrooms" type="number" defaultValue={property.bedrooms ?? ''} /></label><label>{t('admin.address')}<input name="address" defaultValue={property.address ?? ''} /></label><label>{t('admin.description')}<textarea name="description" defaultValue={property.description} required rows={7} /></label><button className="button-dark" type="submit">{t('admin.updateProperty')} <ArrowRight size={17} /></button></form></main>
}

function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    try {
      await login(String(form.get('email')), String(form.get('password')))
      navigate('/admin')
    } catch {
      setError(t('admin.invalidCredentials'))
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> {t('admin.adminAccess')}</div><h1>{t('admin.loginTitle')}<br /><em>{t('admin.loginTitleEmphasis')}</em></h1><p>{t('admin.loginHelp')}</p><form className="listing-form" onSubmit={handleLogin}><label>{t('admin.email')}<input name="email" type="email" required placeholder="admin@jefferson-immobilier.local" /></label><label>{t('admin.password')}<input name="password" type="password" required placeholder={t('admin.passwordPlaceholder')} /></label>{error && <small className="form-error">{error}</small>}<button className="button-dark" type="submit">{t('admin.login')} <ArrowRight size={17} /></button></form><Link to="/" className="back-link">{t('admin.backToSite')}</Link></main>
}

function LiveAdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) {
      navigate('/admin/login', { replace: true })
      return
    }
    getAdminDashboard().then(setDashboard).catch(() => setError(t('admin.dashboardLoadError')))
  }, [navigate, t])
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.dashboard-sidebar nav a'))
    links.forEach((link) => {
      const label = link.textContent?.trim()
      const path = label === t('admin.myProperties') ? '/admin/biens' : label === t('admin.prospects') ? '/admin/prospects' : label === t('admin.messages') ? '/admin/messages' : null
      if (path) link.href = path
    })
  }, [dashboard, t])

  if (error) return <main className="dashboard-page"><Brand /><section className="dashboard-content"><p className="form-error">{error}</p></section></main>
  if (!dashboard) return <main className="dashboard-page"><Brand /><section className="dashboard-content"><p>{t('common.loadingDashboard')}</p></section></main>

  const formatPrice = (price: number, currency: string) => `${price.toLocaleString('fr-FR')} ${currency}`
  return <main className="dashboard-page"><aside className="dashboard-sidebar"><Brand /><p className="dashboard-label">{t('admin.agencySpace')}</p><nav><a className="selected"><BarChart3 size={17} /> {t('admin.overview')}</a><Link to="/admin/annonces/nouvelle"><Plus size={17} /> {t('admin.newListing')}</Link><a><HomeIcon size={17} /> {t('admin.myProperties')}</a><a><Eye size={17} /> {t('admin.prospects')}</a><a><Mail size={17} /> {t('admin.messages')}</a></nav><Link to="/" className="dashboard-back">{t('common.seePublicSite')} <ArrowRight size={15} /></Link></aside><section className="dashboard-content"><header className="dashboard-header"><div><p className="eyebrow dark">{t('admin.agencySpace')}</p><h1>{t('admin.dashboardHeading')} <em>{t('admin.dashboardName')}</em></h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> {t('admin.newListing')}</Link></header><div className="stats-grid"><div className="stat-card"><span>{t('admin.publishedProperties')}</span><strong>{dashboard.publishedProperties}</strong><small>{t('admin.activeCatalogue')}</small></div><div className="stat-card"><span>{t('admin.availableProperties')}</span><strong>{dashboard.availableProperties}</strong><small>{t('admin.toSellOrRent')}</small></div><div className="stat-card"><span>{t('admin.requestsReceived')}</span><strong>{dashboard.totalInquiries}</strong><small>{dashboard.newInquiries} {t('admin.newRequests')}</small></div><div className="stat-card"><span>{t('admin.pendingProspects')}</span><strong>{dashboard.newInquiries}</strong><small>{t('admin.pendingRequests')}</small></div></div><div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">{t('admin.catalogue')}</p><h2>{t('admin.recentListings')}</h2></div></div>{dashboard.properties.slice(0, 8).map((property) => <div className="listing-row" key={property.id}><img src={property.imageUrls[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'} alt="" /><div><strong>{property.title}</strong><span>{property.reference} · {[property.district, property.city].filter(Boolean).join(', ')}</span></div><span className="status-pill">{property.status}</span><span className="row-price">{formatPrice(property.price, property.currency)}</span></div>)}</section><section className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow dark">Prospects</p><h2>Dernières demandes</h2></div></div>{dashboard.inquiries.slice(0, 8).map((inquiry) => <div className="activity-row" key={inquiry.id}><span className="activity-dot" /><div><strong>{inquiry.fullName}</strong><span>{inquiry.propertyReference} · {inquiry.phone}</span></div><small>{inquiry.status}</small></div>)}{dashboard.inquiries.length === 0 && <p>Aucune demande enregistrée.</p>}</section></div></section></main>
}

function AdminPublishPanel() {
  const { t } = useTranslation()
  const [properties, setProperties] = useState<AdminDashboardSummary['properties']>([])
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    getAdminDashboard().then((data) => setProperties(data.properties)).catch(() => setStatus(t('admin.cannotPublish')))
  }, [t])

  async function publish() {
    if (!selectedId) return
    try {
      await updatePropertyStatus(Number(selectedId), 'AVAILABLE')
      setProperties((current) => current.map((property) => property.id === Number(selectedId) ? { ...property, status: 'AVAILABLE' } : property))
      setStatus(t('admin.publishSuccess'))
    } catch {
      setStatus(t('admin.cannotPublish'))
    }
  }

  return <section className="publish-panel"><h2>{t('admin.publishPanelTitle')}</h2><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">{t('admin.selectAnnouncement')}</option>{properties.filter((property) => property.status === 'DRAFT').map((property) => <option key={property.id} value={property.id}>{property.reference} - {property.title}</option>)}</select><button className="button-dark" type="button" onClick={publish} disabled={!selectedId}>{t('admin.publish')}</button>{status && <small className="upload-status">{status}</small>}</section>
}

function AdminPropertiesPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<AdminDashboardSummary | null>(null)
  const [status, setStatus] = useState('')
  useEffect(() => { getAdminDashboard().then(setData).catch(() => setStatus(t('admin.cannotPublish'))) }, [t])
  async function changeStatus(id: number, nextStatus: string) {
    try {
      await updatePropertyStatus(id, nextStatus)
      setData((current) => current ? { ...current, properties: current.properties.map((property) => property.id === id ? { ...property, status: nextStatus } : property) } : current)
      setStatus(t('admin.statusUpdated'))
    } catch { setStatus(t('admin.cannotPublish')) }
  }
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><div className="section-heading"><div><p className="eyebrow dark">{t('admin.catalogueReal')}</p><h1>{t('admin.propertiesTitle')}</h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> {t('admin.newListing')}</Link></div>{status && <p className="upload-status">{status}</p>}{data?.properties.map((property) => <article className="admin-property-row" key={property.id}><img src={property.imageUrls[0] || properties[0].image} alt="" /><div><Link to={`/admin/biens/${property.id}`}><strong>{property.title}</strong></Link><span>{property.reference} · {[property.district, property.city].filter(Boolean).join(', ')}</span><small>{property.price.toLocaleString('fr-FR')} {property.currency}</small></div><select value={property.status} onChange={(event) => changeStatus(property.id, event.target.value)}><option value="DRAFT">{t('admin.draft')}</option><option value="AVAILABLE">{t('admin.available')}</option><option value="RESERVED">{t('admin.reserved')}</option><option value="SOLD">{t('admin.sold')}</option><option value="RENTED">{t('admin.rented')}</option><option value="ARCHIVED">{t('admin.archived')}</option></select></article>)}</div></main>
}

function AdminInquiriesContent({ title = 'Prospects et messages' }: { title?: string }) {
  const { t } = useTranslation()
  const [inquiries, setInquiries] = useState<InquirySummary[]>([])
  const [status, setStatus] = useState('')
  useEffect(() => { getAdminDashboard().then((data) => setInquiries(data.inquiries)).catch(() => setStatus(t('admin.pendingRequests'))) }, [t])
  async function changeStatus(id: number, nextStatus: string) {
    try {
      const updated = await updateInquiryStatus(id, nextStatus)
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? updated : inquiry))
    } catch { setStatus(t('admin.pendingRequests')) }
  }
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">{t('admin.requestsSaved')}</p><h1>{title}</h1>{status && <p className="form-error">{status}</p>}{inquiries.map((inquiry) => <article className="inquiry-row" key={inquiry.id}><div><strong>{inquiry.fullName}</strong><span>{inquiry.email} · {inquiry.phone}</span><small>{inquiry.propertyReference ? `${inquiry.propertyReference} · ` : ''}{inquiry.message}</small></div><select value={inquiry.status} onChange={(event) => changeStatus(inquiry.id, event.target.value)}><option value="NEW">{t('admin.newRequest')}</option><option value="CONTACTED">{t('admin.contacted')}</option><option value="VISIT_SCHEDULED">{t('admin.visitScheduled')}</option><option value="CLOSED">{t('admin.closed')}</option></select></article>)}{inquiries.length === 0 && <p>{t('admin.noRequests')}</p>}</div></main>
}

function AdminInquiriesPage({ title = 'Prospects et messages' }: { title?: string }) {
  const { t } = useTranslation()
  return title === t('admin.messages') ? <AdminContactMessagesPage /> : <AdminInquiriesContent title={title} />
}

function AdminContactMessagesPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [error, setError] = useState('')
  useEffect(() => { getContactMessages().then(setMessages).catch(() => setError(t('admin.messagesReceived'))) }, [t])
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">{t('admin.contactSection')}</p><h1>{t('admin.messagesReceived')}</h1>{error && <p className="form-error">{error}</p>}{messages.length ? messages.map((message) => <article className="inquiry-row" key={message.id}><div><strong>{message.fullName}</strong><span>{message.email}{message.phone ? ` · ${message.phone}` : ''}</span><small>{message.project ? `${message.project} · ` : ''}{message.message}</small></div><span className="status-pill">{message.status}</span></article>) : !error && <p>{t('admin.noMessages')}</p>}</div></main>
}

function AdminContentPage({ section }: { section: 'seo' | 'social' | 'settings' }) {
  const { t } = useTranslation()
  const [seo, setSeo] = useState<SeoMetadata[]>([])
  const [social, setSocial] = useState<SocialLink[]>([])
  const [settings, setSettings] = useState<WebsiteSetting[]>([])
  const [status, setStatus] = useState('')
  useEffect(() => {
    const load = section === 'seo' ? getSeoMetadata().then(setSeo) : section === 'social' ? getSocialLinks().then(setSocial) : getWebsiteSettings().then(setSettings)
    load.catch(() => setStatus(t('admin.configuration')))
  }, [section, t])

  async function submitSeo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const saved = await saveSeoMetadata({ path: String(form.get('path')), title: String(form.get('title')), description: String(form.get('description')), imageUrl: String(form.get('imageUrl') || '') })
      setSeo((current) => [...current.filter((item) => item.path !== saved.path), saved])
      setStatus(t('admin.updatePropertyStatus'))
    } catch { setStatus(t('admin.cannotUpdateProperty')) }
  }

  async function submitSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const saved = await saveWebsiteSetting(String(form.get('key')), String(form.get('value')))
      setSettings((current) => [...current.filter((item) => item.key !== saved.key), saved])
      setStatus(t('admin.statusUpdated'))
    } catch { setStatus(t('admin.cannotUpdateProperty')) }
  }

  const title = section === 'seo' ? t('admin.seoTitle') : section === 'social' ? t('admin.socialTitle') : t('admin.settingsTitle')
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">{t('admin.configuration')}</p><h1>{title}</h1>{status && <p className="upload-status">{status}</p>}{section === 'seo' && <><form className="listing-form" onSubmit={submitSeo}><label>{t('admin.seoPath')}<input name="path" required placeholder="/acheter" /></label><label>{t('admin.seoTitleField')}<input name="title" required placeholder="Biens à vendre | Jefferson Immobilier" /></label><label>{t('admin.seoDescription')}<textarea name="description" required rows={4} /></label><label>{t('admin.ogImage')}<input name="imageUrl" type="url" /></label><button className="button-dark" type="submit">{t('admin.saveSeo')} <ArrowRight size={17} /></button></form>{seo.map((item) => <article className="inquiry-row" key={item.path}><div><strong>{item.path}</strong><span>{item.title}</span><small>{item.description}</small></div></article>)}</>}{section === 'social' && <section className="values-grid">{social.length ? social.map((item) => <div key={item.network}><h3>{item.network}</h3><p>{item.url}</p></div>) : <p>{t('admin.noSocialLinks')}</p>}</section>}{section === 'settings' && <><form className="listing-form" onSubmit={submitSetting}><label>{t('admin.settingKey')}<input name="key" required placeholder="whatsapp.number" /></label><label>{t('admin.settingValue')}<input name="value" required placeholder="22655773241" /></label><button className="button-dark" type="submit">{t('admin.saveSetting')} <ArrowRight size={17} /></button></form>{settings.map((item) => <article className="inquiry-row" key={item.key}><div><strong>{item.key}</strong><span>{item.value}</span></div></article>)}</>}</div></main>
}

function AdminStatisticsPage() {
  const { t } = useTranslation()
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { getAdminDashboard().then(setDashboard).catch(() => setError(t('admin.loadingStats'))) }, [t])
  if (error) return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="form-error">{error}</p></div></main>
  if (!dashboard) return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p>{t('admin.loadingStats')}</p></div></main>
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">{t('admin.agencyControl')}</p><h1>{t('admin.statsTitle')}</h1><div className="stats-grid"><div className="stat-card"><span>{t('admin.publishedProperties')}</span><strong>{dashboard.publishedProperties}</strong><small>{t('admin.activeCatalogue')}</small></div><div className="stat-card"><span>{t('admin.availableProperties')}</span><strong>{dashboard.availableProperties}</strong><small>{t('admin.toSellOrRent')}</small></div><div className="stat-card"><span>{t('admin.viewedProperties')}</span><strong>{dashboard.totalViews}</strong><small>{t('admin.consultations')}</small></div><div className="stat-card"><span>{t('admin.prospectsCount')}</span><strong>{dashboard.newInquiries}</strong><small>{t('admin.pendingRequests')}</small></div></div><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">{t('admin.commercialActivity')}</p><h2>{t('admin.inquiriesReceived')}</h2></div></div><p>{dashboard.totalInquiries} {t('admin.requestsSaved')}, dont {dashboard.newInquiries} {t('admin.newRequests')}.</p></section></div></main>
}

function AdminDashboardLegacy() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) navigate('/admin/login', { replace: true })
  }, [navigate])
  return <main className="dashboard-page"><aside className="dashboard-sidebar"><Brand /><p className="dashboard-label">Espace agence</p><nav><a className="selected"><BarChart3 size={17} /> Vue d'ensemble</a><Link to="/admin/annonces/nouvelle"><Plus size={17} /> Nouvelle annonce</Link><a><HomeIcon size={17} /> Mes biens</a><a><Eye size={17} /> Vues & prospects</a><a><Mail size={17} /> Messages</a></nav><Link to="/" className="dashboard-back">Voir le site public <ArrowRight size={15} /></Link></aside><section className="dashboard-content"><header className="dashboard-header"><div><p className="eyebrow dark">Dimanche, 23 août 2026</p><h1>Bonjour, <em>Jefferson.</em></h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> Nouvelle annonce</Link></header><div className="stats-grid"><div className="stat-card"><span>Biens publiés</span><strong>24</strong><small><b>+12%</b> ce mois-ci</small></div><div className="stat-card"><span>Biens disponibles</span><strong>18</strong><small>75% du catalogue</small></div><div className="stat-card"><span>Vues ce mois</span><strong>1 284</strong><small><b>+18%</b> depuis juillet</small></div><div className="stat-card"><span>Demandes WhatsApp</span><strong>37</strong><small><b>+8</b> cette semaine</small></div></div><div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">Catalogue</p><h2>Annonces récentes</h2></div><Link to="/acheter" className="text-link">Tout voir <ArrowRight size={15} /></Link></div>{properties.map((property) => <div className="listing-row" key={property.id}><img src={property.image} alt="" /><div><strong>{property.title}</strong><span>{property.reference} · {property.location}</span></div><span className="status-pill">Disponible</span><span className="row-price">{property.price}</span></div>)}</section><section className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow dark">Activité</p><h2>Cette semaine</h2></div><BarChart3 size={20} /></div><div className="activity-chart"><i style={{ height: '38%' }} /><i style={{ height: '62%' }} /><i style={{ height: '48%' }} /><i style={{ height: '78%' }} /><i style={{ height: '56%' }} /><i style={{ height: '92%' }} /><i style={{ height: '68%' }} /></div><div className="chart-days"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div><p className="activity-total"><strong>312</strong> visiteurs uniques</p></section></div></section></main>
}

function AdminDashboard() {
  void AdminDashboardLegacy
  return <><LiveAdminDashboard /><AdminPublishPanel /></>
}

function EditorialLandingPage({ title, emphasis, description, path }: { title: string; emphasis: string; description: string; path: string }) {
  const { t } = useTranslation()
  const localizedPage = path === '/maisons' ? ['editorial.housesTitle', 'editorial.housesEmphasis', 'editorial.housesDescription'] : path === '/appartements' ? ['editorial.apartmentsTitle', 'editorial.apartmentsEmphasis', 'editorial.apartmentsDescription'] : path === '/services' ? ['editorial.agencySupport', 'editorial.supportText', 'editorial.supportDescription'] : path === '/immobilier-burkina-faso' ? ['editorial.immobilierBurkina', 'editorial.burkinaFaso', 'editorial.burkinaDescription'] : path === '/immobilier-ouagadougou' ? ['editorial.immobilierOuagadougou', 'editorial.ouagadougou', 'editorial.ouagadougouDescription'] : path === '/immobilier-bobo-dioulasso' ? ['editorial.immobilierBobo', 'editorial.bobo', 'editorial.boboDescription'] : null
  const pageTitle = localizedPage ? t(localizedPage[0]) : title
  const pageEmphasis = localizedPage ? t(localizedPage[1]) : emphasis
  const pageDescription = localizedPage ? t(localizedPage[2]) : description
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="editorial-hero"><p className="eyebrow dark">{t('editorial.agencyName')}</p><h1>{pageTitle}<br /><em>{pageEmphasis}</em></h1><p>{pageDescription}</p><Link to="/acheter" className="button-dark">{t('editorial.viewListings')} <ArrowRight size={17} /></Link></section><ContactCta /><Seo title={`${pageTitle} ${pageEmphasis} | Jefferson Immobilier`} description={pageDescription} path={path} /></main>
}

function FaqPage() {
  const { t } = useTranslation()
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">{t('common.home')} <ArrowRight size={15} /></Link></header><section className="editorial-hero"><p className="eyebrow dark">{t('faq.title')}</p><h1>{t('contact.title')}<br /><em>{t('faq.titleEmphasis')}</em></h1><p>{t('faq.intro')}</p></section><section className="values-grid"><div><h3>{t('faq.q1')}</h3><p>{t('faq.q1Text')}</p></div><div><h3>{t('faq.q2')}</h3><p>{t('faq.q2Text')}</p></div><div><h3>{t('faq.q3')}</h3><p>{t('faq.q3Text')}</p></div></section><Seo title={t('faq.seoTitle')} description={t('faq.seoDescription')} path="/faq" /></main>
}

function PlaceholderPage() {
  const { t } = useTranslation()
  return <main className="placeholder-page"><Brand /><SlidersHorizontal size={34} /><h1>{t('placeholder.title')}<br /><em>{t('placeholder.titleEmphasis')}</em></h1><p>{t('placeholder.text')}</p><Link to="/" className="button-dark">{t('placeholder.cta')} <ArrowRight size={17} /></Link></main>
}

function App() {
  void LegacyContactPage
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  useEffect(() => {
    restoreSession()
  }, [])
  useEffect(() => {
    const path = window.location.pathname
    if (!path.startsWith('/en/')) return
    const englishRoutes: Record<string, string> = { '/en/buy': '/acheter', '/en/rent': '/louer', '/en/land': '/terrains', '/en/houses': '/maisons', '/en/apartments': '/appartements' }
    const target = englishRoutes[path] ?? (path.startsWith('/en/properties/') ? `/biens/${path.slice('/en/properties/'.length)}` : null)
    if (target) {
      void i18n.changeLanguage('en')
      navigate(target, { replace: true })
    }
  }, [i18n, navigate])

  return <Routes><Route path="/" element={<Home />} /><Route path="/acheter" element={<PropertyCatalog mode="acheter" />} /><Route path="/louer" element={<PropertyCatalog mode="louer" />} /><Route path="/terrains" element={<PropertyCatalog mode="terrains" />} /><Route path="/maisons" element={<EditorialLandingPage title="Maisons" emphasis="à vendre et à louer." description="Découvrez notre sélection de maisons au Burkina Faso, choisies pour leur emplacement et leur qualité de vie." path="/maisons" />} /><Route path="/appartements" element={<EditorialLandingPage title="Appartements" emphasis="pour vivre autrement." description="Explorez les appartements proposés par Jefferson Immobilier à Ouagadougou et dans les principales villes du Burkina Faso." path="/appartements" />} /><Route path="/ville/:city" element={<CityRoute />} /><Route path="/quartier/:district" element={<DistrictRoute />} /><Route path="/a-propos" element={<AboutPage />} /><Route path="/services" element={<EditorialLandingPage title="A tailored service" emphasis="that fits you." description="Jefferson Immobilier supports you in buying, renting, selling or investing with clear advice at every step." path="/services" />} /><Route path="/faq" element={<FaqPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/biens/:slug" element={<PropertyRoute />} /><Route path="/immobilier-burkina-faso" element={<EditorialLandingPage title="Immobilier au" emphasis="Burkina Faso." description="Maisons, appartements, villas et terrains sélectionnés par Jefferson Immobilier au Burkina Faso." path="/immobilier-burkina-faso" />} /><Route path="/immobilier-ouagadougou" element={<EditorialLandingPage title="Immobilier à" emphasis="Ouagadougou." description="Découvrez les opportunités immobilières à Ouagadougou avec Jefferson Immobilier." path="/immobilier-ouagadougou" />} /><Route path="/immobilier-bobo-dioulasso" element={<EditorialLandingPage title="Immobilier à" emphasis="Bobo-Dioulasso." description="Découvrez les biens immobiliers disponibles à Bobo-Dioulasso avec Jefferson Immobilier." path="/immobilier-bobo-dioulasso" />} /><Route path="/maison-a-vendre-ouagadougou" element={<EditorialLandingPage title="Maison à vendre à" emphasis="Ouagadougou." description="Trouvez une maison à vendre à Ouagadougou grâce à la sélection Jefferson Immobilier." path="/maison-a-vendre-ouagadougou" />} /><Route path="/maison-a-louer-ouagadougou" element={<EditorialLandingPage title="Maison à louer à" emphasis="Ouagadougou." description="Trouvez une maison à louer à Ouagadougou grâce à la sélection Jefferson Immobilier." path="/maison-a-louer-ouagadougou" />} /><Route path="/terrain-a-vendre-ouagadougou" element={<EditorialLandingPage title="Terrain à vendre à" emphasis="Ouagadougou." description="Découvrez les terrains à vendre à Ouagadougou proposés par Jefferson Immobilier." path="/terrain-a-vendre-ouagadougou" />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/biens" element={<AdminPropertiesPage />} /><Route path="/admin/biens/:id" element={<AdminPropertyEditRoute />} /><Route path="/admin/prospects" element={<AdminInquiriesPage />} /><Route path="/admin/messages" element={<AdminInquiriesPage title="Messages" />} /><Route path="/admin/statistiques" element={<AdminStatisticsPage />} /><Route path="/admin/seo" element={<AdminContentPage section="seo" />} /><Route path="/admin/reseaux-sociaux" element={<AdminContentPage section="social" />} /><Route path="/admin/parametres" element={<AdminContentPage section="settings" />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin/annonces/nouvelle" element={<AdminListingForm />} /><Route path="*" element={<PlaceholderPage />} /></Routes>
}

function PropertyRoute() {
  const slug = window.location.pathname.split('/').pop() ?? ''
  return <PropertyDetail slug={slug} />
}

function CityRoute() { return <CityPage city={window.location.pathname.split('/').pop() ?? ''} /> }

function AdminPropertyEditRoute() {
  return <AdminPropertyEditPage id={Number(window.location.pathname.split('/').pop())} />
}

function DistrictRoute() {
  const { t } = useTranslation()
  const district = window.location.pathname.split('/').pop() ?? ''
  const districtName = district.replace(/-/g, ' ')
  return <EditorialLandingPage title={t('editorial.districtBanner')} emphasis={`${districtName}.`} description={t('editorial.districtDescription', { district: districtName })} path={`/quartier/${district}`} />
}

export default App
