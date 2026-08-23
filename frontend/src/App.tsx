import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { usePublishedProperties } from './hooks/usePublishedProperties'
import { uploadPropertyImage } from './services/imageService'
import { createProperty } from './services/adminPropertyService'
import { login } from './services/authService'
import { ArrowRight, BarChart3, BedDouble, Building2, ChevronDown, Eye, Home as HomeIcon, Mail, MapPin, Menu, MessageCircle, Plus, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import './App.css'

const whatsappNumber = '22655773241'
const agencyEmail = 'tcagroupci@gmail.com'
const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://jefferson-immobilier.example'
type PropertyCardData = { id: string; reference: string; type: string; title: string; location: string; price: string; image: string; beds: number; area: string; imageUrls?: string[] }

function Seo({ title, description, path = '/' }: { title: string; description: string; path?: string }) {
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
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
    const structuredData = { '@context': 'https://schema.org', '@type': ['RealEstateAgent', 'LocalBusiness'], name: 'Jefferson Immobilier', description, url: siteUrl, inLanguage: 'fr-FR', email: agencyEmail, telephone: '+22655773241', areaServed: 'Burkina Faso', sameAs: ['https://www.facebook.com/', 'https://www.instagram.com/', 'https://www.tiktok.com/'] }
    let schema = document.head.querySelector<HTMLScriptElement>('script[data-jefferson-schema]')
    if (!schema) {
      schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.jeffersonSchema = 'true'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(structuredData)
  }, [description, path, title])
  return null
}

const properties: PropertyCardData[] = [
  { id: 'villa-ouaga', reference: 'JEF-VIL-001', type: 'Villa contemporaine', title: 'Ligne claire, jardin secret', location: 'Ouaga 2000, Ouagadougou', price: '185 000 000 FCFA', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', beds: 4, area: '420 m²' },
  { id: 'apartment-ouaga', reference: 'JEF-APP-002', type: 'Appartement premium', title: 'La ville à vos fenêtres', location: 'Zone du Bois, Ouagadougou', price: '950 000 FCFA / mois', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85', beds: 3, area: '168 m²' },
  { id: 'land-bobo', reference: 'JEF-TER-003', type: 'Terrain à bâtir', title: 'Le bon endroit pour demain', location: 'Belle Ville, Bobo-Dioulasso', price: '32 000 000 FCFA', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85', beds: 0, area: '1 200 m²' },
]

function Brand() { return <Link to="/" className="brand" aria-label="Jefferson Immobilier, accueil"><span className="brand-mark">J</span><span>JEFFERSON <b>IMMOBILIER</b></span></Link> }

function SocialIcon({ name }: { name: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' }) {
  const paths = { facebook: 'M14 8h3V5h-3c-2.8 0-5 2.2-5 5v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-1.1.9-2 2-2Z', instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5ZM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z', tiktok: 'M15 3h3c.2 1.7 1.2 3 3 3v3c-1.1 0-2.1-.3-3-1v7.2A5.8 5.8 0 1 1 13 9v3.1a2.8 2.8 0 1 0 2 2.7V3Z', whatsapp: 'M12 3a9 9 0 0 0-7.7 13.7L3 21l4.5-1.3A9 9 0 1 0 12 3Zm0 2a7 7 0 0 1 5.9 10.7l-.3.5.3 2.1-2-.6-.5.3A7 7 0 1 1 12 5Zm-3 3c-.4 0-.8.2-1 .6-.3.5-.4 1.1-.1 1.7.7 1.8 2.1 3.2 3.8 4 .7.3 1.3.2 1.8-.2l.7-.6-.9-1.1-.8.4c-.8-.4-1.4-.9-1.9-1.6l.3-.7-1-1.8-.9-.1Z' } as const
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d={paths[name]} /></svg>
}

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [operation, setOperation] = useState<'acheter' | 'louer'>('acheter')
  const navigate = useNavigate()
  const publishedProperties = usePublishedProperties()
  const visibleProperties = publishedProperties.data?.length
    ? publishedProperties.data.map((property) => ({
        id: property.slug,
        reference: property.reference,
        type: property.propertyType,
        title: property.title,
        location: [property.district, property.city].filter(Boolean).join(', '),
        price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        imageUrls: property.imageUrls,
        beds: property.bedrooms ?? 0,
        area: property.area ? `${property.area} m²` : 'Surface à préciser',
      }))
    : properties
  function handleSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); navigate(`/${operation}`) }
  return <main>
    <Seo title="Jefferson Immobilier | Agence immobilière au Burkina Faso" description="Découvrez les maisons, villas, appartements et terrains proposés par Jefferson Immobilier au Burkina Faso et accompagnez vos projets immobiliers." />
    <section className="hero-section">
      <header className="site-header"><Brand /><nav className={mobileMenuOpen ? 'main-nav is-open' : 'main-nav'}><NavLink to="/acheter" onClick={() => setMobileMenuOpen(false)}>Acheter</NavLink><NavLink to="/louer" onClick={() => setMobileMenuOpen(false)}>Louer</NavLink><NavLink to="/terrains" onClick={() => setMobileMenuOpen(false)}>Terrains</NavLink><NavLink to="/a-propos" onClick={() => setMobileMenuOpen(false)}>L'agence</NavLink></nav><Link to="/contact" className="header-contact">Parlons de votre projet <ArrowRight size={16} /></Link><button className="menu-toggle" aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button></header>
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> L'immobilier, avec une longueur d'avance</p><h1>Trouvez le bien<br /><em>qui vous ressemble.</em></h1><p className="hero-intro">Des adresses choisies avec exigence, pour habiter, investir et avancer sereinement au Burkina Faso.</p></div>
      <form className="search-panel" onSubmit={handleSearch}><div className="search-tabs"><button type="button" className={operation === 'acheter' ? 'active' : ''} onClick={() => setOperation('acheter')}>Acheter</button><button type="button" className={operation === 'louer' ? 'active' : ''} onClick={() => setOperation('louer')}>Louer</button></div><label><span>Je recherche</span><select defaultValue=""><option value="" disabled>Un type de bien</option><option>Maison</option><option>Appartement</option><option>Terrain</option></select><ChevronDown size={15} /></label><label><span>Localisation</span><input placeholder="Ville ou quartier" /><MapPin size={15} /></label><label><span>Budget maximum</span><select defaultValue=""><option value="" disabled>Votre budget</option><option>50 000 000 FCFA</option><option>100 000 000 FCFA</option><option>200 000 000 FCFA</option></select><ChevronDown size={15} /></label><button className="search-submit" type="submit"><Search size={18} /> Rechercher</button></form>
      <div className="hero-note"><span>01</span><span className="note-line" /><span>Des lieux qui ont une histoire<br />et encore beaucoup à écrire.</span></div>
    </section>
    <section className="content-section featured-section"><div className="section-heading"><div><p className="eyebrow dark">Sélection Jefferson</p><h2>Des biens qui<br /><em>ne ressemblent pas aux autres.</em></h2></div><Link to="/acheter" className="text-link">Voir toutes les annonces <ArrowRight size={16} /></Link></div><div className="property-grid">{visibleProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />)}</div></section>
    <section className="manifesto-section"><div className="manifesto-number">02</div><div><p className="eyebrow">Notre manière de faire</p><h2>Plus qu'une adresse,<br /><em>un nouveau chapitre.</em></h2></div><p>Nous croyons qu'un projet immobilier mérite plus qu'une transaction. Il mérite du regard, de l'écoute et une attention rare aux détails.</p><Link to="/a-propos" className="circle-link" aria-label="Découvrir notre agence"><ArrowRight /></Link></section>
    <section className="content-section cities-section"><div className="section-heading"><div><p className="eyebrow dark">Explorer par destination</p><h2>Le Burkina,<br /><em>à votre façon.</em></h2></div><Link to="/ville/ouagadougou" className="text-link">Explorer les villes <ArrowRight size={16} /></Link></div><div className="city-grid"><Link to="/ville/ouagadougou" className="city-card city-ouaga"><span>Ouagadougou</span><small>La capitale, autrement.</small></Link><Link to="/ville/bobo-dioulasso" className="city-card city-bobo"><span>Bobo-Dioulasso</span><small>L'art de vivre en douceur.</small></Link></div></section>
    <footer className="site-footer"><Brand /><div className="footer-contact"><p>Des lieux choisis. Des vies qui avancent.</p><a href={`mailto:${agencyEmail}`} className="email-link" aria-label={`Envoyer un e-mail à ${agencyEmail}`}><Mail size={16} /> {agencyEmail}</a></div><div className="social-links"><a href="https://www.tiktok.com/" aria-label="TikTok"><SocialIcon name="tiktok" /></a><a href="https://www.facebook.com/" aria-label="Facebook"><SocialIcon name="facebook" /></a><a href="https://www.instagram.com/" aria-label="Instagram"><SocialIcon name="instagram" /></a><a href={`https://wa.me/${whatsappNumber}`} className="whatsapp-link" aria-label="Contacter Jefferson Immobilier sur WhatsApp"><span className="social-circle"><SocialIcon name="whatsapp" /></span> WhatsApp</a></div></footer>
  </main>
}

function PropertyCard({ property, featured }: { property: PropertyCardData; featured?: boolean }) {
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
  return <article className={featured ? 'property-card featured' : 'property-card'}><Link to={`/biens/${property.id}`}><div className="property-image"><img src={property.image} alt={property.title} /><span className="property-badge">{property.type}</span><span className="property-arrow"><ArrowRight size={17} /></span></div></Link><div className="property-info"><Link to={`/biens/${property.id}`}><h3>{property.title}</h3></Link><p><MapPin size={13} /> {property.location}</p><strong>{property.price}</strong><div className="property-meta"><span>{property.area}</span>{property.beds > 0 && <span><BedDouble size={14} /> {property.beds} chambres</span>}<span><Building2 size={14} /> {property.type.includes('Terrain') ? 'Terrain' : 'Disponible'}</span></div><a className="property-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={15} /> Demander ce bien sur WhatsApp</a></div></article>
}

function PropertyDetail({ slug }: { slug: string }) {
  const property = properties.find((item) => item.id === slug)
  if (!property) return <PlaceholderPage />
  const apiImages = 'imageUrls' in property ? (property as { imageUrls?: string[] }).imageUrls ?? [] : []
  const images = [property.image, ...apiImages]
  const whatsappText = encodeURIComponent(`Bonjour Jefferson Immobilier,
Je suis intéressé par le bien ${property.title}, référence ${property.reference}.
Localisation : ${property.location}
Prix : ${property.price}
Je souhaite recevoir plus d'informations et convenir d'une visite.
Photo : ${images[0]}`)
  return <main className="property-detail-page"><header className="detail-header"><Brand /><Link to="/acheter" className="text-link">Retour aux annonces <ArrowRight size={15} /></Link></header><div className="detail-gallery">{images.slice(0, 4).map((image, index) => <img key={image} className={index === 0 ? 'detail-cover' : ''} src={image} alt={`${property.title}, photo ${index + 1}`} />)}</div><section className="detail-content"><div className="detail-main"><p className="eyebrow dark">{property.type} · {property.reference}</p><h1>{property.title}</h1><p className="detail-location"><MapPin size={15} /> {property.location}</p><strong className="detail-price">{property.price}</strong><div className="detail-facts"><span>{property.area}</span>{property.beds > 0 && <span><BedDouble size={16} /> {property.beds} chambres</span>}<span><Building2 size={16} /> Disponible</span></div><h2>À propos de ce bien</h2><p className="detail-description">Une adresse pensée pour celles et ceux qui recherchent un cadre singulier, des volumes généreux et une qualité de vie durable. Contactez notre équipe pour recevoir toutes les informations et organiser une visite.</p></div><aside className="contact-panel"><p className="eyebrow dark">Ce bien vous intéresse ?</p><h2>Parlons-en.</h2><p>Notre équipe vous répond directement sur WhatsApp.</p><a className="detail-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}><MessageCircle size={20} /> Écrire sur WhatsApp</a><a className="detail-email" href={`mailto:${agencyEmail}`}>ou écrire à {agencyEmail}</a></aside></section><Seo title={`${property.title} | Jefferson Immobilier`} description={`${property.type} à ${property.location}. ${property.price}. Découvrez cette annonce Jefferson Immobilier et contactez notre équipe.`} path={`/biens/${property.id}`} /></main>
}

function PropertyCatalog({ mode }: { mode: 'acheter' | 'louer' | 'terrains' }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const operation = mode === 'louer' ? 'LOCATION' : 'VENTE'
  const query = usePublishedProperties(operation)
  const title = mode === 'acheter' ? 'Biens à vendre' : mode === 'louer' ? 'Biens à louer' : 'Terrains à bâtir'
  const description = mode === 'acheter' ? 'Maisons, villas et appartements à vendre sélectionnés par Jefferson Immobilier.' : mode === 'louer' ? 'Maisons, villas et appartements à louer au Burkina Faso.' : 'Terrains à vendre pour vos projets immobiliers au Burkina Faso.'
  const apiCatalog: PropertyCardData[] = (query.data ?? []).map((property) => ({ id: property.slug, reference: property.reference, type: property.propertyType, title: property.title, location: [property.district, property.city].filter(Boolean).join(', '), price: `${property.price.toLocaleString('fr-FR')} ${property.currency}`, image: property.imageUrls?.[0] ?? properties[0].image, beds: property.bedrooms ?? 0, area: property.area ? `${property.area} m²` : 'Surface à préciser', imageUrls: property.imageUrls }))
  const sourceCatalog = apiCatalog.length ? apiCatalog : properties
  const catalog = mode === 'terrains' ? sourceCatalog.filter((property) => property.type.includes('TERRAIN') || property.type.includes('Terrain')) : sourceCatalog.filter((property) => mode === 'louer' ? property.price.toLowerCase().includes('mois') : !property.price.toLowerCase().includes('mois'))
  const filteredCatalog = catalog.filter((property) => {
    const matchesSearch = `${property.title} ${property.location}`.toLowerCase().includes(search.toLowerCase())
    const matchesType = !type || property.type.toLowerCase().includes(type.toLowerCase())
    const numericPrice = Number(property.price.replace(/[^0-9]/g, ''))
    return matchesSearch && matchesType && (!maxPrice || numericPrice <= Number(maxPrice))
  })
  return <main className="catalog-page"><header className="catalog-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="catalog-intro"><p className="eyebrow dark">Catalogue Jefferson</p><h1>{title}<br /><em>pour vos projets.</em></h1><p>{description}</p></section><div className="catalog-toolbar"><span>{query.data?.length ?? filteredCatalog.length} annonce(s) disponible(s)</span><div className="catalog-filters"><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ville ou quartier" /></label><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Tous les types</option><option value="maison">Maison</option><option value="villa">Villa</option><option value="appartement">Appartement</option><option value="terrain">Terrain</option></select><select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="">Budget maximum</option><option value="50000000">50 000 000 FCFA</option><option value="100000000">100 000 000 FCFA</option><option value="200000000">200 000 000 FCFA</option></select></div></div><section className="catalog-grid">{filteredCatalog.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />)}</section><Seo title={`${title} | Jefferson Immobilier`} description={description} path={`/${mode}`} /></main>
}

function CityPage({ city }: { city: string }) {
  const cityName = city === 'bobo-dioulasso' ? 'Bobo-Dioulasso' : 'Ouagadougou'
  const cityProperties = properties.filter((property) => property.location.toLowerCase().includes(cityName.toLowerCase()))
  return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero city-hero"><p className="eyebrow dark">Explorer par destination</p><h1>Immobilier à<br /><em>{cityName}.</em></h1><p>Des adresses choisies dans les quartiers qui font le caractère de {cityName}. Explorez les biens Jefferson disponibles.</p></section><section className="editorial-list"><div className="section-heading"><div><p className="eyebrow dark">La sélection locale</p><h2>Nos adresses<br /><em>à {cityName}.</em></h2></div><Link to="/acheter" className="text-link">Voir le catalogue <ArrowRight size={15} /></Link></div><div className="catalog-grid">{cityProperties.length ? cityProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />) : <p className="empty-message">De nouvelles adresses arrivent bientôt dans cette ville.</p>}</div></section><Seo title={`Immobilier à ${cityName} | Jefferson Immobilier`} description={`Découvrez les biens immobiliers proposés par Jefferson Immobilier à ${cityName}. Maisons, appartements, villas et terrains.`} path={`/ville/${city}`} /></main>
}

function AboutPage() { return <main className="editorial-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="editorial-hero about-hero"><p className="eyebrow dark">L'agence</p><h1>Nous créons des liens<br /><em>avec les bons lieux.</em></h1><p>Jefferson Immobilier accompagne celles et ceux qui veulent habiter, investir et construire un avenir au Burkina Faso avec exigence et sérénité.</p></section><section className="about-grid"><div><p className="eyebrow dark">Notre conviction</p><h2>Un bien n'est jamais<br /><em>juste une adresse.</em></h2></div><p>Chaque projet commence par une écoute attentive. Notre rôle est de comprendre une ambition, de repérer les bons volumes et de rendre chaque étape plus claire. De la première visite à la remise des clés, notre équipe reste présente et disponible.</p></section><section className="values-grid"><div><span>01</span><h3>Le regard</h3><p>Nous sélectionnons des lieux avec une vraie personnalité.</p></div><div><span>02</span><h3>L'écoute</h3><p>Nous construisons chaque conseil autour de votre projet.</p></div><div><span>03</span><h3>La confiance</h3><p>Des informations claires, des échanges directs et un suivi humain.</p></div></section><ContactCta /><Seo title="À propos de Jefferson Immobilier" description="Découvrez l'agence Jefferson Immobilier et sa manière d'accompagner les projets immobiliers au Burkina Faso." path="/a-propos" /></main> }

function ContactPage() { const [sent, setSent] = useState(false); function handleContact(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const message = encodeURIComponent(`Bonjour Jefferson Immobilier,\n\nJe souhaite parler de mon projet immobilier.\nNom : ${form.get('name')}\nE-mail : ${form.get('email')}\nProjet : ${form.get('project')}\nMessage : ${form.get('message')}`); window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`; setSent(true) } return <main className="contact-page"><header className="editorial-header"><Brand /><Link to="/" className="text-link">Accueil <ArrowRight size={15} /></Link></header><section className="contact-layout"><div><p className="eyebrow dark">Parlons de votre projet</p><h1>Un projet en tête ?<br /><em>Commençons par en parler.</em></h1><p>Que vous cherchiez à acheter, louer, vendre ou investir, notre équipe vous répond directement.</p><div className="contact-details"><a href={`mailto:${agencyEmail}`}><Mail size={17} /> {agencyEmail}</a><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle size={17} /> +226 55 77 32 41</a></div></div><form className="project-form" onSubmit={handleContact}><label>Votre nom<input name="name" required placeholder="Nom complet" /></label><label>Votre e-mail<input name="email" type="email" required placeholder="vous@exemple.com" /></label><label>Votre projet<select name="project" defaultValue="Acheter"><option>Acheter</option><option>Louer</option><option>Vendre un bien</option><option>Investir</option></select></label><label>Votre message<textarea name="message" required rows={5} placeholder="Dites-nous quelques mots sur votre projet" /></label><button className="button-dark" type="submit">Envoyer sur WhatsApp <MessageCircle size={17} /></button>{sent && <small className="upload-status">Votre message est prêt dans WhatsApp.</small>}</form></section><Seo title="Contact | Jefferson Immobilier" description="Contactez Jefferson Immobilier par WhatsApp ou e-mail pour votre projet immobilier." path="/contact" /></main> }

function ContactCta() { return <section className="contact-cta"><div><p className="eyebrow">Un projet immobilier ?</p><h2>Parlons de<br /><em>la suite.</em></h2></div><Link to="/contact" className="circle-link" aria-label="Contacter l'agence"><ArrowRight /></Link></section> }

function AdminListingForm() {
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [saveStatus, setSaveStatus] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) navigate('/admin/login', { replace: true })
  }, [navigate])
  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setUploadStatus('Envoi des photos...')
    try {
      const urls = await Promise.all(files.map(uploadPropertyImage))
      setUploadedImages((current) => [...current, ...urls])
      setUploadStatus(`${urls.length} photo(s) envoyée(s)`) 
    } catch {
      setUploadStatus('Connexion requise pour envoyer les photos')
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaveStatus('Enregistrement...')
    try {
      await createProperty({
        title: String(form.get('title')),
        reference: String(form.get('reference')),
        slug: String(form.get('title')).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        description: String(form.get('description')),
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
      })
      setSaveStatus('Annonce enregistrée avec succès')
      event.currentTarget.reset()
      setUploadedImages([])
    } catch {
      setSaveStatus('Connexion administrateur requise pour enregistrer')
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Espace agence privé</div><h1>Publier une<br /><em>nouvelle annonce.</em></h1><p>Réservé à l'équipe Jefferson Immobilier. Les visiteurs peuvent uniquement consulter les publications.</p><form className="listing-form" onSubmit={handleSubmit}><label>Titre de l'annonce<input name="title" required placeholder="Ex. Villa contemporaine avec piscine" /></label><div className="form-row"><label>Type<select name="propertyType" defaultValue="MAISON"><option value="MAISON">Maison</option><option value="VILLA">Villa</option><option value="APPARTEMENT">Appartement</option><option value="TERRAIN">Terrain</option></select></label><label>Opération<select name="operationType" defaultValue="Vente"><option>Vente</option><option>Location</option></select></label></div><div className="form-row"><label>Prix<input name="price" type="number" required placeholder="Ex. 185000000" /></label><label>Référence<input name="reference" required placeholder="Ex. JEF-VIL-004" /></label></div><div className="form-row"><label>Ville<input name="city" required placeholder="Ouagadougou" /></label><label>Quartier<input name="district" placeholder="Ouaga 2000" /></label></div><div className="form-row"><label>Superficie<input name="area" type="number" min="0" placeholder="Ex. 420" /></label><label>Chambres<input name="bedrooms" type="number" min="0" placeholder="Ex. 4" /></label></div><label>Adresse complète<input name="address" placeholder="Adresse du bien" /></label><label>Description détaillée<textarea name="description" required placeholder="Présentez les caractéristiques du bien, les équipements et les conditions" rows={6} /></label><label>Photos du bien<input type="file" accept="image/*" multiple onChange={handleImages} />{uploadStatus && <small className="upload-status">{uploadStatus}</small>}{uploadedImages.map((url) => <input key={url} type="url" value={url} readOnly />)}</label>{saveStatus && <small className="upload-status">{saveStatus}</small>}<button className="button-dark" type="submit">Enregistrer l'annonce <ArrowRight size={17} /></button></form><Link to="/" className="back-link">Retour au site public</Link></main>
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
      navigate('/admin/annonces/nouvelle')
    } catch {
      setError('Identifiants incorrects ou API indisponible')
    }
  }
  return <main className="admin-page"><Brand /><div className="admin-kicker"><SlidersHorizontal size={18} /> Accès équipe agence</div><h1>Connexion<br /><em>administrateur.</em></h1><p>La consultation des annonces reste libre. Cette connexion est uniquement réservée au personnel de Jefferson Immobilier.</p><form className="listing-form" onSubmit={handleLogin}><label>E-mail<input name="email" type="email" required placeholder="admin@jefferson-immobilier.local" /></label><label>Mot de passe<input name="password" type="password" required placeholder="Votre mot de passe" /></label>{error && <small className="form-error">{error}</small>}<button className="button-dark" type="submit">Se connecter <ArrowRight size={17} /></button></form><Link to="/" className="back-link">Retour au site public</Link></main>
}

function AdminDashboard() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!localStorage.getItem('jefferson_access_token')) navigate('/admin/login', { replace: true })
  }, [navigate])
  return <main className="dashboard-page"><aside className="dashboard-sidebar"><Brand /><p className="dashboard-label">Espace agence</p><nav><a className="selected"><BarChart3 size={17} /> Vue d'ensemble</a><Link to="/admin/annonces/nouvelle"><Plus size={17} /> Nouvelle annonce</Link><a><HomeIcon size={17} /> Mes biens</a><a><Eye size={17} /> Vues & prospects</a><a><Mail size={17} /> Messages</a></nav><Link to="/" className="dashboard-back">Voir le site public <ArrowRight size={15} /></Link></aside><section className="dashboard-content"><header className="dashboard-header"><div><p className="eyebrow dark">Dimanche, 23 août 2026</p><h1>Bonjour, <em>Jefferson.</em></h1></div><Link to="/admin/annonces/nouvelle" className="button-dark"><Plus size={17} /> Nouvelle annonce</Link></header><div className="stats-grid"><div className="stat-card"><span>Biens publiés</span><strong>24</strong><small><b>+12%</b> ce mois-ci</small></div><div className="stat-card"><span>Biens disponibles</span><strong>18</strong><small>75% du catalogue</small></div><div className="stat-card"><span>Vues ce mois</span><strong>1 284</strong><small><b>+18%</b> depuis juillet</small></div><div className="stat-card"><span>Demandes WhatsApp</span><strong>37</strong><small><b>+8</b> cette semaine</small></div></div><div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow dark">Catalogue</p><h2>Annonces récentes</h2></div><Link to="/acheter" className="text-link">Tout voir <ArrowRight size={15} /></Link></div>{properties.map((property) => <div className="listing-row" key={property.id}><img src={property.image} alt="" /><div><strong>{property.title}</strong><span>{property.reference} · {property.location}</span></div><span className="status-pill">Disponible</span><span className="row-price">{property.price}</span></div>)}</section><section className="dashboard-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow dark">Activité</p><h2>Cette semaine</h2></div><BarChart3 size={20} /></div><div className="activity-chart"><i style={{ height: '38%' }} /><i style={{ height: '62%' }} /><i style={{ height: '48%' }} /><i style={{ height: '78%' }} /><i style={{ height: '56%' }} /><i style={{ height: '92%' }} /><i style={{ height: '68%' }} /></div><div className="chart-days"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div><p className="activity-total"><strong>312</strong> visiteurs uniques</p></section></div></section></main>
}

function PlaceholderPage() { return <main className="placeholder-page"><Brand /><SlidersHorizontal size={34} /><h1>Votre prochaine adresse<br /><em>se prépare ici.</em></h1><p>Cette page sera connectée au catalogue immobilier et à la recherche avancée.</p><Link to="/" className="button-dark">Retour à l'accueil <ArrowRight size={17} /></Link></main> }

function App() { return <Routes><Route path="/" element={<Home />} /><Route path="/acheter" element={<PropertyCatalog mode="acheter" />} /><Route path="/louer" element={<PropertyCatalog mode="louer" />} /><Route path="/terrains" element={<PropertyCatalog mode="terrains" />} /><Route path="/ville/:city" element={<CityRoute />} /><Route path="/a-propos" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/biens/:slug" element={<PropertyRoute />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin/annonces/nouvelle" element={<AdminListingForm />} /><Route path="*" element={<PlaceholderPage />} /></Routes> }

function PropertyRoute() {
  const slug = window.location.pathname.split('/').pop() ?? ''
  return <PropertyDetail slug={slug} />
}

function CityRoute() { return <CityPage city={window.location.pathname.split('/').pop() ?? ''} /> }

export default App
