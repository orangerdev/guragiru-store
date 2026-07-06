import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'GuraGiru Blog'
  const excerpt = searchParams.get('excerpt') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: '#6b7280',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            GuraGiru Blog
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              maxWidth: '800px',
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: '20px',
                color: '#9ca3af',
                marginTop: '20px',
                lineHeight: 1.5,
                maxWidth: '700px',
              }}
            >
              {excerpt}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
