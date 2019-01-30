export class UTF8Encoding {
  /**
   * Encodes multi-byte Unicode string into utf-8 multiple single-byte characters
   * (BMP / basic multilingual plane only).
   *
   * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars.
   *
   * Can be achieved in JavaScript by unescape(encodeURIComponent(str)),
   * but this approach may be useful in other languages.
   *
   * @param   {string} unicodeString - Unicode string to be encoded as UTF-8.
   * @returns {string} UTF8-encoded string.
   */
  static utf8Encode(unicodeString: string): string {
    if (typeof unicodeString !== 'string') {
      throw new TypeError('parameter ‘unicodeString’ is not a string');
    }
    const utf8String = unicodeString
      .replace(
        /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
        c => {
          const cc = c.charCodeAt(0);
          // tslint:disable-next-line:no-bitwise
          return String.fromCharCode(0xc0 | (cc >> 6), 0x80 | (cc & 0x3f));
        },
      )
      .replace(
        /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
        c => {
          const cc = c.charCodeAt(0);
          return String.fromCharCode(
            // tslint:disable-next-line:no-bitwise
            0xe0 | (cc >> 12),
            // tslint:disable-next-line:no-bitwise
            0x80 | ((cc >> 6) & 0x3f),
            // tslint:disable-next-line:no-bitwise
            0x80 | (cc & 0x3f),
          );
        },
      );
    return utf8String;
  }

  /**
   * Decodes utf-8 encoded string back into multi-byte Unicode characters.
   *
   * Can be achieved JavaScript by decodeURIComponent(escape(str)),
   * but this approach may be useful in other languages.
   *
   * @param   {string} utf8String - UTF-8 string to be decoded back to Unicode.
   * @returns {string} Decoded Unicode string.
   */
  static utf8Decode(utf8String: string): string {
    if (typeof utf8String !== 'string') {
      throw new TypeError('parameter ‘utf8String’ is not a string');
    }
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    const unicodeString = utf8String
      .replace(
        /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
        c => {
          // (note parentheses for precedence)
          const cc =
            // tslint:disable-next-line:no-bitwise
            ((c.charCodeAt(0) & 0x0f) << 12) |
            // tslint:disable-next-line:no-bitwise
            ((c.charCodeAt(1) & 0x3f) << 6) |
            // tslint:disable-next-line:no-bitwise
            (c.charCodeAt(2) & 0x3f);
          return String.fromCharCode(cc);
        },
      )
      .replace(
        /[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
        c => {
          // (note parentheses for precedence)
          // tslint:disable-next-line:no-bitwise
          const cc = ((c.charCodeAt(0) & 0x1f) << 6) | (c.charCodeAt(1) & 0x3f);
          return String.fromCharCode(cc);
        },
      );
    return unicodeString;
  }
}
