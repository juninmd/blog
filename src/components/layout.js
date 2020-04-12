import React from "react"
import { Link } from "gatsby"
import Navigation from "../components/navigation"
import 'prismjs/themes/prism-okaidia.css';

export default ({ children }) => {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-title">
          <Link to="/">Home</Link>
        </div>
        <Navigation />
      </header>
      {children}
      <footer className="site-footer">
        <p>&copy; 2020 Delog &bull; Crafted with <span role="img" aria-label="love">❤️</span> by <a href="https://w3layouts.com">W3Layouts</a></p>
      </footer>
    </div>
  )
}