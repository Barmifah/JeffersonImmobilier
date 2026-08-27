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
    const schemaData = structuredData ?? { '@context': 'https://schema.org', '@type': ['RealEstateAgent', 'LocalBusiness'], name: 'Jefferson Immobilier', description, url: siteUrl, inLanguage: 'fr-FR', email: agencyEmail, telephone: '+22655773241', areaServed: 'Burkina Faso', sameAs: [socialLinks.facebook, socialLinks.instagram, socialLinks.tiktok] }
    let schema = document.head.querySelector<HTMLScriptElement>('script[data-jefferson-schema]')
    if (!schema) {
      schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.jeffersonSchema = 'true'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(schemaData)
  }, [description, image, path, structuredData, title])
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
        area: property.area ? `${property.area} m²` : 'Surface à préciser',
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
    <Seo title="Jefferson Immobilier | Agence immobilière au Burkina Faso" description="Découvrez les maisons, villas, appartements et terrains proposés par Jefferson Immobilier au Burkina Faso et accompagnez vos projets immobiliers." />
    <section className="hero-section">
      <header className="site-header"><Brand /><nav className={mobileMenuOpen ? 'main-nav is-open' : 'main-nav'}><NavLink to="/acheter" onClick={() => setMobileMenuOpen(false)}>Acheter</NavLink><NavLink to="/louer" onClick={() => setMobileMenuOpen(false)}>Louer</NavLink><NavLink to="/terrains" onClick={() => setMobileMenuOpen(false)}>Terrains</NavLink><NavLink to="/a-propos" onClick={() => setMobileMenuOpen(false)}>L'agence</NavLink></nav><LanguageSwitcher /><Link to="/contact" className="header-contact">Parlons de votre projet <ArrowRight size={16} /></Link><button className="menu-toggle" aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button></header>
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> {t('home.eyebrow')}</p><h1>{t('home.title')}<br /><em>{t('home.titleEmphasis')}</em></h1><p className="hero-intro">{t('home.intro')}</p></div>
      <form className="search-panel" onSubmit={handleSearch}><div className="search-tabs"><button type="button" className={operation === 'acheter' ? 'active' : ''} onClick={() => setOperation('acheter')}>{t('home.buy')}</button><button type="button" className={operation === 'louer' ? 'active' : ''} onClick={() => setOperation('louer')}>{t('home.rent')}</button></div><label><span>{t('home.propertyType')}</span><select name="type" defaultValue=""><option value="">{t('home.allTypes')}</option><option value="Maison">{t('properties.house')}</option><option value="Appartement">{t('properties.apartment')}</option><option value="Terrain">{t('properties.land')}</option><option value="Villa">{t('properties.villa')}</option></select><ChevronDown size={15} /></label><label><span>{t('home.location')}</span><input name="location" placeholder={t('home.locationPlaceholder')} /><MapPin size={15} /></label><label><span>{t('home.budget')}</span><select name="budget" defaultValue=""><option value="">{t('home.allBudgets')}</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select><ChevronDown size={15} /></label><button className="search-submit" type="submit"><Search size={18} /> {t('home.search')}</button></form>
      <div className="hero-note"><span>01</span><span className="note-line" /><span>Des lieux qui ont une histoire<br />et encore beaucoup à écrire.</span></div>
    </section>
    <section className="content-section featured-section"><div className="section-heading"><div><p className="eyebrow dark">Sélection Jefferson</p><h2>Des biens qui<br /><em>ne ressemblent pas aux autres.</em></h2></div><Link to="/acheter" className="text-link">Voir toutes les annonces <ArrowRight size={16} /></Link></div><div className="property-grid">{visibleProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />)}</div></section>
    <section className="manifesto-section"><div className="manifesto-number">02</div><div><p className="eyebrow">Notre manière de faire</p><h2>Plus qu'une adresse,<br /><em>un nouveau chapitre.</em></h2></div><p>Nous croyons qu'un projet immobilier mérite plus qu'une transaction. Il mérite du regard, de l'écoute et une attention rare aux détails.</p><Link to="/a-propos" className="circle-link" aria-label="Découvrir notre agence"><ArrowRight /></Link></section>
    <section className="content-section cities-section"><div className="section-heading"><div><p className="eyebrow dark">Explorer par destination</p><h2>Le Burkina,<br /><em>à votre façon.</em></h2></div><Link to="/ville/ouagadougou" className="text-link">Explorer les villes <ArrowRight size={16} /></Link></div><div className="city-grid"><Link to="/ville/ouagadougou" className="city-card city-ouaga"><span>Ouagadougou</span><small>La capitale, autrement.</small></Link><Link to="/ville/bobo-dioulasso" className="city-card city-bobo"><span>Bobo-Dioulasso</span><small>L'art de vivre en douceur.</small></Link></div></section>
    <footer className="site-footer"><Brand /><div className="footer-contact"><p>Des lieux choisis. Des vies qui avancent.</p><a href={`mailto:${agencyEmail}`} className="email-link" aria-label={`Envoyer un e-mail à ${agencyEmail}`}><Mail size={16} /> {agencyEmail}</a><a href="tel:+22650776868" className="email-link" aria-label="Appeler Jefferson Immobilier"><Phone size={16} /> +226 50 77 68 68</a></div><div className="social-links"><a href={socialLinks.tiktok} aria-label="TikTok"><SocialIcon name="tiktok" /></a><a href={socialLinks.facebook} aria-label="Facebook"><SocialIcon name="facebook" /></a><a href={socialLinks.instagram} aria-label="Instagram"><SocialIcon name="instagram" /></a><a href={`https://wa.me/${whatsappNumber}`} className="whatsapp-link" aria-label="Contacter Jefferson Immobilier sur WhatsApp"><span className="social-circle"><SocialIcon name="whatsapp" /></span> WhatsApp</a></div></footer>
  </main>
}

function PropertyCard({ property, featured }: { property: PropertyCardData; featured?: boolean }) {
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
    return <article className={featured ? 'property-card featured' : 'property-card'}><Link to={`/biens/${property.id}`}><div className="property-image"><img src={property.image} alt={localized.title} /><span className="property-badge">{property.type}</span><span className="property-arrow"><ArrowRight size={17} /></span></div></Link><div className="property-info"><Link to={`/biens/${property.id}`}><h3>{localized.title}</h3></Link><p><MapPin size={13} /> {property.location}</p><strong>{property.price}</strong><div className="property-meta"><span>{property.area}</span>{property.beds > 0 && <span><BedDouble size={14} /> {property.beds} chambres</span>}<span><Building2 size={14} /> {property.type.includes('Terrain') ? 'Terrain' : 'Disponible'}</span></div><a className="property-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={15} /> Demander ce bien sur WhatsApp</a></div></article>
}

function PropertyDetail({ slug }: { slug: string }) {
  const { i18n } = useTranslation()
  const whatsappNumber = useWhatsAppNumber()
  const property = properties.find((item) => item.id === slug)
  const apiProperty = usePublishedProperty(slug)
  if (!property && apiProperty.isLoading) return <main className="placeholder-page"><Brand /><p>Chargement de l'annonce...</p></main>
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
    area: detail.area ? `${detail.area} m²` : 'Surface à préciser',
    imageUrls: detail.imageUrls,
  } : property!
  const images = displayProperty.imageUrls?.length ? displayProperty.imageUrls : [displayProperty.image]
  const whatsappText = encodeURIComponent(`Bonjour Jefferson Immobilier,
Je suis intéressé par le bien ${displayProperty.title}, référence ${displayProperty.reference}.
Localisation : ${displayProperty.location}
Prix : ${displayProperty.price}
Je souhaite recevoir plus d'informations et convenir d'une visite.
Photo : ${images[0]}`)
  const detailDescription = detail ? ((i18n.language === 'en' ? detail.descriptionEn : detail.descriptionFr) || detail.description) : 'Une adresse pensée pour celles et ceux qui recherchent un cadre singulier et une qualité de vie durable. Contactez notre équipe pour recevoir toutes les informations et organiser une visite.'
  const detailSeoDescription = `${displayProperty.type} à ${displayProperty.location}. ${displayProperty.price}. Découvrez cette annonce Jefferson Immobilier et contactez notre équipe.`
  const detailStructuredData = { '@context': 'https://schema.org', '@type': 'Residence', name: displayProperty.title, description: detailDescription, url: `${siteUrl}/biens/${displayProperty.id}`, image: images, address: { '@type': 'PostalAddress', addressLocality: displayProperty.location, addressCountry: 'BF' }, offers: { '@type': 'Offer', price: detail?.price ?? 0, priceCurrency: detail?.currency ?? 'XOF', availability: 'https://schema.org/InStock', url: `${siteUrl}/biens/${displayProperty.id}` }, provider: { '@type': 'RealEstateAgent', name: 'Jefferson Immobilier', telephone: '+22655773241' }, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Biens', item: `${siteUrl}/acheter` }, { '@type': 'ListItem', position: 3, name: displayProperty.title, item: `${siteUrl}/biens/${displayProperty.id}` }] } }
  return <main className="property-detail-page"><header className="detail-header"><Brand /><Link to="/acheter" className="text-link">Retour aux annonces <ArrowRight size={15} /></Link></header><div className="detail-gallery">{images.slice(0, 4).map((image, index) => <img key={image} className={index === 0 ? 'detail-cover' : ''} src={image} alt={`${displayProperty.title}, photo ${index + 1}`} />)}</div><section className="detail-content"><div className="detail-main"><p className="eyebrow dark">{displayProperty.type} · {displayProperty.reference}</p><h1>{displayProperty.title}</h1><p className="detail-location"><MapPin size={15} /> {displayProperty.location}</p><strong className="detail-price">{displayProperty.price}</strong><div className="detail-facts"><span>{displayProperty.area}</span>{displayProperty.beds > 0 && <span><BedDouble size={16} /> {displayProperty.beds} chambres</span>}<span><Building2 size={16} /> Disponible</span></div><h2>À propos de ce bien</h2><p className="detail-description">{detailDescription}</p></div><aside className="contact-panel"><p className="eyebrow dark">Ce bien vous intéresse ?</p><h2>Parlons-en.</h2><p>Notre équipe vous répond directement sur WhatsApp.</p><a className="detail-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={20} /> Écrire sur WhatsApp</a><a className="detail-email" href={`mailto:${agencyEmail}`}>ou écrire à {agencyEmail}</a></aside></section><Seo title={`${displayProperty.title} | Jefferson Immobilier`} description={detailSeoDescription} path={`/biens/${displayProperty.id}`} image={images[0]} structuredData={detailStructuredData} /></main>
}

function usePublishedProperty(slug: string) {
  return useQuery({ queryKey: ['property', 'published', slug], queryFn: () => getPublishedProperty(slug), retry: 1, staleTime: 60_000 })
}

function PropertyCatalog({ mode }: { mode: 'acheter' | 'louer' | 'terrains' }) {
  const params = new URLSearchParams(window.location.search)
  const [search, setSearch] = useState(params.get('location') ?? '')
  const [type, setType] = useState(params.get('type') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '')
  const [page, setPage] = useState(0)
  const operation = mode === 'louer' ? 'LOCATION' : 'VENTE'
  const query = usePropertySearch({ operationType: operation, location: search || undefined, propertyType: type.toUpperCase() || undefined, maxPrice: maxPrice || undefined, page, size: 12 })
  const title = mode === 'acheter' ? 'Biens à vendre' : mode === 'louer' ? 'Biens à louer' : 'Terrains à bâtir'
  const description = mode === 'acheter' ? 'Maisons, villas et appartements à vendre sélectionnés par Jefferson Immobilier.' : mode === 'louer' ? 'Maisons, villas et appartements à louer au Burkina Faso.' : 'Terrains à vendre pour vos projets immobiliers au Burkina Faso.'
  const apiCatalog: PropertyCardData[] = (query.data?.content ?? []).map((property) => ({ id: property.slug, reference: property.reference, type: property.propertyType, title: property.title, titleFr: property.titleFr, titleEn: property.titleEn, location: [property.district, property.city].filter(Boolean).join(', '), price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`, image: property.imageUrls?.[0] ?? properties[0].image, beds: property.bedrooms ?? 0, area: property.area ? `${property.area} m²` : 'Surface à préciser', imageUrls: property.imageUrls }))
  const sourceCatalog = apiCatalog
  const catalog = mode === 'terrains' ? sourceCatalog.filter((property) => property.type.includes('TERRAIN') || property.type.includes('Terrain')) : sourceCatalog
  const filteredCatalog = catalog
  return <main className="catalog-page"><header className="catalog-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="catalog-intro"><p className="eyebrow dark">Catalogue Jefferson</p><h1>{title}<br /><em>pour vos projets.</em></h1><p>{description}</p></section><div className="catalog-toolbar"><span>{query.data?.totalElements ?? filteredCatalog.length} annonce(s) disponible(s)</span><div className="catalog-filters"><label><Search size={14} /><input value={search} onChange={(event) => { setPage(0); setSearch(event.target.value) }} placeholder="Ville ou quartier" /></label><select value={type} onChange={(event) => { setPage(0); setType(event.target.value) }}><option value="">Tous les types</option><option value="maison">Maison</option><option value="villa">Villa</option><option value="appartement">Appartement</option><option value="terrain">Terrain</option></select><select value={maxPrice} onChange={(event) => { setPage(0); setMaxPrice(event.target.value) }}><option value="">Budget maximum</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select></div></div><section className="catalog-grid">{filteredCatalog.length ? filteredCatalog.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">Aucune annonce réelle ne correspond à votre recherche.</p>}</section>{query.data && query.data.totalPages > 1 && <div className="catalog-pagination"><button className="button-dark" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Page précédente</button><span>Page {page + 1} sur {query.data.totalPages}</span><button className="button-dark" disabled={page + 1 >= query.data.totalPages} onClick={() => setPage((current) => current + 1)}>Page suivante</button></div>}<Seo title={`${title} | Jefferson Immobilier`} description={description} path={`/${mode}`} /></main>
}

function CityPage({ city }: { city: string }) {
  const cityName = city === 'bobo-dioulasso' ? 'Bobo-Dioulasso' : 'Ouagadougou'
  const sales = usePublishedProperties('VENTE')
  const rentals = usePublishedProperties('LOCATION')
  const cityProperties: PropertyCardData[] = [...(sales.data ?? []), ...(rentals.data ?? [])]
    .filter((property) => `${property.city} ${property.district ?? ''}`.toLowerCase().includes(cityName.toLowerCase()))
    .map((property) => ({ id: property.slug, reference: property.reference, type: property.propertyType, title: property.title, titleFr: property.titleFr, titleEn: property.titleEn, location: [property.district, property.city].filter(Boolean).join(', '), price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`, image: property.imageUrls?.[0] ?? properties[0].image, beds: property.bedrooms ?? 0, area: property.area ? `${property.area} m²` : 'Surface à préciser', imageUrls: property.imageUrls }))
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero city-hero"><p className="eyebrow dark">Explorer par destination</p><h1>Immobilier à<br /><em>{cityName}.</em></h1><p>Les annonces disponibles à {cityName}, chargées depuis le catalogue Jefferson.</p></section><section className="editorial-list"><div className="section-heading"><div><p className="eyebrow dark">La sélection locale</p><h2>Nos adresses<br /><em>à {cityName}.</em></h2></div><Link to="/acheter" className="text-link">Voir le catalogue <ArrowRight size={15} /></Link></div><div className="catalog-grid">{cityProperties.length ? cityProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">Aucune annonce disponible dans cette ville.</p>}</div></section><Seo title={`Immobilier à ${cityName} | Jefferson Immobilier`} description={`Découvrez les biens immobiliers proposés par Jefferson Immobilier à ${cityName}. Maisons, appartements, villas et terrains.`} path={`/ville/${city}`} /></main>
}

function AboutPage() { return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero about-hero"><p className="eyebrow dark">L'agence</p><h1>Nous créons des liens<br /><em>avec les bons lieux.</em></h1><p>Jefferson Immobilier accompagne celles et ceux qui veulent habiter, investir et construire un avenir au Burkina Faso avec exigence et sérénité.</p></section><section className="about-grid"><div><p className="eyebrow dark">Notre conviction</p><h2>Un bien n'est jamais<br /><em>juste une adresse.</em></h2></div><p>Chaque projet commence par une écoute attentive. Notre rôle est de comprendre une ambition, de repérer les bons volumes et de rendre chaque étape plus claire. De la première visite à la remise des clés, notre équipe reste présente et disponible.</p></section><section className="values-grid"><div><span>01</span><h3>Le regard</h3><p>Nous sélectionnons des lieux avec une vraie personnalité.</p></div><div><span>02</span><h3>L'écoute</h3><p>Nous construisons chaque conseil autour de votre projet.</p></div><div><span>03</span><h3>La confiance</h3><p>Des informations claires, des échanges directs et un suivi humain.</p></div></section><ContactCta /><Seo title="À propos de Jefferson Immobilier" description="Découvrez l'agence Jefferson Immobilier et sa manière d'accompagner les projets immobiliers au Burkina Faso." path="/a-propos" /></main> }

function ContactPage() {
  const whatsappNumber = useWhatsAppNumber()
  const [status, setStatus] = useState('')
  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await submitContactMessage({ fullName: String(form.get('name')), email: String(form.get('email')), project: String(form.get('project')), message: String(form.get('message')) })
      const message = encodeURIComponent(`Bonjour Jefferson Immobilier,\n\nJe souhaite parler de mon projet immobilier.\nNom : ${form.get('name')}\nE-mail : ${form.get('email')}\nProjet : ${form.get('project')}\nMessage : ${form.get('message')}`)
      setStatus('Message enregistré. Ouverture de WhatsApp...')
      window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`
    } catch { setStatus('Impossible d’enregistrer le message. Réessayez.') }
  }
  return <main className="contact-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="contact-layout"><div><p className="eyebrow dark">Parlons de votre projet</p><h1>Un projet en tête ?<br /><em>Commençons par en parler.</em></h1><p>Que vous cherchiez à acheter, louer, vendre ou investir, notre équipe vous répond directement.</p><div className="contact-details"><a href={`mailto:${agencyEmail}`}><Mail size={17} /> {agencyEmail}</a><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle size={17} /> +226 55 77 32 41</a></div></div><form className="project-form" onSubmit={handleContact}><label>Votre nom<input name="name" required placeholder="Nom complet" /></label><label>Votre e-mail<input name="email" type="email" required placeholder="vous@exemple.com" /></label><label>Votre projet<select name="project" defaultValue="Acheter"><option>Acheter</option><option>Louer</option><option>Vendre un bien</option><option>Investir</option></select></label><label>Votre message<textarea name="message" required rows={5} placeholder="Dites-nous quelques mots sur votre projet" /></label><button className="button-dark" type="submit">Enregistrer et ouvrir WhatsApp <MessageCircle size={17} /></button>{status && <small className="upload-status">{status}</small>}</form></section><Seo title="Contact | Jefferson Immobilier" description="Contactez Jefferson Immobilier par WhatsApp ou e-mail pour votre projet immobilier." path="/contact" /></main>
}

function LegacyContactPage() { const [sent, setSent] = useState(false); function handleContact(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const message = encodeURIComponent(`Bonjour Jefferson Immobilier,\n\nJe souhaite parler de mon projet immobilier.\nNom : ${form.get('name')}\nE-mail : ${form.get('email')}\nProjet : ${form.get('project')}\nMessage : ${form.get('message')}`); window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`; setSent(true) } return <main className="contact-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="contact-layout"><div><p className="eyebrow dark">Parlons de votre projet</p><h1>Un projet en tête ?<br /><em>Commençons par en parler.</em></h1><p>Que vous cherchiez à acheter, louer, vendre ou investir, notre équipe vous répond directement.</p><div className="contact-details"><a href={`mailto:${agencyEmail}`}><Mail size={17} /> {agencyEmail}</a><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle size={17} /> +226 55 77 32 41</a></div></div><form className="project-form" onSubmit={handleContact}><label>Votre nom<input name="name" required placeholder="Nom complet" /></label><label>Votre e-mail<input name="email" type="email" required placeholder="vous@exemple.com" /></label><label>Votre projet<select name="project" defaultValue="Acheter"><option>Acheter</option><option>Louer</option><option>Vendre un bien</option><option>Investir</option></select></label><label>Votre message<textarea name="message" required rows={5} placeholder="Dites-nous quelques mots sur votre projet" /></label><button className="button-dark" type="submit">Envoyer sur WhatsApp <MessageCircle size={17} /></button>{sent && <small className="upload-status">Votre message est prêt dans WhatsApp.</small>}</form></section><Seo title="Contact | Jefferson Immobilier" description="Contactez Jefferson Immobilier par WhatsApp ou e-mail pour votre projet immobilier." path="/contact" /></main> }

function ContactCta() { return <section className="contact-cta"><div><p className="eyebrow">Un projet immobilier ?</p><h2>Parlons de<br /><em>la suite.</em></h2></div><Link to="/contact" className="circle-link" aria-label="Contacter l'agence"><ArrowRight /></Link></section> }

function AdminListingForm() {
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
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('.listing-form input[type="url"][readonly]'))
    inputs.forEach((input) => {
      if (input.nextElementSibling?.classList.contains('remove-uploaded-image')) return
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'remove-uploaded-image'
      button.textContent = 'Supprimer cette photo'
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
      translations.innerHTML = '<p class="eyebrow dark">Versions anglaises</p><label>Titre français<input name="titleFr" placeholder="Titre en français"></label><label>English title<input name="titleEn" placeholder="Title in English"></label><label>Description française<textarea name="descriptionFr" rows="4" placeholder="Description en français"></textarea></label><label>English description<textarea name="descriptionEn" rows="4" placeholder="Description in English"></textarea></label>'
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
      legend.textContent = 'Équipements'
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
    returnLink.textContent = 'Retour au dashboard admin'
    form.appendChild(returnLink)
    return () => returnLink.remove()
  }, [saveSucceeded])
  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setUploadStatus('Envoi des photos...')
    try {
      const urls = await Promise.all(files.map(uploadPropertyImage))
      setUploadedImages((current) => [...current, ...urls])
      setUploadStatus(`${urls.length} photo(s) envoyée(s)`) 
    } catch {
      setUploadStatus('Impossible d’envoyer la photo. Vérifiez la configuration Cloudinary.')
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
    if (isSaving) return
    const form = new FormData(event.currentTarget)
    const reference = String(form.get('reference'))
    setIsSaving(true)
    setSaveSucceeded(false)
      setSaveStatus('Enregistrement de l’annonce...')
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
            setSaveStatus('Annonce enregistrée avec succès !')
            setSaveSucceeded(true)
            event.currentTarget.reset()
            setUploadedImages([])
            return
          }
        } catch {
          // Conserve l'erreur initiale si le contrôle de confirmation échoue.
        }
      const message = axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
        ? `Enregistrement non confirmé : ${error.response.data.message}`
        : 'Enregistrement non confirmé. Vérifiez le dashboard avant de recommencer.'
      setSaveSucceeded(false)
      setSaveStatus(message)
    } finally {
      setIsSaving(false)
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Espace agence privé</div><h1>Publier une<br /><em>nouvelle annonce.</em></h1><p>Réservé à l'équipe Jefferson Immobilier. Les visiteurs peuvent uniquement consulter les publications.</p><form className="listing-form" onSubmit={handleSubmit}><label>Titre de l'annonce<input name="title" required placeholder="Ex. Villa contemporaine avec piscine" /></label><div className="form-row"><label>Type<select name="propertyType" defaultValue="MAISON"><option value="MAISON">Maison</option><option value="VILLA">Villa</option><option value="APPARTEMENT">Appartement</option><option value="TERRAIN">Terrain</option></select></label><label>Opération<select name="operationType" defaultValue="Vente"><option>Vente</option><option>Location</option></select></label></div><div className="form-row"><label>Prix<input name="price" type="number" required placeholder="Ex. 185000000" /></label><label>Référence<input name="reference" required placeholder="Ex. JEF-VIL-004" /></label></div><div className="form-row"><label>Ville<input name="city" required placeholder="Ouagadougou" /></label><label>Quartier<input name="district" placeholder="Ouaga 2000" /></label></div><div className="form-row"><label>Superficie<input name="area" type="number" min="0" placeholder="Ex. 420" /></label><label>Chambres<input name="bedrooms" type="number" min="0" placeholder="Ex. 4" /></label></div><label>Adresse complète<input name="address" placeholder="Adresse du bien" /></label><label>Description détaillée<textarea name="description" required placeholder="Présentez les caractéristiques du bien, les équipements et les conditions" rows={6} /></label><label>Photos du bien<input type="file" accept="image/*" multiple onChange={handleImages} />{uploadStatus && <small className="upload-status">{uploadStatus}</small>}{uploadedImages.map((url) => <input key={url} type="url" value={url} readOnly />)}</label>{saveStatus && <small className="upload-status">{saveStatus}</small>}<button className="button-dark" type="submit">Enregistrer l'annonce <ArrowRight size={17} /></button></form><Link to="/" className="back-link">Retour au site public</Link></main>
}

function AdminPropertyEditPage({ id }: { id: number }) {
  const navigate = useNavigate()
  const featureQuery = usePropertyFeatures()
  const [property, setProperty] = useState<AdminDashboardSummary['properties'][number] | null>(null)
  const [status, setStatus] = useState('')
  useEffect(() => {
    getAdminDashboard().then((data) => setProperty(data.properties.find((item) => item.id === id) ?? null)).catch(() => setStatus('Impossible de charger le bien'))
  }, [id])
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>('.admin-page .listing-form')
    if (!form || !property || !featureQuery.data?.length || form.querySelector('.property-features-field')) return
    const fieldset = document.createElement('fieldset')
    fieldset.className = 'property-features-field'
    const legend = document.createElement('legend')
    legend.textContent = 'Équipements'
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
  }, [featureQuery.data, property])
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!property) return
    const form = new FormData(event.currentTarget)
    try {
      await updateProperty(id, { reference: String(form.get('reference')), title: String(form.get('title')), slug: property.slug, description: String(form.get('description')), propertyType: String(form.get('propertyType')), operationType: property.operationType, price: Number(form.get('price')), currency: property.currency, city: String(form.get('city')), district: String(form.get('district')), address: String(form.get('address')), area: Number(form.get('area')) || undefined, bedrooms: Number(form.get('bedrooms')) || undefined, imageUrls: property.imageUrls, featureIds: property.featureIds })
      setStatus('Annonce mise à jour')
      navigate('/admin/biens')
    } catch { setStatus('Impossible de mettre à jour cette annonce') }
  }
  if (status && !property) return <main className="admin-section-page"><Brand /><p className="form-error">{status}</p></main>
  if (!property) return <main className="admin-section-page"><Brand /><p>Chargement de l’annonce...</p></main>
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Modifier une annonce</div><h1>Mettre à jour<br /><em>ce bien.</em></h1>{status && <p className="upload-status">{status}</p>}<form className="listing-form" onSubmit={handleSubmit}><label>Titre<input name="title" defaultValue={property.title} required /></label><div className="form-row"><label>Type<select name="propertyType" defaultValue={property.propertyType}><option value="MAISON">Maison</option><option value="VILLA">Villa</option><option value="APPARTEMENT">Appartement</option><option value="TERRAIN">Terrain</option></select></label><label>Référence<input name="reference" defaultValue={property.reference} required /></label></div><div className="form-row"><label>Prix<input name="price" type="number" defaultValue={property.price} required /></label><label>Ville<input name="city" defaultValue={property.city} required /></label></div><div className="form-row"><label>Quartier<input name="district" defaultValue={property.district ?? ''} /></label><label>Superficie<input name="area" type="number" defaultValue={property.area ?? ''} /></label></div><label>Chambres<input name="bedrooms" type="number" defaultValue={property.bedrooms ?? ''} /></label><label>Adresse<input name="address" defaultValue={property.address ?? ''} /></label><label>Description<textarea name="description" defaultValue={property.description} required rows={7} /></label><button className="button-dark" type="submit">Enregistrer les modifications <ArrowRight size={17} /></button></form></main>
}

function AdminLogin() {
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
      setError('Identifiants incorrects ou API indisponible')
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Accès équipe agence</div><h1>Connexion<br /><em>administrateur.</em></h1><p>La consultation des annonces reste libre. Cette connexion est uniquement réservée au personnel de Jefferson Immobilier.</p><form className="listing-form" onSubmit={handleLogin}><label>E-mail<input name="email" type="email" required placeholder="admin@jefferson-immobilier.local" /></label><label>Mot de passe<input name="password" type="password" required placeholder="Votre mot de passe" /></label>{error && <small className="form-error">{error}</small>}<button className="button-dark" type="submit">Se connecter <ArrowRight size={17} /></button></form><Link to="/" className="back-link">Retour au site public</Link></main>
}

function LiveAdminDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) {
      navigate('/admin/login', { replace: true })
      return
    }
    getAdminDashboard().then(setDashboard).catch(() => setError('Impossible de charger les données du dashboard'))
  }, [navigate])
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.dashboard-sidebar nav a'))
    links.forEach((link) => {
      const label = link.textContent?.trim()
      const path = label === 'Mes biens' ? '/admin/biens' : label === 'Vues & prospects' ? '/admin/prospects' : label === 'Messages' ? '/admin/messages' : null
      if (path) link.href = path
    })
  }, [dashboard])

  if (error) return <main className="dashboard-page"><Brand /><section className="dashboard-content"><p className="form-error">{error}</p></section></main>
  if (!dashboard) return <main className="dashboard-page"><Brand /><section className="dashboard-content"><p>Chargement du dashboard...</p></section></main>

  const formatPrice = (price: number, currency: string) => `${price.toLocaleString('fr-FR')} ${currency}`
  return <main className="dashboard-page"><aside className="dashboard-sidebar"><Brand /><p className="dashboard-label">Espace agence</p><nav><a className="selected"><BarChart3 size={17} /> Vue d'ensemble</a><Link to="/admin/annonces/nouvelle"><Plus size={17} /> Nouvelle annonce</Link><a><HomeIcon size={17} /> Mes biens</a><a><Eye size={17} /> Vues & prospects</a><a><Mail size={17} /> Messages</a></nav><Link to="/" className="dashboard-back">Voir le site public <ArrowRight size={15} /></Link></aside><section className="dashboard-content"><header className="dashboard-header"><div><p className="eyebrow dark">Espace agence</p><h1>Bonjour, <em>Jefferson.</em></h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> Nouvelle annonce</Link></header><div className="stats-grid"><div className="stat-card"><span>Biens publiés</span><strong>{dashboard.publishedProperties}</strong><small>Catalogue actif</small></div><div className="stat-card"><span>Biens disponibles</span><strong>{dashboard.availableProperties}</strong><small>À la vente ou location</small></div><div className="stat-card"><span>Demandes reçues</span><strong>{dashboard.totalInquiries}</strong><small>{dashboard.newInquiries} nouvelle(s)</small></div><div className="stat-card"><span>Prospects à traiter</span><strong>{dashboard.newInquiries}</strong><small>Demandes non contactées</small></div></div><div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">Catalogue</p><h2>Annonces récentes</h2></div></div>{dashboard.properties.slice(0, 8).map((property) => <div className="listing-row" key={property.id}><img src={property.imageUrls[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'} alt="" /><div><strong>{property.title}</strong><span>{property.reference} · {[property.district, property.city].filter(Boolean).join(', ')}</span></div><span className="status-pill">{property.status}</span><span className="row-price">{formatPrice(property.price, property.currency)}</span></div>)}</section><section className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow dark">Prospects</p><h2>Dernières demandes</h2></div></div>{dashboard.inquiries.slice(0, 8).map((inquiry) => <div className="activity-row" key={inquiry.id}><span className="activity-dot" /><div><strong>{inquiry.fullName}</strong><span>{inquiry.propertyReference} · {inquiry.phone}</span></div><small>{inquiry.status}</small></div>)}{dashboard.inquiries.length === 0 && <p>Aucune demande enregistrée.</p>}</section></div></section></main>
}

function AdminPublishPanel() {
  const [properties, setProperties] = useState<AdminDashboardSummary['properties']>([])
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    getAdminDashboard().then((data) => setProperties(data.properties)).catch(() => setStatus('Impossible de charger les annonces'))
  }, [])

  async function publish() {
    if (!selectedId) return
    try {
      await updatePropertyStatus(Number(selectedId), 'AVAILABLE')
      setProperties((current) => current.map((property) => property.id === Number(selectedId) ? { ...property, status: 'AVAILABLE' } : property))
      setStatus('Annonce publiée avec succès')
    } catch {
      setStatus("Impossible de publier l'annonce")
    }
  }

  return <section className="publish-panel"><h2>Publier une annonce</h2><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Sélectionner une annonce</option>{properties.filter((property) => property.status === 'DRAFT').map((property) => <option key={property.id} value={property.id}>{property.reference} - {property.title}</option>)}</select><button className="button-dark" type="button" onClick={publish} disabled={!selectedId}>Publier</button>{status && <small className="upload-status">{status}</small>}</section>
}

function AdminPropertiesPage() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null)
  const [status, setStatus] = useState('')
  useEffect(() => { getAdminDashboard().then(setData).catch(() => setStatus('Impossible de charger les annonces')) }, [])
  async function changeStatus(id: number, nextStatus: string) {
    try {
      await updatePropertyStatus(id, nextStatus)
      setData((current) => current ? { ...current, properties: current.properties.map((property) => property.id === id ? { ...property, status: nextStatus } : property) } : current)
      setStatus('Statut mis à jour')
    } catch { setStatus('Impossible de modifier le statut') }
  }
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><div className="section-heading"><div><p className="eyebrow dark">Catalogue réel</p><h1>Mes biens</h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> Nouvelle annonce</Link></div>{status && <p className="upload-status">{status}</p>}{data?.properties.map((property) => <article className="admin-property-row" key={property.id}><img src={property.imageUrls[0] || properties[0].image} alt="" /><div><Link to={`/admin/biens/${property.id}`}><strong>{property.title}</strong></Link><span>{property.reference} · {[property.district, property.city].filter(Boolean).join(', ')}</span><small>{property.price.toLocaleString('fr-FR')} {property.currency}</small></div><select value={property.status} onChange={(event) => changeStatus(property.id, event.target.value)}><option value="DRAFT">Brouillon</option><option value="AVAILABLE">Disponible</option><option value="RESERVED">Réservé</option><option value="SOLD">Vendu</option><option value="RENTED">Loué</option><option value="ARCHIVED">Archivé</option></select></article>)}</div></main>
}

function AdminInquiriesContent({ title = 'Prospects et messages' }: { title?: string }) {
  const [inquiries, setInquiries] = useState<InquirySummary[]>([])
  const [status, setStatus] = useState('')
  useEffect(() => { getAdminDashboard().then((data) => setInquiries(data.inquiries)).catch(() => setStatus('Impossible de charger les demandes')) }, [])
  async function changeStatus(id: number, nextStatus: string) {
    try {
      const updated = await updateInquiryStatus(id, nextStatus)
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? updated : inquiry))
    } catch { setStatus('Impossible de modifier le statut de la demande') }
  }
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">Demandes enregistrées</p><h1>{title}</h1>{status && <p className="form-error">{status}</p>}{inquiries.map((inquiry) => <article className="inquiry-row" key={inquiry.id}><div><strong>{inquiry.fullName}</strong><span>{inquiry.email} · {inquiry.phone}</span><small>{inquiry.propertyReference ? `${inquiry.propertyReference} · ` : ''}{inquiry.message}</small></div><select value={inquiry.status} onChange={(event) => changeStatus(inquiry.id, event.target.value)}><option value="NEW">Nouveau</option><option value="CONTACTED">Contacté</option><option value="VISIT_SCHEDULED">Visite programmée</option><option value="CLOSED">Clos</option></select></article>)}{inquiries.length === 0 && <p>Aucune demande enregistrée.</p>}</div></main>
}

function AdminInquiriesPage({ title = 'Prospects et messages' }: { title?: string }) {
  return title === 'Messages' ? <AdminContactMessagesPage /> : <AdminInquiriesContent title={title} />
}

function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [error, setError] = useState('')
  useEffect(() => { getContactMessages().then(setMessages).catch(() => setError('Impossible de charger les messages')) }, [])
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">Contact</p><h1>Messages reçus</h1>{error && <p className="form-error">{error}</p>}{messages.length ? messages.map((message) => <article className="inquiry-row" key={message.id}><div><strong>{message.fullName}</strong><span>{message.email}{message.phone ? ` · ${message.phone}` : ''}</span><small>{message.project ? `${message.project} · ` : ''}{message.message}</small></div><span className="status-pill">{message.status}</span></article>) : !error && <p>Aucun message reçu.</p>}</div></main>
}

function AdminContentPage({ section }: { section: 'seo' | 'social' | 'settings' }) {
  const [seo, setSeo] = useState<SeoMetadata[]>([])
  const [social, setSocial] = useState<SocialLink[]>([])
  const [settings, setSettings] = useState<WebsiteSetting[]>([])
  const [status, setStatus] = useState('')
  useEffect(() => {
    const load = section === 'seo' ? getSeoMetadata().then(setSeo) : section === 'social' ? getSocialLinks().then(setSocial) : getWebsiteSettings().then(setSettings)
    load.catch(() => setStatus('Impossible de charger cette section'))
  }, [section])
  async function submitSeo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const saved = await saveSeoMetadata({ path: String(form.get('path')), title: String(form.get('title')), description: String(form.get('description')), imageUrl: String(form.get('imageUrl') || '') })
      setSeo((current) => [...current.filter((item) => item.path !== saved.path), saved])
      setStatus('Métadonnées SEO enregistrées')
    } catch { setStatus('Impossible d’enregistrer les métadonnées') }
  }
  async function submitSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const saved = await saveWebsiteSetting(String(form.get('key')), String(form.get('value')))
      setSettings((current) => [...current.filter((item) => item.key !== saved.key), saved])
      setStatus('Paramètre enregistré')
    } catch { setStatus('Impossible d’enregistrer le paramètre') }
  }
  const title = section === 'seo' ? 'SEO du site' : section === 'social' ? 'Réseaux sociaux' : 'Paramètres du site'
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">Configuration</p><h1>{title}</h1>{status && <p className="upload-status">{status}</p>}{section === 'seo' && <><form className="listing-form" onSubmit={submitSeo}><label>URL de la page<input name="path" required placeholder="/acheter" /></label><label>Titre SEO<input name="title" required placeholder="Biens à vendre | Jefferson Immobilier" /></label><label>Description SEO<textarea name="description" required rows={4} /></label><label>Image Open Graph<input name="imageUrl" type="url" /></label><button className="button-dark" type="submit">Enregistrer le SEO <ArrowRight size={17} /></button></form>{seo.map((item) => <article className="inquiry-row" key={item.path}><div><strong>{item.path}</strong><span>{item.title}</span><small>{item.description}</small></div></article>)}</>}{section === 'social' && <section className="values-grid">{social.length ? social.map((item) => <div key={item.network}><h3>{item.network}</h3><p>{item.url}</p></div>) : <p>Aucun réseau social configuré.</p>}</section>}{section === 'settings' && <><form className="listing-form" onSubmit={submitSetting}><label>Clé du paramètre<input name="key" required placeholder="whatsapp.number" /></label><label>Valeur<input name="value" required placeholder="22655773241" /></label><button className="button-dark" type="submit">Enregistrer le paramètre <ArrowRight size={17} /></button></form>{settings.map((item) => <article className="inquiry-row" key={item.key}><div><strong>{item.key}</strong><span>{item.value}</span></div></article>)}</>}</div></main>
}

function AdminStatisticsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { getAdminDashboard().then(setDashboard).catch(() => setError('Impossible de charger les statistiques')) }, [])
  if (error) return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="form-error">{error}</p></div></main>
  if (!dashboard) return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p>Chargement des statistiques...</p></div></main>
  return <main className="admin-section-page"><header><Brand /><Link to="/admin">Dashboard <ArrowRight size={15} /></Link></header><div className="admin-section-inner"><p className="eyebrow dark">Pilotage agence</p><h1>Statistiques</h1><div className="stats-grid"><div className="stat-card"><span>Biens publiés</span><strong>{dashboard.publishedProperties}</strong><small>Catalogue actif</small></div><div className="stat-card"><span>Disponibles</span><strong>{dashboard.availableProperties}</strong><small>À vendre ou louer</small></div><div className="stat-card"><span>Vues des biens</span><strong>{dashboard.totalViews}</strong><small>Consultations enregistrées</small></div><div className="stat-card"><span>Prospects</span><strong>{dashboard.newInquiries}</strong><small>Demandes à traiter</small></div></div><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">Activité commerciale</p><h2>Demandes reçues</h2></div></div><p>{dashboard.totalInquiries} demande(s) enregistrée(s), dont {dashboard.newInquiries} nouvelle(s).</p></section></div></main>
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
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero"><p className="eyebrow dark">Jefferson Immobilier</p><h1>{title}<br /><em>{emphasis}</em></h1><p>{description}</p><Link to="/acheter" className="button-dark">Voir les annonces <ArrowRight size={17} /></Link></section><ContactCta /><Seo title={`${title} ${emphasis} | Jefferson Immobilier`} description={description} path={path} /></main>
}

function FaqPage() {
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero"><p className="eyebrow dark">Questions fréquentes</p><h1>Votre projet,<br /><em>en toute clarté.</em></h1><p>Retrouvez les réponses aux questions fréquentes sur l'achat, la location et l'accompagnement Jefferson Immobilier.</p></section><section className="values-grid"><div><h3>Comment visiter un bien ?</h3><p>Contactez notre équipe par WhatsApp ou e-mail pour convenir d'un rendez-vous.</p></div><div><h3>Quels biens proposez-vous ?</h3><p>Maisons, villas, appartements et terrains sélectionnés au Burkina Faso.</p></div><div><h3>Où intervenez-vous ?</h3><p>Notre catalogue couvre notamment Ouagadougou et Bobo-Dioulasso.</p></div></section><Seo title="FAQ | Jefferson Immobilier" description="Questions fréquentes sur les biens immobiliers et les services de Jefferson Immobilier." path="/faq" /></main>
}

function PlaceholderPage() { return <main className="placeholder-page"><Brand /><SlidersHorizontal size={34} /><h1>Votre prochaine adresse<br /><em>se prépare ici.</em></h1><p>Cette page sera connectée au catalogue immobilier et à la recherche avancée.</p><Link to="/" className="button-dark">Retour à l'accueil <ArrowRight size={17} /></Link></main> }

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

  return <Routes><Route path="/" element={<Home />} /><Route path="/acheter" element={<PropertyCatalog mode="acheter" />} /><Route path="/louer" element={<PropertyCatalog mode="louer" />} /><Route path="/terrains" element={<PropertyCatalog mode="terrains" />} /><Route path="/maisons" element={<EditorialLandingPage title="Maisons" emphasis="à vendre et à louer." description="Découvrez notre sélection de maisons au Burkina Faso, choisies pour leur emplacement et leur qualité de vie." path="/maisons" />} /><Route path="/appartements" element={<EditorialLandingPage title="Appartements" emphasis="pour vivre autrement." description="Explorez les appartements proposés par Jefferson Immobilier à Ouagadougou et dans les principales villes du Burkina Faso." path="/appartements" />} /><Route path="/ville/:city" element={<CityRoute />} /><Route path="/quartier/:district" element={<DistrictRoute />} /><Route path="/a-propos" element={<AboutPage />} /><Route path="/services" element={<EditorialLandingPage title="Un accompagnement" emphasis="qui vous ressemble." description="Jefferson Immobilier vous accompagne pour acheter, louer, vendre ou investir avec des conseils clairs à chaque étape." path="/services" />} /><Route path="/faq" element={<FaqPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/biens/:slug" element={<PropertyRoute />} /><Route path="/immobilier-burkina-faso" element={<EditorialLandingPage title="Immobilier au" emphasis="Burkina Faso." description="Maisons, appartements, villas et terrains sélectionnés par Jefferson Immobilier au Burkina Faso." path="/immobilier-burkina-faso" />} /><Route path="/immobilier-ouagadougou" element={<EditorialLandingPage title="Immobilier à" emphasis="Ouagadougou." description="Découvrez les opportunités immobilières à Ouagadougou avec Jefferson Immobilier." path="/immobilier-ouagadougou" />} /><Route path="/immobilier-bobo-dioulasso" element={<EditorialLandingPage title="Immobilier à" emphasis="Bobo-Dioulasso." description="Découvrez les biens immobiliers disponibles à Bobo-Dioulasso avec Jefferson Immobilier." path="/immobilier-bobo-dioulasso" />} /><Route path="/maison-a-vendre-ouagadougou" element={<EditorialLandingPage title="Maison à vendre à" emphasis="Ouagadougou." description="Trouvez une maison à vendre à Ouagadougou grâce à la sélection Jefferson Immobilier." path="/maison-a-vendre-ouagadougou" />} /><Route path="/maison-a-louer-ouagadougou" element={<EditorialLandingPage title="Maison à louer à" emphasis="Ouagadougou." description="Trouvez une maison à louer à Ouagadougou grâce à la sélection Jefferson Immobilier." path="/maison-a-louer-ouagadougou" />} /><Route path="/terrain-a-vendre-ouagadougou" element={<EditorialLandingPage title="Terrain à vendre à" emphasis="Ouagadougou." description="Découvrez les terrains à vendre à Ouagadougou proposés par Jefferson Immobilier." path="/terrain-a-vendre-ouagadougou" />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/biens" element={<AdminPropertiesPage />} /><Route path="/admin/biens/:id" element={<AdminPropertyEditRoute />} /><Route path="/admin/prospects" element={<AdminInquiriesPage />} /><Route path="/admin/messages" element={<AdminInquiriesPage title="Messages" />} /><Route path="/admin/statistiques" element={<AdminStatisticsPage />} /><Route path="/admin/seo" element={<AdminContentPage section="seo" />} /><Route path="/admin/reseaux-sociaux" element={<AdminContentPage section="social" />} /><Route path="/admin/parametres" element={<AdminContentPage section="settings" />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin/annonces/nouvelle" element={<AdminListingForm />} /><Route path="*" element={<PlaceholderPage />} /></Routes>
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
  const district = window.location.pathname.split('/').pop() ?? ''
  const districtName = district.replace(/-/g, ' ')
  return <EditorialLandingPage title="Immobilier dans le quartier" emphasis={`${districtName}.`} description={`Découvrez les biens immobiliers disponibles dans le quartier ${districtName}, sélectionnés par Jefferson Immobilier.`} path={`/quartier/${district}`} />
}

export default App
