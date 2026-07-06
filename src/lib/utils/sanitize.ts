/**
 * Sanitize HTML content — strip dangerous tags and attributes.
 * Allows safe formatting tags from WYSIWYG editor.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

  // Remove javascript: protocol in href/src
  clean = clean.replace(/(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')

  // Remove data: protocol in src (except data:image for inline images)
  clean = clean.replace(/src\s*=\s*(?:"data:(?!image)[^"]*"|'data:(?!image)[^']*')/gi, '')

  // Remove iframe, object, embed, form tags
  clean = clean.replace(/<\/?(iframe|object|embed|form|input|textarea|select|button)\b[^>]*>/gi, '')

  // Remove style attributes that could contain expressions
  clean = clean.replace(/style\s*=\s*"[^"]*expression[^"]*"/gi, '')

  return clean
}
