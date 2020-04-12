import React from "react"
import Helmet from "react-helmet"
import { graphql } from 'gatsby'
import Layout from "../components/layout"

const ContactPage = ({
  data: {
    site
  },
}) => {
  return (
    <Layout>
      <Helmet>
        <title>Contato — {site.siteMetadata.title}</title>
        <meta name="description" content={site.siteMetadata.description} />
      </Helmet>
      <div className="two-grids -contact">
        <div className="post-thumbnail" style={{ backgroundImage: `url('/assets/contato.jpg')`, marginBottom: 0 }}>
          <h1 className="post-title">Contato</h1>
          <div className="navigation">
            <a href="http://github.com/juninmd" target="_blank" rel="noopener noreferrer">Github</a>
            <a href="http://facebook.com/juninmd" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="http://twitter.com/junin_md" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>
      </div>

    </Layout>
  )
}
export default ContactPage
export const pageQuery = graphql`
  query ContactPageQuery{
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`