import { Link } from "react-router-dom";
import { productCatalog } from "../data/siteData";

const companyLinks = ["About", "Careers", "Press", "Privacy"];
const socialLinks = ["Instagram", "LinkedIn", "X", "YouTube"];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white/80 py-16">
      <div className="section-shell grid gap-12 lg:grid-cols-[1.2fr,1fr,1fr,1fr]">
        <div className="max-w-sm">
          <div className="text-lg font-semibold">PulseWear</div>
          <p className="mt-4 text-sm leading-6 text-smoke">
            Fictional smart wearables for people who want health, focus, and
            performance to feel more understandable every day.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">
            Products
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {productCatalog.map((product) => (
              <li key={product.slug}>
                <Link
                  to={product.route}
                  className="transition hover:text-accent"
                >
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">
            Company
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {companyLinks.map((link) => (
              <li key={link}>
                <Link
                  to="/"
                  className="transition hover:text-accent"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">
            Social
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {socialLinks.map((link) => (
              <li key={link}>
                <Link
                  to="/"
                  className="transition hover:text-accent"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
