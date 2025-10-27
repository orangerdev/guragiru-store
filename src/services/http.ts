import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'

// Cache TTL: 1 hour
const ONE_HOUR_MS = 60 * 60 * 1000

// Create a shared axios instance with in-memory cache.
// The cache key considers method + url + params by default.
export const http = setupCache(axios.create(), {
  ttl: ONE_HOUR_MS,
  interpretHeader: false, // ignore cache headers; rely on ttl
  methods: ['get'], // only cache GET
})

export default http
