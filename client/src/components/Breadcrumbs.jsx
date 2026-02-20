import { Link, useLocation } from "react-router-dom";
import "../styles/Breadcrumbs.css";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show on home page
  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-nav">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            // Handle listing IDs or other long hex IDs
            let name = value;
            if (/^[0-9a-fA-F]{24}$/.test(value)) {
              name = "Listing Details";
            } else {
              name =
                value.charAt(0).toUpperCase() +
                value.slice(1).replace(/-/g, " ");
            }

            return (
              <li
                key={to}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? <span>{name}</span> : <Link to={to}>{name}</Link>}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
