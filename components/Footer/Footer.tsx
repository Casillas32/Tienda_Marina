'use client'
import Link from 'next/link'
import { MessageCircle, Heart, Mail, Phone } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <span className={styles.brandScript}>Un Suspiro</span>
                <span className={styles.brandDisplay}>Navideño</span>
              </div>
              <p className={styles.brandDesc}>
                Creaciones artesanales hechas con amor y dedicación. 
                Cada pieza es única y especial, como tú. 💕
              </p>
              <div className={styles.social}>
                <a href="https://www.instagram.com/marina.molina.9277583/?hl=es" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                  📸
                </a>
                <a href="https://wa.me/525617644737" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Categorías</h3>
              <ul className={styles.linkList}>
                <li><Link href="/categoria/navidad">🎄 Navidad</Link></li>
                <li><Link href="/categoria/halloween">🎃 Halloween</Link></li>
                <li><Link href="/categoria/bisuteria">💎 Bisutería</Link></li>
                <li><Link href="/categoria/aceites">🌿 Aceites Esenciales</Link></li>
                <li><Link href="/categoria/otros">✨ Otros</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Información</h3>
              <ul className={styles.linkList}>
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/contacto">Pedidos personalizados</Link></li>
                <li><Link href="/contacto">Contacto</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Contáctanos</h3>
              <div className={styles.contactList}>
                <a href="mailto:pelusa122705@gmail.com" className={styles.contactItem}>
                  <Mail size={15} />
                  <span>pelusa122705@gmail.com</span>
                </a>
                <a href="https://wa.me/525617644737" className={styles.contactItem}>
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
                <a href="tel:+525617644737" className={styles.contactItem}>
                  <Phone size={15} />
                  <span>+52 561 764 4737</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p className={styles.copyright}>
            © {currentYear} Un Suspiro Navideño. Hecho con <Heart size={13} className={styles.heart} /> en México.
          </p>
          <p className={styles.payments}>
            Pagos por transferencia bancaria 🏦
          </p>
        </div>
      </div>
    </footer>
  )
}
