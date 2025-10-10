/**
 * PlantUML Encoder/Decoder
 * Basado en el algoritmo oficial de PlantUML
 * https://plantuml.com/text-encoding
 */

(function() {
  'use strict';

  const encode64 = (function() {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    
    function encode6bit(b) {
      if (b < 0 || b > 63) {
        return '?';
      }
      return alphabet.charAt(b);
    }
    
    function append3bytes(b1, b2, b3) {
      const c1 = b1 >> 2;
      const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
      const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
      const c4 = b3 & 0x3F;
      let r = '';
      r += encode6bit(c1 & 0x3F);
      r += encode6bit(c2 & 0x3F);
      r += encode6bit(c3 & 0x3F);
      r += encode6bit(c4 & 0x3F);
      return r;
    }
    
    return function(data) {
      let r = '';
      for (let i = 0; i < data.length; i += 3) {
        if (i + 2 === data.length) {
          r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
        } else if (i + 1 === data.length) {
          r += append3bytes(data.charCodeAt(i), 0, 0);
        } else {
          r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
        }
      }
      return r;
    };
  })();

  function deflate(data) {
    // Using pako library for deflate compression
    if (typeof pako !== 'undefined') {
      // UTF-8 encoding: igual que en el código oficial de PlantUML
      // unescape(encodeURIComponent(s)) convierte string a UTF-8 bytes como string
      const utf8String = unescape(encodeURIComponent(data));
      
      // Convertir el string UTF-8 a array de bytes
      const bytes = new Uint8Array(utf8String.length);
      for (let i = 0; i < utf8String.length; i++) {
        bytes[i] = utf8String.charCodeAt(i);
      }
      
      // Comprimir con Deflate RAW (sin headers zlib)
      const compressed = pako.deflateRaw(bytes, { level: 9 });
      
      // Convertir Uint8Array comprimido a string (cada byte como character)
      let result = '';
      for (let i = 0; i < compressed.length; i++) {
        result += String.fromCharCode(compressed[i]);
      }
      return result;
    }
    // Fallback: return original data if pako is not available
    console.warn('pako library not found, encoding may not work correctly');
    return data;
  }

  /**
   * Encode PlantUML source code to URL-safe format
   * @param {string} source - PlantUML source code
   * @returns {string} - Encoded diagram
   */
  window.encodePlantUML = function(source) {
    try {
      const compressed = deflate(source);
      return encode64(compressed);
    } catch (error) {
      console.error('Error encoding PlantUML:', error);
      throw error;
    }
  };

  /**
   * Decode PlantUML encoded diagram back to source code
   * Note: This requires the server's coder endpoint
   * @param {string} encoded - Encoded diagram
   * @returns {Promise<string>} - PlantUML source code
   */
  window.decodePlantUML = async function(encoded) {
    // Decoding requires server-side support
    const baseUrl = typeof getPlantumlBase === 'function' 
      ? getPlantumlBase() 
      : 'https://www.plantuml.com/plantuml';
    
    try {
      const response = await fetch(`${baseUrl}/coder/${encoded}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error decoding PlantUML:', error);
      throw error;
    }
  };

})();
