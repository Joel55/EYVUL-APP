const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
 
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
  }
 
  module.exports = {
    escapeHtml
  };