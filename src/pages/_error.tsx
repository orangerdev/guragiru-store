import type { NextPageContext } from 'next'

function ErrorPage({ statusCode }: { statusCode?: number }) {
  // Minimal fallback error page for compatibility with some adapters
  return (
    <html>
      <body>
        <main style={{ color: '#fff', background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
        </main>
      </body>
    </html>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404
  return { statusCode }
}

export default ErrorPage
