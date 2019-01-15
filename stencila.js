(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('substance'), require('substance-texture'), require('stencila-libcore'), require('stencila-mini'), require('plotly.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'substance', 'substance-texture', 'stencila-libcore', 'stencila-mini', 'plotly.js'], factory) :
  (factory((global.stencila = {}),global.window.substance,global.window.texture,global.window.stencilaLibcore,global.window.stencilaMini,global.window.Plotly));
}(this, (function (exports,substance,substanceTexture,libcore,stencilaMini,Plotly) { 'use strict';

  libcore = libcore && libcore.hasOwnProperty('default') ? libcore['default'] : libcore;
  Plotly = Plotly && Plotly.hasOwnProperty('default') ? Plotly['default'] : Plotly;

  /**
   * @namespace address
   */

  /**
   * Get the long form of a component address
   *
   * @memberof address
   * @see short
   *
   * @example
   *
   * long('+document')
   * 'new://document'
   *
   * long('gh:stencila/stencila/README.md')
   * 'gh://stencila/stencila/README.md'
   *
   * long('./report/intro.md')
   * 'file:///current/directory/report/intro.md'
   *
   * long('stats/t-test.md')
   * 'lib://stats/t-test.md'
   *
   * long()
   * 'id://fa4cf2c5cff5b576990feb96f25c98e6111990c873010855a53bcba979583836'
   *
   * @param {string} address - The address to lengthen
   * @return {string} - The long form of the address
   */
  function long (address) {
    if (address.match(/^(new|id|name|lib|file|http|https|git|gh):\/\//)) {
      return address
    } else if (address[0] === '+') {
      return 'new://' + address.substring(1)
    } else if (address[0] === '*') {
      return 'name://' + address.substring(1)
    } else if (address[0] === '.' || address[0] === '/' || address[0] === '~') {
      return 'file://' + address
    } else {
      let match = address.match(/^([a-z]+)(:\/?\/?)(.+)$/);
      if (match) {
        let alias = match[1];
        let path = match[3];
        if (alias === 'file') {
          // Only arrive here with `file:/foo` since with
          // `file:` with two or more slashes is already "long"
          return `file:///${path}`
        } else if (alias === 'http' || alias === 'https') {
          return `${alias}://${path}`
        } else if (alias === 'gh' || alias === 'github') {
          return `gh://${path}`
        } else {
          throw new Error(`Unknown scheme alias "${alias}"`)
        }
      } else {
        return 'lib://' + address
      }
    }
  }

  /**
   * Get the short form of a component address
   *
   * This method is the inverse of `long()`. It shortens an address tp
   * a smaller, more aeshetically pleasing form, that is useful in URLs
   * an other places.
   *
   * @memberof address
   * @see long
   *
   * @example
   *
   * short('new://document')
   * '+document'
   *
   * short('file:///some/directory/my-doc.md')
   * 'file:/some/directory/my-doc.md'
   *
   * short()
   * '*fa4cf2c5cff5b576990feb96f25c98e6111990c873010855a53bcba979583836'
   *
   * @param {string} address - The address to shorten
   * @return {string} - The short form of the address
   */
  function short (address) {
    address = long(address);
    if (address.substring(0, 6) === 'new://') {
      return '+' + address.substring(6)
    } else if (address.substring(0, 7) === 'name://') {
      return '*' + address.substring(7)
    } else if (address.substring(0, 7) === 'file://') {
      return 'file:' + address.substring(7)
    } else if (address.substring(0, 6) === 'lib://') {
      return address.substring(6)
    } else if (address.substring(0, 5) === 'gh://') {
      return 'gh:' + address.substring(5)
    } else {
      let match = address.match(/([a-z]+):\/\/(.+)$/);
      return `${match[1]}:${match[2]}`
    }
  }

  /**
   * Split a component address into its parts
   *
   * @memberof address
   *
   * @param {string} address - The address to split
   * @return {object} - An object with a property for each part of the address
   */
  function split (address) {
    address = long(address);
    let matches = address.match(/([a-z]+):\/\/([\w\-.~/]+)(@([\w\-.]+))?/);
    if (matches) {
      // Previously used Node's `path.extname` function to get any file extension.
      // This simple reimplementation probably need robustification.
      let ext = null;
      let parts = matches[2].split('.');
      if (parts.length > 1) ext = parts[parts.length - 1];
      return {
        scheme: matches[1],
        path: matches[2],
        format: ext,
        version: matches[4] || null
      }
    } else {
      throw new Error(`Unable to split address "${address}"`)
    }
  }

  /**
   * Get the scheme of a component address
   *
   * @memberof address
   *
   * @param {string} address - The address
   * @return {string} - The address's scheme
   */
  function scheme (address) {
    return split(address).scheme
  }

  /**
   * Get the path of a component address
   *
   * @memberof address
   *
   * @param {string} address - The address
   * @return {string} - The address's path
   */
  function path (address) {
    return split(address).path
  }

  /**
   * Get the format of a component address
   *
   * @memberof address
   *
   * @param {string} address - The address
   * @return {string} - The address's format
   */
  function format (address) {
    return split(address).format
  }

  /**
   * Get the version of a component address
   *
   * @memberof address
   *
   * @param {string} address - The address
   * @return {string} - The address's version
   */
  function version (address) {
    return split(address).version
  }

  var address = /*#__PURE__*/Object.freeze({
    long: long,
    short: short,
    split: split,
    scheme: scheme,
    path: path,
    format: format,
    version: version
  });

  // Type heirarchy

  // Parent of each type
  const parentTypes = {
    'any': null,

    'null': 'any',

    'boolean': 'any',

    'number': 'any',
    'integer': 'number',

    'string': 'any',

    'object': 'any',

    'array': 'any',
    'array[boolean]': 'array',
    'array[number]': 'array',
    'array[integer]': 'array[number]',
    'array[string]': 'array',
    'array[object]': 'array',

    'table': 'any'
  };

  // Children of each type
  let childrenTypes = {};
  for (let type of Object.keys(parentTypes)) {
    if (!childrenTypes[type]) childrenTypes[type] = [];
    let base = parentTypes[type];
    if (!base) continue
    if (childrenTypes[base]) childrenTypes[base].push(type);
    else childrenTypes[base] = [type];
  }

  // Descendants (children, grandchildren etc) of each type
  let descendantTypes = {};
  for (let type of Object.keys(parentTypes)) {
    if (!descendantTypes[type]) descendantTypes[type] = [];
    let parent = parentTypes[type];
    while (parent) {
      if (descendantTypes[parent]) descendantTypes[parent].push(type);
      else descendantTypes[parent] = [type];
      parent = parentTypes[parent];
    }
  }

  function coercedArrayType(arr) {
    let valType = arr.reduce(_mostSpecificType, undefined);
    if (valType === 'any') {
      return 'array'
    } else {
      return `array[${valType}]`
    }
  }

  function _mostSpecificType(type, next) {
    if (!next) return 'any'
    let nextType = next.type;
    if (!type) return nextType
    if (type === nextType) {
      return type
    }
    switch(type) {
      case 'number': {
        if (nextType === 'integer') {
          return 'number'
        }
        break
      }
      case 'integer': {
        if (nextType === 'number') {
          return 'number'
        }
        break
      }
      default:
        //
    }
    return 'any'
  }

  /**
   * @namespace value
   */

  /**
   * Get the type code for a value
   *
   * @memberof value
   * @param {*} value - A JavaScript value
   * @return {string} - Type code for value
   */
  function type (value) {
    let type = typeof value;

    if (value === null) {
      return 'null'
    } else if (type === 'boolean') {
      return 'boolean'
    } else if (type === 'number') {
      let isInteger = false;
      if (value.isInteger) isInteger = value.isInteger();
      else isInteger = (value % 1) === 0;
      return isInteger ? 'integer' : 'number'
    } else if (type === 'string') {
      return 'string'
    } else if (type === 'object') {
      if (value.constructor === Array) {
        return 'array'
      }
      if (value.type) return value.type
      else return 'object'
    } else {
      return 'unknown'
    }
  }

  /**
   * Pack a value into a package
   *
   * @memberof value
   * @param {*} value The Javascript value
   * @return {object} A package as a Javascript object
   */
  function pack (value) {
    // A data pack has a `type`, `format` (defaults to "text")
    // and a `value` (the serialisation of the value into the format)
    let type_ = type(value);
    let format = 'text';
    let content;

    if (type_ === 'null') {
      content = 'null';
    } else if (type_ === 'boolean' || type_ === 'integer' || type_ === 'number') {
      content = value.toString();
    } else if (type_ === 'string') {
      content = value;
    } else if (type_ === 'object' || type_ === 'array' || type_ === 'table') {
      format = 'json';
      content = JSON.stringify(value);
    } else if (type_ === 'unknown') {
      content = value.toString();
    } else {
      format = 'json';
      content = JSON.stringify(value);
    }
    return {type: type_, format: format, content: content}
  }

  /**
   * Unpack a data package into an value
   *
   * @memberof value
   * @param {object|string} pkg The package
   * @return {anything} A Javascript value
   */
  function unpack (pkg) {
    if (typeof pkg === 'string') {
      pkg = JSON.parse(pkg);
    }
    if (pkg.constructor !== Object) {
      throw new Error('Package should be an `Object`')
    }
    if (!(pkg.type && pkg.format && pkg.content)) {
      throw new Error('Package should have fields `type`, `format`, `content`')
    }

    let {type, format, content} = pkg;

    if (type === 'null') {
      return null
    } else if (type === 'boolean') {
      return content === 'true'
    } else if (type === 'integer') {
      return parseInt(content, 10)
    } else if (type === 'number') {
      return parseFloat(content)
    } else if (type === 'string') {
      return content
    } else if (type === 'object') {
      return JSON.parse(content)
    } else if (type === 'array') {
      return JSON.parse(content)
    } else if (type === 'image') {
      return {
        type: 'image',
        src: content
      }
    } else {
      if (format === 'json') return JSON.parse(content)
      else return content
    }
  }

  /*
    A helper to gather values of a composite value (object, array, range)
  */
  function gather(type, value) {
    switch(type) {
      case 'array': {
        return {
          type: coercedArrayType(value),
          data: value.map((v) => {
            if (v) {
              return v.data
            } else {
              return undefined
            }
          })
        }
      }
      default:
        throw new Error('Not implemented.')
    }
  }

  /**
   * Load a value from a HTML representation
   *
   * This function is used for deserializing cell values from HTML.
   *
   * @param {*} elem - HTML element
   * @return {*} - The value
   */
  function fromHTML (elem) {
    let type = elem.attr('data-value');
    let format = elem.attr('data-format');
    let content;
    if (type === 'image') {
      if (format === 'svg') {
        content = elem.innerHTML;
      } else {
        content = elem.attr('src');
      }
    } else {
      content = elem.innerHTML;
    }
    return unpack({
      type: type,
      format: format,
      content: content
    })
  }

  /**
   * Dump a value to a HTML representation
   *
   * This function is used for serializing cell values to HTML.
   *
   * @param {*} value - Value to convert to HTML
   * @return {string} - HTML string
   */
  function toHTML (value) {
    let type_ = type(value);
    if (type_ === 'image') {
      if (value.format === 'svg') {
        return `<div data-value="image" data-format="svg">${value.content}</div>`
      }
      if (value.format === 'src') {
        return `<img data-value="image" data-format="src" src="${value.content}">`
      }
      throw new Error(`Unhandled image format: ${value.format}`)
    } else {
      if (typeof value.content === 'undefined') {
        // Do a pack to get a text representation of the value
        let packed = pack(value);
        return `<div data-value="${type_}">${packed.content}</div>`
      } else {
        return `<div data-value="${type_}">${value.content}</div>`
      }
    }
  }

  /**
   * Load a value from a MIME type/content representation
   *
   * This function is used for deserializing cell values from MIME content
   * (e.g. Jupyter cells).
   *
   * @param {string} mimetype - The MIME type
   * @param {string} content - The MIME content
   * @return {*} - The value
   */
  function fromMime (mimetype, content) {
    if (mimetype === 'image/svg+xml') {
      return {
        type: 'image',
        format: 'svg',
        content: content
      }
    }

    let match = mimetype.match(/^image\/([a-z]+)$/);
    if (match) {
      return {
        type: 'image',
        format: 'src',
        content: `data:${mimetype};base64,${content}`
      }
    }

    if (mimetype === 'text/html') {
      return {
        type: 'dom',
        format: 'html',
        content: content
      }
    }

    if (mimetype === 'text/latex') {
      // Remove any preceding or trailing double dollars
      if (content.substring(0, 2) === '$$') content = content.substring(2);
      if (content.slice(-2) === '$$') content = content.slice(0, -2);
      return {
        type: 'math',
        format: 'latex',
        content: content
      }
    }

    return content
  }

  /**
   * Dump a value to a MIME type/content representation
   *
   * This function is used for serializing cell values to MIME.
   *
   * @param {*} value - Value to convert to HTML
   * @return {object} - MIUME type and content as string
   */
  function toMime (value) {
    let type_ = type(value);
    if (type_ === 'image') {
      if (value.src) {
        // Determine mimetype from src
        let match = value.src.match(/^data:image\/([a-z]+);base64,(.*)/);
        if (match) {
          return {
            mimetype: `image/${match[1]}`,
            content: match[2]
          }
        }
      }
      throw new Error('Unhandled image format')
    } else {
      let content;
      if (typeof value.content === 'undefined') {
        // Do a pack to get a text representation of the value
        content = pack(value).content;
      } else {
        // Use the value's content
        content = value.content;
      }

      return {
        mimetype: 'text/plain',
        content: content
      }
    }
  }

  var value = /*#__PURE__*/Object.freeze({
    type: type,
    pack: pack,
    unpack: unpack,
    gather: gather,
    fromHTML: fromHTML,
    toHTML: toHTML,
    fromMime: fromMime,
    toMime: toMime
  });

  /* eslint-disable no-multi-spaces */
  /* eslint-disable indent */
  function uuid(a) {
    return a           // if the placeholder was passed, return
      ? (              // a random number from 0 to 15
        a ^            // unless b is 8,
        Math.random()  // in which case
        * 16           // a random number from
        >> a/4         // 8 to 11
        ).toString(16) // in hexadecimal
      : (              // or otherwise a concatenated string:
        [1e7] +        // 10000000 +
        -1e3 +         // -1000 +
        -4e3 +         // -4000 +
        -8e3 +         // -80000000 +
        -1e11          // -100000000000,
        ).replace(     // replacing
          /[018]/g,    // zeroes, ones, and eights with
          uuid            // random hex digits
        )
  }

  var navigator = {};
  navigator.userAgent = false;

  var window$1 = {};
  /*
   * jsrsasign(all) 8.0.12 (2018-04-22) (c) 2010-2018 Kenji Urushima | kjur.github.com/jsrsasign/license
   */

  /*!
  Copyright (c) 2011, Yahoo! Inc. All rights reserved.
  Code licensed under the BSD License:
  http://developer.yahoo.com/yui/license.html
  version: 2.9.0
  */
  if(YAHOO===undefined){var YAHOO={};}YAHOO.lang={extend:function(g,h,f){if(!h||!g){throw new Error("YAHOO.lang.extend failed, please check that all dependencies are included.")}var d=function(){};d.prototype=h.prototype;g.prototype=new d();g.prototype.constructor=g;g.superclass=h.prototype;if(h.prototype.constructor==Object.prototype.constructor){h.prototype.constructor=h;}if(f){var b;for(b in f){g.prototype[b]=f[b];}var e=function(){},c=["toString","valueOf"];try{if(/MSIE/.test(navigator.userAgent)){e=function(j,i){for(b=0;b<c.length;b=b+1){var l=c[b],k=i[l];if(typeof k==="function"&&k!=Object.prototype[l]){j[l]=k;}}};}}catch(a){}e(g.prototype,f);}}};

  /*! CryptoJS v3.1.2 core-fix.js
   * code.google.com/p/crypto-js
   * (c) 2009-2013 by Jeff Mott. All rights reserved.
   * code.google.com/p/crypto-js/wiki/License
   * THIS IS FIX of 'core.js' to fix Hmac issue.
   * https://code.google.com/p/crypto-js/issues/detail?id=84
   * https://crypto-js.googlecode.com/svn-history/r667/branches/3.x/src/core.js
   */
  var CryptoJS=CryptoJS||(function(e,g){var a={};var b=a.lib={};var j=b.Base=(function(){function n(){}return{extend:function(p){n.prototype=this;var o=new n();if(p){o.mixIn(p);}if(!o.hasOwnProperty("init")){o.init=function(){o.$super.init.apply(this,arguments);};}o.init.prototype=o;o.$super=this;return o},create:function(){var o=this.extend();o.init.apply(o,arguments);return o},init:function(){},mixIn:function(p){for(var o in p){if(p.hasOwnProperty(o)){this[o]=p[o];}}if(p.hasOwnProperty("toString")){this.toString=p.toString;}},clone:function(){return this.init.prototype.extend(this)}}}());var l=b.WordArray=j.extend({init:function(o,n){o=this.words=o||[];if(n!=g){this.sigBytes=n;}else{this.sigBytes=o.length*4;}},toString:function(n){return(n||h).stringify(this)},concat:function(t){var q=this.words;var p=t.words;var n=this.sigBytes;var s=t.sigBytes;this.clamp();if(n%4){for(var r=0;r<s;r++){var o=(p[r>>>2]>>>(24-(r%4)*8))&255;q[(n+r)>>>2]|=o<<(24-((n+r)%4)*8);}}else{for(var r=0;r<s;r+=4){q[(n+r)>>>2]=p[r>>>2];}}this.sigBytes+=s;return this},clamp:function(){var o=this.words;var n=this.sigBytes;o[n>>>2]&=4294967295<<(32-(n%4)*8);o.length=e.ceil(n/4);},clone:function(){var n=j.clone.call(this);n.words=this.words.slice(0);return n},random:function(p){var o=[];for(var n=0;n<p;n+=4){o.push((e.random()*4294967296)|0);}return new l.init(o,p)}});var m=a.enc={};var h=m.Hex={stringify:function(p){var r=p.words;var o=p.sigBytes;var q=[];for(var n=0;n<o;n++){var s=(r[n>>>2]>>>(24-(n%4)*8))&255;q.push((s>>>4).toString(16));q.push((s&15).toString(16));}return q.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o+=2){q[o>>>3]|=parseInt(p.substr(o,2),16)<<(24-(o%8)*4);}return new l.init(q,n/2)}};var d=m.Latin1={stringify:function(q){var r=q.words;var p=q.sigBytes;var n=[];for(var o=0;o<p;o++){var s=(r[o>>>2]>>>(24-(o%4)*8))&255;n.push(String.fromCharCode(s));}return n.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o++){q[o>>>2]|=(p.charCodeAt(o)&255)<<(24-(o%4)*8);}return new l.init(q,n)}};var c=m.Utf8={stringify:function(n){try{return decodeURIComponent(escape(d.stringify(n)))}catch(o){throw new Error("Malformed UTF-8 data")}},parse:function(n){return d.parse(unescape(encodeURIComponent(n)))}};var i=b.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new l.init();this._nDataBytes=0;},_append:function(n){if(typeof n=="string"){n=c.parse(n);}this._data.concat(n);this._nDataBytes+=n.sigBytes;},_process:function(w){var q=this._data;var x=q.words;var n=q.sigBytes;var t=this.blockSize;var v=t*4;var u=n/v;if(w){u=e.ceil(u);}else{u=e.max((u|0)-this._minBufferSize,0);}var s=u*t;var r=e.min(s*4,n);if(s){for(var p=0;p<s;p+=t){this._doProcessBlock(x,p);}var o=x.splice(0,s);q.sigBytes-=r;}return new l.init(o,r)},clone:function(){var n=j.clone.call(this);n._data=this._data.clone();return n},_minBufferSize:0});var f=b.Hasher=i.extend({cfg:j.extend(),init:function(n){this.cfg=this.cfg.extend(n);this.reset();},reset:function(){i.reset.call(this);this._doReset();},update:function(n){this._append(n);this._process();return this},finalize:function(n){if(n){this._append(n);}var o=this._doFinalize();return o},blockSize:512/32,_createHelper:function(n){return function(p,o){return new n.init(o).finalize(p)}},_createHmacHelper:function(n){return function(p,o){return new k.HMAC.init(n,o).finalize(p)}}});var k=a.algo={};return a}(Math));
  /*
  CryptoJS v3.1.2 x64-core-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(g){var a=CryptoJS,f=a.lib,e=f.Base,h=f.WordArray,a=a.x64={};a.Word=e.extend({init:function(b,c){this.high=b;this.low=c;}});a.WordArray=e.extend({init:function(b,c){b=this.words=b||[];this.sigBytes=c!=g?c:8*b.length;},toX32:function(){for(var b=this.words,c=b.length,a=[],d=0;d<c;d++){var e=b[d];a.push(e.high);a.push(e.low);}return h.create(a,this.sigBytes)},clone:function(){for(var b=e.clone.call(this),c=b.words=this.words.slice(0),a=c.length,d=0;d<a;d++)c[d]=c[d].clone();return b}});})();

  /*
  CryptoJS v3.1.2 cipher-core.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  CryptoJS.lib.Cipher||function(u){var g=CryptoJS,f=g.lib,k=f.Base,l=f.WordArray,q=f.BufferedBlockAlgorithm,r=g.enc.Base64,v=g.algo.EvpKDF,n=f.Cipher=q.extend({cfg:k.extend(),createEncryptor:function(a,b){return this.create(this._ENC_XFORM_MODE,a,b)},createDecryptor:function(a,b){return this.create(this._DEC_XFORM_MODE,a,b)},init:function(a,b,c){this.cfg=this.cfg.extend(c);this._xformMode=a;this._key=b;this.reset();},reset:function(){q.reset.call(this);this._doReset();},process:function(a){this._append(a);
  return this._process()},finalize:function(a){a&&this._append(a);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(a){return{encrypt:function(b,c,d){return("string"==typeof c?s:j).encrypt(a,b,c,d)},decrypt:function(b,c,d){return("string"==typeof c?s:j).decrypt(a,b,c,d)}}}});f.StreamCipher=n.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var m=g.mode={},t=function(a,b,c){var d=this._iv;d?this._iv=u:d=this._prevBlock;for(var e=
  0;e<c;e++)a[b+e]^=d[e];},h=(f.BlockCipherMode=k.extend({createEncryptor:function(a,b){return this.Encryptor.create(a,b)},createDecryptor:function(a,b){return this.Decryptor.create(a,b)},init:function(a,b){this._cipher=a;this._iv=b;}})).extend();h.Encryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize;t.call(this,a,b,d);c.encryptBlock(a,b);this._prevBlock=a.slice(b,b+d);}});h.Decryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize,e=a.slice(b,b+d);c.decryptBlock(a,
  b);t.call(this,a,b,d);this._prevBlock=e;}});m=m.CBC=h;h=(g.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,e=[],f=0;f<c;f+=4)e.push(d);c=l.create(e,c);a.concat(c);},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255;}};f.BlockCipher=n.extend({cfg:n.cfg.extend({mode:m,padding:h}),reset:function(){n.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;
  this._mode=c.call(a,this,b&&b.words);},_doProcessBlock:function(a,b){this._mode.processBlock(a,b);},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0);}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var p=f.CipherParams=k.extend({init:function(a){this.mixIn(a);},toString:function(a){return(a||this.formatter).stringify(this)}}),m=(g.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;
  return(a?l.create([1398893684,1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=l.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16;}return p.create({ciphertext:a,salt:c})}},j=f.SerializableCipher=k.extend({cfg:k.extend({format:m}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var e=a.createEncryptor(c,d);b=e.finalize(b);e=e.cfg;return p.create({ciphertext:b,key:c,iv:e.iv,algorithm:a,mode:e.mode,padding:e.padding,
  blockSize:a.blockSize,formatter:d.format})},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),g=(g.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=l.random(8));a=v.create({keySize:b+c}).compute(a,d);c=l.create(a.words.slice(b),4*c);a.sigBytes=4*b;return p.create({key:a,iv:c,salt:d})}},s=f.PasswordBasedCipher=j.extend({cfg:j.cfg.extend({kdf:g}),encrypt:function(a,
  b,c,d){d=this.cfg.extend(d);c=d.kdf.execute(c,a.keySize,a.ivSize);d.iv=c.iv;a=j.encrypt.call(this,a,b,c.key,d);a.mixIn(c);return a},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);c=d.kdf.execute(c,a.keySize,a.ivSize,b.salt);d.iv=c.iv;return j.decrypt.call(this,a,b,c.key,d)}});}();

  /*
  CryptoJS v3.1.2 aes.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){for(var q=CryptoJS,x=q.lib.BlockCipher,r=q.algo,j=[],y=[],z=[],A=[],B=[],C=[],s=[],u=[],v=[],w=[],g=[],k=0;256>k;k++)g[k]=128>k?k<<1:k<<1^283;for(var n=0,l=0,k=0;256>k;k++){var f=l^l<<1^l<<2^l<<3^l<<4,f=f>>>8^f&255^99;j[n]=f;y[f]=n;var t=g[n],D=g[t],E=g[D],b=257*g[f]^16843008*f;z[n]=b<<24|b>>>8;A[n]=b<<16|b>>>16;B[n]=b<<8|b>>>24;C[n]=b;b=16843009*E^65537*D^257*t^16843008*n;s[f]=b<<24|b>>>8;u[f]=b<<16|b>>>16;v[f]=b<<8|b>>>24;w[f]=b;n?(n=t^g[g[g[E^t]]],l^=g[g[l]]):n=l=1;}var F=[0,1,2,4,8,
  16,32,64,128,27,54],r=r.AES=x.extend({_doReset:function(){for(var c=this._key,e=c.words,a=c.sigBytes/4,c=4*((this._nRounds=a+6)+1),b=this._keySchedule=[],h=0;h<c;h++)if(h<a)b[h]=e[h];else{var d=b[h-1];h%a?6<a&&4==h%a&&(d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255]):(d=d<<8|d>>>24,d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255],d^=F[h/a|0]<<24);b[h]=b[h-a]^d;}e=this._invKeySchedule=[];for(a=0;a<c;a++)h=c-a,d=a%4?b[h]:b[h-4],e[a]=4>a||4>=h?d:s[j[d>>>24]]^u[j[d>>>16&255]]^v[j[d>>>
  8&255]]^w[j[d&255]];},encryptBlock:function(c,e){this._doCryptBlock(c,e,this._keySchedule,z,A,B,C,j);},decryptBlock:function(c,e){var a=c[e+1];c[e+1]=c[e+3];c[e+3]=a;this._doCryptBlock(c,e,this._invKeySchedule,s,u,v,w,y);a=c[e+1];c[e+1]=c[e+3];c[e+3]=a;},_doCryptBlock:function(c,e,a,b,h,d,j,m){for(var n=this._nRounds,f=c[e]^a[0],g=c[e+1]^a[1],k=c[e+2]^a[2],p=c[e+3]^a[3],l=4,t=1;t<n;t++)var q=b[f>>>24]^h[g>>>16&255]^d[k>>>8&255]^j[p&255]^a[l++],r=b[g>>>24]^h[k>>>16&255]^d[p>>>8&255]^j[f&255]^a[l++],s=
  b[k>>>24]^h[p>>>16&255]^d[f>>>8&255]^j[g&255]^a[l++],p=b[p>>>24]^h[f>>>16&255]^d[g>>>8&255]^j[k&255]^a[l++],f=q,g=r,k=s;q=(m[f>>>24]<<24|m[g>>>16&255]<<16|m[k>>>8&255]<<8|m[p&255])^a[l++];r=(m[g>>>24]<<24|m[k>>>16&255]<<16|m[p>>>8&255]<<8|m[f&255])^a[l++];s=(m[k>>>24]<<24|m[p>>>16&255]<<16|m[f>>>8&255]<<8|m[g&255])^a[l++];p=(m[p>>>24]<<24|m[f>>>16&255]<<16|m[g>>>8&255]<<8|m[k&255])^a[l++];c[e]=q;c[e+1]=r;c[e+2]=s;c[e+3]=p;},keySize:8});q.AES=x._createHelper(r);})();

  /*
  CryptoJS v3.1.2 tripledes-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){function j(b,c){var a=(this._lBlock>>>b^this._rBlock)&c;this._rBlock^=a;this._lBlock^=a<<b;}function l(b,c){var a=(this._rBlock>>>b^this._lBlock)&c;this._lBlock^=a;this._rBlock^=a<<b;}var h=CryptoJS,e=h.lib,n=e.WordArray,e=e.BlockCipher,g=h.algo,q=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],p=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,
  55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],r=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],s=[{"0":8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,
  2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,
  1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{"0":1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,
  75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,
  276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{"0":260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,
  14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,
  17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{"0":2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,
  98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,
  1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{"0":128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,
  10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,
  83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{"0":268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,
  2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{"0":1048576,
  16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,
  496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{"0":134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,
  2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,
  2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],t=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],m=g.DES=e.extend({_doReset:function(){for(var b=this._key.words,c=[],a=0;56>a;a++){var f=q[a]-1;c[a]=b[f>>>5]>>>31-f%32&1;}b=this._subKeys=[];for(f=0;16>f;f++){for(var d=b[f]=[],e=r[f],a=0;24>a;a++)d[a/6|0]|=c[(p[a]-1+e)%28]<<31-a%6,d[4+(a/6|0)]|=c[28+(p[a+24]-1+e)%28]<<31-a%6;d[0]=d[0]<<1|d[0]>>>31;for(a=1;7>a;a++)d[a]>>>=
  4*(a-1)+3;d[7]=d[7]<<5|d[7]>>>27;}c=this._invSubKeys=[];for(a=0;16>a;a++)c[a]=b[15-a];},encryptBlock:function(b,c){this._doCryptBlock(b,c,this._subKeys);},decryptBlock:function(b,c){this._doCryptBlock(b,c,this._invSubKeys);},_doCryptBlock:function(b,c,a){this._lBlock=b[c];this._rBlock=b[c+1];j.call(this,4,252645135);j.call(this,16,65535);l.call(this,2,858993459);l.call(this,8,16711935);j.call(this,1,1431655765);for(var f=0;16>f;f++){for(var d=a[f],e=this._lBlock,h=this._rBlock,g=0,k=0;8>k;k++)g|=s[k][((h^
  d[k])&t[k])>>>0];this._lBlock=h;this._rBlock=e^g;}a=this._lBlock;this._lBlock=this._rBlock;this._rBlock=a;j.call(this,1,1431655765);l.call(this,8,16711935);l.call(this,2,858993459);j.call(this,16,65535);j.call(this,4,252645135);b[c]=this._lBlock;b[c+1]=this._rBlock;},keySize:2,ivSize:2,blockSize:2});h.DES=e._createHelper(m);g=g.TripleDES=e.extend({_doReset:function(){var b=this._key.words;this._des1=m.createEncryptor(n.create(b.slice(0,2)));this._des2=m.createEncryptor(n.create(b.slice(2,4)));this._des3=
  m.createEncryptor(n.create(b.slice(4,6)));},encryptBlock:function(b,c){this._des1.encryptBlock(b,c);this._des2.decryptBlock(b,c);this._des3.encryptBlock(b,c);},decryptBlock:function(b,c){this._des3.decryptBlock(b,c);this._des2.encryptBlock(b,c);this._des1.decryptBlock(b,c);},keySize:6,ivSize:2,blockSize:2});h.TripleDES=e._createHelper(g);})();

  /*
  CryptoJS v3.1.2 enc-base64.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
  e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++;}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="};})();

  /*
  CryptoJS v3.1.2 md5.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(E){function h(a,f,g,j,p,h,k){a=a+(f&g|~f&j)+p+k;return(a<<h|a>>>32-h)+f}function k(a,f,g,j,p,h,k){a=a+(f&j|g&~j)+p+k;return(a<<h|a>>>32-h)+f}function l(a,f,g,j,h,k,l){a=a+(f^g^j)+h+l;return(a<<k|a>>>32-k)+f}function n(a,f,g,j,h,k,l){a=a+(g^(f|~j))+h+l;return(a<<k|a>>>32-k)+f}for(var r=CryptoJS,q=r.lib,F=q.WordArray,s=q.Hasher,q=r.algo,a=[],t=0;64>t;t++)a[t]=4294967296*E.abs(E.sin(t+1))|0;q=q.MD5=s.extend({_doReset:function(){this._hash=new F.init([1732584193,4023233417,2562383102,271733878]);},
  _doProcessBlock:function(m,f){for(var g=0;16>g;g++){var j=f+g,p=m[j];m[j]=(p<<8|p>>>24)&16711935|(p<<24|p>>>8)&4278255360;}var g=this._hash.words,j=m[f+0],p=m[f+1],q=m[f+2],r=m[f+3],s=m[f+4],t=m[f+5],u=m[f+6],v=m[f+7],w=m[f+8],x=m[f+9],y=m[f+10],z=m[f+11],A=m[f+12],B=m[f+13],C=m[f+14],D=m[f+15],b=g[0],c=g[1],d=g[2],e=g[3],b=h(b,c,d,e,j,7,a[0]),e=h(e,b,c,d,p,12,a[1]),d=h(d,e,b,c,q,17,a[2]),c=h(c,d,e,b,r,22,a[3]),b=h(b,c,d,e,s,7,a[4]),e=h(e,b,c,d,t,12,a[5]),d=h(d,e,b,c,u,17,a[6]),c=h(c,d,e,b,v,22,a[7]),
  b=h(b,c,d,e,w,7,a[8]),e=h(e,b,c,d,x,12,a[9]),d=h(d,e,b,c,y,17,a[10]),c=h(c,d,e,b,z,22,a[11]),b=h(b,c,d,e,A,7,a[12]),e=h(e,b,c,d,B,12,a[13]),d=h(d,e,b,c,C,17,a[14]),c=h(c,d,e,b,D,22,a[15]),b=k(b,c,d,e,p,5,a[16]),e=k(e,b,c,d,u,9,a[17]),d=k(d,e,b,c,z,14,a[18]),c=k(c,d,e,b,j,20,a[19]),b=k(b,c,d,e,t,5,a[20]),e=k(e,b,c,d,y,9,a[21]),d=k(d,e,b,c,D,14,a[22]),c=k(c,d,e,b,s,20,a[23]),b=k(b,c,d,e,x,5,a[24]),e=k(e,b,c,d,C,9,a[25]),d=k(d,e,b,c,r,14,a[26]),c=k(c,d,e,b,w,20,a[27]),b=k(b,c,d,e,B,5,a[28]),e=k(e,b,
  c,d,q,9,a[29]),d=k(d,e,b,c,v,14,a[30]),c=k(c,d,e,b,A,20,a[31]),b=l(b,c,d,e,t,4,a[32]),e=l(e,b,c,d,w,11,a[33]),d=l(d,e,b,c,z,16,a[34]),c=l(c,d,e,b,C,23,a[35]),b=l(b,c,d,e,p,4,a[36]),e=l(e,b,c,d,s,11,a[37]),d=l(d,e,b,c,v,16,a[38]),c=l(c,d,e,b,y,23,a[39]),b=l(b,c,d,e,B,4,a[40]),e=l(e,b,c,d,j,11,a[41]),d=l(d,e,b,c,r,16,a[42]),c=l(c,d,e,b,u,23,a[43]),b=l(b,c,d,e,x,4,a[44]),e=l(e,b,c,d,A,11,a[45]),d=l(d,e,b,c,D,16,a[46]),c=l(c,d,e,b,q,23,a[47]),b=n(b,c,d,e,j,6,a[48]),e=n(e,b,c,d,v,10,a[49]),d=n(d,e,b,c,
  C,15,a[50]),c=n(c,d,e,b,t,21,a[51]),b=n(b,c,d,e,A,6,a[52]),e=n(e,b,c,d,r,10,a[53]),d=n(d,e,b,c,y,15,a[54]),c=n(c,d,e,b,p,21,a[55]),b=n(b,c,d,e,w,6,a[56]),e=n(e,b,c,d,D,10,a[57]),d=n(d,e,b,c,u,15,a[58]),c=n(c,d,e,b,B,21,a[59]),b=n(b,c,d,e,s,6,a[60]),e=n(e,b,c,d,z,10,a[61]),d=n(d,e,b,c,q,15,a[62]),c=n(c,d,e,b,x,21,a[63]);g[0]=g[0]+b|0;g[1]=g[1]+c|0;g[2]=g[2]+d|0;g[3]=g[3]+e|0;},_doFinalize:function(){var a=this._data,f=a.words,g=8*this._nDataBytes,j=8*a.sigBytes;f[j>>>5]|=128<<24-j%32;var h=E.floor(g/
  4294967296);f[(j+64>>>9<<4)+15]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;f[(j+64>>>9<<4)+14]=(g<<8|g>>>24)&16711935|(g<<24|g>>>8)&4278255360;a.sigBytes=4*(f.length+1);this._process();a=this._hash;f=a.words;for(g=0;4>g;g++)j=f[g],f[g]=(j<<8|j>>>24)&16711935|(j<<24|j>>>8)&4278255360;return a},clone:function(){var a=s.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=s._createHelper(q);r.HmacMD5=s._createHmacHelper(q);})(Math);

  /*
  CryptoJS v3.1.2 sha1-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var k=CryptoJS,b=k.lib,m=b.WordArray,l=b.Hasher,d=[],b=k.algo.SHA1=l.extend({_doReset:function(){this._hash=new m.init([1732584193,4023233417,2562383102,271733878,3285377520]);},_doProcessBlock:function(n,p){for(var a=this._hash.words,e=a[0],f=a[1],h=a[2],j=a[3],b=a[4],c=0;80>c;c++){if(16>c)d[c]=n[p+c]|0;else{var g=d[c-3]^d[c-8]^d[c-14]^d[c-16];d[c]=g<<1|g>>>31;}g=(e<<5|e>>>27)+b+d[c];g=20>c?g+((f&h|~f&j)+1518500249):40>c?g+((f^h^j)+1859775393):60>c?g+((f&h|f&j|h&j)-1894007588):g+((f^h^
  j)-899497514);b=j;j=h;h=f<<30|f>>>2;f=e;e=g;}a[0]=a[0]+e|0;a[1]=a[1]+f|0;a[2]=a[2]+h|0;a[3]=a[3]+j|0;a[4]=a[4]+b|0;},_doFinalize:function(){var b=this._data,d=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=Math.floor(a/4294967296);d[(e+64>>>9<<4)+15]=a;b.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var b=l.clone.call(this);b._hash=this._hash.clone();return b}});k.SHA1=l._createHelper(b);k.HmacSHA1=l._createHmacHelper(b);})();

  /*
  CryptoJS v3.1.2 sha256-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(k){for(var g=CryptoJS,h=g.lib,v=h.WordArray,j=h.Hasher,h=g.algo,s=[],t=[],u=function(q){return 4294967296*(q-(q|0))|0},l=2,b=0;64>b;){var d;a:{d=l;for(var w=k.sqrt(d),r=2;r<=w;r++)if(!(d%r)){d=!1;break a}d=!0;}d&&(8>b&&(s[b]=u(k.pow(l,0.5))),t[b]=u(k.pow(l,1/3)),b++);l++;}var n=[],h=h.SHA256=j.extend({_doReset:function(){this._hash=new v.init(s.slice(0));},_doProcessBlock:function(q,h){for(var a=this._hash.words,c=a[0],d=a[1],b=a[2],k=a[3],f=a[4],g=a[5],j=a[6],l=a[7],e=0;64>e;e++){if(16>e)n[e]=
  q[h+e]|0;else{var m=n[e-15],p=n[e-2];n[e]=((m<<25|m>>>7)^(m<<14|m>>>18)^m>>>3)+n[e-7]+((p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10)+n[e-16];}m=l+((f<<26|f>>>6)^(f<<21|f>>>11)^(f<<7|f>>>25))+(f&g^~f&j)+t[e]+n[e];p=((c<<30|c>>>2)^(c<<19|c>>>13)^(c<<10|c>>>22))+(c&d^c&b^d&b);l=j;j=g;g=f;f=k+m|0;k=b;b=d;d=c;c=m+p|0;}a[0]=a[0]+c|0;a[1]=a[1]+d|0;a[2]=a[2]+b|0;a[3]=a[3]+k|0;a[4]=a[4]+f|0;a[5]=a[5]+g|0;a[6]=a[6]+j|0;a[7]=a[7]+l|0;},_doFinalize:function(){var d=this._data,b=d.words,a=8*this._nDataBytes,c=8*d.sigBytes;
  b[c>>>5]|=128<<24-c%32;b[(c+64>>>9<<4)+14]=k.floor(a/4294967296);b[(c+64>>>9<<4)+15]=a;d.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var b=j.clone.call(this);b._hash=this._hash.clone();return b}});g.SHA256=j._createHelper(h);g.HmacSHA256=j._createHmacHelper(h);})(Math);

  /*
  CryptoJS v3.1.2 sha224-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var b=CryptoJS,d=b.lib.WordArray,a=b.algo,c=a.SHA256,a=a.SHA224=c.extend({_doReset:function(){this._hash=new d.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]);},_doFinalize:function(){var a=c._doFinalize.call(this);a.sigBytes-=4;return a}});b.SHA224=c._createHelper(a);b.HmacSHA224=c._createHmacHelper(a);})();

  /*
  CryptoJS v3.1.2 sha512-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){function a(){return d.create.apply(d,arguments)}for(var n=CryptoJS,r=n.lib.Hasher,e=n.x64,d=e.Word,T=e.WordArray,e=n.algo,ea=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),
  a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,
  2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),
  a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,
  3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],v=[],w=0;80>w;w++)v[w]=a();e=e.SHA512=r.extend({_doReset:function(){this._hash=new T.init([new d.init(1779033703,4089235720),new d.init(3144134277,2227873595),new d.init(1013904242,4271175723),new d.init(2773480762,1595750129),new d.init(1359893119,2917565137),new d.init(2600822924,725511199),new d.init(528734635,4215389547),new d.init(1541459225,327033209)]);},_doProcessBlock:function(a,d){for(var f=this._hash.words,
  F=f[0],e=f[1],n=f[2],r=f[3],G=f[4],H=f[5],I=f[6],f=f[7],w=F.high,J=F.low,X=e.high,K=e.low,Y=n.high,L=n.low,Z=r.high,M=r.low,$=G.high,N=G.low,aa=H.high,O=H.low,ba=I.high,P=I.low,ca=f.high,Q=f.low,k=w,g=J,z=X,x=K,A=Y,y=L,U=Z,B=M,l=$,h=N,R=aa,C=O,S=ba,D=P,V=ca,E=Q,m=0;80>m;m++){var s=v[m];if(16>m)var j=s.high=a[d+2*m]|0,b=s.low=a[d+2*m+1]|0;else{var j=v[m-15],b=j.high,p=j.low,j=(b>>>1|p<<31)^(b>>>8|p<<24)^b>>>7,p=(p>>>1|b<<31)^(p>>>8|b<<24)^(p>>>7|b<<25),u=v[m-2],b=u.high,c=u.low,u=(b>>>19|c<<13)^(b<<
  3|c>>>29)^b>>>6,c=(c>>>19|b<<13)^(c<<3|b>>>29)^(c>>>6|b<<26),b=v[m-7],W=b.high,t=v[m-16],q=t.high,t=t.low,b=p+b.low,j=j+W+(b>>>0<p>>>0?1:0),b=b+c,j=j+u+(b>>>0<c>>>0?1:0),b=b+t,j=j+q+(b>>>0<t>>>0?1:0);s.high=j;s.low=b;}var W=l&R^~l&S,t=h&C^~h&D,s=k&z^k&A^z&A,T=g&x^g&y^x&y,p=(k>>>28|g<<4)^(k<<30|g>>>2)^(k<<25|g>>>7),u=(g>>>28|k<<4)^(g<<30|k>>>2)^(g<<25|k>>>7),c=ea[m],fa=c.high,da=c.low,c=E+((h>>>14|l<<18)^(h>>>18|l<<14)^(h<<23|l>>>9)),q=V+((l>>>14|h<<18)^(l>>>18|h<<14)^(l<<23|h>>>9))+(c>>>0<E>>>0?1:
  0),c=c+t,q=q+W+(c>>>0<t>>>0?1:0),c=c+da,q=q+fa+(c>>>0<da>>>0?1:0),c=c+b,q=q+j+(c>>>0<b>>>0?1:0),b=u+T,s=p+s+(b>>>0<u>>>0?1:0),V=S,E=D,S=R,D=C,R=l,C=h,h=B+c|0,l=U+q+(h>>>0<B>>>0?1:0)|0,U=A,B=y,A=z,y=x,z=k,x=g,g=c+b|0,k=q+s+(g>>>0<c>>>0?1:0)|0;}J=F.low=J+g;F.high=w+k+(J>>>0<g>>>0?1:0);K=e.low=K+x;e.high=X+z+(K>>>0<x>>>0?1:0);L=n.low=L+y;n.high=Y+A+(L>>>0<y>>>0?1:0);M=r.low=M+B;r.high=Z+U+(M>>>0<B>>>0?1:0);N=G.low=N+h;G.high=$+l+(N>>>0<h>>>0?1:0);O=H.low=O+C;H.high=aa+R+(O>>>0<C>>>0?1:0);P=I.low=P+D;
  I.high=ba+S+(P>>>0<D>>>0?1:0);Q=f.low=Q+E;f.high=ca+V+(Q>>>0<E>>>0?1:0);},_doFinalize:function(){var a=this._data,d=a.words,f=8*this._nDataBytes,e=8*a.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+128>>>10<<5)+30]=Math.floor(f/4294967296);d[(e+128>>>10<<5)+31]=f;a.sigBytes=4*d.length;this._process();return this._hash.toX32()},clone:function(){var a=r.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});n.SHA512=r._createHelper(e);n.HmacSHA512=r._createHmacHelper(e);})();

  /*
  CryptoJS v3.1.2 sha384-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var c=CryptoJS,a=c.x64,b=a.Word,e=a.WordArray,a=c.algo,d=a.SHA512,a=a.SHA384=d.extend({_doReset:function(){this._hash=new e.init([new b.init(3418070365,3238371032),new b.init(1654270250,914150663),new b.init(2438529370,812702999),new b.init(355462360,4144912697),new b.init(1731405415,4290775857),new b.init(2394180231,1750603025),new b.init(3675008525,1694076839),new b.init(1203062813,3204075428)]);},_doFinalize:function(){var a=d._doFinalize.call(this);a.sigBytes-=16;return a}});c.SHA384=
  d._createHelper(a);c.HmacSHA384=d._createHmacHelper(a);})();

  /*
  CryptoJS v3.1.2 ripemd160-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  /*

  (c) 2012 by Cedric Mesnil. All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

      - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
      - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function(){var q=CryptoJS,d=q.lib,n=d.WordArray,p=d.Hasher,d=q.algo,x=n.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),y=n.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),z=n.create([11,14,15,12,
  5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=n.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),B=n.create([0,1518500249,1859775393,2400959708,2840853838]),C=n.create([1352829926,1548603684,1836072691,
  2053994217,0]),d=d.RIPEMD160=p.extend({_doReset:function(){this._hash=n.create([1732584193,4023233417,2562383102,271733878,3285377520]);},_doProcessBlock:function(e,v){for(var b=0;16>b;b++){var c=v+b,f=e[c];e[c]=(f<<8|f>>>24)&16711935|(f<<24|f>>>8)&4278255360;}var c=this._hash.words,f=B.words,d=C.words,n=x.words,q=y.words,p=z.words,w=A.words,t,g,h,j,r,u,k,l,m,s;u=t=c[0];k=g=c[1];l=h=c[2];m=j=c[3];s=r=c[4];for(var a,b=0;80>b;b+=1)a=t+e[v+n[b]]|0,a=16>b?a+((g^h^j)+f[0]):32>b?a+((g&h|~g&j)+f[1]):48>b?
  a+(((g|~h)^j)+f[2]):64>b?a+((g&j|h&~j)+f[3]):a+((g^(h|~j))+f[4]),a|=0,a=a<<p[b]|a>>>32-p[b],a=a+r|0,t=r,r=j,j=h<<10|h>>>22,h=g,g=a,a=u+e[v+q[b]]|0,a=16>b?a+((k^(l|~m))+d[0]):32>b?a+((k&m|l&~m)+d[1]):48>b?a+(((k|~l)^m)+d[2]):64>b?a+((k&l|~k&m)+d[3]):a+((k^l^m)+d[4]),a|=0,a=a<<w[b]|a>>>32-w[b],a=a+s|0,u=s,s=m,m=l<<10|l>>>22,l=k,k=a;a=c[1]+h+m|0;c[1]=c[2]+j+s|0;c[2]=c[3]+r+u|0;c[3]=c[4]+t+k|0;c[4]=c[0]+g+l|0;c[0]=a;},_doFinalize:function(){var e=this._data,d=e.words,b=8*this._nDataBytes,c=8*e.sigBytes;
  d[c>>>5]|=128<<24-c%32;d[(c+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;e.sigBytes=4*(d.length+1);this._process();e=this._hash;d=e.words;for(b=0;5>b;b++)c=d[b],d[b]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return e},clone:function(){var d=p.clone.call(this);d._hash=this._hash.clone();return d}});q.RIPEMD160=p._createHelper(d);q.HmacRIPEMD160=p._createHmacHelper(d);})(Math);

  /*
  CryptoJS v3.1.2 hmac.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var c=CryptoJS,k=c.enc.Utf8;c.algo.HMAC=c.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=k.parse(b));var c=a.blockSize,e=4*c;b.sigBytes>e&&(b=a.finalize(b));b.clamp();for(var f=this._oKey=b.clone(),g=this._iKey=b.clone(),h=f.words,j=g.words,d=0;d<c;d++)h[d]^=1549556828,j[d]^=909522486;f.sigBytes=g.sigBytes=e;this.reset();},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey);},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
  this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}});})();

  /*
  CryptoJS v3.1.2 pbkdf2-min.js
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  (function(){var b=CryptoJS,a=b.lib,d=a.Base,m=a.WordArray,a=b.algo,q=a.HMAC,l=a.PBKDF2=d.extend({cfg:d.extend({keySize:4,hasher:a.SHA1,iterations:1}),init:function(a){this.cfg=this.cfg.extend(a);},compute:function(a,b){for(var c=this.cfg,f=q.create(c.hasher,a),g=m.create(),d=m.create([1]),l=g.words,r=d.words,n=c.keySize,c=c.iterations;l.length<n;){var h=f.update(b).finalize(d);f.reset();for(var j=h.words,s=j.length,k=h,p=1;p<c;p++){k=f.finalize(k);f.reset();for(var t=k.words,e=0;e<s;e++)j[e]^=t[e];}g.concat(h);
  r[0]++;}g.sigBytes=4*n;return g}});b.PBKDF2=function(a,b,c){return l.create(c).compute(a,b)};})();

  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64pad="=";function hex2b64(d){var b;var e;var a="";for(b=0;b+3<=d.length;b+=3){e=parseInt(d.substring(b,b+3),16);a+=b64map.charAt(e>>6)+b64map.charAt(e&63);}if(b+1==d.length){e=parseInt(d.substring(b,b+1),16);a+=b64map.charAt(e<<2);}else{if(b+2==d.length){e=parseInt(d.substring(b,b+2),16);a+=b64map.charAt(e>>2)+b64map.charAt((e&3)<<4);}}if(b64pad){while((a.length&3)>0){a+=b64pad;}}return a}function b64tohex(f){var d="";var e;var b=0;var c;var a;for(e=0;e<f.length;++e){if(f.charAt(e)==b64pad){break}a=b64map.indexOf(f.charAt(e));if(a<0){continue}if(b==0){d+=int2char(a>>2);c=a&3;b=1;}else{if(b==1){d+=int2char((c<<2)|(a>>4));c=a&15;b=2;}else{if(b==2){d+=int2char(c);d+=int2char(a>>2);c=a&3;b=3;}else{d+=int2char((c<<2)|(a>>4));d+=int2char(a&15);b=0;}}}}if(b==1){d+=int2char(c<<2);}return d}/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f);}else{if(d==null&&"string"!=typeof e){this.fromString(e,256);}else{this.fromString(e,d);}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863;}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823;}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455;}return o}if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30;}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26;}else{BigInteger.prototype.am=am3;dbits=28;}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv;}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv;}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv;}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a];}b.t=this.t;b.s=this.s;}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a;}else{if(a<-1){this[0]=a+this.DV;}else{this.t=0;}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4;}else{if(c==8){e=3;}else{if(c==256){e=8;}else{if(c==2){e=1;}else{if(c==32){e=5;}else{if(c==4){e=2;}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true;}continue}d=false;if(f==0){this[this.t++]=a;}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f));}else{this[this.t-1]|=a<<f;}}f+=e;if(f>=this.DB){f-=this.DB;}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f;}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this);}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t;}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4;}else{if(c==8){e=3;}else{if(c==2){e=1;}else{if(c==32){e=5;}else{if(c==4){e=2;}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l);}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e);}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f;}}if(l>0){a=true;}if(a){h+=int2char(l);}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return(this.s<0)?-d:d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16;}if((b=a>>8)!=0){a=b;c+=8;}if((b=a>>4)!=0){a=b;c+=4;}if((b=a>>2)!=0){a=b;c+=2;}if((b=a>>1)!=0){a=b;c+=1;}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a];}for(a=c-1;a>=0;--a){b[a]=0;}b.t=this.t+c;b.s=this.s;}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a];}b.t=Math.max(this.t-c,0);b.s=this.s;}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b;}for(d=f-1;d>=0;--d){e[d]=0;}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp();}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b;}if(b>0){d[this.t-e-1]|=(this.s&f)<<a;}d.t=this.t-e;d.clamp();}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB;}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB;}g+=this.s;}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB;}g-=d.s;}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g;}else{if(g>0){f[e++]=g;}}f.t=e;f.clamp();}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0;}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t);}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e);}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0;}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1;}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1);}d.s=0;d.clamp();}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0);}if(g!=null){this.copyTo(g);}return}if(g==null){g=nbi();}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g);}else{w.copyTo(d);k.copyTo(g);}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g);}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0;}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g);}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h);}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g);}if(a<0){BigInteger.ZERO.subTo(g,g);}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c);}return c}function Classic(a){this.m=a;}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a);}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b);}function cSqrTo(a,b){a.squareTo(b);this.reduce(b);}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t;}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b);}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0;}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++;}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a);}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b);}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b);}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f);}else{var b=f;f=a;a=b;}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a);}else{c=new Montgomery(a);}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10;}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h);}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10;}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true;}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0;}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0);}if(e){BigInteger.ZERO.subTo(this,this);}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1);}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this);}if(this.isEven()){this.dAddOffset(1,0);}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this);}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1);}else{d[0]=0;}this.fromString(d,256);}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e));}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8);}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b;}}if((f&128)!=0){f|=-256;}if(a==0&&(this.s&128)!=(f&128)){++a;}if(a>0||f!=this.s){c[a++]=f;}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d]);}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g);}e.t=this.t;}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d]);}e.t=c.t;}e.s=h(this.s,c.s);e.clamp();}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a];}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a);}else{this.lShiftTo(b,a);}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a);}else{this.rShiftTo(b,a);}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16;}if((a&255)==0){a>>=8;b+=8;}if((a&15)==0){a>>=4;b+=4;}if((a&3)==0){a>>=2;b+=2;}if((a&1)==0){++b;}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b;}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a);}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB;}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB;}g+=this.s;}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB;}g+=d.s;}f.s=(g<0)?-1:0;if(g>0){f[e++]=g;}else{if(g<-1){f[e++]=this.DV+g;}}f.t=e;f.clamp();}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp();}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0;}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0;}++this[a];}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b);}function nSqrTo(a,b){a.squareTo(b);}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0;}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t);}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d);}e.clamp();}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0;}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e);}d.clamp();d.drShiftTo(1,d);}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a;}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp();}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1);}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a);}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b);}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b);}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1;}else{if(o<48){h=3;}else{if(o<144){h=4;}else{if(o<768){h=5;}else{h=6;}}}}}if(o<8){v=new Classic(f);}else{if(f.isEven()){v=new Barrett(f);}else{v=new Montgomery(f);}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2;}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a;}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s);}}d=h;while((x&1)==0){x>>=1;--d;}if((o-=d)<0){o+=this.DB;--l;}if(u){p[x].copyTo(b);u=false;}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2;}if(d>0){v.sqrTo(b,c);}else{y=b;b=c;c=y;}v.mulTo(c,p[x],b);}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l;}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e;}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d;}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h);}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b);}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h);}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b);}else{h.subTo(b,h);h.rShiftTo(1,h);}}if(f>0){h.lShiftTo(f,h);}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e;}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e;}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e);}g.rShiftTo(1,g);}else{if(!e.isEven()){e.subTo(f,e);}}e.rShiftTo(1,e);}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k);}l.rShiftTo(1,l);}else{if(!k.isEven()){k.subTo(f,k);}}k.rShiftTo(1,k);}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g);}e.subTo(k,e);}else{h.subTo(i,h);if(j){l.subTo(g,l);}k.subTo(e,k);}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k);}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++];}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length;}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  function Arcfour(){this.i=0;this.j=0;this.S=new Array();}function ARC4init(d){var c,a,b;for(c=0;c<256;++c){this.S[c]=c;}a=0;for(c=0;c<256;++c){a=(a+this.S[c]+d[c%d.length])&255;b=this.S[c];this.S[c]=this.S[a];this.S[a]=b;}this.i=0;this.j=0;}function ARC4next(){var a;this.i=(this.i+1)&255;this.j=(this.j+this.S[this.i])&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[(a+this.S[this.i])&255]}Arcfour.prototype.init=ARC4init;Arcfour.prototype.next=ARC4next;function prng_newstate(){return new Arcfour()}var rng_psize=256;
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  var rng_state;var rng_pool;var rng_pptr;function rng_seed_int(a){rng_pool[rng_pptr++]^=a&255;rng_pool[rng_pptr++]^=(a>>8)&255;rng_pool[rng_pptr++]^=(a>>16)&255;rng_pool[rng_pptr++]^=(a>>24)&255;if(rng_pptr>=rng_psize){rng_pptr-=rng_psize;}}function rng_seed_time(){rng_seed_int(new Date().getTime());}if(rng_pool==null){rng_pool=new Array();rng_pptr=0;var t;if(window$1!==undefined&&(window$1.crypto!==undefined||window$1.msCrypto!==undefined)){var crypto=window$1.crypto||window$1.msCrypto;if(crypto.getRandomValues){var ua=new Uint8Array(32);crypto.getRandomValues(ua);for(t=0;t<32;++t){rng_pool[rng_pptr++]=ua[t];}}else{if(navigator.appName=="Netscape"&&navigator.appVersion<"5"){var z=window$1.crypto.random(32);for(t=0;t<z.length;++t){rng_pool[rng_pptr++]=z.charCodeAt(t)&255;}}}}while(rng_pptr<rng_psize){t=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=t>>>8;rng_pool[rng_pptr++]=t&255;}rng_pptr=0;rng_seed_time();}function rng_get_byte(){if(rng_state==null){rng_seed_time();rng_state=prng_newstate();rng_state.init(rng_pool);for(rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr){rng_pool[rng_pptr]=0;}rng_pptr=0;}return rng_state.next()}function rng_get_bytes(b){var a;for(a=0;a<b.length;++a){b[a]=rng_get_byte();}}function SecureRandom(){}SecureRandom.prototype.nextBytes=rng_get_bytes;
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  function parseBigInt(b,a){return new BigInteger(b,a)}function pkcs1pad2(e,h){if(h<e.length+11){throw"Message too long for RSA";return null}var g=new Array();var d=e.length-1;while(d>=0&&h>0){var f=e.charCodeAt(d--);if(f<128){g[--h]=f;}else{if((f>127)&&(f<2048)){g[--h]=(f&63)|128;g[--h]=(f>>6)|192;}else{g[--h]=(f&63)|128;g[--h]=((f>>6)&63)|128;g[--h]=(f>>12)|224;}}}g[--h]=0;var b=new SecureRandom();var a=new Array();while(h>2){a[0]=0;while(a[0]==0){b.nextBytes(a);}g[--h]=a[0];}g[--h]=2;g[--h]=0;return new BigInteger(g)}function oaep_mgf1_arr(c,a,e){var b="",d=0;while(b.length<a){b+=e(String.fromCharCode.apply(String,c.concat([(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255])));d+=1;}return b}function oaep_pad(q,a,f,l){var c=KJUR.crypto.MessageDigest;var o=KJUR.crypto.Util;var b=null;if(!f){f="sha1";}if(typeof f==="string"){b=c.getCanonicalAlgName(f);l=c.getHashLength(b);f=function(i){return hextorstr(o.hashHex(rstrtohex(i),b))};}if(q.length+2*l+2>a){throw"Message too long for RSA"}var k="",e;for(e=0;e<a-q.length-2*l-2;e+=1){k+="\x00";}var h=f("")+k+"\x01"+q;var g=new Array(l);new SecureRandom().nextBytes(g);var j=oaep_mgf1_arr(g,h.length,f);var p=[];for(e=0;e<h.length;e+=1){p[e]=h.charCodeAt(e)^j.charCodeAt(e);}var m=oaep_mgf1_arr(p,g.length,f);var d=[0];for(e=0;e<g.length;e+=1){d[e+1]=g[e]^m.charCodeAt(e);}return new BigInteger(d.concat(p))}function RSAKey(){this.n=null;this.e=0;this.d=null;this.p=null;this.q=null;this.dmp1=null;this.dmq1=null;this.coeff=null;}function RSASetPublic(b,a){this.isPublic=true;this.isPrivate=false;if(typeof b!=="string"){this.n=b;this.e=a;}else{if(b!=null&&a!=null&&b.length>0&&a.length>0){this.n=parseBigInt(b,16);this.e=parseInt(a,16);}else{throw"Invalid RSA public key"}}}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(d){var a=pkcs1pad2(d,(this.n.bitLength()+7)>>3);if(a==null){return null}var e=this.doPublic(a);if(e==null){return null}var b=e.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}function RSAEncryptOAEP(f,e,b){var a=oaep_pad(f,(this.n.bitLength()+7)>>3,e,b);if(a==null){return null}var g=this.doPublic(a);if(g==null){return null}var d=g.toString(16);if((d.length&1)==0){return d}else{return"0"+d}}RSAKey.prototype.doPublic=RSADoPublic;RSAKey.prototype.setPublic=RSASetPublic;RSAKey.prototype.encrypt=RSAEncrypt;RSAKey.prototype.encryptOAEP=RSAEncryptOAEP;RSAKey.prototype.type="RSA";
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  function pkcs1unpad2(g,j){var a=g.toByteArray();var f=0;while(f<a.length&&a[f]==0){++f;}if(a.length-f!=j-1||a[f]!=2){return null}++f;while(a[f]!=0){if(++f>=a.length){return null}}var e="";while(++f<a.length){var h=a[f]&255;if(h<128){e+=String.fromCharCode(h);}else{if((h>191)&&(h<224)){e+=String.fromCharCode(((h&31)<<6)|(a[f+1]&63));++f;}else{e+=String.fromCharCode(((h&15)<<12)|((a[f+1]&63)<<6)|(a[f+2]&63));f+=2;}}}return e}function oaep_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=e(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]));d+=1;}return b}function oaep_unpad(o,b,g,p){var e=KJUR.crypto.MessageDigest;var r=KJUR.crypto.Util;var c=null;if(!g){g="sha1";}if(typeof g==="string"){c=e.getCanonicalAlgName(g);p=e.getHashLength(c);g=function(d){return hextorstr(r.hashHex(rstrtohex(d),c))};}o=o.toByteArray();var h;for(h=0;h<o.length;h+=1){o[h]&=255;}while(o.length<b){o.unshift(0);}o=String.fromCharCode.apply(String,o);if(o.length<2*p+2){throw"Cipher too short"}var f=o.substr(1,p);var s=o.substr(p+1);var q=oaep_mgf1_str(s,p,g);var k=[],h;for(h=0;h<f.length;h+=1){k[h]=f.charCodeAt(h)^q.charCodeAt(h);}var l=oaep_mgf1_str(String.fromCharCode.apply(String,k),o.length-p,g);var j=[];for(h=0;h<s.length;h+=1){j[h]=s.charCodeAt(h)^l.charCodeAt(h);}j=String.fromCharCode.apply(String,j);if(j.substr(0,p)!==g("")){throw"Hash mismatch"}j=j.substr(p);var a=j.indexOf("\x01");var m=(a!=-1)?j.substr(0,a).lastIndexOf("\x00"):-1;if(m+1!=a){throw"Malformed data"}return j.substr(a+1)}function RSASetPrivate(c,a,b){this.isPrivate=true;if(typeof c!=="string"){this.n=c;this.e=a;this.d=b;}else{if(c!=null&&a!=null&&c.length>0&&a.length>0){this.n=parseBigInt(c,16);this.e=parseInt(a,16);this.d=parseBigInt(b,16);}else{throw"Invalid RSA private key"}}}function RSASetPrivateEx(g,d,e,c,b,a,h,f){this.isPrivate=true;this.isPublic=false;if(g==null){throw"RSASetPrivateEx N == null"}if(d==null){throw"RSASetPrivateEx E == null"}if(g.length==0){throw"RSASetPrivateEx N.length == 0"}if(d.length==0){throw"RSASetPrivateEx E.length == 0"}if(g!=null&&d!=null&&g.length>0&&d.length>0){this.n=parseBigInt(g,16);this.e=parseInt(d,16);this.d=parseBigInt(e,16);this.p=parseBigInt(c,16);this.q=parseBigInt(b,16);this.dmp1=parseBigInt(a,16);this.dmq1=parseBigInt(h,16);this.coeff=parseBigInt(f,16);}else{throw"Invalid RSA private key in RSASetPrivateEx"}}function RSAGenerate(b,i){var a=new SecureRandom();var f=b>>1;this.e=parseInt(i,16);var c=new BigInteger(i,16);for(;;){for(;;){this.p=new BigInteger(b-f,1,a);if(this.p.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.p.isProbablePrime(10)){break}}for(;;){this.q=new BigInteger(f,1,a);if(this.q.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.q.isProbablePrime(10)){break}}if(this.p.compareTo(this.q)<=0){var h=this.p;this.p=this.q;this.q=h;}var g=this.p.subtract(BigInteger.ONE);var d=this.q.subtract(BigInteger.ONE);var e=g.multiply(d);if(e.gcd(c).compareTo(BigInteger.ONE)==0){this.n=this.p.multiply(this.q);this.d=c.modInverse(e);this.dmp1=this.d.mod(g);this.dmq1=this.d.mod(d);this.coeff=this.q.modInverse(this.p);break}}this.isPrivate=true;}function RSADoPrivate(a){if(this.p==null||this.q==null){return a.modPow(this.d,this.n)}var c=a.mod(this.p).modPow(this.dmp1,this.p);var b=a.mod(this.q).modPow(this.dmq1,this.q);while(c.compareTo(b)<0){c=c.add(this.p);}return c.subtract(b).multiply(this.coeff).mod(this.p).multiply(this.q).add(b)}function RSADecrypt(b){var d=parseBigInt(b,16);var a=this.doPrivate(d);if(a==null){return null}return pkcs1unpad2(a,(this.n.bitLength()+7)>>3)}function RSADecryptOAEP(e,d,b){var f=parseBigInt(e,16);var a=this.doPrivate(f);if(a==null){return null}return oaep_unpad(a,(this.n.bitLength()+7)>>3,d,b)}RSAKey.prototype.doPrivate=RSADoPrivate;RSAKey.prototype.setPrivate=RSASetPrivate;RSAKey.prototype.setPrivateEx=RSASetPrivateEx;RSAKey.prototype.generate=RSAGenerate;RSAKey.prototype.decrypt=RSADecrypt;RSAKey.prototype.decryptOAEP=RSADecryptOAEP;
  /*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
   */
  function ECFieldElementFp(b,a){this.x=a;this.q=b;}function feFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.x.equals(a.x))}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;function ECPointFp(c,a,d,b){this.curve=c;this.x=a;this.y=d;if(b==null){this.z=BigInteger.ONE;}else{this.z=b;}this.zinv=null;}function pointFpGetX(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q);}return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q);}return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){if(a==this){return true}if(this.isInfinity()){return a.isInfinity()}if(a.isInfinity()){return this.isInfinity()}var c,b;c=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q);if(!c.equals(BigInteger.ZERO)){return false}b=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);return b.equals(BigInteger.ZERO)}function pointFpIsInfinity(){if((this.x==null)&&(this.y==null)){return true}return this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(l){if(this.isInfinity()){return l}if(l.isInfinity()){return this}var p=l.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(l.z)).mod(this.curve.q);var o=l.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(l.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(o)){if(BigInteger.ZERO.equals(p)){return this.twice()}return this.curve.getInfinity()}var j=new BigInteger("3");var e=this.x.toBigInteger();var n=this.y.toBigInteger();var c=l.x.toBigInteger();var k=l.y.toBigInteger();var m=o.square();var i=m.multiply(o);var d=e.multiply(m);var g=p.square().multiply(this.z);var a=g.subtract(d.shiftLeft(1)).multiply(l.z).subtract(i).multiply(o).mod(this.curve.q);var h=d.multiply(j).multiply(p).subtract(n.multiply(i)).subtract(g.multiply(p)).multiply(l.z).add(p.multiply(i)).mod(this.curve.q);var f=i.multiply(this.z).multiply(l.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(h),f)}function pointFpTwice(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var g=new BigInteger("3");var c=this.x.toBigInteger();var h=this.y.toBigInteger();var e=h.multiply(this.z);var j=e.multiply(h).mod(this.curve.q);var i=this.curve.a.toBigInteger();var k=c.square().multiply(g);if(!BigInteger.ZERO.equals(i)){k=k.add(this.z.square().multiply(i));}k=k.mod(this.curve.q);var b=k.square().subtract(c.shiftLeft(3).multiply(j)).shiftLeft(1).multiply(e).mod(this.curve.q);var f=k.multiply(g).multiply(c).subtract(j.shiftLeft(1)).shiftLeft(2).multiply(j).subtract(k.square().multiply(k)).mod(this.curve.q);var d=e.square().multiply(e).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(f),d)}function pointFpMultiply(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add(a?this:l);}}return d}function pointFpMultiplyTwo(c,a,b){var d;if(c.bitLength()>b.bitLength()){d=c.bitLength()-1;}else{d=b.bitLength()-1;}var f=this.curve.getInfinity();var e=this.add(a);while(d>=0){f=f.twice();if(c.testBit(d)){if(b.testBit(d)){f=f.add(e);}else{f=f.add(this);}}else{if(b.testBit(d)){f=f.add(a);}}--d;}return f}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;function ECCurveFp(e,d,c){this.q=e;this.a=this.fromBigInteger(d);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null);}function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b))}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(d){switch(parseInt(d.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var a=(d.length-2)/2;var c=d.substr(2,a);var b=d.substr(a+2,a);return new ECPointFp(this,this.fromBigInteger(new BigInteger(c,16)),this.fromBigInteger(new BigInteger(b,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;
  /*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
   */
  ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(c){var d=function(h,f){var g=h.toByteArrayUnsigned();if(f<g.length){g=g.slice(g.length-f);}else{while(f>g.length){g.unshift(0);}}return g};var a=this.getX().toBigInteger();var e=this.getY().toBigInteger();var b=d(a,32);if(c){if(e.isEven()){b.unshift(2);}else{b.unshift(3);}}else{b.unshift(4);b=b.concat(d(e,32));}return b};ECPointFp.decodeFrom=function(g,c){var f=c[0];var e=c.length-1;var d=c.slice(1,1+e/2);var b=c.slice(1+e/2,1+e);d.unshift(0);b.unshift(0);var a=new BigInteger(d);var h=new BigInteger(b);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.decodeFromHex=function(g,c){var f=c.substr(0,2);var e=c.length-2;var d=c.substr(2,e/2);var b=c.substr(2+e/2,e/2);var a=new BigInteger(d,16);var h=new BigInteger(b,16);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.prototype.add2D=function(c){if(this.isInfinity()){return c}if(c.isInfinity()){return this}if(this.x.equals(c.x)){if(this.y.equals(c.y)){return this.twice()}return this.curve.getInfinity()}var g=c.x.subtract(this.x);var e=c.y.subtract(this.y);var a=e.divide(g);var d=a.square().subtract(this.x).subtract(c.x);var f=a.multiply(this.x.subtract(d)).subtract(this.y);return new ECPointFp(this.curve,d,f)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var b=this.curve.fromBigInteger(BigInteger.valueOf(2));var e=this.curve.fromBigInteger(BigInteger.valueOf(3));var a=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(b));var c=a.square().subtract(this.x.multiply(b));var d=a.multiply(this.x.subtract(c)).subtract(this.y);return new ECPointFp(this.curve,c,d)};ECPointFp.prototype.multiply2D=function(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add2D(a?this:l);}}return d};ECPointFp.prototype.isOnCurve=function(){var d=this.getX().toBigInteger();var i=this.getY().toBigInteger();var f=this.curve.getA().toBigInteger();var c=this.curve.getB().toBigInteger();var h=this.curve.getQ();var e=i.multiply(i).mod(h);var g=d.multiply(d).multiply(d).add(f.multiply(d)).add(c).mod(h);return e.equals(g)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var c=this.curve.getQ();if(this.isInfinity()){throw new Error("Point is at infinity.")}var a=this.getX().toBigInteger();var b=this.getY().toBigInteger();if(a.compareTo(BigInteger.ONE)<0||a.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("x coordinate out of bounds")}if(b.compareTo(BigInteger.ONE)<0||b.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("y coordinate out of bounds")}if(!this.isOnCurve()){throw new Error("Point is not on the curve.")}if(this.multiply(c).isInfinity()){throw new Error("Point is not a scalar multiple of G.")}return true};
  /*! Mike Samuel (c) 2009 | code.google.com/p/json-sans-eval
   */
  var jsonParse=(function(){var e="(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)";var j='(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';var i='(?:"'+j+'*")';var d=new RegExp("(?:false|true|null|[\\{\\}\\[\\]]|"+e+"|"+i+")","g");var k=new RegExp("\\\\(?:([^u])|u(.{4}))","g");var g={'"':'"',"/":"/","\\":"\\",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"};function h(l,m,n){return m?g[m]:String.fromCharCode(parseInt(n,16))}var c=new String("");var a="\\";var b=Object.hasOwnProperty;return function(u,q){var p=u.match(d);var x;var v=p[0];var l=false;if("{"===v){x={};}else{if("["===v){x=[];}else{x=[];l=true;}}var t;var r=[x];for(var o=1-l,m=p.length;o<m;++o){v=p[o];var w;switch(v.charCodeAt(0)){default:w=r[0];w[t||w.length]=+(v);t=void 0;break;case 34:v=v.substring(1,v.length-1);if(v.indexOf(a)!==-1){v=v.replace(k,h);}w=r[0];if(!t){if(w instanceof Array){t=w.length;}else{t=v||c;break}}w[t]=v;t=void 0;break;case 91:w=r[0];r.unshift(w[t||w.length]=[]);t=void 0;break;case 93:r.shift();break;case 102:w=r[0];w[t||w.length]=false;t=void 0;break;case 110:w=r[0];w[t||w.length]=null;t=void 0;break;case 116:w=r[0];w[t||w.length]=true;t=void 0;break;case 123:w=r[0];r.unshift(w[t||w.length]={});t=void 0;break;case 125:r.shift();break}}if(l){if(r.length!==1){throw new Error()}x=x[0];}else{if(r.length){throw new Error()}}if(q){var s=function(C,B){var D=C[B];if(D&&typeof D==="object"){var n=null;for(var z in D){if(b.call(D,z)&&D!==C){var y=s(D,z);if(y!==void 0){D[z]=y;}else{if(!n){n=[];}n.push(z);}}}if(n){for(var A=n.length;--A>=0;){delete D[n[A]];}}}return q.call(C,B,D)};x=s({"":x},"");}return x}})();
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);if((b.length%2)==1){b="0"+b;}return b};this.bigIntToMinTwosComplementsHex=function(j){var f=j.toString(16);if(f.substr(0,1)!="-"){if(f.length%2==1){f="0"+f;}else{if(!f.match(/^[0-7]/)){f="00"+f;}}}else{var a=f.substr(1);var e=a.length;if(e%2==1){e+=1;}else{if(!f.match(/^[0-7]/)){e+=2;}}var g="";for(var d=0;d<e;d++){g+="f";}var c=new BigInteger(g,16);var b=c.xor(j).add(BigInteger.ONE);f=b.toString(16).replace(/^-/,"");}return f};this.getPEMStringFromHex=function(a,b){return hextopem(a,b)};this.newObject=function(k){var D=KJUR,n=D.asn1,z=n.DERBoolean,e=n.DERInteger,s=n.DERBitString,h=n.DEROctetString,v=n.DERNull,w=n.DERObjectIdentifier,l=n.DEREnumerated,g=n.DERUTF8String,f=n.DERNumericString,y=n.DERPrintableString,u=n.DERTeletexString,p=n.DERIA5String,C=n.DERUTCTime,j=n.DERGeneralizedTime,m=n.DERSequence,c=n.DERSet,r=n.DERTaggedObject,o=n.ASN1Util.newObject;var t=Object.keys(k);if(t.length!=1){throw"key of param shall be only one."}var F=t[0];if(":bool:int:bitstr:octstr:null:oid:enum:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:seq:set:tag:".indexOf(":"+F+":")==-1){throw"undefined key: "+F}if(F=="bool"){return new z(k[F])}if(F=="int"){return new e(k[F])}if(F=="bitstr"){return new s(k[F])}if(F=="octstr"){return new h(k[F])}if(F=="null"){return new v(k[F])}if(F=="oid"){return new w(k[F])}if(F=="enum"){return new l(k[F])}if(F=="utf8str"){return new g(k[F])}if(F=="numstr"){return new f(k[F])}if(F=="prnstr"){return new y(k[F])}if(F=="telstr"){return new u(k[F])}if(F=="ia5str"){return new p(k[F])}if(F=="utctime"){return new C(k[F])}if(F=="gentime"){return new j(k[F])}if(F=="seq"){var d=k[F];var E=[];for(var x=0;x<d.length;x++){var B=o(d[x]);E.push(B);}return new m({array:E})}if(F=="set"){var d=k[F];var E=[];for(var x=0;x<d.length;x++){var B=o(d[x]);E.push(B);}return new c({array:E})}if(F=="tag"){var A=k[F];if(Object.prototype.toString.call(A)==="[object Array]"&&A.length==3){var q=o(A[2]);return new r({tag:A[0],explicit:A[1],obj:q})}else{var b={};if(A.explicit!==undefined){b.explicit=A.explicit;}if(A.tag!==undefined){b.tag=A.tag;}if(A.obj===undefined){throw"obj shall be specified for 'tag'."}b.obj=o(A.obj);return new r(b)}}};this.jsonToASN1HEX=function(b){var a=this.newObject(b);return a.getEncodedHex()};};KJUR.asn1.ASN1Util.oidHexToInt=function(a){var j="";var k=parseInt(a.substr(0,2),16);var d=Math.floor(k/40);var c=k%40;var j=d+"."+c;var e="";for(var f=2;f<a.length;f+=2){var g=parseInt(a.substr(f,2),16);var h=("00000000"+g.toString(2)).slice(-8);e=e+h.substr(1,7);if(h.substr(0,1)=="0"){var b=new BigInteger(e,2);j=j+"."+b.toString(10);e="";}}return j};KJUR.asn1.ASN1Util.oidIntToHex=function(f){var e=function(a){var k=a.toString(16);if(k.length==1){k="0"+k;}return k};var d=function(o){var n="";var k=new BigInteger(o,10);var a=k.toString(2);var l=7-a.length%7;if(l==7){l=0;}var q="";for(var m=0;m<l;m++){q+="0";}a=q+a;for(var m=0;m<a.length-1;m+=7){var p=a.substr(m,7);if(m!=a.length-7){p="1"+p;}n+=e(parseInt(p,2));}return n};if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var b=f.split(".");var j=parseInt(b[0])*40+parseInt(b[1]);g+=e(j);b.splice(0,2);for(var c=0;c<b.length;c++){g+=d(b[c]);}return g};KJUR.asn1.ASN1Object=function(){var a="";this.getLengthHexFromValue=function(){if(typeof this.hV=="undefined"||this.hV==null){throw"this.hV is null or undefined."}if(this.hV.length%2==1){throw"value hex must be even length: n="+a.length+",v="+this.hV}var i=this.hV.length/2;var h=i.toString(16);if(h.length%2==1){h="0"+h;}if(i<128){return h}else{var g=h.length/2;if(g>15){throw"ASN.1 length too long to represent by 8x: n = "+i.toString(16)}var f=128+g;return f.toString(16)+h}};this.getEncodedHex=function(){if(this.hTLV==null||this.isModified){this.hV=this.getFreshValueHex();this.hL=this.getLengthHexFromValue();this.hTLV=this.hT+this.hL+this.hV;this.isModified=false;}return this.hTLV};this.getValueHex=function(){this.getEncodedHex();return this.hV};this.getFreshValueHex=function(){return""};};KJUR.asn1.DERAbstractString=function(c){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=utf8tohex(this.s).toLowerCase();};this.setStringHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d;};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"){this.setString(c);}else{if(typeof c.str!="undefined"){this.setString(c.str);}else{if(typeof c.hex!="undefined"){this.setStringHex(c.hex);}}}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractTime=function(c){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);this.localDateToUTC=function(f){utc=f.getTime()+(f.getTimezoneOffset()*60000);var e=new Date(utc);return e};this.formatDate=function(m,o,e){var g=this.zeroPadding;var n=this.localDateToUTC(m);var p=String(n.getFullYear());if(o=="utc"){p=p.substr(2,2);}var l=g(String(n.getMonth()+1),2);var q=g(String(n.getDate()),2);var h=g(String(n.getHours()),2);var i=g(String(n.getMinutes()),2);var j=g(String(n.getSeconds()),2);var r=p+l+q+h+i+j;if(e===true){var f=n.getMilliseconds();if(f!=0){var k=g(String(f),3);k=k.replace(/[0]+$/,"");r=r+"."+k;}}return r+"Z"};this.zeroPadding=function(e,d){if(e.length>=d){return e}return new Array(d-e.length+1).join("0")+e};this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(d);};this.setByDateValue=function(h,j,e,d,f,g){var i=new Date(Date.UTC(h,j-1,e,d,f,g,0));this.setByDate(i);};this.getFreshValueHex=function(){return this.hV};};YAHOO.lang.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractStructured=function(b){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.setByASN1ObjectArray=function(c){this.hTLV=null;this.isModified=true;this.asn1Array=c;};this.appendASN1Object=function(c){this.hTLV=null;this.isModified=true;this.asn1Array.push(c);};this.asn1Array=new Array();if(typeof b!="undefined"){if(typeof b.array!="undefined"){this.asn1Array=b.array;}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object);KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this);this.hT="01";this.hTLV="0101ff";};YAHOO.lang.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object);KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this);this.hT="02";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b);};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b);};this.setValueHex=function(b){this.hV=b;};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.bigint!="undefined"){this.setByBigInteger(a.bigint);}else{if(typeof a["int"]!="undefined"){this.setByInteger(a["int"]);}else{if(typeof a=="number"){this.setByInteger(a);}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex);}}}}}};YAHOO.lang.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object);KJUR.asn1.DERBitString=function(b){if(b!==undefined&&typeof b.obj!=="undefined"){var a=KJUR.asn1.ASN1Util.newObject(b.obj);b.hex="00"+a.getEncodedHex();}KJUR.asn1.DERBitString.superclass.constructor.call(this);this.hT="03";this.setHexValueIncludingUnusedBits=function(c){this.hTLV=null;this.isModified=true;this.hV=c;};this.setUnusedBitsAndHexValue=function(c,e){if(c<0||7<c){throw"unused bits shall be from 0 to 7: u = "+c}var d="0"+c;this.hTLV=null;this.isModified=true;this.hV=d+e;};this.setByBinaryString=function(e){e=e.replace(/0+$/,"");var f=8-e.length%8;if(f==8){f=0;}for(var g=0;g<=f;g++){e+="0";}var j="";for(var g=0;g<e.length-1;g+=8){var d=e.substr(g,8);var c=parseInt(d,2).toString(16);if(c.length==1){c="0"+c;}j+=c;}this.hTLV=null;this.isModified=true;this.hV="0"+f+j;};this.setByBooleanArray=function(e){var d="";for(var c=0;c<e.length;c++){if(e[c]==true){d+="1";}else{d+="0";}}this.setByBinaryString(d);};this.newFalseArray=function(e){var c=new Array(e);for(var d=0;d<e;d++){c[d]=false;}return c};this.getFreshValueHex=function(){return this.hV};if(typeof b!="undefined"){if(typeof b=="string"&&b.toLowerCase().match(/^[0-9a-f]+$/)){this.setHexValueIncludingUnusedBits(b);}else{if(typeof b.hex!="undefined"){this.setHexValueIncludingUnusedBits(b.hex);}else{if(typeof b.bin!="undefined"){this.setByBinaryString(b.bin);}else{if(typeof b.array!="undefined"){this.setByBooleanArray(b.array);}}}}}};YAHOO.lang.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object);KJUR.asn1.DEROctetString=function(b){if(b!==undefined&&typeof b.obj!=="undefined"){var a=KJUR.asn1.ASN1Util.newObject(b.obj);b.hex=a.getEncodedHex();}KJUR.asn1.DEROctetString.superclass.constructor.call(this,b);this.hT="04";};YAHOO.lang.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this);this.hT="05";this.hTLV="0500";};YAHOO.lang.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object);KJUR.asn1.DERObjectIdentifier=function(c){var b=function(d){var e=d.toString(16);if(e.length==1){e="0"+e;}return e};var a=function(k){var j="";var e=new BigInteger(k,10);var d=e.toString(2);var f=7-d.length%7;if(f==7){f=0;}var m="";for(var g=0;g<f;g++){m+="0";}d=m+d;for(var g=0;g<d.length-1;g+=7){var l=d.substr(g,7);if(g!=d.length-7){l="1"+l;}j+=b(parseInt(l,2));}return j};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);this.hT="06";this.setValueHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d;};this.setValueOidString=function(f){if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var d=f.split(".");var j=parseInt(d[0])*40+parseInt(d[1]);g+=b(j);d.splice(0,2);for(var e=0;e<d.length;e++){g+=a(d[e]);}this.hTLV=null;this.isModified=true;this.s=null;this.hV=g;};this.setValueName=function(e){var d=KJUR.asn1.x509.OID.name2oid(e);if(d!==""){this.setValueOidString(d);}else{throw"DERObjectIdentifier oidName undefined: "+e}};this.getFreshValueHex=function(){return this.hV};if(c!==undefined){if(typeof c==="string"){if(c.match(/^[0-2].[0-9.]+$/)){this.setValueOidString(c);}else{this.setValueName(c);}}else{if(c.oid!==undefined){this.setValueOidString(c.oid);}else{if(c.hex!==undefined){this.setValueHex(c.hex);}else{if(c.name!==undefined){this.setValueName(c.name);}}}}}};YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.DEREnumerated=function(a){KJUR.asn1.DEREnumerated.superclass.constructor.call(this);this.hT="0a";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b);};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b);};this.setValueHex=function(b){this.hV=b;};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a["int"]!="undefined"){this.setByInteger(a["int"]);}else{if(typeof a=="number"){this.setByInteger(a);}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex);}}}}};YAHOO.lang.extend(KJUR.asn1.DEREnumerated,KJUR.asn1.ASN1Object);KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a);this.hT="0c";};YAHOO.lang.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a);this.hT="12";};YAHOO.lang.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a);this.hT="13";};YAHOO.lang.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a);this.hT="14";};YAHOO.lang.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a);this.hT="16";};YAHOO.lang.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a);this.hT="17";this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s);};this.getFreshValueHex=function(){if(typeof this.date=="undefined"&&typeof this.s=="undefined"){this.date=new Date();this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s);}return this.hV};if(a!==undefined){if(a.str!==undefined){this.setString(a.str);}else{if(typeof a=="string"&&a.match(/^[0-9]{12}Z$/)){this.setString(a);}else{if(a.hex!==undefined){this.setStringHex(a.hex);}else{if(a.date!==undefined){this.setByDate(a.date);}}}}}};YAHOO.lang.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a);this.hT="18";this.withMillis=false;this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s);};this.getFreshValueHex=function(){if(this.date===undefined&&this.s===undefined){this.date=new Date();this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s);}return this.hV};if(a!==undefined){if(a.str!==undefined){this.setString(a.str);}else{if(typeof a=="string"&&a.match(/^[0-9]{14}Z$/)){this.setString(a);}else{if(a.hex!==undefined){this.setStringHex(a.hex);}else{if(a.date!==undefined){this.setByDate(a.date);}}}}if(a.millis===true){this.withMillis=true;}}};YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a);this.hT="30";this.getFreshValueHex=function(){var c="";for(var b=0;b<this.asn1Array.length;b++){var d=this.asn1Array[b];c+=d.getEncodedHex();}this.hV=c;return this.hV};};YAHOO.lang.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a);this.hT="31";this.sortFlag=true;this.getFreshValueHex=function(){var b=new Array();for(var c=0;c<this.asn1Array.length;c++){var d=this.asn1Array[c];b.push(d.getEncodedHex());}if(this.sortFlag==true){b.sort();}this.hV=b.join("");return this.hV};if(typeof a!="undefined"){if(typeof a.sortflag!="undefined"&&a.sortflag==false){this.sortFlag=false;}}};YAHOO.lang.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);this.hT="a0";this.hV="";this.isExplicit=true;this.asn1Object=null;this.setASN1Object=function(b,c,d){this.hT=c;this.isExplicit=b;this.asn1Object=d;if(this.isExplicit){this.hV=this.asn1Object.getEncodedHex();this.hTLV=null;this.isModified=true;}else{this.hV=null;this.hTLV=d.getEncodedHex();this.hTLV=this.hTLV.replace(/^../,c);this.isModified=false;}};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.tag!="undefined"){this.hT=a.tag;}if(typeof a.explicit!="undefined"){this.isExplicit=a.explicit;}if(typeof a.obj!="undefined"){this.asn1Object=a.obj;this.setASN1Object(this.isExplicit,this.hT,this.asn1Object);}}};YAHOO.lang.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object);
  var ASN1HEX=new function(){};ASN1HEX.getLblen=function(c,a){if(c.substr(a+2,1)!="8"){return 1}var b=parseInt(c.substr(a+3,1));if(b==0){return -1}if(0<b&&b<10){return b+1}return -2};ASN1HEX.getL=function(c,b){var a=ASN1HEX.getLblen(c,b);if(a<1){return""}return c.substr(b+2,a*2)};ASN1HEX.getVblen=function(d,a){var c,b;c=ASN1HEX.getL(d,a);if(c==""){return -1}if(c.substr(0,1)==="8"){b=new BigInteger(c.substr(2),16);}else{b=new BigInteger(c,16);}return b.intValue()};ASN1HEX.getVidx=function(c,b){var a=ASN1HEX.getLblen(c,b);if(a<0){return a}return b+(a+1)*2};ASN1HEX.getV=function(d,a){var c=ASN1HEX.getVidx(d,a);var b=ASN1HEX.getVblen(d,a);return d.substr(c,b*2)};ASN1HEX.getTLV=function(b,a){return b.substr(a,2)+ASN1HEX.getL(b,a)+ASN1HEX.getV(b,a)};ASN1HEX.getNextSiblingIdx=function(d,a){var c=ASN1HEX.getVidx(d,a);var b=ASN1HEX.getVblen(d,a);return c+b*2};ASN1HEX.getChildIdx=function(e,f){var j=ASN1HEX;var g=new Array();var i=j.getVidx(e,f);if(e.substr(f,2)=="03"){g.push(i+2);}else{g.push(i);}var l=j.getVblen(e,f);var c=i;var d=0;while(1){var b=j.getNextSiblingIdx(e,c);if(b==null||(b-i>=(l*2))){break}if(d>=200){break}g.push(b);c=b;d++;}return g};ASN1HEX.getNthChildIdx=function(d,b,e){var c=ASN1HEX.getChildIdx(d,b);return c[e]};ASN1HEX.getIdxbyList=function(e,d,c,i){var g=ASN1HEX;var f,b;if(c.length==0){if(i!==undefined){if(e.substr(d,2)!==i){throw"checking tag doesn't match: "+e.substr(d,2)+"!="+i}}return d}f=c.shift();b=g.getChildIdx(e,d);return g.getIdxbyList(e,b[f],c,i)};ASN1HEX.getTLVbyList=function(d,c,b,f){var e=ASN1HEX;var a=e.getIdxbyList(d,c,b);if(a===undefined){throw"can't find nthList object"}if(f!==undefined){if(d.substr(a,2)!=f){throw"checking tag doesn't match: "+d.substr(a,2)+"!="+f}}return e.getTLV(d,a)};ASN1HEX.getVbyList=function(e,c,b,g,i){var f=ASN1HEX;var a,d;a=f.getIdxbyList(e,c,b,g);if(a===undefined){throw"can't find nthList object"}d=f.getV(e,a);if(i===true){d=d.substr(2);}return d};ASN1HEX.hextooidstr=function(e){var h=function(b,a){if(b.length>=a){return b}return new Array(a-b.length+1).join("0")+b};var l=[];var o=e.substr(0,2);var f=parseInt(o,16);l[0]=new String(Math.floor(f/40));l[1]=new String(f%40);var m=e.substr(2);var k=[];for(var g=0;g<m.length/2;g++){k.push(parseInt(m.substr(g*2,2),16));}var j=[];var d="";for(var g=0;g<k.length;g++){if(k[g]&128){d=d+h((k[g]&127).toString(2),7);}else{d=d+h((k[g]&127).toString(2),7);j.push(new String(parseInt(d,2)));d="";}}var n=l.join(".");if(j.length>0){n=n+"."+j.join(".");}return n};ASN1HEX.dump=function(t,c,l,g){var p=ASN1HEX;var j=p.getV;var y=p.dump;var w=p.getChildIdx;var e=t;if(t instanceof KJUR.asn1.ASN1Object){e=t.getEncodedHex();}var q=function(A,i){if(A.length<=i*2){return A}else{var v=A.substr(0,i)+"..(total "+A.length/2+"bytes).."+A.substr(A.length-i,i);return v}};if(c===undefined){c={ommit_long_octet:32};}if(l===undefined){l=0;}if(g===undefined){g="";}var x=c.ommit_long_octet;if(e.substr(l,2)=="01"){var h=j(e,l);if(h=="00"){return g+"BOOLEAN FALSE\n"}else{return g+"BOOLEAN TRUE\n"}}if(e.substr(l,2)=="02"){var h=j(e,l);return g+"INTEGER "+q(h,x)+"\n"}if(e.substr(l,2)=="03"){var h=j(e,l);return g+"BITSTRING "+q(h,x)+"\n"}if(e.substr(l,2)=="04"){var h=j(e,l);if(p.isASN1HEX(h)){var k=g+"OCTETSTRING, encapsulates\n";k=k+y(h,c,0,g+"  ");return k}else{return g+"OCTETSTRING "+q(h,x)+"\n"}}if(e.substr(l,2)=="05"){return g+"NULL\n"}if(e.substr(l,2)=="06"){var m=j(e,l);var a=KJUR.asn1.ASN1Util.oidHexToInt(m);var o=KJUR.asn1.x509.OID.oid2name(a);var b=a.replace(/\./g," ");if(o!=""){return g+"ObjectIdentifier "+o+" ("+b+")\n"}else{return g+"ObjectIdentifier ("+b+")\n"}}if(e.substr(l,2)=="0c"){return g+"UTF8String '"+hextoutf8(j(e,l))+"'\n"}if(e.substr(l,2)=="13"){return g+"PrintableString '"+hextoutf8(j(e,l))+"'\n"}if(e.substr(l,2)=="14"){return g+"TeletexString '"+hextoutf8(j(e,l))+"'\n"}if(e.substr(l,2)=="16"){return g+"IA5String '"+hextoutf8(j(e,l))+"'\n"}if(e.substr(l,2)=="17"){return g+"UTCTime "+hextoutf8(j(e,l))+"\n"}if(e.substr(l,2)=="18"){return g+"GeneralizedTime "+hextoutf8(j(e,l))+"\n"}if(e.substr(l,2)=="30"){if(e.substr(l,4)=="3000"){return g+"SEQUENCE {}\n"}var k=g+"SEQUENCE\n";var d=w(e,l);var f=c;if((d.length==2||d.length==3)&&e.substr(d[0],2)=="06"&&e.substr(d[d.length-1],2)=="04"){var o=p.oidname(j(e,d[0]));var r=JSON.parse(JSON.stringify(c));r.x509ExtName=o;f=r;}for(var u=0;u<d.length;u++){k=k+y(e,f,d[u],g+"  ");}return k}if(e.substr(l,2)=="31"){var k=g+"SET\n";var d=w(e,l);for(var u=0;u<d.length;u++){k=k+y(e,c,d[u],g+"  ");}return k}var z=parseInt(e.substr(l,2),16);if((z&128)!=0){var n=z&31;if((z&32)!=0){var k=g+"["+n+"]\n";var d=w(e,l);for(var u=0;u<d.length;u++){k=k+y(e,c,d[u],g+"  ");}return k}else{var h=j(e,l);if(h.substr(0,8)=="68747470"){h=hextoutf8(h);}if(c.x509ExtName==="subjectAltName"&&n==2){h=hextoutf8(h);}var k=g+"["+n+"] "+h+"\n";return k}}return g+"UNKNOWN("+e.substr(l,2)+") "+j(e,l)+"\n"};ASN1HEX.isASN1HEX=function(e){var d=ASN1HEX;if(e.length%2==1){return false}var c=d.getVblen(e,0);var b=e.substr(0,2);var f=d.getL(e,0);var a=e.length-b.length-f.length;if(a==c*2){return true}return false};ASN1HEX.oidname=function(a){var c=KJUR.asn1;if(KJUR.lang.String.isHex(a)){a=c.ASN1Util.oidHexToInt(a);}var b=c.x509.OID.oid2name(a);if(b===""){b=a;}return b};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}if(typeof KJUR.asn1.x509=="undefined"||!KJUR.asn1.x509){KJUR.asn1.x509={};}KJUR.asn1.x509.Certificate=function(e){KJUR.asn1.x509.Certificate.superclass.constructor.call(this);var b=KJUR,f=b.crypto,g=b.asn1,d=g.DERSequence,c=g.DERBitString;this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;var m=new KJUR.crypto.Signature({alg:this.asn1SignatureAlg.nameAlg});m.init(this.prvKey);m.updateHex(this.asn1TBSCert.getEncodedHex());this.hexSig=m.sign();this.asn1Sig=new c({hex:"00"+this.hexSig});var l=new d({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=l.getEncodedHex();this.isModified=false;};this.setSignatureHex=function(l){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;this.hexSig=l;this.asn1Sig=new c({hex:"00"+this.hexSig});var m=new d({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=m.getEncodedHex();this.isModified=false;};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var l=hextob64nl(this.getEncodedHex());return"-----BEGIN CERTIFICATE-----\r\n"+l+"\r\n-----END CERTIFICATE-----\r\n"};if(e!==undefined){if(e.tbscertobj!==undefined){this.asn1TBSCert=e.tbscertobj;}if(e.prvkeyobj!==undefined){this.prvKey=e.prvkeyobj;}}};YAHOO.lang.extend(KJUR.asn1.x509.Certificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertificate=function(e){KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);var b=KJUR,i=b.asn1,f=i.DERSequence,h=i.DERInteger,c=i.DERTaggedObject,d=i.x509,g=d.Time,a=d.X500Name,j=d.SubjectPublicKeyInfo;this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new c({obj:new h({"int":2})});this.asn1SerialNumber=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1NotBefore=null;this.asn1NotAfter=null;this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array();};this.setSerialNumberByParam=function(k){this.asn1SerialNumber=new h(k);};this.setSignatureAlgByParam=function(k){this.asn1SignatureAlg=new d.AlgorithmIdentifier(k);};this.setIssuerByParam=function(k){this.asn1Issuer=new a(k);};this.setNotBeforeByParam=function(k){this.asn1NotBefore=new g(k);};this.setNotAfterByParam=function(k){this.asn1NotAfter=new g(k);};this.setSubjectByParam=function(k){this.asn1Subject=new a(k);};this.setSubjectPublicKey=function(k){this.asn1SubjPKey=new j(k);};this.setSubjectPublicKeyByGetKey=function(l){var k=KEYUTIL.getKey(l);this.asn1SubjPKey=new j(k);};this.appendExtension=function(k){this.extensionsArray.push(k);};this.appendExtensionByName=function(l,k){KJUR.asn1.x509.Extension.appendByNameToArray(l,k,this.extensionsArray);};this.getEncodedHex=function(){if(this.asn1NotBefore==null||this.asn1NotAfter==null){throw"notBefore and/or notAfter not set"}var l=new f({array:[this.asn1NotBefore,this.asn1NotAfter]});this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1SerialNumber);this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(l);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var m=new f({array:this.extensionsArray});var k=new c({explicit:true,tag:"a3",obj:m});this.asn1Array.push(k);}var n=new f({array:this.asn1Array});this.hTLV=n.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize();};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension=function(d){KJUR.asn1.x509.Extension.superclass.constructor.call(this);var a=KJUR,e=a.asn1,h=e.DERObjectIdentifier,i=e.DEROctetString,b=e.DERBitString,g=e.DERBoolean,c=e.DERSequence;this.getEncodedHex=function(){var m=new h({oid:this.oid});var l=new i({hex:this.getExtnValueHex()});var k=new Array();k.push(m);if(this.critical){k.push(new g());}k.push(l);var j=new c({array:k});return j.getEncodedHex()};this.critical=false;if(d!==undefined){if(d.critical!==undefined){this.critical=d.critical;}}};YAHOO.lang.extend(KJUR.asn1.x509.Extension,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension.appendByNameToArray=function(e,c,b){var g=e.toLowerCase(),f=KJUR.asn1.x509;if(g=="basicconstraints"){var d=new f.BasicConstraints(c);b.push(d);}else{if(g=="keyusage"){var d=new f.KeyUsage(c);b.push(d);}else{if(g=="crldistributionpoints"){var d=new f.CRLDistributionPoints(c);b.push(d);}else{if(g=="extkeyusage"){var d=new f.ExtKeyUsage(c);b.push(d);}else{if(g=="authoritykeyidentifier"){var d=new f.AuthorityKeyIdentifier(c);b.push(d);}else{if(g=="authorityinfoaccess"){var d=new f.AuthorityInfoAccess(c);b.push(d);}else{if(g=="subjectaltname"){var d=new f.SubjectAltName(c);b.push(d);}else{if(g=="issueraltname"){var d=new f.IssuerAltName(c);b.push(d);}else{throw"unsupported extension name: "+e}}}}}}}}};KJUR.asn1.x509.KeyUsage=function(f){KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this,f);var a=X509.KEYUSAGE_NAME;this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.15";if(f!==undefined){if(f.bin!==undefined){this.asn1ExtnValue=new KJUR.asn1.DERBitString(f);}if(f.names!==undefined&&f.names.length!==undefined){var e=f.names;var d="000000000";for(var c=0;c<e.length;c++){for(var b=0;b<a.length;b++){if(e[c]===a[b]){d=d.substring(0,b)+"1"+d.substring(b+1,d.length);}}}this.asn1ExtnValue=new KJUR.asn1.DERBitString({bin:d});}}};YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.BasicConstraints=function(c){KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this,c);this.getExtnValueHex=function(){var e=new Array();if(this.cA){e.push(new KJUR.asn1.DERBoolean());}if(this.pathLen>-1){e.push(new KJUR.asn1.DERInteger({"int":this.pathLen}));}var d=new KJUR.asn1.DERSequence({array:e});this.asn1ExtnValue=d;return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.19";this.cA=false;this.pathLen=-1;if(c!==undefined){if(c.cA!==undefined){this.cA=c.cA;}if(c.pathLen!==undefined){this.pathLen=c.pathLen;}}};YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRLDistributionPoints=function(d){KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this,d);var b=KJUR,a=b.asn1,c=a.x509;this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.setByDPArray=function(e){this.asn1ExtnValue=new a.DERSequence({array:e});};this.setByOneURI=function(h){var e=new c.GeneralNames([{uri:h}]);var g=new c.DistributionPointName(e);var f=new c.DistributionPoint({dpobj:g});this.setByDPArray([f]);};this.oid="2.5.29.31";if(d!==undefined){if(d.array!==undefined){this.setByDPArray(d.array);}else{if(d.uri!==undefined){this.setByOneURI(d.uri);}}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.ExtKeyUsage=function(c){KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this,c);var b=KJUR,a=b.asn1;this.setPurposeArray=function(d){this.asn1ExtnValue=new a.DERSequence();for(var e=0;e<d.length;e++){var f=new a.DERObjectIdentifier(d[e]);this.asn1ExtnValue.appendASN1Object(f);}};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.37";if(c!==undefined){if(c.array!==undefined){this.setPurposeArray(c.array);}}};YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.AuthorityKeyIdentifier=function(d){KJUR.asn1.x509.AuthorityKeyIdentifier.superclass.constructor.call(this,d);var b=KJUR,a=b.asn1,c=a.DERTaggedObject;this.asn1KID=null;this.asn1CertIssuer=null;this.asn1CertSN=null;this.getExtnValueHex=function(){var f=new Array();if(this.asn1KID){f.push(new c({explicit:false,tag:"80",obj:this.asn1KID}));}if(this.asn1CertIssuer){f.push(new c({explicit:false,tag:"a1",obj:this.asn1CertIssuer}));}if(this.asn1CertSN){f.push(new c({explicit:false,tag:"82",obj:this.asn1CertSN}));}var e=new a.DERSequence({array:f});this.asn1ExtnValue=e;return this.asn1ExtnValue.getEncodedHex()};this.setKIDByParam=function(e){this.asn1KID=new KJUR.asn1.DEROctetString(e);};this.setCertIssuerByParam=function(e){this.asn1CertIssuer=new KJUR.asn1.x509.X500Name(e);};this.setCertSNByParam=function(e){this.asn1CertSN=new KJUR.asn1.DERInteger(e);};this.oid="2.5.29.35";if(d!==undefined){if(d.kid!==undefined){this.setKIDByParam(d.kid);}if(d.issuer!==undefined){this.setCertIssuerByParam(d.issuer);}if(d.sn!==undefined){this.setCertSNByParam(d.sn);}}};YAHOO.lang.extend(KJUR.asn1.x509.AuthorityKeyIdentifier,KJUR.asn1.x509.Extension);KJUR.asn1.x509.AuthorityInfoAccess=function(a){KJUR.asn1.x509.AuthorityInfoAccess.superclass.constructor.call(this,a);this.setAccessDescriptionArray=function(k){var j=new Array(),b=KJUR,g=b.asn1,d=g.DERSequence;for(var f=0;f<k.length;f++){var c=new g.DERObjectIdentifier(k[f].accessMethod);var e=new g.x509.GeneralName(k[f].accessLocation);var h=new d({array:[c,e]});j.push(h);}this.asn1ExtnValue=new d({array:j});};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="1.3.6.1.5.5.7.1.1";if(a!==undefined){if(a.array!==undefined){this.setAccessDescriptionArray(a.array);}}};YAHOO.lang.extend(KJUR.asn1.x509.AuthorityInfoAccess,KJUR.asn1.x509.Extension);KJUR.asn1.x509.SubjectAltName=function(a){KJUR.asn1.x509.SubjectAltName.superclass.constructor.call(this,a);this.setNameArray=function(b){this.asn1ExtnValue=new KJUR.asn1.x509.GeneralNames(b);};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.17";if(a!==undefined){if(a.array!==undefined){this.setNameArray(a.array);}}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectAltName,KJUR.asn1.x509.Extension);KJUR.asn1.x509.IssuerAltName=function(a){KJUR.asn1.x509.IssuerAltName.superclass.constructor.call(this,a);this.setNameArray=function(b){this.asn1ExtnValue=new KJUR.asn1.x509.GeneralNames(b);};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.18";if(a!==undefined){if(a.array!==undefined){this.setNameArray(a.array);}}};YAHOO.lang.extend(KJUR.asn1.x509.IssuerAltName,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRL=function(f){KJUR.asn1.x509.CRL.superclass.constructor.call(this);this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCertList.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:"SHA1withRSA",prov:"cryptojs/jsrsa"});sig.init(this.prvKey);sig.updateHex(this.asn1TBSCertList.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var g=new KJUR.asn1.DERSequence({array:[this.asn1TBSCertList,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=g.getEncodedHex();this.isModified=false;};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var g=hextob64nl(this.getEncodedHex());return"-----BEGIN X509 CRL-----\r\n"+g+"\r\n-----END X509 CRL-----\r\n"};if(f!==undefined){if(f.tbsobj!==undefined){this.asn1TBSCertList=f.tbsobj;}if(f.prvkeyobj!==undefined){this.prvKey=f.prvkeyobj;}}};YAHOO.lang.extend(KJUR.asn1.x509.CRL,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertList=function(g){KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);var d=KJUR,c=d.asn1,b=c.DERSequence,f=c.x509,a=f.Time;this.setSignatureAlgByParam=function(h){this.asn1SignatureAlg=new f.AlgorithmIdentifier(h);};this.setIssuerByParam=function(h){this.asn1Issuer=new f.X500Name(h);};this.setThisUpdateByParam=function(h){this.asn1ThisUpdate=new a(h);};this.setNextUpdateByParam=function(h){this.asn1NextUpdate=new a(h);};this.addRevokedCert=function(h,i){var k={};if(h!=undefined&&h!=null){k.sn=h;}if(i!=undefined&&i!=null){k.time=i;}var j=new f.CRLEntry(k);this.aRevokedCert.push(j);};this.getEncodedHex=function(){this.asn1Array=new Array();if(this.asn1Version!=null){this.asn1Array.push(this.asn1Version);}this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(this.asn1ThisUpdate);if(this.asn1NextUpdate!=null){this.asn1Array.push(this.asn1NextUpdate);}if(this.aRevokedCert.length>0){var h=new b({array:this.aRevokedCert});this.asn1Array.push(h);}var i=new b({array:this.asn1Array});this.hTLV=i.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize=function(){this.asn1Version=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1ThisUpdate=null;this.asn1NextUpdate=null;this.aRevokedCert=new Array();};this._initialize();};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList,KJUR.asn1.ASN1Object);KJUR.asn1.x509.CRLEntry=function(e){KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);var b=KJUR,a=b.asn1;this.setCertSerial=function(f){this.sn=new a.DERInteger(f);};this.setRevocationDate=function(f){this.time=new a.x509.Time(f);};this.getEncodedHex=function(){var f=new a.DERSequence({array:[this.sn,this.time]});this.TLV=f.getEncodedHex();return this.TLV};if(e!==undefined){if(e.time!==undefined){this.setRevocationDate(e.time);}if(e.sn!==undefined){this.setCertSerial(e.sn);}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name=function(f){KJUR.asn1.x509.X500Name.superclass.constructor.call(this);this.asn1Array=new Array();var d=KJUR,c=d.asn1,e=c.x509,b=pemtohex;this.setByString=function(g){var k=g.split("/");k.shift();var j=[];for(var l=0;l<k.length;l++){if(k[l].match(/^[^=]+=.+$/)){j.push(k[l]);}else{var h=j.length-1;j[h]=j[h]+"/"+k[l];}}for(var l=0;l<j.length;l++){this.asn1Array.push(new e.RDN({str:j[l]}));}};this.setByLdapString=function(g){var h=e.X500Name.ldapToOneline(g);this.setByString(h);};this.setByObject=function(i){for(var g in i){if(i.hasOwnProperty(g)){var h=new KJUR.asn1.x509.RDN({str:g+"="+i[g]});this.asn1Array?this.asn1Array.push(h):this.asn1Array=[h];}}};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var g=new c.DERSequence({array:this.asn1Array});this.hTLV=g.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.str!==undefined){this.setByString(f.str);}else{if(f.ldapstr!==undefined){this.setByLdapString(f.ldapstr);}else{if(typeof f==="object"){this.setByObject(f);}}}if(f.certissuer!==undefined){var a=new X509();a.hex=b(f.certissuer);this.hTLV=a.getIssuerHex();}if(f.certsubject!==undefined){var a=new X509();a.hex=b(f.certsubject);this.hTLV=a.getSubjectHex();}}};YAHOO.lang.extend(KJUR.asn1.x509.X500Name,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name.onelineToLDAP=function(d){if(d.substr(0,1)!=="/"){throw"malformed input"}d=d.substr(1);var c=d.split("/");c.reverse();c=c.map(function(a){return a.replace(/,/,"\\,")});return c.join(",")};KJUR.asn1.x509.X500Name.ldapToOneline=function(g){var c=g.split(",");var e=false;var b=[];for(var f=0;c.length>0;f++){var h=c.shift();if(e===true){var d=b.pop();var j=(d+","+h).replace(/\\,/g,",");b.push(j);e=false;}else{b.push(h);}if(h.substr(-1,1)==="\\"){e=true;}}b=b.map(function(a){return a.replace("/","\\/")});b.reverse();return"/"+b.join("/")};KJUR.asn1.x509.RDN=function(a){KJUR.asn1.x509.RDN.superclass.constructor.call(this);this.asn1Array=new Array();this.addByString=function(b){this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({str:b}));};this.addByMultiValuedString=function(d){var b=KJUR.asn1.x509.RDN.parseString(d);for(var c=0;c<b.length;c++){this.addByString(b[c]);}};this.getEncodedHex=function(){var b=new KJUR.asn1.DERSet({array:this.asn1Array});this.TLV=b.getEncodedHex();return this.TLV};if(a!==undefined){if(a.str!==undefined){this.addByMultiValuedString(a.str);}}};YAHOO.lang.extend(KJUR.asn1.x509.RDN,KJUR.asn1.ASN1Object);KJUR.asn1.x509.RDN.parseString=function(m){var j=m.split(/\+/);var h=false;var c=[];for(var g=0;j.length>0;g++){var k=j.shift();if(h===true){var f=c.pop();var d=(f+"+"+k).replace(/\\\+/g,"+");c.push(d);h=false;}else{c.push(k);}if(k.substr(-1,1)==="\\"){h=true;}}var l=false;var b=[];for(var g=0;c.length>0;g++){var k=c.shift();if(l===true){var e=b.pop();if(k.match(/"$/)){var d=(e+"+"+k).replace(/^([^=]+)="(.*)"$/,"$1=$2");b.push(d);l=false;}else{b.push(e+"+"+k);}}else{b.push(k);}if(k.match(/^[^=]+="/)){l=true;}}return b};KJUR.asn1.x509.AttributeTypeAndValue=function(d){KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);var a="utf8",c=KJUR,b=c.asn1;this.setByString=function(h){var g=h.match(/^([^=]+)=(.+)$/);if(g){this.setByAttrTypeAndValueStr(g[1],g[2]);}else{throw"malformed attrTypeAndValueStr: "+h}};this.setByAttrTypeAndValueStr=function(i,h){this.typeObj=KJUR.asn1.x509.OID.atype2obj(i);var g=a;if(i=="C"){g="prn";}this.valueObj=this.getValueObj(g,h);};this.getValueObj=function(h,g){if(h=="utf8"){return new b.DERUTF8String({str:g})}if(h=="prn"){return new b.DERPrintableString({str:g})}if(h=="tel"){return new b.DERTeletexString({str:g})}if(h=="ia5"){return new b.DERIA5String({str:g})}throw"unsupported directory string type: type="+h+" value="+g};this.getEncodedHex=function(){var g=new b.DERSequence({array:[this.typeObj,this.valueObj]});this.TLV=g.getEncodedHex();return this.TLV};if(d!==undefined){if(d.str!==undefined){this.setByString(d.str);}}};YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.x509.SubjectPublicKeyInfo=function(f){KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);var a=KJUR,j=a.asn1,i=j.DERInteger,b=j.DERBitString,m=j.DERObjectIdentifier,e=j.DERSequence,h=j.ASN1Util.newObject,d=j.x509,o=d.AlgorithmIdentifier,g=a.crypto,n=g.ECDSA,c=g.DSA;this.getASN1Object=function(){if(this.asn1AlgId==null||this.asn1SubjPKey==null){throw"algId and/or subjPubKey not set"}var p=new e({array:[this.asn1AlgId,this.asn1SubjPKey]});return p};this.getEncodedHex=function(){var p=this.getASN1Object();this.hTLV=p.getEncodedHex();return this.hTLV};this.setPubKey=function(q){try{if(q instanceof RSAKey){var u=h({seq:[{"int":{bigint:q.n}},{"int":{"int":q.e}}]});var s=u.getEncodedHex();this.asn1AlgId=new o({name:"rsaEncryption"});this.asn1SubjPKey=new b({hex:"00"+s});}}catch(p){}try{if(q instanceof KJUR.crypto.ECDSA){var r=new m({name:q.curveName});this.asn1AlgId=new o({name:"ecPublicKey",asn1params:r});this.asn1SubjPKey=new b({hex:"00"+q.pubKeyHex});}}catch(p){}try{if(q instanceof KJUR.crypto.DSA){var r=new h({seq:[{"int":{bigint:q.p}},{"int":{bigint:q.q}},{"int":{bigint:q.g}}]});this.asn1AlgId=new o({name:"dsa",asn1params:r});var t=new i({bigint:q.y});this.asn1SubjPKey=new b({hex:"00"+t.getEncodedHex()});}}catch(p){}};if(f!==undefined){this.setPubKey(f);}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Time=function(f){KJUR.asn1.x509.Time.superclass.constructor.call(this);var d=KJUR,c=d.asn1,b=c.DERUTCTime,g=c.DERGeneralizedTime;this.setTimeParams=function(h){this.timeParams=h;};this.getEncodedHex=function(){var h=null;if(this.timeParams!=null){if(this.type=="utc"){h=new b(this.timeParams);}else{h=new g(this.timeParams);}}else{if(this.type=="utc"){h=new b();}else{h=new g();}}this.TLV=h.getEncodedHex();return this.TLV};this.type="utc";if(f!==undefined){if(f.type!==undefined){this.type=f.type;}else{if(f.str!==undefined){if(f.str.match(/^[0-9]{12}Z$/)){this.type="utc";}if(f.str.match(/^[0-9]{14}Z$/)){this.type="gen";}}}this.timeParams=f;}};YAHOO.lang.extend(KJUR.asn1.x509.Time,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AlgorithmIdentifier=function(d){KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);this.nameAlg=null;this.asn1Alg=null;this.asn1Params=null;this.paramEmpty=false;var b=KJUR,a=b.asn1;this.getEncodedHex=function(){if(this.nameAlg===null&&this.asn1Alg===null){throw"algorithm not specified"}if(this.nameAlg!==null&&this.asn1Alg===null){this.asn1Alg=a.x509.OID.name2obj(this.nameAlg);}var e=[this.asn1Alg];if(this.asn1Params!==null){e.push(this.asn1Params);}var f=new a.DERSequence({array:e});this.hTLV=f.getEncodedHex();return this.hTLV};if(d!==undefined){if(d.name!==undefined){this.nameAlg=d.name;}if(d.asn1params!==undefined){this.asn1Params=d.asn1params;}if(d.paramempty!==undefined){this.paramEmpty=d.paramempty;}}if(this.asn1Params===null&&this.paramEmpty===false&&this.nameAlg!==null){var c=this.nameAlg.toLowerCase();if(c.substr(-7,7)!=="withdsa"&&c.substr(-9,9)!=="withecdsa"){this.asn1Params=new a.DERNull();}}};YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralName=function(e){KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);var k={rfc822:"81",dns:"82",dn:"a4",uri:"86",ip:"87"},b=KJUR,g=b.asn1,f=g.DERSequence,j=g.DEROctetString,d=g.DERIA5String,c=g.DERTaggedObject,l=g.ASN1Object,a=g.x509.X500Name,h=pemtohex;this.explicit=false;this.setByParam=function(p){var u=null;if(p===undefined){return}if(p.rfc822!==undefined){this.type="rfc822";u=new d({str:p[this.type]});}if(p.dns!==undefined){this.type="dns";u=new d({str:p[this.type]});}if(p.uri!==undefined){this.type="uri";u=new d({str:p[this.type]});}if(p.dn!==undefined){this.type="dn";this.explicit=true;u=new a({str:p.dn});}if(p.ldapdn!==undefined){this.type="dn";this.explicit=true;u=new a({ldapstr:p.ldapdn});}if(p.certissuer!==undefined){this.type="dn";this.explicit=true;var o=p.certissuer;var w=null;if(o.match(/^[0-9A-Fa-f]+$/));if(o.indexOf("-----BEGIN ")!=-1){w=h(o);}if(w==null){throw"certissuer param not cert"}var t=new X509();t.hex=w;var y=t.getIssuerHex();u=new l();u.hTLV=y;}if(p.certsubj!==undefined){this.type="dn";this.explicit=true;var o=p.certsubj;var w=null;if(o.match(/^[0-9A-Fa-f]+$/));if(o.indexOf("-----BEGIN ")!=-1){w=h(o);}if(w==null){throw"certsubj param not cert"}var t=new X509();t.hex=w;var y=t.getSubjectHex();u=new l();u.hTLV=y;}if(p.ip!==undefined){this.type="ip";this.explicit=false;var q=p.ip;var s;var n="malformed IP address";if(q.match(/^[0-9.]+[.][0-9.]+$/)){s=intarystrtohex("["+q.split(".").join(",")+"]");if(s.length!==8){throw n}}else{if(q.match(/^[0-9A-Fa-f:]+:[0-9A-Fa-f:]+$/)){s=ipv6tohex(q);}else{if(q.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/)){s=q;}else{throw n}}}u=new j({hex:s});}if(this.type==null){throw"unsupported type in params="+p}this.asn1Obj=new c({explicit:this.explicit,tag:k[this.type],obj:u});};this.getEncodedHex=function(){return this.asn1Obj.getEncodedHex()};if(e!==undefined){this.setByParam(e);}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralNames=function(d){KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);var c=KJUR,b=c.asn1;this.setByParamArray=function(g){for(var e=0;e<g.length;e++){var f=new b.x509.GeneralName(g[e]);this.asn1Array.push(f);}};this.getEncodedHex=function(){var e=new b.DERSequence({array:this.asn1Array});return e.getEncodedHex()};this.asn1Array=new Array();if(typeof d!="undefined"){this.setByParamArray(d);}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPointName=function(b){KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);var d=KJUR,c=d.asn1,f=c.DERTaggedObject;this.getEncodedHex=function(){if(this.type!="full"){throw"currently type shall be 'full': "+this.type}this.asn1Obj=new f({explicit:false,tag:this.tag,obj:this.asn1V});this.hTLV=this.asn1Obj.getEncodedHex();return this.hTLV};if(b!==undefined){if(c.x509.GeneralNames.prototype.isPrototypeOf(b)){this.type="full";this.tag="a0";this.asn1V=b;}else{throw"This class supports GeneralNames only as argument"}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPoint=function(d){KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);var c=KJUR,b=c.asn1;this.getEncodedHex=function(){var e=new b.DERSequence();if(this.asn1DP!=null){var f=new b.DERTaggedObject({explicit:true,tag:"a0",obj:this.asn1DP});e.appendASN1Object(f);}this.hTLV=e.getEncodedHex();return this.hTLV};if(d!==undefined){if(d.dpobj!==undefined){this.asn1DP=d.dpobj;}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint,KJUR.asn1.ASN1Object);KJUR.asn1.x509.OID=new function(a){this.atype2oidList={CN:"2.5.4.3",L:"2.5.4.7",ST:"2.5.4.8",O:"2.5.4.10",OU:"2.5.4.11",C:"2.5.4.6",STREET:"2.5.4.9",DC:"0.9.2342.19200300.100.1.25",UID:"0.9.2342.19200300.100.1.1",SN:"2.5.4.4",T:"2.5.4.12",DN:"2.5.4.49",E:"1.2.840.113549.1.9.1",description:"2.5.4.13",businessCategory:"2.5.4.15",postalCode:"2.5.4.17",serialNumber:"2.5.4.5",uniqueIdentifier:"2.5.4.45",organizationIdentifier:"2.5.4.97",jurisdictionOfIncorporationL:"1.3.6.1.4.1.311.60.2.1.1",jurisdictionOfIncorporationSP:"1.3.6.1.4.1.311.60.2.1.2",jurisdictionOfIncorporationC:"1.3.6.1.4.1.311.60.2.1.3"};this.name2oidList={sha1:"1.3.14.3.2.26",sha256:"2.16.840.1.101.3.4.2.1",sha384:"2.16.840.1.101.3.4.2.2",sha512:"2.16.840.1.101.3.4.2.3",sha224:"2.16.840.1.101.3.4.2.4",md5:"1.2.840.113549.2.5",md2:"1.3.14.7.2.2.1",ripemd160:"1.3.36.3.2.1",MD2withRSA:"1.2.840.113549.1.1.2",MD4withRSA:"1.2.840.113549.1.1.3",MD5withRSA:"1.2.840.113549.1.1.4",SHA1withRSA:"1.2.840.113549.1.1.5",SHA224withRSA:"1.2.840.113549.1.1.14",SHA256withRSA:"1.2.840.113549.1.1.11",SHA384withRSA:"1.2.840.113549.1.1.12",SHA512withRSA:"1.2.840.113549.1.1.13",SHA1withECDSA:"1.2.840.10045.4.1",SHA224withECDSA:"1.2.840.10045.4.3.1",SHA256withECDSA:"1.2.840.10045.4.3.2",SHA384withECDSA:"1.2.840.10045.4.3.3",SHA512withECDSA:"1.2.840.10045.4.3.4",dsa:"1.2.840.10040.4.1",SHA1withDSA:"1.2.840.10040.4.3",SHA224withDSA:"2.16.840.1.101.3.4.3.1",SHA256withDSA:"2.16.840.1.101.3.4.3.2",rsaEncryption:"1.2.840.113549.1.1.1",commonName:"2.5.4.3",countryName:"2.5.4.6",localityName:"2.5.4.7",stateOrProvinceName:"2.5.4.8",streetAddress:"2.5.4.9",organizationName:"2.5.4.10",organizationalUnitName:"2.5.4.11",domainComponent:"0.9.2342.19200300.100.1.25",userId:"0.9.2342.19200300.100.1.1",surname:"2.5.4.4",title:"2.5.4.12",distinguishedName:"2.5.4.49",emailAddress:"1.2.840.113549.1.9.1",description:"2.5.4.13",businessCategory:"2.5.4.15",postalCode:"2.5.4.17",uniqueIdentifier:"2.5.4.45",organizationIdentifier:"2.5.4.97",jurisdictionOfIncorporationL:"1.3.6.1.4.1.311.60.2.1.1",jurisdictionOfIncorporationSP:"1.3.6.1.4.1.311.60.2.1.2",jurisdictionOfIncorporationC:"1.3.6.1.4.1.311.60.2.1.3",subjectKeyIdentifier:"2.5.29.14",keyUsage:"2.5.29.15",subjectAltName:"2.5.29.17",issuerAltName:"2.5.29.18",basicConstraints:"2.5.29.19",nameConstraints:"2.5.29.30",cRLDistributionPoints:"2.5.29.31",certificatePolicies:"2.5.29.32",authorityKeyIdentifier:"2.5.29.35",policyConstraints:"2.5.29.36",extKeyUsage:"2.5.29.37",authorityInfoAccess:"1.3.6.1.5.5.7.1.1",ocsp:"1.3.6.1.5.5.7.48.1",caIssuers:"1.3.6.1.5.5.7.48.2",anyExtendedKeyUsage:"2.5.29.37.0",serverAuth:"1.3.6.1.5.5.7.3.1",clientAuth:"1.3.6.1.5.5.7.3.2",codeSigning:"1.3.6.1.5.5.7.3.3",emailProtection:"1.3.6.1.5.5.7.3.4",timeStamping:"1.3.6.1.5.5.7.3.8",ocspSigning:"1.3.6.1.5.5.7.3.9",ecPublicKey:"1.2.840.10045.2.1",secp256r1:"1.2.840.10045.3.1.7",secp256k1:"1.3.132.0.10",secp384r1:"1.3.132.0.34",pkcs5PBES2:"1.2.840.113549.1.5.13",pkcs5PBKDF2:"1.2.840.113549.1.5.12","des-EDE3-CBC":"1.2.840.113549.3.7",data:"1.2.840.113549.1.7.1","signed-data":"1.2.840.113549.1.7.2","enveloped-data":"1.2.840.113549.1.7.3","digested-data":"1.2.840.113549.1.7.5","encrypted-data":"1.2.840.113549.1.7.6","authenticated-data":"1.2.840.113549.1.9.16.1.2",tstinfo:"1.2.840.113549.1.9.16.1.4",extensionRequest:"1.2.840.113549.1.9.14",};this.objCache={};this.name2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.name2oidList[b]=="undefined"){throw"Name of ObjectIdentifier not defined: "+b}var c=this.name2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d};this.atype2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.atype2oidList[b]=="undefined"){throw"AttributeType name undefined: "+b}var c=this.atype2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d};};KJUR.asn1.x509.OID.oid2name=function(b){var c=KJUR.asn1.x509.OID.name2oidList;for(var a in c){if(c[a]==b){return a}}return""};KJUR.asn1.x509.OID.oid2atype=function(b){var c=KJUR.asn1.x509.OID.atype2oidList;for(var a in c){if(c[a]==b){return a}}return b};KJUR.asn1.x509.OID.name2oid=function(a){var b=KJUR.asn1.x509.OID.name2oidList;if(b[a]===undefined){return""}return b[a]};KJUR.asn1.x509.X509Util={};KJUR.asn1.x509.X509Util.newCertPEM=function(h){var g=KJUR.asn1.x509,b=g.TBSCertificate,a=g.Certificate;var f=new b();if(h.serial!==undefined){f.setSerialNumberByParam(h.serial);}else{throw"serial number undefined."}if(typeof h.sigalg.name==="string"){f.setSignatureAlgByParam(h.sigalg);}else{throw"unproper signature algorithm name"}if(h.issuer!==undefined){f.setIssuerByParam(h.issuer);}else{throw"issuer name undefined."}if(h.notbefore!==undefined){f.setNotBeforeByParam(h.notbefore);}else{throw"notbefore undefined."}if(h.notafter!==undefined){f.setNotAfterByParam(h.notafter);}else{throw"notafter undefined."}if(h.subject!==undefined){f.setSubjectByParam(h.subject);}else{throw"subject name undefined."}if(h.sbjpubkey!==undefined){f.setSubjectPublicKeyByGetKey(h.sbjpubkey);}else{throw"subject public key undefined."}if(h.ext!==undefined&&h.ext.length!==undefined){for(var d=0;d<h.ext.length;d++){for(key in h.ext[d]){f.appendExtensionByName(key,h.ext[d][key]);}}}if(h.cakey===undefined&&h.sighex===undefined){throw"param cakey and sighex undefined."}var e=null;var c=null;if(h.cakey){if(h.cakey.isPrivate===true){e=h.cakey;}else{e=KEYUTIL.getKey.apply(null,h.cakey);}c=new a({tbscertobj:f,prvkeyobj:e});c.sign();}if(h.sighex){c=new a({tbscertobj:f});c.setSignatureHex(h.sighex);}return c.getPEMString()};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}if(typeof KJUR.asn1.cms=="undefined"||!KJUR.asn1.cms){KJUR.asn1.cms={};}KJUR.asn1.cms.Attribute=function(d){var c=KJUR,b=c.asn1;b.cms.Attribute.superclass.constructor.call(this);this.getEncodedHex=function(){var h,g,e;h=new b.DERObjectIdentifier({oid:this.attrTypeOid});g=new b.DERSet({array:this.valueList});try{g.getEncodedHex();}catch(f){throw"fail valueSet.getEncodedHex in Attribute(1)/"+f}e=new b.DERSequence({array:[h,g]});try{this.hTLV=e.getEncodedHex();}catch(f){throw"failed seq.getEncodedHex in Attribute(2)/"+f}return this.hTLV};};YAHOO.lang.extend(KJUR.asn1.cms.Attribute,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentType=function(d){var c=KJUR,b=c.asn1;b.cms.ContentType.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.3";var a=null;if(typeof d!="undefined"){var a=new b.DERObjectIdentifier(d);this.valueList=[a];}};YAHOO.lang.extend(KJUR.asn1.cms.ContentType,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.MessageDigest=function(d){var b=KJUR,e=b.asn1,g=e.DEROctetString,i=e.cms;i.MessageDigest.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.4";if(d!==undefined){if(d.eciObj instanceof i.EncapsulatedContentInfo&&typeof d.hashAlg==="string"){var h=d.eciObj.eContentValueHex;var c=d.hashAlg;var a=b.crypto.Util.hashHex(h,c);var f=new g({hex:a});f.getEncodedHex();this.valueList=[f];}else{var f=new g(d);f.getEncodedHex();this.valueList=[f];}}};YAHOO.lang.extend(KJUR.asn1.cms.MessageDigest,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningTime=function(e){var d=KJUR,c=d.asn1;c.cms.SigningTime.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.5";if(e!==undefined){var a=new c.x509.Time(e);try{a.getEncodedHex();}catch(b){throw"SigningTime.getEncodedHex() failed/"+b}this.valueList=[a];}};YAHOO.lang.extend(KJUR.asn1.cms.SigningTime,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificate=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,e=b.cms,d=c.crypto;e.SigningCertificate.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.12";this.setCerts=function(n){var l=[];for(var k=0;k<n.length;k++){var h=pemtohex(n[k]);var g=c.crypto.Util.hashHex(h,"sha1");var o=new b.DEROctetString({hex:g});o.getEncodedHex();var m=new e.IssuerAndSerialNumber({cert:n[k]});m.getEncodedHex();var p=new a({array:[o,m]});p.getEncodedHex();l.push(p);}var j=new a({array:l});j.getEncodedHex();this.valueList=[j];};if(f!==undefined){if(typeof f.array=="object"){this.setCerts(f.array);}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificate,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificateV2=function(h){var d=KJUR,c=d.asn1,b=c.DERSequence,g=c.x509,f=c.cms,e=d.crypto;f.SigningCertificateV2.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.47";this.setCerts=function(r,k){var p=[];for(var n=0;n<r.length;n++){var l=pemtohex(r[n]);var t=[];if(k!=="sha256"){t.push(new g.AlgorithmIdentifier({name:k}));}var j=e.Util.hashHex(l,k);var s=new c.DEROctetString({hex:j});s.getEncodedHex();t.push(s);var o=new f.IssuerAndSerialNumber({cert:r[n]});o.getEncodedHex();t.push(o);var q=new b({array:t});q.getEncodedHex();p.push(q);}var m=new b({array:p});m.getEncodedHex();this.valueList=[m];};if(h!==undefined){if(typeof h.array=="object"){var a="sha256";if(typeof h.hashAlg=="string"){a=h.hashAlg;}this.setCerts(h.array,a);}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificateV2,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.IssuerAndSerialNumber=function(e){var b=KJUR,g=b.asn1,f=g.DERInteger,i=g.cms,d=g.x509,a=d.X500Name,c=X509;i.IssuerAndSerialNumber.superclass.constructor.call(this);this.setByCertPEM=function(n){var l=pemtohex(n);var k=new c();k.hex=l;var o=k.getIssuerHex();this.dIssuer=new a();this.dIssuer.hTLV=o;var m=k.getSerialNumberHex();this.dSerial=new f({hex:m});};this.getEncodedHex=function(){var k=new g.DERSequence({array:[this.dIssuer,this.dSerial]});this.hTLV=k.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e=="string"&&e.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(e);}if(e.issuer&&e.serial){if(e.issuer instanceof a){this.dIssuer=e.issuer;}else{this.dIssuer=new a(e.issuer);}if(e.serial instanceof f){this.dSerial=e.serial;}else{this.dSerial=new f(e.serial);}}if(typeof e.cert=="string"){this.setByCertPEM(e.cert);}}};YAHOO.lang.extend(KJUR.asn1.cms.IssuerAndSerialNumber,KJUR.asn1.ASN1Object);KJUR.asn1.cms.AttributeList=function(d){var b=KJUR,a=b.asn1,c=a.cms;c.AttributeList.superclass.constructor.call(this);this.list=new Array();this.sortFlag=true;this.add=function(e){if(e instanceof c.Attribute){this.list.push(e);}};this.length=function(){return this.list.length};this.clear=function(){this.list=new Array();this.hTLV=null;this.hV=null;};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var e=new a.DERSet({array:this.list,sortflag:this.sortFlag});this.hTLV=e.getEncodedHex();return this.hTLV};if(d!==undefined){if(typeof d.sortflag!="undefined"&&d.sortflag==false){this.sortFlag=false;}}};YAHOO.lang.extend(KJUR.asn1.cms.AttributeList,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignerInfo=function(e){var a=KJUR,h=a.asn1,b=h.DERTaggedObject,n=h.cms,j=n.AttributeList,g=n.ContentType,k=n.EncapsulatedContentInfo,c=n.MessageDigest,l=n.SignedData,d=h.x509,m=d.AlgorithmIdentifier,f=a.crypto,i=KEYUTIL;n.SignerInfo.superclass.constructor.call(this);this.dCMSVersion=new h.DERInteger({"int":1});this.dSignerIdentifier=null;this.dDigestAlgorithm=null;this.dSignedAttrs=new j();this.dSigAlg=null;this.dSig=null;this.dUnsignedAttrs=new j();this.setSignerIdentifier=function(p){if(typeof p=="string"&&p.indexOf("CERTIFICATE")!=-1&&p.indexOf("BEGIN")!=-1&&p.indexOf("END")!=-1){this.dSignerIdentifier=new n.IssuerAndSerialNumber({cert:p});}};this.setForContentAndHash=function(o){if(o!==undefined){if(o.eciObj instanceof k){this.dSignedAttrs.add(new g({oid:"1.2.840.113549.1.7.1"}));this.dSignedAttrs.add(new c({eciObj:o.eciObj,hashAlg:o.hashAlg}));}if(o.sdObj!==undefined&&o.sdObj instanceof l){if(o.sdObj.digestAlgNameList.join(":").indexOf(o.hashAlg)==-1){o.sdObj.digestAlgNameList.push(o.hashAlg);}}if(typeof o.hashAlg=="string"){this.dDigestAlgorithm=new m({name:o.hashAlg});}}};this.sign=function(t,p){this.dSigAlg=new m({name:p});var q=this.dSignedAttrs.getEncodedHex();var o=i.getKey(t);var s=new f.Signature({alg:p});s.init(o);s.updateHex(q);var r=s.sign();this.dSig=new h.DEROctetString({hex:r});};this.addUnsigned=function(o){this.hTLV=null;this.dUnsignedAttrs.hTLV=null;this.dUnsignedAttrs.add(o);};this.getEncodedHex=function(){if(this.dSignedAttrs instanceof j&&this.dSignedAttrs.length()==0){throw"SignedAttrs length = 0 (empty)"}var o=new b({obj:this.dSignedAttrs,tag:"a0",explicit:false});var r=null;if(this.dUnsignedAttrs.length()>0){r=new b({obj:this.dUnsignedAttrs,tag:"a1",explicit:false});}var q=[this.dCMSVersion,this.dSignerIdentifier,this.dDigestAlgorithm,o,this.dSigAlg,this.dSig,];if(r!=null){q.push(r);}var p=new h.DERSequence({array:q});this.hTLV=p.getEncodedHex();return this.hTLV};};YAHOO.lang.extend(KJUR.asn1.cms.SignerInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.EncapsulatedContentInfo=function(g){var c=KJUR,b=c.asn1,e=b.DERTaggedObject,a=b.DERSequence,h=b.DERObjectIdentifier,d=b.DEROctetString,f=b.cms;f.EncapsulatedContentInfo.superclass.constructor.call(this);this.dEContentType=new h({name:"data"});this.dEContent=null;this.isDetached=false;this.eContentValueHex=null;this.setContentType=function(i){if(i.match(/^[0-2][.][0-9.]+$/)){this.dEContentType=new h({oid:i});}else{this.dEContentType=new h({name:i});}};this.setContentValue=function(i){if(i!==undefined){if(typeof i.hex=="string"){this.eContentValueHex=i.hex;}else{if(typeof i.str=="string"){this.eContentValueHex=utf8tohex(i.str);}}}};this.setContentValueHex=function(i){this.eContentValueHex=i;};this.setContentValueStr=function(i){this.eContentValueHex=utf8tohex(i);};this.getEncodedHex=function(){if(typeof this.eContentValueHex!="string"){throw"eContentValue not yet set"}var k=new d({hex:this.eContentValueHex});this.dEContent=new e({obj:k,tag:"a0",explicit:true});var i=[this.dEContentType];if(!this.isDetached){i.push(this.dEContent);}var j=new a({array:i});this.hTLV=j.getEncodedHex();return this.hTLV};};YAHOO.lang.extend(KJUR.asn1.cms.EncapsulatedContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentInfo=function(f){var c=KJUR,b=c.asn1,d=b.DERTaggedObject,a=b.DERSequence,e=b.x509;KJUR.asn1.cms.ContentInfo.superclass.constructor.call(this);this.dContentType=null;this.dContent=null;this.setContentType=function(g){if(typeof g=="string"){this.dContentType=e.OID.name2obj(g);}};this.getEncodedHex=function(){var h=new d({obj:this.dContent,tag:"a0",explicit:true});var g=new a({array:[this.dContentType,h]});this.hTLV=g.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.type){this.setContentType(f.type);}if(f.obj&&f.obj instanceof b.ASN1Object){this.dContent=f.obj;}}};YAHOO.lang.extend(KJUR.asn1.cms.ContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignedData=function(e){var a=KJUR,h=a.asn1,j=h.ASN1Object,g=h.DERInteger,m=h.DERSet,f=h.DERSequence,b=h.DERTaggedObject,l=h.cms,i=l.EncapsulatedContentInfo,d=l.SignerInfo,n=l.ContentInfo,c=h.x509,k=c.AlgorithmIdentifier;KJUR.asn1.cms.SignedData.superclass.constructor.call(this);this.dCMSVersion=new g({"int":1});this.dDigestAlgs=null;this.digestAlgNameList=[];this.dEncapContentInfo=new i();this.dCerts=null;this.certificateList=[];this.crlList=[];this.signerInfoList=[new d()];this.addCertificatesByPEM=function(p){var q=pemtohex(p);var r=new j();r.hTLV=q;this.certificateList.push(r);};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}if(this.dDigestAlgs==null){var u=[];for(var t=0;t<this.digestAlgNameList.length;t++){var s=this.digestAlgNameList[t];var w=new k({name:s});u.push(w);}this.dDigestAlgs=new m({array:u});}var p=[this.dCMSVersion,this.dDigestAlgs,this.dEncapContentInfo];if(this.dCerts==null){if(this.certificateList.length>0){var v=new m({array:this.certificateList});this.dCerts=new b({obj:v,tag:"a0",explicit:false});}}if(this.dCerts!=null){p.push(this.dCerts);}var r=new m({array:this.signerInfoList});p.push(r);var q=new f({array:p});this.hTLV=q.getEncodedHex();return this.hTLV};this.getContentInfo=function(){this.getEncodedHex();var o=new n({type:"signed-data",obj:this});return o};this.getContentInfoEncodedHex=function(){var o=this.getContentInfo();var p=o.getEncodedHex();return p};this.getPEM=function(){return hextopem(this.getContentInfoEncodedHex(),"CMS")};};YAHOO.lang.extend(KJUR.asn1.cms.SignedData,KJUR.asn1.ASN1Object);KJUR.asn1.cms.CMSUtil=new function(){};KJUR.asn1.cms.CMSUtil.newSignedData=function(d){var b=KJUR,j=b.asn1,q=j.cms,f=q.SignerInfo,n=q.SignedData,o=q.SigningTime,a=q.SigningCertificate,p=q.SigningCertificateV2,c=j.cades,e=c.SignaturePolicyIdentifier;var m=new n();m.dEncapContentInfo.setContentValue(d.content);if(typeof d.certs=="object"){for(var h=0;h<d.certs.length;h++){m.addCertificatesByPEM(d.certs[h]);}}m.signerInfoList=[];for(var h=0;h<d.signerInfos.length;h++){var k=d.signerInfos[h];var g=new f();g.setSignerIdentifier(k.signerCert);g.setForContentAndHash({sdObj:m,eciObj:m.dEncapContentInfo,hashAlg:k.hashAlg});for(attrName in k.sAttr){var r=k.sAttr[attrName];if(attrName=="SigningTime"){var l=new o(r);g.dSignedAttrs.add(l);}if(attrName=="SigningCertificate"){var l=new a(r);g.dSignedAttrs.add(l);}if(attrName=="SigningCertificateV2"){var l=new p(r);g.dSignedAttrs.add(l);}if(attrName=="SignaturePolicyIdentifier"){var l=new e(r);g.dSignedAttrs.add(l);}}g.sign(k.signerPrvKey,k.sigAlg);m.signerInfoList.push(g);}return m};KJUR.asn1.cms.CMSUtil.verifySignedData=function(n){var C=KJUR,p=C.asn1,s=p.cms,D=s.SignerInfo,q=s.SignedData,y=s.SigningTime,b=s.SigningCertificate,d=s.SigningCertificateV2,A=p.cades,u=A.SignaturePolicyIdentifier,i=C.lang.String.isHex,v=ASN1HEX,h=v.getVbyList,a=v.getTLVbyList,t=v.getIdxbyList,z=v.getChildIdx,c=v.getTLV,B=v.oidname,j=C.crypto.Util.hashHex;if(n.cms===undefined&&!i(n.cms));var E=n.cms;var g=function(J,H){var G;for(var I=3;I<6;I++){G=t(J,0,[1,0,I]);if(G!==undefined){var F=J.substr(G,2);if(F==="a0"){H.certsIdx=G;}if(F==="a1"){H.revinfosIdx=G;}if(F==="31"){H.signerinfosIdx=G;}}}};var l=function(I,F){var H=F.signerinfosIdx;if(H===undefined){return}var L=z(I,H);F.signerInfoIdxList=L;for(var G=0;G<L.length;G++){var K=L[G];var J={idx:K};k(I,J);F.signerInfos.push(J);}};var k=function(I,J){var F=J.idx;J.signerid_issuer1=a(I,F,[1,0],"30");J.signerid_serial1=h(I,F,[1,1],"02");J.hashalg=B(h(I,F,[2,0],"06"));var H=t(I,F,[3],"a0");J.idxSignedAttrs=H;f(I,J,H);var G=z(I,F);var K=G.length;if(K<6){throw"malformed SignerInfo"}J.sigalg=B(h(I,F,[K-2,0],"06"));J.sigval=h(I,F,[K-1],"04");};var f=function(L,M,F){var J=z(L,F);M.signedAttrIdxList=J;for(var K=0;K<J.length;K++){var I=J[K];var G=h(L,I,[0],"06");var H;if(G==="2a864886f70d010905"){H=hextoutf8(h(L,I,[1,0]));M.saSigningTime=H;}else{if(G==="2a864886f70d010904"){H=h(L,I,[1,0],"04");M.saMessageDigest=H;}}}};var w=function(G,F){if(h(G,0,[0],"06")!=="2a864886f70d010702"){return F}F.cmsType="signedData";F.econtent=h(G,0,[1,0,2,1,0]);g(G,F);F.signerInfos=[];l(G,F);};var o=function(J,F){var G=F.parse.signerInfos;var L=G.length;var K=true;for(var I=0;I<L;I++){var H=G[I];e(J,F,H,I);if(!H.isValid){K=false;}}F.isValid=K;};var x=function(F,Q,J,P){var N=Q.parse.certsIdx;var H;if(Q.certs===undefined){H=[];Q.certkeys=[];var K=z(F,N);for(var I=0;I<K.length;I++){var M=c(F,K[I]);var O=new X509();O.readCertHex(M);H[I]=O;Q.certkeys[I]=O.getPublicKey();}Q.certs=H;}else{H=Q.certs;}Q.cccc=H.length;Q.cccci=K.length;for(var I=0;I<H.length;I++){var L=O.getIssuerHex();var G=O.getSerialNumberHex();if(J.signerid_issuer1===L&&J.signerid_serial1===G){J.certkey_idx=I;}}};var e=function(F,R,I,N){I.verifyDetail={};var Q=I.verifyDetail;var K=R.parse.econtent;var G=I.hashalg;var L=I.saMessageDigest;Q.validMessageDigest=false;if(j(K,G)===L){Q.validMessageDigest=true;}x(F,R,I,N);Q.validSignatureValue=false;var H=I.sigalg;var M="31"+c(F,I.idxSignedAttrs).substr(2);I.signedattrshex=M;var J=R.certs[I.certkey_idx].getPublicKey();var P=new KJUR.crypto.Signature({alg:H});P.init(J);P.updateHex(M);var O=P.verify(I.sigval);Q.validSignatureValue_isValid=O;if(O===true){Q.validSignatureValue=true;}I.isValid=false;if(Q.validMessageDigest&&Q.validSignatureValue){I.isValid=true;}};var r={isValid:false,parse:{}};w(E,r.parse);o(E,r);return r};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}if(typeof KJUR.asn1.tsp=="undefined"||!KJUR.asn1.tsp){KJUR.asn1.tsp={};}KJUR.asn1.tsp.Accuracy=function(f){var c=KJUR,b=c.asn1,e=b.DERInteger,a=b.DERSequence,d=b.DERTaggedObject;b.tsp.Accuracy.superclass.constructor.call(this);this.seconds=null;this.millis=null;this.micros=null;this.getEncodedHex=function(){var i=null;var k=null;var m=null;var g=[];if(this.seconds!=null){i=new e({"int":this.seconds});g.push(i);}if(this.millis!=null){var l=new e({"int":this.millis});k=new d({obj:l,tag:"80",explicit:false});g.push(k);}if(this.micros!=null){var j=new e({"int":this.micros});m=new d({obj:j,tag:"81",explicit:false});g.push(m);}var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(typeof f.seconds=="number"){this.seconds=f.seconds;}if(typeof f.millis=="number"){this.millis=f.millis;}if(typeof f.micros=="number"){this.micros=f.micros;}}};YAHOO.lang.extend(KJUR.asn1.tsp.Accuracy,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.MessageImprint=function(g){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.DEROctetString,f=b.x509,e=f.AlgorithmIdentifier;b.tsp.MessageImprint.superclass.constructor.call(this);this.dHashAlg=null;this.dHashValue=null;this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var h=new a({array:[this.dHashAlg,this.dHashValue]});return h.getEncodedHex()};if(g!==undefined){if(typeof g.hashAlg=="string"){this.dHashAlg=new e({name:g.hashAlg});}if(typeof g.hashValue=="string"){this.dHashValue=new d({hex:g.hashValue});}}};YAHOO.lang.extend(KJUR.asn1.tsp.MessageImprint,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampReq=function(c){var a=KJUR,f=a.asn1,d=f.DERSequence,e=f.DERInteger,g=f.DERBoolean,i=f.DERObjectIdentifier,h=f.tsp,b=h.MessageImprint;h.TimeStampReq.superclass.constructor.call(this);this.dVersion=new e({"int":1});this.dMessageImprint=null;this.dPolicy=null;this.dNonce=null;this.certReq=true;this.setMessageImprint=function(j){if(j instanceof b){this.dMessageImprint=j;return}if(typeof j=="object"){this.dMessageImprint=new b(j);}};this.getEncodedHex=function(){if(this.dMessageImprint==null){throw"messageImprint shall be specified"}var j=[this.dVersion,this.dMessageImprint];if(this.dPolicy!=null){j.push(this.dPolicy);}if(this.dNonce!=null){j.push(this.dNonce);}if(this.certReq){j.push(new g());}var k=new d({array:j});this.hTLV=k.getEncodedHex();return this.hTLV};if(c!==undefined){if(typeof c.mi=="object"){this.setMessageImprint(c.mi);}if(typeof c.policy=="object"){this.dPolicy=new i(c.policy);}if(typeof c.nonce=="object"){this.dNonce=new e(c.nonce);}if(typeof c.certreq=="boolean"){this.certReq=c.certreq;}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampReq,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TSTInfo=function(e){var c=KJUR,i=c.asn1,f=i.DERSequence,h=i.DERInteger,k=i.DERBoolean,g=i.DERGeneralizedTime,l=i.DERObjectIdentifier,j=i.tsp,d=j.MessageImprint,b=j.Accuracy,a=i.x509.X500Name;j.TSTInfo.superclass.constructor.call(this);this.dVersion=new h({"int":1});this.dPolicy=null;this.dMessageImprint=null;this.dSerialNumber=null;this.dGenTime=null;this.dAccuracy=null;this.dOrdering=null;this.dNonce=null;this.dTsa=null;this.getEncodedHex=function(){var m=[this.dVersion];if(this.dPolicy==null){throw"policy shall be specified."}m.push(this.dPolicy);if(this.dMessageImprint==null){throw"messageImprint shall be specified."}m.push(this.dMessageImprint);if(this.dSerialNumber==null){throw"serialNumber shall be specified."}m.push(this.dSerialNumber);if(this.dGenTime==null){throw"genTime shall be specified."}m.push(this.dGenTime);if(this.dAccuracy!=null){m.push(this.dAccuracy);}if(this.dOrdering!=null){m.push(this.dOrdering);}if(this.dNonce!=null){m.push(this.dNonce);}if(this.dTsa!=null){m.push(this.dTsa);}var n=new f({array:m});this.hTLV=n.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e.policy=="string"){if(!e.policy.match(/^[0-9.]+$/)){throw"policy shall be oid like 0.1.4.134"}this.dPolicy=new l({oid:e.policy});}if(e.messageImprint!==undefined){this.dMessageImprint=new d(e.messageImprint);}if(e.serialNumber!==undefined){this.dSerialNumber=new h(e.serialNumber);}if(e.genTime!==undefined){this.dGenTime=new g(e.genTime);}if(e.accuracy!==undefined){this.dAccuracy=new b(e.accuracy);}if(e.ordering!==undefined&&e.ordering==true){this.dOrdering=new k();}if(e.nonce!==undefined){this.dNonce=new h(e.nonce);}if(e.tsa!==undefined){this.dTsa=new a(e.tsa);}}};YAHOO.lang.extend(KJUR.asn1.tsp.TSTInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampResp=function(g){var e=KJUR,d=e.asn1,c=d.DERSequence,f=d.ASN1Object,a=d.tsp,b=a.PKIStatusInfo;a.TimeStampResp.superclass.constructor.call(this);this.dStatus=null;this.dTST=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var h=[this.dStatus];if(this.dTST!=null){h.push(this.dTST);}var i=new c({array:h});this.hTLV=i.getEncodedHex();return this.hTLV};if(g!==undefined){if(typeof g.status=="object"){this.dStatus=new b(g.status);}if(g.tst!==undefined&&g.tst instanceof f){this.dTST=g.tst.getContentInfo();}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampResp,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatusInfo=function(h){var g=KJUR,f=g.asn1,e=f.DERSequence,a=f.tsp,d=a.PKIStatus,c=a.PKIFreeText,b=a.PKIFailureInfo;a.PKIStatusInfo.superclass.constructor.call(this);this.dStatus=null;this.dStatusString=null;this.dFailureInfo=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var i=[this.dStatus];if(this.dStatusString!=null){i.push(this.dStatusString);}if(this.dFailureInfo!=null){i.push(this.dFailureInfo);}var j=new e({array:i});this.hTLV=j.getEncodedHex();return this.hTLV};if(h!==undefined){if(typeof h.status=="object"){this.dStatus=new d(h.status);}if(typeof h.statstr=="object"){this.dStatusString=new c({array:h.statstr});}if(typeof h.failinfo=="object"){this.dFailureInfo=new b(h.failinfo);}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatusInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus=function(h){var d=KJUR,c=d.asn1,g=c.DERInteger,a=c.tsp,b=a.PKIStatus;a.PKIStatus.superclass.constructor.call(this);this.getEncodedHex=function(){this.hTLV=this.dStatus.getEncodedHex();return this.hTLV};if(h!==undefined){if(h.name!==undefined){var e=b.valueList;if(e[h.name]===undefined){throw"name undefined: "+h.name}this.dStatus=new g({"int":e[h.name]});}else{this.dStatus=new g(h);}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatus,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus.valueList={granted:0,grantedWithMods:1,rejection:2,waiting:3,revocationWarning:4,revocationNotification:5};KJUR.asn1.tsp.PKIFreeText=function(f){var e=KJUR,d=e.asn1,b=d.DERSequence,c=d.DERUTF8String,a=d.tsp;a.PKIFreeText.superclass.constructor.call(this);this.textList=[];this.getEncodedHex=function(){var g=[];for(var j=0;j<this.textList.length;j++){g.push(new c({str:this.textList[j]}));}var h=new b({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(typeof f.array=="object"){this.textList=f.array;}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFreeText,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo=function(g){var d=KJUR,c=d.asn1,f=c.DERBitString,a=c.tsp,b=a.PKIFailureInfo;b.superclass.constructor.call(this);this.value=null;this.getEncodedHex=function(){if(this.value==null){throw"value shall be specified"}var h=new Number(this.value).toString(2);var i=new f();i.setByBinaryString(h);this.hTLV=i.getEncodedHex();return this.hTLV};if(g!==undefined){if(typeof g.name=="string"){var e=b.valueList;if(e[g.name]===undefined){throw"name undefined: "+g.name}this.value=e[g.name];}else{if(typeof g["int"]=="number"){this.value=g["int"];}}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFailureInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo.valueList={badAlg:0,badRequest:2,badDataFormat:5,timeNotAvailable:14,unacceptedPolicy:15,unacceptedExtension:16,addInfoNotAvailable:17,systemFailure:25};KJUR.asn1.tsp.AbstractTSAAdapter=function(a){this.getTSTHex=function(c,b){throw"not implemented yet"};};KJUR.asn1.tsp.SimpleTSAAdapter=function(e){var d=KJUR,c=d.asn1,a=c.tsp,b=d.crypto.Util.hashHex;a.SimpleTSAAdapter.superclass.constructor.call(this);this.params=null;this.serial=0;this.getTSTHex=function(g,f){var i=b(g,f);this.params.tstInfo.messageImprint={hashAlg:f,hashValue:i};this.params.tstInfo.serialNumber={"int":this.serial++};var h=Math.floor(Math.random()*1000000000);this.params.tstInfo.nonce={"int":h};var j=a.TSPUtil.newTimeStampToken(this.params);return j.getContentInfoEncodedHex()};if(e!==undefined){this.params=e;}};YAHOO.lang.extend(KJUR.asn1.tsp.SimpleTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.FixedTSAAdapter=function(e){var d=KJUR,c=d.asn1,a=c.tsp,b=d.crypto.Util.hashHex;a.FixedTSAAdapter.superclass.constructor.call(this);this.params=null;this.getTSTHex=function(g,f){var h=b(g,f);this.params.tstInfo.messageImprint={hashAlg:f,hashValue:h};var i=a.TSPUtil.newTimeStampToken(this.params);return i.getContentInfoEncodedHex()};if(e!==undefined){this.params=e;}};YAHOO.lang.extend(KJUR.asn1.tsp.FixedTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.TSPUtil=new function(){};KJUR.asn1.tsp.TSPUtil.newTimeStampToken=function(c){var b=KJUR,h=b.asn1,m=h.cms,k=h.tsp,a=h.tsp.TSTInfo;var j=new m.SignedData();var g=new a(c.tstInfo);var f=g.getEncodedHex();j.dEncapContentInfo.setContentValue({hex:f});j.dEncapContentInfo.setContentType("tstinfo");if(typeof c.certs=="object"){for(var e=0;e<c.certs.length;e++){j.addCertificatesByPEM(c.certs[e]);}}var d=j.signerInfoList[0];d.setSignerIdentifier(c.signerCert);d.setForContentAndHash({sdObj:j,eciObj:j.dEncapContentInfo,hashAlg:c.hashAlg});var l=new m.SigningCertificate({array:[c.signerCert]});d.dSignedAttrs.add(l);d.sign(c.signerPrvKey,c.sigAlg);return j};KJUR.asn1.tsp.TSPUtil.parseTimeStampReq=function(m){var l=ASN1HEX;var h=l.getChildIdx;var f=l.getV;var b=l.getTLV;var j={};j.certreq=false;var a=h(m,0);if(a.length<2){throw"TimeStampReq must have at least 2 items"}var e=b(m,a[1]);j.mi=KJUR.asn1.tsp.TSPUtil.parseMessageImprint(e);for(var d=2;d<a.length;d++){var g=a[d];var k=m.substr(g,2);if(k=="06"){var c=f(m,g);j.policy=l.hextooidstr(c);}if(k=="02"){j.nonce=f(m,g);}if(k=="01"){j.certreq=true;}}return j};KJUR.asn1.tsp.TSPUtil.parseMessageImprint=function(c){var m=ASN1HEX;var j=m.getChildIdx;var i=m.getV;var g=m.getIdxbyList;var k={};if(c.substr(0,2)!="30"){throw"head of messageImprint hex shall be '30'"}var a=j(c,0);var l=g(c,0,[0,0]);var e=i(c,l);var d=m.hextooidstr(e);var h=KJUR.asn1.x509.OID.oid2name(d);if(h==""){throw"hashAlg name undefined: "+d}var b=h;var f=g(c,0,[1]);k.hashAlg=b;k.hashValue=i(c,f);return k};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}if(typeof KJUR.asn1.cades=="undefined"||!KJUR.asn1.cades){KJUR.asn1.cades={};}KJUR.asn1.cades.SignaturePolicyIdentifier=function(f){var b=KJUR,h=b.asn1,i=h.DERObjectIdentifier,g=h.DERSequence,e=h.cades,c=e.OtherHashAlgAndValue;e.SignaturePolicyIdentifier.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.15";if(f!==undefined){if(typeof f.oid=="string"&&typeof f.hash=="object"){var d=new i({oid:f.oid});var a=new c(f.hash);var j=new g({array:[d,a]});this.valueList=[j];}}};YAHOO.lang.extend(KJUR.asn1.cades.SignaturePolicyIdentifier,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherHashAlgAndValue=function(e){var a=KJUR,g=a.asn1,f=g.DERSequence,h=g.DEROctetString,d=g.x509,i=d.AlgorithmIdentifier,c=g.cades,b=c.OtherHashAlgAndValue;b.superclass.constructor.call(this);this.dAlg=null;this.dHash=null;this.getEncodedHex=function(){var j=new f({array:[this.dAlg,this.dHash]});this.hTLV=j.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e.alg=="string"&&typeof e.hash=="string"){this.dAlg=new i({name:e.alg});this.dHash=new h({hex:e.hash});}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHashAlgAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.cades.SignatureTimeStamp=function(h){var c=KJUR,b=c.asn1,e=b.ASN1Object,g=b.x509,a=b.cades;a.SignatureTimeStamp.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.14";this.tstHex=null;if(h!==undefined){if(h.res!==undefined){if(typeof h.res=="string"&&h.res.match(/^[0-9A-Fa-f]+$/));else{if(h.res instanceof e);else{throw"res param shall be ASN1Object or hex string"}}}if(h.tst!==undefined){if(typeof h.tst=="string"&&h.tst.match(/^[0-9A-Fa-f]+$/)){var f=new e();this.tstHex=h.tst;f.hTLV=this.tstHex;f.getEncodedHex();this.valueList=[f];}else{if(h.tst instanceof e);else{throw"tst param shall be ASN1Object or hex string"}}}}};YAHOO.lang.extend(KJUR.asn1.cades.SignatureTimeStamp,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.CompleteCertificateRefs=function(d){var c=KJUR,b=c.asn1,a=b.cades;a.CompleteCertificateRefs.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.21";this.setByArray=function(e){this.valueList=[];for(var f=0;f<e.length;f++){var g=new a.OtherCertID(e[f]);this.valueList.push(g);}};if(d!==undefined){if(typeof d=="object"&&typeof d.length=="number"){this.setByArray(d);}}};YAHOO.lang.extend(KJUR.asn1.cades.CompleteCertificateRefs,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherCertID=function(e){var c=KJUR,b=c.asn1,d=b.cms,a=b.cades;a.OtherCertID.superclass.constructor.call(this);this.hasIssuerSerial=true;this.dOtherCertHash=null;this.dIssuerSerial=null;this.setByCertPEM=function(f){this.dOtherCertHash=new a.OtherHash(f);if(this.hasIssuerSerial){this.dIssuerSerial=new d.IssuerAndSerialNumber(f);}};this.getEncodedHex=function(){if(this.hTLV!=null){return this.hTLV}if(this.dOtherCertHash==null){throw"otherCertHash not set"}var f=[this.dOtherCertHash];if(this.dIssuerSerial!=null){f.push(this.dIssuerSerial);}var g=new b.DERSequence({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e=="string"&&e.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(e);}if(typeof e=="object"){if(e.hasis===false){this.hasIssuerSerial=false;}if(typeof e.cert=="string"){this.setByCertPEM(e.cert);}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherCertID,KJUR.asn1.ASN1Object);KJUR.asn1.cades.OtherHash=function(f){var d=KJUR,c=d.asn1,e=c.cms,b=c.cades,g=b.OtherHashAlgAndValue,a=d.crypto.Util.hashHex;b.OtherHash.superclass.constructor.call(this);this.alg="sha256";this.dOtherHash=null;this.setByCertPEM=function(h){if(h.indexOf("-----BEGIN ")==-1){throw"certPEM not to seem PEM format"}var i=pemtohex(h);var j=a(i,this.alg);this.dOtherHash=new g({alg:this.alg,hash:j});};this.getEncodedHex=function(){if(this.dOtherHash==null){throw"OtherHash not set"}return this.dOtherHash.getEncodedHex()};if(f!==undefined){if(typeof f=="string"){if(f.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(f);}else{if(f.match(/^[0-9A-Fa-f]+$/)){this.dOtherHash=new c.DEROctetString({hex:f});}else{throw"unsupported string value for params"}}}else{if(typeof f=="object"){if(typeof f.cert=="string"){if(typeof f.alg=="string"){this.alg=f.alg;}this.setByCertPEM(f.cert);}else{this.dOtherHash=new g(f);}}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHash,KJUR.asn1.ASN1Object);KJUR.asn1.cades.CAdESUtil=new function(){};KJUR.asn1.cades.CAdESUtil.addSigTS=function(c,b,a){};KJUR.asn1.cades.CAdESUtil.parseSignedDataForAddingUnsigned=function(e){var p=ASN1HEX,u=p.getChildIdx,b=p.getTLV,a=p.getTLVbyList,k=p.getIdxbyList,A=KJUR,g=A.asn1,l=g.ASN1Object,j=g.cms,h=j.SignedData,v=g.cades,z=v.CAdESUtil;var m={};if(a(e,0,[0])!="06092a864886f70d010702"){throw"hex is not CMS SignedData"}var y=k(e,0,[1,0]);var B=u(e,y);if(B.length<4){throw"num of SignedData elem shall be 4 at least"}var d=B.shift();m.version=b(e,d);var w=B.shift();m.algs=b(e,w);var c=B.shift();m.encapcontent=b(e,c);m.certs=null;m.revs=null;m.si=[];var o=B.shift();if(e.substr(o,2)=="a0"){m.certs=b(e,o);o=B.shift();}if(e.substr(o,2)=="a1"){m.revs=b(e,o);o=B.shift();}var t=o;if(e.substr(t,2)!="31"){throw"Can't find signerInfos"}var f=u(e,t);for(var q=0;q<f.length;q++){var s=f[q];var n=z.parseSignerInfoForAddingUnsigned(e,s,q);m.si[q]=n;}var x=null;m.obj=new h();x=new l();x.hTLV=m.version;m.obj.dCMSVersion=x;x=new l();x.hTLV=m.algs;m.obj.dDigestAlgs=x;x=new l();x.hTLV=m.encapcontent;m.obj.dEncapContentInfo=x;x=new l();x.hTLV=m.certs;m.obj.dCerts=x;m.obj.signerInfoList=[];for(var q=0;q<m.si.length;q++){m.obj.signerInfoList.push(m.si[q].obj);}return m};KJUR.asn1.cades.CAdESUtil.parseSignerInfoForAddingUnsigned=function(g,q,c){var p=ASN1HEX,s=p.getChildIdx,a=p.getTLV,l=p.getV,v=KJUR,h=v.asn1,n=h.ASN1Object,j=h.cms,k=j.AttributeList,w=j.SignerInfo;var o={};var t=s(g,q);if(t.length!=6){throw"not supported items for SignerInfo (!=6)"}var d=t.shift();o.version=a(g,d);var e=t.shift();o.si=a(g,e);var m=t.shift();o.digalg=a(g,m);var f=t.shift();o.sattrs=a(g,f);var i=t.shift();o.sigalg=a(g,i);var b=t.shift();o.sig=a(g,b);o.sigval=l(g,b);var u=null;o.obj=new w();u=new n();u.hTLV=o.version;o.obj.dCMSVersion=u;u=new n();u.hTLV=o.si;o.obj.dSignerIdentifier=u;u=new n();u.hTLV=o.digalg;o.obj.dDigestAlgorithm=u;u=new n();u.hTLV=o.sattrs;o.obj.dSignedAttrs=u;u=new n();u.hTLV=o.sigalg;o.obj.dSigAlg=u;u=new n();u.hTLV=o.sig;o.obj.dSig=u;o.obj.dUnsignedAttrs=new k();return o};
  if(typeof KJUR.asn1.csr=="undefined"||!KJUR.asn1.csr){KJUR.asn1.csr={};}KJUR.asn1.csr.CertificationRequest=function(d){var a=KJUR,f=a.asn1,b=f.DERBitString,e=f.DERSequence,k=f.csr,c=f.x509;k.CertificationRequest.superclass.constructor.call(this);this.sign=function(o,n){if(this.prvKey==null){this.prvKey=n;}this.asn1SignatureAlg=new c.AlgorithmIdentifier({name:o});sig=new a.crypto.Signature({alg:o});sig.init(this.prvKey);sig.updateHex(this.asn1CSRInfo.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new b({hex:"00"+this.hexSig});var m=new e({array:[this.asn1CSRInfo,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=m.getEncodedHex();this.isModified=false;};this.getPEMString=function(){return hextopem(this.getEncodedHex(),"CERTIFICATE REQUEST")};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};if(d!==undefined&&d.csrinfo!==undefined){this.asn1CSRInfo=d.csrinfo;}};YAHOO.lang.extend(KJUR.asn1.csr.CertificationRequest,KJUR.asn1.ASN1Object);KJUR.asn1.csr.CertificationRequestInfo=function(e){var b=KJUR,h=b.asn1,g=h.DERInteger,f=h.DERSequence,m=h.DERSet,j=h.DERNull,c=h.DERTaggedObject,k=h.DERObjectIdentifier,l=h.csr,d=h.x509,a=d.X500Name,n=d.Extension,i=KEYUTIL;l.CertificationRequestInfo.superclass.constructor.call(this);this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new g({"int":0});this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array();};this.setSubjectByParam=function(o){this.asn1Subject=new a(o);};this.setSubjectPublicKeyByGetKey=function(p){var o=i.getKey(p);this.asn1SubjPKey=new d.SubjectPublicKeyInfo(o);};this.appendExtensionByName=function(p,o){n.appendByNameToArray(p,o,this.extensionsArray);};this.getEncodedHex=function(){this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var s=new f({array:this.extensionsArray});var r=new m({array:[s]});var q=new f({array:[new k({oid:"1.2.840.113549.1.9.14"}),r]});var p=new c({explicit:true,tag:"a0",obj:q});this.asn1Array.push(p);}else{var p=new c({explicit:false,tag:"a0",obj:new j()});this.asn1Array.push(p);}var t=new f({array:this.asn1Array});this.hTLV=t.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize();};YAHOO.lang.extend(KJUR.asn1.csr.CertificationRequestInfo,KJUR.asn1.ASN1Object);KJUR.asn1.csr.CSRUtil=new function(){};KJUR.asn1.csr.CSRUtil.newCSRPEM=function(h){var c=KEYUTIL,b=KJUR.asn1.csr;if(h.subject===undefined){throw"parameter subject undefined"}if(h.sbjpubkey===undefined){throw"parameter sbjpubkey undefined"}if(h.sigalg===undefined){throw"parameter sigalg undefined"}if(h.sbjprvkey===undefined){throw"parameter sbjpubkey undefined"}var d=new b.CertificationRequestInfo();d.setSubjectByParam(h.subject);d.setSubjectPublicKeyByGetKey(h.sbjpubkey);if(h.ext!==undefined&&h.ext.length!==undefined){for(var e=0;e<h.ext.length;e++){for(key in h.ext[e]){d.appendExtensionByName(key,h.ext[e][key]);}}}var f=new b.CertificationRequest({csrinfo:d});var a=c.getKey(h.sbjprvkey);f.sign(h.sigalg,a);var g=f.getPEMString();return g};KJUR.asn1.csr.CSRUtil.getInfo=function(b){var d=ASN1HEX;var e=d.getTLVbyList;var a={};a.subject={};a.pubkey={};if(b.indexOf("-----BEGIN CERTIFICATE REQUEST")==-1){throw"argument is not PEM file"}var c=pemtohex(b,"CERTIFICATE REQUEST");a.subject.hex=e(c,0,[0,1]);a.subject.name=X509.hex2dn(a.subject.hex);a.pubkey.hex=e(c,0,[0,2]);a.pubkey.obj=KEYUTIL.getKey(a.pubkey.hex,null,"pkcs8pub");return a};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={};}if(typeof KJUR.asn1.ocsp=="undefined"||!KJUR.asn1.ocsp){KJUR.asn1.ocsp={};}KJUR.asn1.ocsp.DEFAULT_HASH="sha1";KJUR.asn1.ocsp.CertID=function(g){var d=KJUR,k=d.asn1,m=k.DEROctetString,j=k.DERInteger,h=k.DERSequence,f=k.x509,n=f.AlgorithmIdentifier,o=k.ocsp,l=o.DEFAULT_HASH,i=d.crypto,e=i.Util.hashHex,c=X509,q=ASN1HEX;o.CertID.superclass.constructor.call(this);this.dHashAlg=null;this.dIssuerNameHash=null;this.dIssuerKeyHash=null;this.dSerialNumber=null;this.setByValue=function(t,s,p,r){if(r===undefined){r=l;}this.dHashAlg=new n({name:r});this.dIssuerNameHash=new m({hex:t});this.dIssuerKeyHash=new m({hex:s});this.dSerialNumber=new j({hex:p});};this.setByCert=function(x,t,v){if(v===undefined){v=l;}var p=new c();p.readCertPEM(t);var y=new c();y.readCertPEM(x);var z=y.getPublicKeyHex();var w=q.getTLVbyList(z,0,[1,0],"30");var r=p.getSerialNumberHex();var s=e(y.getSubjectHex(),v);var u=e(w,v);this.setByValue(s,u,r,v);this.hoge=p.getSerialNumberHex();};this.getEncodedHex=function(){if(this.dHashAlg===null&&this.dIssuerNameHash===null&&this.dIssuerKeyHash===null&&this.dSerialNumber===null){throw"not yet set values"}var p=[this.dHashAlg,this.dIssuerNameHash,this.dIssuerKeyHash,this.dSerialNumber];var r=new h({array:p});this.hTLV=r.getEncodedHex();return this.hTLV};if(g!==undefined){var b=g;if(b.issuerCert!==undefined&&b.subjectCert!==undefined){var a=l;if(b.alg===undefined){a=undefined;}this.setByCert(b.issuerCert,b.subjectCert,a);}else{if(b.namehash!==undefined&&b.keyhash!==undefined&&b.serial!==undefined){var a=l;if(b.alg===undefined){a=undefined;}this.setByValue(b.namehash,b.keyhash,b.serial,a);}else{throw"invalid constructor arguments"}}}};YAHOO.lang.extend(KJUR.asn1.ocsp.CertID,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.Request=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.Request.superclass.constructor.call(this);this.dReqCert=null;this.dExt=null;this.getEncodedHex=function(){var g=[];if(this.dReqCert===null){throw"reqCert not set"}g.push(this.dReqCert);var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(typeof f!=="undefined"){var e=new d.CertID(f);this.dReqCert=e;}};YAHOO.lang.extend(KJUR.asn1.ocsp.Request,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.TBSRequest=function(e){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.TBSRequest.superclass.constructor.call(this);this.version=0;this.dRequestorName=null;this.dRequestList=[];this.dRequestExt=null;this.setRequestListByParam=function(h){var f=[];for(var g=0;g<h.length;g++){var j=new d.Request(h[0]);f.push(j);}this.dRequestList=f;};this.getEncodedHex=function(){var f=[];if(this.version!==0){throw"not supported version: "+this.version}if(this.dRequestorName!==null){throw"requestorName not supported"}var h=new a({array:this.dRequestList});f.push(h);if(this.dRequestExt!==null){throw"requestExtensions not supported"}var g=new a({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(e!==undefined){if(e.reqList!==undefined){this.setRequestListByParam(e.reqList);}}};YAHOO.lang.extend(KJUR.asn1.ocsp.TBSRequest,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.OCSPRequest=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.OCSPRequest.superclass.constructor.call(this);this.dTbsRequest=null;this.dOptionalSignature=null;this.getEncodedHex=function(){var g=[];if(this.dTbsRequest!==null){g.push(this.dTbsRequest);}else{throw"tbsRequest not set"}if(this.dOptionalSignature!==null){throw"optionalSignature not supported"}var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.reqList!==undefined){var e=new d.TBSRequest(f);this.dTbsRequest=e;}}};YAHOO.lang.extend(KJUR.asn1.ocsp.OCSPRequest,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.OCSPUtil={};KJUR.asn1.ocsp.OCSPUtil.getRequestHex=function(a,b,h){var d=KJUR,c=d.asn1,e=c.ocsp;if(h===undefined){h=e.DEFAULT_HASH;}var g={alg:h,issuerCert:a,subjectCert:b};var f=new e.OCSPRequest({reqList:[g]});return f.getEncodedHex()};KJUR.asn1.ocsp.OCSPUtil.getOCSPResponseInfo=function(b){var k=ASN1HEX;var c=k.getVbyList;var d=k.getIdxbyList;var c=k.getVbyList;var f=k.getV;var l={};try{var i=c(b,0,[0],"0a");l.responseStatus=parseInt(i,16);}catch(e){}if(l.responseStatus!==0){return l}try{var g=d(b,0,[1,0,1,0,0,2,0,1]);if(b.substr(g,2)==="80"){l.certStatus="good";}else{if(b.substr(g,2)==="a1"){l.certStatus="revoked";l.revocationTime=hextoutf8(c(b,g,[0]));}else{if(b.substr(g,2)==="82"){l.certStatus="unknown";}}}}catch(e){}try{var a=d(b,0,[1,0,1,0,0,2,0,2]);l.thisUpdate=hextoutf8(f(b,a));}catch(e){}try{var j=d(b,0,[1,0,1,0,0,2,0,3]);if(b.substr(j,2)==="a0"){l.nextUpdate=hextoutf8(c(b,j,[0]));}}catch(e){}return l};
  var KJUR;if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.lang=="undefined"||!KJUR.lang){KJUR.lang={};}KJUR.lang.String=function(){};function stoBA(d){var b=new Array();for(var c=0;c<d.length;c++){b[c]=d.charCodeAt(c);}return b}function BAtohex(b){var e="";for(var d=0;d<b.length;d++){var c=b[d].toString(16);if(c.length==1){c="0"+c;}e=e+c;}return e}function stohex(a){return BAtohex(stoBA(a))}function b64tob64u(a){a=a.replace(/\=/g,"");a=a.replace(/\+/g,"-");a=a.replace(/\//g,"_");return a}function b64utob64(a){if(a.length%4==2){a=a+"==";}else{if(a.length%4==3){a=a+"=";}}a=a.replace(/-/g,"+");a=a.replace(/_/g,"/");return a}function hextob64u(a){if(a.length%2==1){a="0"+a;}return b64tob64u(hex2b64(a))}function b64utohex(a){return b64tohex(b64utob64(a))}var utf8tob64u,b64utoutf8;if(typeof Buffer==="function"){utf8tob64u=function(a){return b64tob64u(new Buffer(a,"utf8").toString("base64"))};b64utoutf8=function(a){return new Buffer(b64utob64(a),"base64").toString("utf8")};}else{utf8tob64u=function(a){return hextob64u(uricmptohex(encodeURIComponentAll(a)))};b64utoutf8=function(a){return decodeURIComponent(hextouricmp(b64utohex(a)))};}function utf8tohex(a){return uricmptohex(encodeURIComponentAll(a))}function hextoutf8(a){return decodeURIComponent(hextouricmp(a))}function hextorstr(c){var b="";for(var a=0;a<c.length-1;a+=2){b+=String.fromCharCode(parseInt(c.substr(a,2),16));}return b}function rstrtohex(c){var a="";for(var b=0;b<c.length;b++){a+=("0"+c.charCodeAt(b).toString(16)).slice(-2);}return a}function hextob64(a){return hex2b64(a)}function hextob64nl(b){var a=hextob64(b);var c=a.replace(/(.{64})/g,"$1\r\n");c=c.replace(/\r\n$/,"");return c}function b64nltohex(b){var a=b.replace(/[^0-9A-Za-z\/+=]*/g,"");var c=b64tohex(a);return c}function hextopem(a,b){var c=hextob64nl(a);return"-----BEGIN "+b+"-----\r\n"+c+"\r\n-----END "+b+"-----\r\n"}function pemtohex(a,b){if(a.indexOf("-----BEGIN ")==-1){throw"can't find PEM header: "+b}if(b!==undefined){a=a.replace("-----BEGIN "+b+"-----","");a=a.replace("-----END "+b+"-----","");}else{a=a.replace(/-----BEGIN [^-]+-----/,"");a=a.replace(/-----END [^-]+-----/,"");}return b64nltohex(a)}function zulutomsec(n){var l,j,m,e,f,i,b;var a,h,g,c;c=n.match(/^(\d{2}|\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(|\.\d+)Z$/);if(c){a=c[1];l=parseInt(a);if(a.length===2){if(50<=l&&l<100){l=1900+l;}else{if(0<=l&&l<50){l=2000+l;}}}j=parseInt(c[2])-1;m=parseInt(c[3]);e=parseInt(c[4]);f=parseInt(c[5]);i=parseInt(c[6]);b=0;h=c[7];if(h!==""){g=(h.substr(1)+"00").substr(0,3);b=parseInt(g);}return Date.UTC(l,j,m,e,f,i,b)}throw"unsupported zulu format: "+n}function zulutosec(a){var b=zulutomsec(a);return ~~(b/1000)}function uricmptohex(a){return a.replace(/%/g,"")}function hextouricmp(a){return a.replace(/(..)/g,"%$1")}function ipv6tohex(g){var b="malformed IPv6 address";if(!g.match(/^[0-9A-Fa-f:]+$/)){throw b}g=g.toLowerCase();var d=g.split(":").length-1;if(d<2){throw b}var e=":".repeat(7-d+2);g=g.replace("::",e);var c=g.split(":");if(c.length!=8){throw b}for(var f=0;f<8;f++){c[f]=("0000"+c[f]).slice(-4);}return c.join("")}function hextoipv6(e){if(!e.match(/^[0-9A-Fa-f]{32}$/)){throw"malformed IPv6 address octet"}e=e.toLowerCase();var b=e.match(/.{1,4}/g);for(var d=0;d<8;d++){b[d]=b[d].replace(/^0+/,"");if(b[d]==""){b[d]="0";}}e=":"+b.join(":")+":";var c=e.match(/:(0:){2,}/g);if(c===null){return e.slice(1,-1)}var f="";for(var d=0;d<c.length;d++){if(c[d].length>f.length){f=c[d];}}e=e.replace(f,"::");return e.slice(1,-1)}function hextoip(b){var d="malformed hex value";if(!b.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/)){throw d}if(b.length==8){var c;try{c=parseInt(b.substr(0,2),16)+"."+parseInt(b.substr(2,2),16)+"."+parseInt(b.substr(4,2),16)+"."+parseInt(b.substr(6,2),16);return c}catch(a){throw d}}else{if(b.length==32){return hextoipv6(b)}else{return b}}}function encodeURIComponentAll(a){var d=encodeURIComponent(a);var b="";for(var c=0;c<d.length;c++){if(d[c]=="%"){b=b+d.substr(c,3);c=c+2;}else{b=b+"%"+stohex(d[c]);}}return b}KJUR.lang.String.isInteger=function(a){if(a.match(/^[0-9]+$/)){return true}else{if(a.match(/^-[0-9]+$/)){return true}else{return false}}};KJUR.lang.String.isHex=function(a){if(a.length%2==0&&(a.match(/^[0-9a-f]+$/)||a.match(/^[0-9A-F]+$/))){return true}else{return false}};KJUR.lang.String.isBase64=function(a){a=a.replace(/\s+/g,"");if(a.match(/^[0-9A-Za-z+\/]+={0,3}$/)&&a.length%4==0){return true}else{return false}};KJUR.lang.String.isBase64URL=function(a){if(a.match(/[+/=]/)){return false}a=b64utob64(a);return KJUR.lang.String.isBase64(a)};KJUR.lang.String.isIntegerArray=function(a){a=a.replace(/\s+/g,"");if(a.match(/^\[[0-9,]+\]$/)){return true}else{return false}};function hextoposhex(a){if(a.length%2==1){return"0"+a}if(a.substr(0,1)>"7"){return"00"+a}return a}function intarystrtohex(b){b=b.replace(/^\s*\[\s*/,"");b=b.replace(/\s*\]\s*$/,"");b=b.replace(/\s*/g,"");try{var c=b.split(/,/).map(function(g,e,h){var f=parseInt(g);if(f<0||255<f){throw"integer not in range 0-255"}var d=("00"+f.toString(16)).slice(-2);return d}).join("");return c}catch(a){throw"malformed integer array string: "+a}}if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={};}KJUR.crypto.Util=new function(){this.DIGESTINFOHEAD={sha1:"3021300906052b0e03021a05000414",sha224:"302d300d06096086480165030402040500041c",sha256:"3031300d060960864801650304020105000420",sha384:"3041300d060960864801650304020205000430",sha512:"3051300d060960864801650304020305000440",md2:"3020300c06082a864886f70d020205000410",md5:"3020300c06082a864886f70d020505000410",ripemd160:"3021300906052b2403020105000414",};this.DEFAULTPROVIDER={md5:"cryptojs",sha1:"cryptojs",sha224:"cryptojs",sha256:"cryptojs",sha384:"cryptojs",sha512:"cryptojs",ripemd160:"cryptojs",hmacmd5:"cryptojs",hmacsha1:"cryptojs",hmacsha224:"cryptojs",hmacsha256:"cryptojs",hmacsha384:"cryptojs",hmacsha512:"cryptojs",hmacripemd160:"cryptojs",MD5withRSA:"cryptojs/jsrsa",SHA1withRSA:"cryptojs/jsrsa",SHA224withRSA:"cryptojs/jsrsa",SHA256withRSA:"cryptojs/jsrsa",SHA384withRSA:"cryptojs/jsrsa",SHA512withRSA:"cryptojs/jsrsa",RIPEMD160withRSA:"cryptojs/jsrsa",MD5withECDSA:"cryptojs/jsrsa",SHA1withECDSA:"cryptojs/jsrsa",SHA224withECDSA:"cryptojs/jsrsa",SHA256withECDSA:"cryptojs/jsrsa",SHA384withECDSA:"cryptojs/jsrsa",SHA512withECDSA:"cryptojs/jsrsa",RIPEMD160withECDSA:"cryptojs/jsrsa",SHA1withDSA:"cryptojs/jsrsa",SHA224withDSA:"cryptojs/jsrsa",SHA256withDSA:"cryptojs/jsrsa",MD5withRSAandMGF1:"cryptojs/jsrsa",SHA1withRSAandMGF1:"cryptojs/jsrsa",SHA224withRSAandMGF1:"cryptojs/jsrsa",SHA256withRSAandMGF1:"cryptojs/jsrsa",SHA384withRSAandMGF1:"cryptojs/jsrsa",SHA512withRSAandMGF1:"cryptojs/jsrsa",RIPEMD160withRSAandMGF1:"cryptojs/jsrsa",};this.CRYPTOJSMESSAGEDIGESTNAME={md5:CryptoJS.algo.MD5,sha1:CryptoJS.algo.SHA1,sha224:CryptoJS.algo.SHA224,sha256:CryptoJS.algo.SHA256,sha384:CryptoJS.algo.SHA384,sha512:CryptoJS.algo.SHA512,ripemd160:CryptoJS.algo.RIPEMD160};this.getDigestInfoHex=function(a,b){if(typeof this.DIGESTINFOHEAD[b]=="undefined"){throw"alg not supported in Util.DIGESTINFOHEAD: "+b}return this.DIGESTINFOHEAD[b]+a};this.getPaddedDigestInfoHex=function(h,a,j){var c=this.getDigestInfoHex(h,a);var d=j/4;if(c.length+22>d){throw"key is too short for SigAlg: keylen="+j+","+a}var b="0001";var k="00"+c;var g="";var l=d-b.length-k.length;for(var f=0;f<l;f+=2){g+="ff";}var e=b+g+k;return e};this.hashString=function(a,c){var b=new KJUR.crypto.MessageDigest({alg:c});return b.digestString(a)};this.hashHex=function(b,c){var a=new KJUR.crypto.MessageDigest({alg:c});return a.digestHex(b)};this.sha1=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha1",prov:"cryptojs"});return b.digestString(a)};this.sha256=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestString(a)};this.sha256Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestHex(a)};this.sha512=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestString(a)};this.sha512Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestHex(a)};};KJUR.crypto.Util.md5=function(a){var b=new KJUR.crypto.MessageDigest({alg:"md5",prov:"cryptojs"});return b.digestString(a)};KJUR.crypto.Util.ripemd160=function(a){var b=new KJUR.crypto.MessageDigest({alg:"ripemd160",prov:"cryptojs"});return b.digestString(a)};KJUR.crypto.Util.SECURERANDOMGEN=new SecureRandom();KJUR.crypto.Util.getRandomHexOfNbytes=function(b){var a=new Array(b);KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(a);return BAtohex(a)};KJUR.crypto.Util.getRandomBigIntegerOfNbytes=function(a){return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbytes(a),16)};KJUR.crypto.Util.getRandomHexOfNbits=function(d){var c=d%8;var a=(d-c)/8;var b=new Array(a+1);KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(b);b[0]=(((255<<c)&255)^255)&b[0];return BAtohex(b)};KJUR.crypto.Util.getRandomBigIntegerOfNbits=function(a){return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbits(a),16)};KJUR.crypto.Util.getRandomBigIntegerZeroToMax=function(b){var a=b.bitLength();while(1){var c=KJUR.crypto.Util.getRandomBigIntegerOfNbits(a);if(b.compareTo(c)!=-1){return c}}};KJUR.crypto.Util.getRandomBigIntegerMinToMax=function(e,b){var c=e.compareTo(b);if(c==1){throw"biMin is greater than biMax"}if(c==0){return e}var a=b.subtract(e);var d=KJUR.crypto.Util.getRandomBigIntegerZeroToMax(a);return d.add(e)};KJUR.crypto.MessageDigest=function(c){this.setAlgAndProvider=function(g,f){g=KJUR.crypto.MessageDigest.getCanonicalAlgName(g);if(g!==null&&f===undefined){f=KJUR.crypto.Util.DEFAULTPROVIDER[g];}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(g)!=-1&&f=="cryptojs"){try{this.md=KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[g].create();}catch(e){throw"setAlgAndProvider hash alg set fail alg="+g+"/"+e}this.updateString=function(h){this.md.update(h);};this.updateHex=function(h){var i=CryptoJS.enc.Hex.parse(h);this.md.update(i);};this.digest=function(){var h=this.md.finalize();return h.toString(CryptoJS.enc.Hex)};this.digestString=function(h){this.updateString(h);return this.digest()};this.digestHex=function(h){this.updateHex(h);return this.digest()};}if(":sha256:".indexOf(g)!=-1&&f=="sjcl"){try{this.md=new sjcl.hash.sha256();}catch(e){throw"setAlgAndProvider hash alg set fail alg="+g+"/"+e}this.updateString=function(h){this.md.update(h);};this.updateHex=function(i){var h=sjcl.codec.hex.toBits(i);this.md.update(h);};this.digest=function(){var h=this.md.finalize();return sjcl.codec.hex.fromBits(h)};this.digestString=function(h){this.updateString(h);return this.digest()};this.digestHex=function(h){this.updateHex(h);return this.digest()};}};this.updateString=function(e){throw"updateString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.updateHex=function(e){throw"updateHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digest=function(){throw"digest() not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestString=function(e){throw"digestString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestHex=function(e){throw"digestHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};if(c!==undefined){if(c.alg!==undefined){this.algName=c.alg;if(c.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];}this.setAlgAndProvider(this.algName,this.provName);}}};KJUR.crypto.MessageDigest.getCanonicalAlgName=function(a){if(typeof a==="string"){a=a.toLowerCase();a=a.replace(/-/,"");}return a};KJUR.crypto.MessageDigest.getHashLength=function(c){var b=KJUR.crypto.MessageDigest;var a=b.getCanonicalAlgName(c);if(b.HASHLENGTH[a]===undefined){throw"not supported algorithm: "+c}return b.HASHLENGTH[a]};KJUR.crypto.MessageDigest.HASHLENGTH={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,ripemd160:20};KJUR.crypto.Mac=function(d){this.setAlgAndProvider=function(k,i){k=k.toLowerCase();if(k==null){k="hmacsha1";}k=k.toLowerCase();if(k.substr(0,4)!="hmac"){throw"setAlgAndProvider unsupported HMAC alg: "+k}if(i===undefined){i=KJUR.crypto.Util.DEFAULTPROVIDER[k];}this.algProv=k+"/"+i;var g=k.substr(4);if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(g)!=-1&&i=="cryptojs"){try{var j=KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[g];this.mac=CryptoJS.algo.HMAC.create(j,this.pass);}catch(h){throw"setAlgAndProvider hash alg set fail hashAlg="+g+"/"+h}this.updateString=function(l){this.mac.update(l);};this.updateHex=function(l){var m=CryptoJS.enc.Hex.parse(l);this.mac.update(m);};this.doFinal=function(){var l=this.mac.finalize();return l.toString(CryptoJS.enc.Hex)};this.doFinalString=function(l){this.updateString(l);return this.doFinal()};this.doFinalHex=function(l){this.updateHex(l);return this.doFinal()};}};this.updateString=function(g){throw"updateString(str) not supported for this alg/prov: "+this.algProv};this.updateHex=function(g){throw"updateHex(hex) not supported for this alg/prov: "+this.algProv};this.doFinal=function(){throw"digest() not supported for this alg/prov: "+this.algProv};this.doFinalString=function(g){throw"digestString(str) not supported for this alg/prov: "+this.algProv};this.doFinalHex=function(g){throw"digestHex(hex) not supported for this alg/prov: "+this.algProv};this.setPassword=function(h){if(typeof h=="string"){var g=h;if(h.length%2==1||!h.match(/^[0-9A-Fa-f]+$/)){g=rstrtohex(h);}this.pass=CryptoJS.enc.Hex.parse(g);return}if(typeof h!="object"){throw"KJUR.crypto.Mac unsupported password type: "+h}var g=null;if(h.hex!==undefined){if(h.hex.length%2!=0||!h.hex.match(/^[0-9A-Fa-f]+$/)){throw"Mac: wrong hex password: "+h.hex}g=h.hex;}if(h.utf8!==undefined){g=utf8tohex(h.utf8);}if(h.rstr!==undefined){g=rstrtohex(h.rstr);}if(h.b64!==undefined){g=b64tohex(h.b64);}if(h.b64u!==undefined){g=b64utohex(h.b64u);}if(g==null){throw"KJUR.crypto.Mac unsupported password type: "+h}this.pass=CryptoJS.enc.Hex.parse(g);};if(d!==undefined){if(d.pass!==undefined){this.setPassword(d.pass);}if(d.alg!==undefined){this.algName=d.alg;if(d.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];}this.setAlgAndProvider(this.algName,this.provName);}}};KJUR.crypto.Signature=function(o){var q=null;this._setAlgNames=function(){var s=this.algName.match(/^(.+)with(.+)$/);if(s){this.mdAlgName=s[1].toLowerCase();this.pubkeyAlgName=s[2].toLowerCase();}};this._zeroPaddingOfSignature=function(x,w){var v="";var t=w/4-x.length;for(var u=0;u<t;u++){v=v+"0";}return v+x};this.setAlgAndProvider=function(u,t){this._setAlgNames();if(t!="cryptojs/jsrsa"){throw"provider not supported: "+t}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName)!=-1){try{this.md=new KJUR.crypto.MessageDigest({alg:this.mdAlgName});}catch(s){throw"setAlgAndProvider hash alg set fail alg="+this.mdAlgName+"/"+s}this.init=function(w,x){var y=null;try{if(x===undefined){y=KEYUTIL.getKey(w);}else{y=KEYUTIL.getKey(w,x);}}catch(v){throw"init failed:"+v}if(y.isPrivate===true){this.prvKey=y;this.state="SIGN";}else{if(y.isPublic===true){this.pubKey=y;this.state="VERIFY";}else{throw"init failed.:"+y}}};this.updateString=function(v){this.md.updateString(v);};this.updateHex=function(v){this.md.updateHex(v);};this.sign=function(){this.sHashHex=this.md.digest();if(typeof this.ecprvhex!="undefined"&&typeof this.eccurvename!="undefined"){var v=new KJUR.crypto.ECDSA({curve:this.eccurvename});this.hSign=v.signHex(this.sHashHex,this.ecprvhex);}else{if(this.prvKey instanceof RSAKey&&this.pubkeyAlgName==="rsaandmgf1"){this.hSign=this.prvKey.signWithMessageHashPSS(this.sHashHex,this.mdAlgName,this.pssSaltLen);}else{if(this.prvKey instanceof RSAKey&&this.pubkeyAlgName==="rsa"){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex,this.mdAlgName);}else{if(this.prvKey instanceof KJUR.crypto.ECDSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex);}else{if(this.prvKey instanceof KJUR.crypto.DSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex);}else{throw"Signature: unsupported private key alg: "+this.pubkeyAlgName}}}}}return this.hSign};this.signString=function(v){this.updateString(v);return this.sign()};this.signHex=function(v){this.updateHex(v);return this.sign()};this.verify=function(v){this.sHashHex=this.md.digest();if(typeof this.ecpubhex!="undefined"&&typeof this.eccurvename!="undefined"){var w=new KJUR.crypto.ECDSA({curve:this.eccurvename});return w.verifyHex(this.sHashHex,v,this.ecpubhex)}else{if(this.pubKey instanceof RSAKey&&this.pubkeyAlgName==="rsaandmgf1"){return this.pubKey.verifyWithMessageHashPSS(this.sHashHex,v,this.mdAlgName,this.pssSaltLen)}else{if(this.pubKey instanceof RSAKey&&this.pubkeyAlgName==="rsa"){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(KJUR.crypto.ECDSA!==undefined&&this.pubKey instanceof KJUR.crypto.ECDSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(KJUR.crypto.DSA!==undefined&&this.pubKey instanceof KJUR.crypto.DSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}};}};this.init=function(s,t){throw"init(key, pass) not supported for this alg:prov="+this.algProvName};this.updateString=function(s){throw"updateString(str) not supported for this alg:prov="+this.algProvName};this.updateHex=function(s){throw"updateHex(hex) not supported for this alg:prov="+this.algProvName};this.sign=function(){throw"sign() not supported for this alg:prov="+this.algProvName};this.signString=function(s){throw"digestString(str) not supported for this alg:prov="+this.algProvName};this.signHex=function(s){throw"digestHex(hex) not supported for this alg:prov="+this.algProvName};this.verify=function(s){throw"verify(hSigVal) not supported for this alg:prov="+this.algProvName};this.initParams=o;if(o!==undefined){if(o.alg!==undefined){this.algName=o.alg;if(o.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];}else{this.provName=o.prov;}this.algProvName=this.algName+":"+this.provName;this.setAlgAndProvider(this.algName,this.provName);this._setAlgNames();}if(o.psssaltlen!==undefined){this.pssSaltLen=o.psssaltlen;}if(o.prvkeypem!==undefined){if(o.prvkeypas!==undefined){throw"both prvkeypem and prvkeypas parameters not supported"}else{try{var q=KEYUTIL.getKey(o.prvkeypem);this.init(q);}catch(m){throw"fatal error to load pem private key: "+m}}}}};KJUR.crypto.Cipher=function(a){};KJUR.crypto.Cipher.encrypt=function(e,f,d){if(f instanceof RSAKey&&f.isPublic){var c=KJUR.crypto.Cipher.getAlgByKeyAndName(f,d);if(c==="RSA"){return f.encrypt(e)}if(c==="RSAOAEP"){return f.encryptOAEP(e,"sha1")}var b=c.match(/^RSAOAEP(\d+)$/);if(b!==null){return f.encryptOAEP(e,"sha"+b[1])}throw"Cipher.encrypt: unsupported algorithm for RSAKey: "+d}else{throw"Cipher.encrypt: unsupported key or algorithm"}};KJUR.crypto.Cipher.decrypt=function(e,f,d){if(f instanceof RSAKey&&f.isPrivate){var c=KJUR.crypto.Cipher.getAlgByKeyAndName(f,d);if(c==="RSA"){return f.decrypt(e)}if(c==="RSAOAEP"){return f.decryptOAEP(e,"sha1")}var b=c.match(/^RSAOAEP(\d+)$/);if(b!==null){return f.decryptOAEP(e,"sha"+b[1])}throw"Cipher.decrypt: unsupported algorithm for RSAKey: "+d}else{throw"Cipher.decrypt: unsupported key or algorithm"}};KJUR.crypto.Cipher.getAlgByKeyAndName=function(b,a){if(b instanceof RSAKey){if(":RSA:RSAOAEP:RSAOAEP224:RSAOAEP256:RSAOAEP384:RSAOAEP512:".indexOf(a)!=-1){return a}if(a===null||a===undefined){return"RSA"}throw"getAlgByKeyAndName: not supported algorithm name for RSAKey: "+a}throw"getAlgByKeyAndName: not supported algorithm name: "+a};KJUR.crypto.OID=new function(){this.oidhex2name={"2a864886f70d010101":"rsaEncryption","2a8648ce3d0201":"ecPublicKey","2a8648ce380401":"dsa","2a8648ce3d030107":"secp256r1","2b8104001f":"secp192k1","2b81040021":"secp224r1","2b8104000a":"secp256k1","2b81040023":"secp521r1","2b81040022":"secp384r1","2a8648ce380403":"SHA1withDSA","608648016503040301":"SHA224withDSA","608648016503040302":"SHA256withDSA",};};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={};}KJUR.crypto.ECDSA=function(h){var e="secp256r1";var a=new SecureRandom();this.type="EC";this.isPrivate=false;this.isPublic=false;this.getBigRandom=function(i){return new BigInteger(i.bitLength(),a).mod(i.subtract(BigInteger.ONE)).add(BigInteger.ONE)};this.setNamedCurve=function(i){this.ecparams=KJUR.crypto.ECParameterDB.getByName(i);this.prvKeyHex=null;this.pubKeyHex=null;this.curveName=i;};this.setPrivateKeyHex=function(i){this.isPrivate=true;this.prvKeyHex=i;};this.setPublicKeyHex=function(i){this.isPublic=true;this.pubKeyHex=i;};this.getPublicKeyXYHex=function(){var k=this.pubKeyHex;if(k.substr(0,2)!=="04"){throw"this method supports uncompressed format(04) only"}var j=this.ecparams.keylen/4;if(k.length!==2+j*2){throw"malformed public key hex length"}var i={};i.x=k.substr(2,j);i.y=k.substr(2+j);return i};this.getShortNISTPCurveName=function(){var i=this.curveName;if(i==="secp256r1"||i==="NIST P-256"||i==="P-256"||i==="prime256v1"){return"P-256"}if(i==="secp384r1"||i==="NIST P-384"||i==="P-384"){return"P-384"}return null};this.generateKeyPairHex=function(){var k=this.ecparams.n;var n=this.getBigRandom(k);var l=this.ecparams.G.multiply(n);var q=l.getX().toBigInteger();var o=l.getY().toBigInteger();var i=this.ecparams.keylen/4;var m=("0000000000"+n.toString(16)).slice(-i);var r=("0000000000"+q.toString(16)).slice(-i);var p=("0000000000"+o.toString(16)).slice(-i);var j="04"+r+p;this.setPrivateKeyHex(m);this.setPublicKeyHex(j);return{ecprvhex:m,ecpubhex:j}};this.signWithMessageHash=function(i){return this.signHex(i,this.prvKeyHex)};this.signHex=function(o,j){var t=new BigInteger(j,16);var l=this.ecparams.n;var q=new BigInteger(o,16);do{var m=this.getBigRandom(l);var u=this.ecparams.G;var p=u.multiply(m);var i=p.getX().toBigInteger().mod(l);}while(i.compareTo(BigInteger.ZERO)<=0);var v=m.modInverse(l).multiply(q.add(t.multiply(i))).mod(l);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(i,v)};this.sign=function(m,u){var q=u;var j=this.ecparams.n;var p=BigInteger.fromByteArrayUnsigned(m);do{var l=this.getBigRandom(j);var t=this.ecparams.G;var o=t.multiply(l);var i=o.getX().toBigInteger().mod(j);}while(i.compareTo(BigInteger.ZERO)<=0);var v=l.modInverse(j).multiply(p.add(q.multiply(i))).mod(j);return this.serializeSig(i,v)};this.verifyWithMessageHash=function(j,i){return this.verifyHex(j,i,this.pubKeyHex)};this.verifyHex=function(m,i,p){var l,j;var o=KJUR.crypto.ECDSA.parseSigHex(i);l=o.r;j=o.s;var k;k=ECPointFp.decodeFromHex(this.ecparams.curve,p);var n=new BigInteger(m,16);return this.verifyRaw(n,l,j,k)};this.verify=function(o,p,j){var l,i;if(Bitcoin.Util.isArray(p)){var n=this.parseSig(p);l=n.r;i=n.s;}else{if("object"===typeof p&&p.r&&p.s){l=p.r;i=p.s;}else{throw"Invalid value for signature"}}var k;if(j instanceof ECPointFp){k=j;}else{if(Bitcoin.Util.isArray(j)){k=ECPointFp.decodeFrom(this.ecparams.curve,j);}else{throw"Invalid format for pubkey value, must be byte array or ECPointFp"}}var m=BigInteger.fromByteArrayUnsigned(o);return this.verifyRaw(m,l,i,k)};this.verifyRaw=function(o,i,w,m){var l=this.ecparams.n;var u=this.ecparams.G;if(i.compareTo(BigInteger.ONE)<0||i.compareTo(l)>=0){return false}if(w.compareTo(BigInteger.ONE)<0||w.compareTo(l)>=0){return false}var p=w.modInverse(l);var k=o.multiply(p).mod(l);var j=i.multiply(p).mod(l);var q=u.multiply(k).add(m.multiply(j));var t=q.getX().toBigInteger().mod(l);return t.equals(i)};this.serializeSig=function(k,j){var l=k.toByteArraySigned();var i=j.toByteArraySigned();var m=[];m.push(2);m.push(l.length);m=m.concat(l);m.push(2);m.push(i.length);m=m.concat(i);m.unshift(m.length);m.unshift(48);return m};this.parseSig=function(n){var m;if(n[0]!=48){throw new Error("Signature not a valid DERSequence")}m=2;if(n[m]!=2){throw new Error("First element in signature must be a DERInteger")}var l=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];if(n[m]!=2){throw new Error("Second element in signature must be a DERInteger")}var i=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];var k=BigInteger.fromByteArrayUnsigned(l);var j=BigInteger.fromByteArrayUnsigned(i);return{r:k,s:j}};this.parseSigCompact=function(m){if(m.length!==65){throw"Signature has the wrong length"}var j=m[0]-27;if(j<0||j>7){throw"Invalid signature type"}var o=this.ecparams.n;var l=BigInteger.fromByteArrayUnsigned(m.slice(1,33)).mod(o);var k=BigInteger.fromByteArrayUnsigned(m.slice(33,65)).mod(o);return{r:l,s:k,i:j}};this.readPKCS5PrvKeyHex=function(l){var n=ASN1HEX;var m=KJUR.crypto.ECDSA.getName;var p=n.getVbyList;if(n.isASN1HEX(l)===false){throw"not ASN.1 hex string"}var i,k,o;try{i=p(l,0,[2,0],"06");k=p(l,0,[1],"04");try{o=p(l,0,[3,0],"03").substr(2);}catch(j){}}catch(j){throw"malformed PKCS#1/5 plain ECC private key"}this.curveName=m(i);if(this.curveName===undefined){throw"unsupported curve name"}this.setNamedCurve(this.curveName);this.setPublicKeyHex(o);this.setPrivateKeyHex(k);this.isPublic=false;};this.readPKCS8PrvKeyHex=function(l){var q=ASN1HEX;var i=KJUR.crypto.ECDSA.getName;var n=q.getVbyList;if(q.isASN1HEX(l)===false){throw"not ASN.1 hex string"}var j,p,m,k;try{j=n(l,0,[1,0],"06");p=n(l,0,[1,1],"06");m=n(l,0,[2,0,1],"04");try{k=n(l,0,[2,0,2,0],"03").substr(2);}catch(o){}}catch(o){throw"malformed PKCS#8 plain ECC private key"}this.curveName=i(p);if(this.curveName===undefined){throw"unsupported curve name"}this.setNamedCurve(this.curveName);this.setPublicKeyHex(k);this.setPrivateKeyHex(m);this.isPublic=false;};this.readPKCS8PubKeyHex=function(l){var n=ASN1HEX;var m=KJUR.crypto.ECDSA.getName;var p=n.getVbyList;if(n.isASN1HEX(l)===false){throw"not ASN.1 hex string"}var k,i,o;try{k=p(l,0,[0,0],"06");i=p(l,0,[0,1],"06");o=p(l,0,[1],"03").substr(2);}catch(j){throw"malformed PKCS#8 ECC public key"}this.curveName=m(i);if(this.curveName===null){throw"unsupported curve name"}this.setNamedCurve(this.curveName);this.setPublicKeyHex(o);};this.readCertPubKeyHex=function(k,p){if(p!==5){p=6;}var m=ASN1HEX;var l=KJUR.crypto.ECDSA.getName;var o=m.getVbyList;if(m.isASN1HEX(k)===false){throw"not ASN.1 hex string"}var i,n;try{i=o(k,0,[0,p,0,1],"06");n=o(k,0,[0,p,1],"03").substr(2);}catch(j){throw"malformed X.509 certificate ECC public key"}this.curveName=l(i);if(this.curveName===null){throw"unsupported curve name"}this.setNamedCurve(this.curveName);this.setPublicKeyHex(n);};if(h!==undefined){if(h.curve!==undefined){this.curveName=h.curve;}}if(this.curveName===undefined){this.curveName=e;}this.setNamedCurve(this.curveName);if(h!==undefined){if(h.prv!==undefined){this.setPrivateKeyHex(h.prv);}if(h.pub!==undefined){this.setPublicKeyHex(h.pub);}}};KJUR.crypto.ECDSA.parseSigHex=function(a){var b=KJUR.crypto.ECDSA.parseSigHexInHexRS(a);var d=new BigInteger(b.r,16);var c=new BigInteger(b.s,16);return{r:d,s:c}};KJUR.crypto.ECDSA.parseSigHexInHexRS=function(f){var j=ASN1HEX;var i=j.getChildIdx;var g=j.getV;if(f.substr(0,2)!="30"){throw"signature is not a ASN.1 sequence"}var h=i(f,0);if(h.length!=2){throw"number of signature ASN.1 sequence elements seem wrong"}var e=h[0];var d=h[1];if(f.substr(e,2)!="02"){throw"1st item of sequene of signature is not ASN.1 integer"}if(f.substr(d,2)!="02"){throw"2nd item of sequene of signature is not ASN.1 integer"}var c=g(f,e);var b=g(f,d);return{r:c,s:b}};KJUR.crypto.ECDSA.asn1SigToConcatSig=function(c){var d=KJUR.crypto.ECDSA.parseSigHexInHexRS(c);var b=d.r;var a=d.s;if(b.substr(0,2)=="00"&&(b.length%32)==2){b=b.substr(2);}if(a.substr(0,2)=="00"&&(a.length%32)==2){a=a.substr(2);}if((b.length%32)==30){b="00"+b;}if((a.length%32)==30){a="00"+a;}if(b.length%32!=0){throw"unknown ECDSA sig r length error"}if(a.length%32!=0){throw"unknown ECDSA sig s length error"}return b+a};KJUR.crypto.ECDSA.concatSigToASN1Sig=function(a){if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA concatinated r-s sig  length error"}var c=a.substr(0,a.length/2);var b=a.substr(a.length/2);return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(c,b)};KJUR.crypto.ECDSA.hexRSSigToASN1Sig=function(b,a){var d=new BigInteger(b,16);var c=new BigInteger(a,16);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(d,c)};KJUR.crypto.ECDSA.biRSSigToASN1Sig=function(f,d){var c=KJUR.asn1;var b=new c.DERInteger({bigint:f});var a=new c.DERInteger({bigint:d});var e=new c.DERSequence({array:[b,a]});return e.getEncodedHex()};KJUR.crypto.ECDSA.getName=function(a){if(a==="2a8648ce3d030107"){return"secp256r1"}if(a==="2b8104000a"){return"secp256k1"}if(a==="2b81040022"){return"secp384r1"}if("|secp256r1|NIST P-256|P-256|prime256v1|".indexOf(a)!==-1){return"secp256r1"}if("|secp256k1|".indexOf(a)!==-1){return"secp256k1"}if("|secp384r1|NIST P-384|P-384|".indexOf(a)!==-1){return"secp384r1"}return null};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={};}KJUR.crypto.ECParameterDB=new function(){var b={};var c={};function a(d){return new BigInteger(d,16)}this.getByName=function(e){var d=e;if(typeof c[d]!="undefined"){d=c[e];}if(typeof b[d]!="undefined"){return b[d]}throw"unregistered EC curve name: "+d};this.regist=function(A,l,o,g,m,e,j,f,k,u,d,x){b[A]={};var s=a(o);var z=a(g);var y=a(m);var t=a(e);var w=a(j);var r=new ECCurveFp(s,z,y);var q=r.decodePointHex("04"+f+k);b[A]["name"]=A;b[A]["keylen"]=l;b[A]["curve"]=r;b[A]["G"]=q;b[A]["n"]=t;b[A]["h"]=w;b[A]["oid"]=d;b[A]["info"]=x;for(var v=0;v<u.length;v++){c[u[v]]=A;}};};KJUR.crypto.ECParameterDB.regist("secp128r1",128,"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC","E87579C11079F43DD824993C2CEE5ED3","FFFFFFFE0000000075A30D1B9038A115","1","161FF7528B899B2D0C28607CA52C5B86","CF5AC8395BAFEB13C02DA292DDED7A83",[],"","secp128r1 : SECG curve over a 128 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160k1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73","0","7","0100000000000000000001B8FA16DFAB9ACA16B6B3","1","3B4C382CE37AA192A4019E763036F4F5DD4D7EBB","938CF935318FDCED6BC28286531733C3F03C4FEE",[],"","secp160k1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160r1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC","1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45","0100000000000000000001F4C8F927AED3CA752257","1","4A96B5688EF573284664698968C38BB913CBFC82","23A628553168947D59DCC912042351377AC5FB32",[],"","secp160r1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp192k1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37","0","3","FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D","1","DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D","9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D",[]);KJUR.crypto.ECParameterDB.regist("secp192r1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC","64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1","FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831","1","188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012","07192B95FFC8DA78631011ED6B24CDD573F977A11E794811",[]);KJUR.crypto.ECParameterDB.regist("secp224r1",224,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE","B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4","FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D","1","B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21","BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34",[]);KJUR.crypto.ECParameterDB.regist("secp256k1",256,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F","0","7","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141","1","79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",[]);KJUR.crypto.ECParameterDB.regist("secp256r1",256,"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC","5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B","FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551","1","6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296","4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",["NIST P-256","P-256","prime256v1"]);KJUR.crypto.ECParameterDB.regist("secp384r1",384,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC","B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973","1","AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7","3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f",["NIST P-384","P-384"]);KJUR.crypto.ECParameterDB.regist("secp521r1",521,"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC","051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409","1","C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66","011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650",["NIST P-521","P-521"]);
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={};}KJUR.crypto.DSA=function(){this.p=null;this.q=null;this.g=null;this.y=null;this.x=null;this.type="DSA";this.isPrivate=false;this.isPublic=false;this.setPrivate=function(d,c,b,e,a){this.isPrivate=true;this.p=d;this.q=c;this.g=b;this.y=e;this.x=a;};this.setPrivateHex=function(d,b,f,i,j){var c,a,e,g,h;c=new BigInteger(d,16);a=new BigInteger(b,16);e=new BigInteger(f,16);if(typeof i==="string"&&i.length>1){g=new BigInteger(i,16);}else{g=null;}h=new BigInteger(j,16);this.setPrivate(c,a,e,g,h);};this.setPublic=function(c,b,a,d){this.isPublic=true;this.p=c;this.q=b;this.g=a;this.y=d;this.x=null;};this.setPublicHex=function(f,e,d,g){var b,a,h,c;b=new BigInteger(f,16);a=new BigInteger(e,16);h=new BigInteger(d,16);c=new BigInteger(g,16);this.setPublic(b,a,h,c);};this.signWithMessageHash=function(d){var c=this.p;var b=this.q;var f=this.g;var i=this.y;var j=this.x;var e=KJUR.crypto.Util.getRandomBigIntegerMinToMax(BigInteger.ONE.add(BigInteger.ONE),b.subtract(BigInteger.ONE));var l=d.substr(0,b.bitLength()/4);var h=new BigInteger(l,16);var a=(f.modPow(e,c)).mod(b);var n=(e.modInverse(b).multiply(h.add(j.multiply(a)))).mod(b);var m=KJUR.asn1.ASN1Util.jsonToASN1HEX({seq:[{"int":{bigint:a}},{"int":{bigint:n}}]});return m};this.verifyWithMessageHash=function(h,f){var d=this.p;var b=this.q;var j=this.g;var l=this.y;var i=this.parseASN1Signature(f);var a=i[0];var t=i[1];var o=h.substr(0,b.bitLength()/4);var k=new BigInteger(o,16);if(BigInteger.ZERO.compareTo(a)>0||a.compareTo(b)>0){throw"invalid DSA signature"}if(BigInteger.ZERO.compareTo(t)>=0||t.compareTo(b)>0){throw"invalid DSA signature"}var m=t.modInverse(b);var e=k.multiply(m).mod(b);var c=a.multiply(m).mod(b);var n=j.modPow(e,d).multiply(l.modPow(c,d)).mod(d).mod(b);return n.compareTo(a)==0};this.parseASN1Signature=function(a){try{var d=new BigInteger(ASN1HEX.getVbyList(a,0,[0],"02"),16);var c=new BigInteger(ASN1HEX.getVbyList(a,0,[1],"02"),16);return[d,c]}catch(b){throw"malformed ASN.1 DSA signature"}};this.readPKCS5PrvKeyHex=function(c){var b,a,f,g,i;var j=ASN1HEX;var d=j.getVbyList;if(j.isASN1HEX(c)===false){throw"not ASN.1 hex string"}try{b=d(c,0,[1],"02");a=d(c,0,[2],"02");f=d(c,0,[3],"02");g=d(c,0,[4],"02");i=d(c,0,[5],"02");}catch(e){console.log("EXCEPTION:"+e);throw"malformed PKCS#1/5 plain DSA private key"}this.setPrivateHex(b,a,f,g,i);};this.readPKCS8PrvKeyHex=function(d){var f,c,b,g;var e=ASN1HEX;var i=e.getVbyList;if(e.isASN1HEX(d)===false){throw"not ASN.1 hex string"}try{f=i(d,0,[1,1,0],"02");c=i(d,0,[1,1,1],"02");b=i(d,0,[1,1,2],"02");g=i(d,0,[2,0],"02");}catch(a){console.log("EXCEPTION:"+a);throw"malformed PKCS#8 plain DSA private key"}this.setPrivateHex(f,c,b,null,g);};this.readPKCS8PubKeyHex=function(d){var f,c,b,g;var e=ASN1HEX;var i=e.getVbyList;if(e.isASN1HEX(d)===false){throw"not ASN.1 hex string"}try{f=i(d,0,[0,1,0],"02");c=i(d,0,[0,1,1],"02");b=i(d,0,[0,1,2],"02");g=i(d,0,[1,0],"02");}catch(a){console.log("EXCEPTION:"+a);throw"malformed PKCS#8 DSA public key"}this.setPublicHex(f,c,b,g);};this.readCertPubKeyHex=function(c,f){if(f!==5){f=6;}var b,a,g,i;var j=ASN1HEX;var d=j.getVbyList;if(j.isASN1HEX(c)===false){throw"not ASN.1 hex string"}try{b=d(c,0,[0,f,0,1,0],"02");a=d(c,0,[0,f,0,1,1],"02");g=d(c,0,[0,f,0,1,2],"02");i=d(c,0,[0,f,1,0],"02");}catch(e){console.log("EXCEPTION:"+e);throw"malformed X.509 certificate DSA public key"}this.setPublicHex(b,a,g,i);};};
  var KEYUTIL=function(){var d=function(p,r,q){return k(CryptoJS.AES,p,r,q)};var e=function(p,r,q){return k(CryptoJS.TripleDES,p,r,q)};var a=function(p,r,q){return k(CryptoJS.DES,p,r,q)};var k=function(s,x,u,q){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(u);var p=CryptoJS.enc.Hex.parse(q);var t={};t.key=w;t.iv=p;t.ciphertext=r;var v=s.decrypt(t,w,{iv:p});return CryptoJS.enc.Hex.stringify(v)};var l=function(p,r,q){return g(CryptoJS.AES,p,r,q)};var o=function(p,r,q){return g(CryptoJS.TripleDES,p,r,q)};var f=function(p,r,q){return g(CryptoJS.DES,p,r,q)};var g=function(t,y,v,q){var s=CryptoJS.enc.Hex.parse(y);var x=CryptoJS.enc.Hex.parse(v);var p=CryptoJS.enc.Hex.parse(q);var w=t.encrypt(s,x,{iv:p});var r=CryptoJS.enc.Hex.parse(w.toString());var u=CryptoJS.enc.Base64.stringify(r);return u};var i={"AES-256-CBC":{proc:d,eproc:l,keylen:32,ivlen:16},"AES-192-CBC":{proc:d,eproc:l,keylen:24,ivlen:16},"AES-128-CBC":{proc:d,eproc:l,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:e,eproc:o,keylen:24,ivlen:8},"DES-CBC":{proc:a,eproc:f,keylen:8,ivlen:8}};var m=function(p){var r=CryptoJS.lib.WordArray.random(p);var q=CryptoJS.enc.Hex.stringify(r);return q};var n=function(v){var w={};var q=v.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"));if(q){w.cipher=q[1];w.ivsalt=q[2];}var p=v.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));if(p){w.type=p[1];}var u=-1;var x=0;if(v.indexOf("\r\n\r\n")!=-1){u=v.indexOf("\r\n\r\n");x=2;}if(v.indexOf("\n\n")!=-1){u=v.indexOf("\n\n");x=1;}var t=v.indexOf("-----END");if(u!=-1&&t!=-1){var r=v.substring(u+x*2,t-x);r=r.replace(/\s+/g,"");w.data=r;}return w};var j=function(q,y,p){var v=p.substring(0,16);var t=CryptoJS.enc.Hex.parse(v);var r=CryptoJS.enc.Utf8.parse(y);var u=i[q]["keylen"]+i[q]["ivlen"];var x="";var w=null;for(;;){var s=CryptoJS.algo.MD5.create();if(w!=null){s.update(w);}s.update(r);s.update(t);w=s.finalize();x=x+CryptoJS.enc.Hex.stringify(w);if(x.length>=u*2){break}}var z={};z.keyhex=x.substr(0,i[q]["keylen"]*2);z.ivhex=x.substr(i[q]["keylen"]*2,i[q]["ivlen"]*2);return z};var b=function(p,v,r,w){var s=CryptoJS.enc.Base64.parse(p);var q=CryptoJS.enc.Hex.stringify(s);var u=i[v]["proc"];var t=u(q,r,w);return t};var h=function(p,s,q,u){var r=i[s]["eproc"];var t=r(p,q,u);return t};return{version:"1.0.0",parsePKCS5PEM:function(p){return n(p)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(q,p,r){return j(q,p,r)},decryptKeyB64:function(p,r,q,s){return b(p,r,q,s)},getDecryptedKeyHex:function(y,x){var q=n(y);var r=q.cipher;var p=q.ivsalt;var s=q.data;var w=j(r,x,p);var v=w.keyhex;var u=b(s,r,v,p);return u},getEncryptedPKCS5PEMFromPrvKeyHex:function(x,s,A,t,r){var p="";if(typeof t=="undefined"||t==null){t="AES-256-CBC";}if(typeof i[t]=="undefined"){throw"KEYUTIL unsupported algorithm: "+t}if(typeof r=="undefined"||r==null){var v=i[t]["ivlen"];var u=m(v);r=u.toUpperCase();}var z=j(t,A,r);var y=z.keyhex;var w=h(s,t,y,r);var q=w.replace(/(.{64})/g,"$1\r\n");var p="-----BEGIN "+x+" PRIVATE KEY-----\r\n";p+="Proc-Type: 4,ENCRYPTED\r\n";p+="DEK-Info: "+t+","+r+"\r\n";p+="\r\n";p+=q;p+="\r\n-----END "+x+" PRIVATE KEY-----\r\n";return p},parseHexOfEncryptedPKCS8:function(y){var B=ASN1HEX;var z=B.getChildIdx;var w=B.getV;var t={};var r=z(y,0);if(r.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+r.length}t.ciphertext=w(y,r[1]);var A=z(y,r[0]);if(A.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+A.length}if(w(y,A[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var p=z(y,A[1]);if(A.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+p.length}var q=z(y,p[1]);if(q.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+q.length}if(w(y,q[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}t.encryptionSchemeAlg="TripleDES";t.encryptionSchemeIV=w(y,q[1]);var s=z(y,p[0]);if(s.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+s.length}if(w(y,s[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var x=z(y,s[1]);if(x.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+x.length}t.pbkdf2Salt=w(y,x[0]);var u=w(y,x[1]);try{t.pbkdf2Iter=parseInt(u,16);}catch(v){throw"malformed format pbkdf2Iter: "+u}return t},getPBKDF2KeyHexFromParam:function(u,p){var t=CryptoJS.enc.Hex.parse(u.pbkdf2Salt);var q=u.pbkdf2Iter;var s=CryptoJS.PBKDF2(p,t,{keySize:192/32,iterations:q});var r=CryptoJS.enc.Hex.stringify(s);return r},_getPlainPKCS8HexFromEncryptedPKCS8PEM:function(x,y){var r=pemtohex(x,"ENCRYPTED PRIVATE KEY");var p=this.parseHexOfEncryptedPKCS8(r);var u=KEYUTIL.getPBKDF2KeyHexFromParam(p,y);var v={};v.ciphertext=CryptoJS.enc.Hex.parse(p.ciphertext);var t=CryptoJS.enc.Hex.parse(u);var s=CryptoJS.enc.Hex.parse(p.encryptionSchemeIV);var w=CryptoJS.TripleDES.decrypt(v,t,{iv:s});var q=CryptoJS.enc.Hex.stringify(w);return q},getKeyFromEncryptedPKCS8PEM:function(s,q){var p=this._getPlainPKCS8HexFromEncryptedPKCS8PEM(s,q);var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},parsePlainPrivatePKCS8Hex:function(s){var v=ASN1HEX;var u=v.getChildIdx;var t=v.getV;var q={};q.algparam=null;if(s.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var r=u(s,0);if(r.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(s.substr(r[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var p=u(s,r[1]);if(p.length!=2){throw"malformed PKCS8 private key(code:004)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}q.algoid=t(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=t(s,p[1]);}if(s.substr(r[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}q.keyidx=v.getVidx(s,r[2]);return q},getKeyFromPlainPrivatePKCS8PEM:function(q){var p=pemtohex(q,"PRIVATE KEY");var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},getKeyFromPlainPrivatePKCS8Hex:function(p){var q=this.parsePlainPrivatePKCS8Hex(p);var r;if(q.algoid=="2a864886f70d010101"){r=new RSAKey();}else{if(q.algoid=="2a8648ce380401"){r=new KJUR.crypto.DSA();}else{if(q.algoid=="2a8648ce3d0201"){r=new KJUR.crypto.ECDSA();}else{throw"unsupported private key algorithm"}}}r.readPKCS8PrvKeyHex(p);return r},_getKeyFromPublicPKCS8Hex:function(q){var p;var r=ASN1HEX.getVbyList(q,0,[0,0],"06");if(r==="2a864886f70d010101"){p=new RSAKey();}else{if(r==="2a8648ce380401"){p=new KJUR.crypto.DSA();}else{if(r==="2a8648ce3d0201"){p=new KJUR.crypto.ECDSA();}else{throw"unsupported PKCS#8 public key hex"}}}p.readPKCS8PubKeyHex(q);return p},parsePublicRawRSAKeyHex:function(r){var u=ASN1HEX;var t=u.getChildIdx;var s=u.getV;var p={};if(r.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var q=t(r,0);if(q.length!=2){throw"malformed RSA key(code:002)"}if(r.substr(q[0],2)!="02"){throw"malformed RSA key(code:003)"}p.n=s(r,q[0]);if(r.substr(q[1],2)!="02"){throw"malformed RSA key(code:004)"}p.e=s(r,q[1]);return p},parsePublicPKCS8Hex:function(t){var v=ASN1HEX;var u=v.getChildIdx;var s=v.getV;var q={};q.algparam=null;var r=u(t,0);if(r.length!=2){throw"outer DERSequence shall have 2 elements: "+r.length}var w=r[0];if(t.substr(w,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var p=u(t,w);if(p.length!=2){throw"malformed PKCS8 public key(code:002)"}if(t.substr(p[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}q.algoid=s(t,p[0]);if(t.substr(p[1],2)=="06"){q.algparam=s(t,p[1]);}else{if(t.substr(p[1],2)=="30"){q.algparam={};q.algparam.p=v.getVbyList(t,p[1],[0],"02");q.algparam.q=v.getVbyList(t,p[1],[1],"02");q.algparam.g=v.getVbyList(t,p[1],[2],"02");}}if(t.substr(r[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}q.key=s(t,r[1]).substr(2);return q},}}();KEYUTIL.getKey=function(l,k,n){var G=ASN1HEX,L=G.getChildIdx,v=G.getV,d=G.getVbyList,c=KJUR.crypto,i=c.ECDSA,C=c.DSA,w=RSAKey,M=pemtohex,F=KEYUTIL;if(typeof w!="undefined"&&l instanceof w){return l}if(typeof i!="undefined"&&l instanceof i){return l}if(typeof C!="undefined"&&l instanceof C){return l}if(l.curve!==undefined&&l.xy!==undefined&&l.d===undefined){return new i({pub:l.xy,curve:l.curve})}if(l.curve!==undefined&&l.d!==undefined){return new i({prv:l.d,curve:l.curve})}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d===undefined){var P=new w();P.setPublic(l.n,l.e);return P}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p!==undefined&&l.q!==undefined&&l.dp!==undefined&&l.dq!==undefined&&l.co!==undefined&&l.qi===undefined){var P=new w();P.setPrivateEx(l.n,l.e,l.d,l.p,l.q,l.dp,l.dq,l.co);return P}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p===undefined){var P=new w();P.setPrivate(l.n,l.e,l.d);return P}if(l.p!==undefined&&l.q!==undefined&&l.g!==undefined&&l.y!==undefined&&l.x===undefined){var P=new C();P.setPublic(l.p,l.q,l.g,l.y);return P}if(l.p!==undefined&&l.q!==undefined&&l.g!==undefined&&l.y!==undefined&&l.x!==undefined){var P=new C();P.setPrivate(l.p,l.q,l.g,l.y,l.x);return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d===undefined){var P=new w();P.setPublic(b64utohex(l.n),b64utohex(l.e));return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p!==undefined&&l.q!==undefined&&l.dp!==undefined&&l.dq!==undefined&&l.qi!==undefined){var P=new w();P.setPrivateEx(b64utohex(l.n),b64utohex(l.e),b64utohex(l.d),b64utohex(l.p),b64utohex(l.q),b64utohex(l.dp),b64utohex(l.dq),b64utohex(l.qi));return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined){var P=new w();P.setPrivate(b64utohex(l.n),b64utohex(l.e),b64utohex(l.d));return P}if(l.kty==="EC"&&l.crv!==undefined&&l.x!==undefined&&l.y!==undefined&&l.d===undefined){var j=new i({curve:l.crv});var t=j.ecparams.keylen/4;var B=("0000000000"+b64utohex(l.x)).slice(-t);var z=("0000000000"+b64utohex(l.y)).slice(-t);var u="04"+B+z;j.setPublicKeyHex(u);return j}if(l.kty==="EC"&&l.crv!==undefined&&l.x!==undefined&&l.y!==undefined&&l.d!==undefined){var j=new i({curve:l.crv});var t=j.ecparams.keylen/4;var B=("0000000000"+b64utohex(l.x)).slice(-t);var z=("0000000000"+b64utohex(l.y)).slice(-t);var u="04"+B+z;var b=("0000000000"+b64utohex(l.d)).slice(-t);j.setPublicKeyHex(u);j.setPrivateKeyHex(b);return j}if(n==="pkcs5prv"){var J=l,G=ASN1HEX,N,P;N=L(J,0);if(N.length===9){P=new w();P.readPKCS5PrvKeyHex(J);}else{if(N.length===6){P=new C();P.readPKCS5PrvKeyHex(J);}else{if(N.length>2&&J.substr(N[1],2)==="04"){P=new i();P.readPKCS5PrvKeyHex(J);}else{throw"unsupported PKCS#1/5 hexadecimal key"}}}return P}if(n==="pkcs8prv"){var P=F.getKeyFromPlainPrivatePKCS8Hex(l);return P}if(n==="pkcs8pub"){return F._getKeyFromPublicPKCS8Hex(l)}if(n==="x509pub"){return X509.getPublicKeyFromCertHex(l)}if(l.indexOf("-END CERTIFICATE-",0)!=-1||l.indexOf("-END X509 CERTIFICATE-",0)!=-1||l.indexOf("-END TRUSTED CERTIFICATE-",0)!=-1){return X509.getPublicKeyFromCertPEM(l)}if(l.indexOf("-END PUBLIC KEY-")!=-1){var O=pemtohex(l,"PUBLIC KEY");return F._getKeyFromPublicPKCS8Hex(O)}if(l.indexOf("-END RSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")==-1){var m=M(l,"RSA PRIVATE KEY");return F.getKey(m,null,"pkcs5prv")}if(l.indexOf("-END DSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")==-1){var I=M(l,"DSA PRIVATE KEY");var E=d(I,0,[1],"02");var D=d(I,0,[2],"02");var K=d(I,0,[3],"02");var r=d(I,0,[4],"02");var s=d(I,0,[5],"02");var P=new C();P.setPrivate(new BigInteger(E,16),new BigInteger(D,16),new BigInteger(K,16),new BigInteger(r,16),new BigInteger(s,16));return P}if(l.indexOf("-END PRIVATE KEY-")!=-1){return F.getKeyFromPlainPrivatePKCS8PEM(l)}if(l.indexOf("-END RSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var o=F.getDecryptedKeyHex(l,k);var H=new RSAKey();H.readPKCS5PrvKeyHex(o);return H}if(l.indexOf("-END EC PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var I=F.getDecryptedKeyHex(l,k);var P=d(I,0,[1],"04");var f=d(I,0,[2,0],"06");var A=d(I,0,[3,0],"03").substr(2);var e="";if(KJUR.crypto.OID.oidhex2name[f]!==undefined){e=KJUR.crypto.OID.oidhex2name[f];}else{throw"undefined OID(hex) in KJUR.crypto.OID: "+f}var j=new i({curve:e});j.setPublicKeyHex(A);j.setPrivateKeyHex(P);j.isPublic=false;return j}if(l.indexOf("-END DSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var I=F.getDecryptedKeyHex(l,k);var E=d(I,0,[1],"02");var D=d(I,0,[2],"02");var K=d(I,0,[3],"02");var r=d(I,0,[4],"02");var s=d(I,0,[5],"02");var P=new C();P.setPrivate(new BigInteger(E,16),new BigInteger(D,16),new BigInteger(K,16),new BigInteger(r,16),new BigInteger(s,16));return P}if(l.indexOf("-END ENCRYPTED PRIVATE KEY-")!=-1){return F.getKeyFromEncryptedPKCS8PEM(l,k)}throw"not supported argument"};KEYUTIL.generateKeypair=function(a,c){if(a=="RSA"){var b=c;var h=new RSAKey();h.generate(b,"10001");h.isPrivate=true;h.isPublic=true;var f=new RSAKey();var e=h.n.toString(16);var i=h.e.toString(16);f.setPublic(e,i);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{if(a=="EC"){var d=c;var g=new KJUR.crypto.ECDSA({curve:d});var j=g.generateKeyPairHex();var h=new KJUR.crypto.ECDSA({curve:d});h.setPublicKeyHex(j.ecpubhex);h.setPrivateKeyHex(j.ecprvhex);h.isPrivate=true;h.isPublic=false;var f=new KJUR.crypto.ECDSA({curve:d});f.setPublicKeyHex(j.ecpubhex);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{throw"unknown algorithm: "+a}}};KEYUTIL.getPEM=function(b,D,y,m,q,j){var F=KJUR,k=F.asn1,z=k.DERObjectIdentifier,f=k.DERInteger,l=k.ASN1Util.newObject,a=k.x509,C=a.SubjectPublicKeyInfo,e=F.crypto,u=e.DSA,r=e.ECDSA,n=RSAKey;function A(s){var G=l({seq:[{"int":0},{"int":{bigint:s.n}},{"int":s.e},{"int":{bigint:s.d}},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.dmp1}},{"int":{bigint:s.dmq1}},{"int":{bigint:s.coeff}}]});return G}function B(G){var s=l({seq:[{"int":1},{octstr:{hex:G.prvKeyHex}},{tag:["a0",true,{oid:{name:G.curveName}}]},{tag:["a1",true,{bitstr:{hex:"00"+G.pubKeyHex}}]}]});return s}function x(s){var G=l({seq:[{"int":0},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.g}},{"int":{bigint:s.y}},{"int":{bigint:s.x}}]});return G}if(((n!==undefined&&b instanceof n)||(u!==undefined&&b instanceof u)||(r!==undefined&&b instanceof r))&&b.isPublic==true&&(D===undefined||D=="PKCS8PUB")){var E=new C(b);var w=E.getEncodedHex();return hextopem(w,"PUBLIC KEY")}if(D=="PKCS1PRV"&&n!==undefined&&b instanceof n&&(y===undefined||y==null)&&b.isPrivate==true){var E=A(b);var w=E.getEncodedHex();return hextopem(w,"RSA PRIVATE KEY")}if(D=="PKCS1PRV"&&r!==undefined&&b instanceof r&&(y===undefined||y==null)&&b.isPrivate==true){var i=new z({name:b.curveName});var v=i.getEncodedHex();var h=B(b);var t=h.getEncodedHex();var p="";p+=hextopem(v,"EC PARAMETERS");p+=hextopem(t,"EC PRIVATE KEY");return p}if(D=="PKCS1PRV"&&u!==undefined&&b instanceof u&&(y===undefined||y==null)&&b.isPrivate==true){var E=x(b);var w=E.getEncodedHex();return hextopem(w,"DSA PRIVATE KEY")}if(D=="PKCS5PRV"&&n!==undefined&&b instanceof n&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=A(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC";}return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",w,y,m,j)}if(D=="PKCS5PRV"&&r!==undefined&&b instanceof r&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=B(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC";}return this.getEncryptedPKCS5PEMFromPrvKeyHex("EC",w,y,m,j)}if(D=="PKCS5PRV"&&u!==undefined&&b instanceof u&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=x(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC";}return this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA",w,y,m,j)}var o=function(G,s){var I=c(G,s);var H=new l({seq:[{seq:[{oid:{name:"pkcs5PBES2"}},{seq:[{seq:[{oid:{name:"pkcs5PBKDF2"}},{seq:[{octstr:{hex:I.pbkdf2Salt}},{"int":I.pbkdf2Iter}]}]},{seq:[{oid:{name:"des-EDE3-CBC"}},{octstr:{hex:I.encryptionSchemeIV}}]}]}]},{octstr:{hex:I.ciphertext}}]});return H.getEncodedHex()};var c=function(N,O){var H=100;var M=CryptoJS.lib.WordArray.random(8);var L="DES-EDE3-CBC";var s=CryptoJS.lib.WordArray.random(8);var I=CryptoJS.PBKDF2(O,M,{keySize:192/32,iterations:H});var J=CryptoJS.enc.Hex.parse(N);var K=CryptoJS.TripleDES.encrypt(J,I,{iv:s})+"";var G={};G.ciphertext=K;G.pbkdf2Salt=CryptoJS.enc.Hex.stringify(M);G.pbkdf2Iter=H;G.encryptionSchemeAlg=L;G.encryptionSchemeIV=CryptoJS.enc.Hex.stringify(s);return G};if(D=="PKCS8PRV"&&n!=undefined&&b instanceof n&&b.isPrivate==true){var g=A(b);var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"rsaEncryption"}},{"null":true}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}if(D=="PKCS8PRV"&&r!==undefined&&b instanceof r&&b.isPrivate==true){var g=new l({seq:[{"int":1},{octstr:{hex:b.prvKeyHex}},{tag:["a1",true,{bitstr:{hex:"00"+b.pubKeyHex}}]}]});var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"ecPublicKey"}},{oid:{name:b.curveName}}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}if(D=="PKCS8PRV"&&u!==undefined&&b instanceof u&&b.isPrivate==true){var g=new f({bigint:b.x});var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"dsa"}},{seq:[{"int":{bigint:b.p}},{"int":{bigint:b.q}},{"int":{bigint:b.g}}]}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}throw"unsupported object nor format"};KEYUTIL.getKeyFromCSRPEM=function(b){var a=pemtohex(b,"CERTIFICATE REQUEST");var c=KEYUTIL.getKeyFromCSRHex(a);return c};KEYUTIL.getKeyFromCSRHex=function(a){var c=KEYUTIL.parseCSRHex(a);var b=KEYUTIL.getKey(c.p8pubkeyhex,null,"pkcs8pub");return b};KEYUTIL.parseCSRHex=function(d){var i=ASN1HEX;var f=i.getChildIdx;var c=i.getTLV;var b={};var g=d;if(g.substr(0,2)!="30"){throw"malformed CSR(code:001)"}var e=f(g,0);if(e.length<1){throw"malformed CSR(code:002)"}if(g.substr(e[0],2)!="30"){throw"malformed CSR(code:003)"}var a=f(g,e[0]);if(a.length<3){throw"malformed CSR(code:004)"}b.p8pubkeyhex=c(g,a[2]);return b};KEYUTIL.getJWKFromKey=function(d){var b={};if(d instanceof RSAKey&&d.isPrivate){b.kty="RSA";b.n=hextob64u(d.n.toString(16));b.e=hextob64u(d.e.toString(16));b.d=hextob64u(d.d.toString(16));b.p=hextob64u(d.p.toString(16));b.q=hextob64u(d.q.toString(16));b.dp=hextob64u(d.dmp1.toString(16));b.dq=hextob64u(d.dmq1.toString(16));b.qi=hextob64u(d.coeff.toString(16));return b}else{if(d instanceof RSAKey&&d.isPublic){b.kty="RSA";b.n=hextob64u(d.n.toString(16));b.e=hextob64u(d.e.toString(16));return b}else{if(d instanceof KJUR.crypto.ECDSA&&d.isPrivate){var a=d.getShortNISTPCurveName();if(a!=="P-256"&&a!=="P-384"){throw"unsupported curve name for JWT: "+a}var c=d.getPublicKeyXYHex();b.kty="EC";b.crv=a;b.x=hextob64u(c.x);b.y=hextob64u(c.y);b.d=hextob64u(d.prvKeyHex);return b}else{if(d instanceof KJUR.crypto.ECDSA&&d.isPublic){var a=d.getShortNISTPCurveName();if(a!=="P-256"&&a!=="P-384"){throw"unsupported curve name for JWT: "+a}var c=d.getPublicKeyXYHex();b.kty="EC";b.crv=a;b.x=hextob64u(c.x);b.y=hextob64u(c.y);return b}}}}throw"not supported key object"};
  RSAKey.getPosArrayOfChildrenFromHex=function(a){return ASN1HEX.getChildIdx(a,0)};RSAKey.getHexValueArrayOfChildrenFromHex=function(f){var n=ASN1HEX;var i=n.getV;var k=RSAKey.getPosArrayOfChildrenFromHex(f);var e=i(f,k[0]);var j=i(f,k[1]);var b=i(f,k[2]);var c=i(f,k[3]);var h=i(f,k[4]);var g=i(f,k[5]);var m=i(f,k[6]);var l=i(f,k[7]);var d=i(f,k[8]);var k=new Array();k.push(e,j,b,c,h,g,m,l,d);return k};RSAKey.prototype.readPrivateKeyFromPEMString=function(d){var c=pemtohex(d);var b=RSAKey.getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8]);};RSAKey.prototype.readPKCS5PrvKeyHex=function(c){var b=RSAKey.getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8]);};RSAKey.prototype.readPKCS8PrvKeyHex=function(e){var c,j,l,b,a,f,d,k;var m=ASN1HEX;var g=m.getVbyList;if(m.isASN1HEX(e)===false){throw"not ASN.1 hex string"}try{c=g(e,0,[2,0,1],"02");j=g(e,0,[2,0,2],"02");l=g(e,0,[2,0,3],"02");b=g(e,0,[2,0,4],"02");a=g(e,0,[2,0,5],"02");f=g(e,0,[2,0,6],"02");d=g(e,0,[2,0,7],"02");k=g(e,0,[2,0,8],"02");}catch(i){throw"malformed PKCS#8 plain RSA private key"}this.setPrivateEx(c,j,l,b,a,f,d,k);};RSAKey.prototype.readPKCS5PubKeyHex=function(c){var e=ASN1HEX;var b=e.getV;if(e.isASN1HEX(c)===false){throw"keyHex is not ASN.1 hex string"}var a=e.getChildIdx(c,0);if(a.length!==2||c.substr(a[0],2)!=="02"||c.substr(a[1],2)!=="02"){throw"wrong hex for PKCS#5 public key"}var f=b(c,a[0]);var d=b(c,a[1]);this.setPublic(f,d);};RSAKey.prototype.readPKCS8PubKeyHex=function(b){var c=ASN1HEX;if(c.isASN1HEX(b)===false){throw"not ASN.1 hex string"}if(c.getTLVbyList(b,0,[0,0])!=="06092a864886f70d010101"){throw"not PKCS8 RSA public key"}var a=c.getTLVbyList(b,0,[1,0]);this.readPKCS5PubKeyHex(a);};RSAKey.prototype.readCertPubKeyHex=function(b,d){var a,c;a=new X509();a.readCertHex(b);c=a.getPublicKeyHex();this.readPKCS8PubKeyHex(c);};
  var _RE_HEXDECONLY=new RegExp("");_RE_HEXDECONLY.compile("[^0-9a-f]","gi");function _zeroPaddingOfSignature(e,d){var c="";var a=d/4-e.length;for(var b=0;b<a;b++){c=c+"0";}return c+e}RSAKey.prototype.sign=function(d,a){var b=function(e){return KJUR.crypto.Util.hashString(e,a)};var c=b(d);return this.signWithMessageHash(c,a)};RSAKey.prototype.signWithMessageHash=function(e,c){var f=KJUR.crypto.Util.getPaddedDigestInfoHex(e,c,this.n.bitLength());var b=parseBigInt(f,16);var d=this.doPrivate(b);var a=d.toString(16);return _zeroPaddingOfSignature(a,this.n.bitLength())};function pss_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=hextorstr(e(rstrtohex(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]))));d+=1;}return b}RSAKey.prototype.signPSS=function(e,a,d){var c=function(f){return KJUR.crypto.Util.hashHex(f,a)};var b=c(rstrtohex(e));if(d===undefined){d=-1;}return this.signWithMessageHashPSS(b,a,d)};RSAKey.prototype.signWithMessageHashPSS=function(l,a,k){var b=hextorstr(l);var g=b.length;var m=this.n.bitLength()-1;var c=Math.ceil(m/8);var d;var o=function(i){return KJUR.crypto.Util.hashHex(i,a)};if(k===-1||k===undefined){k=g;}else{if(k===-2){k=c-g-2;}else{if(k<-2){throw"invalid salt length"}}}if(c<(g+k+2)){throw"data too long"}var f="";if(k>0){f=new Array(k);new SecureRandom().nextBytes(f);f=String.fromCharCode.apply(String,f);}var n=hextorstr(o(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+b+f)));var j=[];for(d=0;d<c-k-g-2;d+=1){j[d]=0;}var e=String.fromCharCode.apply(String,j)+"\x01"+f;var h=pss_mgf1_str(n,e.length,o);var q=[];for(d=0;d<e.length;d+=1){q[d]=e.charCodeAt(d)^h.charCodeAt(d);}var p=(65280>>(8*c-m))&255;q[0]&=~p;for(d=0;d<g;d++){q.push(n.charCodeAt(d));}q.push(188);return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(q)).toString(16),this.n.bitLength())};function _rsasign_getAlgNameAndHashFromHexDisgestInfo(f){for(var e in KJUR.crypto.Util.DIGESTINFOHEAD){var d=KJUR.crypto.Util.DIGESTINFOHEAD[e];var b=d.length;if(f.substring(0,b)==d){var c=[e,f.substring(b)];return c}}return[]}RSAKey.prototype.verify=function(f,j){j=j.replace(_RE_HEXDECONLY,"");j=j.replace(/[ \n]+/g,"");var b=parseBigInt(j,16);if(b.bitLength()>this.n.bitLength()){return 0}var i=this.doPublic(b);var e=i.toString(16).replace(/^1f+00/,"");var g=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(g.length==0){return false}var d=g[0];var h=g[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(h==c)};RSAKey.prototype.verifyWithMessageHash=function(e,a){a=a.replace(_RE_HEXDECONLY,"");a=a.replace(/[ \n]+/g,"");var b=parseBigInt(a,16);if(b.bitLength()>this.n.bitLength()){return 0}var h=this.doPublic(b);var g=h.toString(16).replace(/^1f+00/,"");var c=_rsasign_getAlgNameAndHashFromHexDisgestInfo(g);if(c.length==0){return false}var f=c[1];return(f==e)};RSAKey.prototype.verifyPSS=function(c,b,a,f){var e=function(g){return KJUR.crypto.Util.hashHex(g,a)};var d=e(rstrtohex(c));if(f===undefined){f=-1;}return this.verifyWithMessageHashPSS(d,b,a,f)};RSAKey.prototype.verifyWithMessageHashPSS=function(f,s,l,c){var k=new BigInteger(s,16);if(k.bitLength()>this.n.bitLength()){return false}var r=function(i){return KJUR.crypto.Util.hashHex(i,l)};var j=hextorstr(f);var h=j.length;var g=this.n.bitLength()-1;var m=Math.ceil(g/8);var q;if(c===-1||c===undefined){c=h;}else{if(c===-2){c=m-h-2;}else{if(c<-2){throw"invalid salt length"}}}if(m<(h+c+2)){throw"data too long"}var a=this.doPublic(k).toByteArray();for(q=0;q<a.length;q+=1){a[q]&=255;}while(a.length<m){a.unshift(0);}if(a[m-1]!==188){throw"encoded message does not end in 0xbc"}a=String.fromCharCode.apply(String,a);var d=a.substr(0,m-h-1);var e=a.substr(d.length,h);var p=(65280>>(8*m-g))&255;if((d.charCodeAt(0)&p)!==0){throw"bits beyond keysize not zero"}var n=pss_mgf1_str(e,d.length,r);var o=[];for(q=0;q<d.length;q+=1){o[q]=d.charCodeAt(q)^n.charCodeAt(q);}o[0]&=~p;var b=m-h-c-2;for(q=0;q<b;q+=1){if(o[q]!==0){throw"leftmost octets not zero"}}if(o[b]!==1){throw"0x01 marker not found"}return e===hextorstr(r(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+j+String.fromCharCode.apply(String,o.slice(-c)))))};RSAKey.SALT_LEN_HLEN=-1;RSAKey.SALT_LEN_MAX=-2;RSAKey.SALT_LEN_RECOVER=-2;
  function X509(){var k=ASN1HEX,j=k.getChildIdx,h=k.getV,b=k.getTLV,f=k.getVbyList,c=k.getTLVbyList,g=k.getIdxbyList,d=k.getVidx,i=k.oidname,a=X509,e=pemtohex;this.hex=null;this.version=0;this.foffset=0;this.aExtInfo=null;this.getVersion=function(){if(this.hex===null||this.version!==0){return this.version}if(c(this.hex,0,[0,0])!=="a003020102"){this.version=1;this.foffset=-1;return 1}this.version=3;return 3};this.getSerialNumberHex=function(){return f(this.hex,0,[0,1+this.foffset],"02")};this.getSignatureAlgorithmField=function(){return i(f(this.hex,0,[0,2+this.foffset,0],"06"))};this.getIssuerHex=function(){return c(this.hex,0,[0,3+this.foffset],"30")};this.getIssuerString=function(){return a.hex2dn(this.getIssuerHex())};this.getSubjectHex=function(){return c(this.hex,0,[0,5+this.foffset],"30")};this.getSubjectString=function(){return a.hex2dn(this.getSubjectHex())};this.getNotBefore=function(){var l=f(this.hex,0,[0,4+this.foffset,0]);l=l.replace(/(..)/g,"%$1");l=decodeURIComponent(l);return l};this.getNotAfter=function(){var l=f(this.hex,0,[0,4+this.foffset,1]);l=l.replace(/(..)/g,"%$1");l=decodeURIComponent(l);return l};this.getPublicKeyHex=function(){return k.getTLVbyList(this.hex,0,[0,6+this.foffset],"30")};this.getPublicKeyIdx=function(){return g(this.hex,0,[0,6+this.foffset],"30")};this.getPublicKeyContentIdx=function(){var l=this.getPublicKeyIdx();return g(this.hex,l,[1,0],"30")};this.getPublicKey=function(){return KEYUTIL.getKey(this.getPublicKeyHex(),null,"pkcs8pub")};this.getSignatureAlgorithmName=function(){return i(f(this.hex,0,[1,0],"06"))};this.getSignatureValueHex=function(){return f(this.hex,0,[2],"03",true)};this.verifySignature=function(n){var o=this.getSignatureAlgorithmName();var l=this.getSignatureValueHex();var m=c(this.hex,0,[0],"30");var p=new KJUR.crypto.Signature({alg:o});p.init(n);p.updateHex(m);return p.verify(l)};this.parseExt=function(){if(this.version!==3){return -1}var p=g(this.hex,0,[0,7,0],"30");var m=j(this.hex,p);this.aExtInfo=new Array();for(var n=0;n<m.length;n++){var q={};q.critical=false;var l=j(this.hex,m[n]);var r=0;if(l.length===3){q.critical=true;r=1;}q.oid=k.hextooidstr(f(this.hex,m[n],[0],"06"));var o=g(this.hex,m[n],[1+r]);q.vidx=d(this.hex,o);this.aExtInfo.push(q);}};this.getExtInfo=function(n){var l=this.aExtInfo;var o=n;if(!n.match(/^[0-9.]+$/)){o=KJUR.asn1.x509.OID.name2oid(n);}if(o===""){return undefined}for(var m=0;m<l.length;m++){if(l[m].oid===o){return l[m]}}return undefined};this.getExtBasicConstraints=function(){var n=this.getExtInfo("basicConstraints");if(n===undefined){return n}var l=h(this.hex,n.vidx);if(l===""){return{}}if(l==="0101ff"){return{cA:true}}if(l.substr(0,8)==="0101ff02"){var o=h(l,6);var m=parseInt(o,16);return{cA:true,pathLen:m}}throw"basicConstraints parse error"};this.getExtKeyUsageBin=function(){var o=this.getExtInfo("keyUsage");if(o===undefined){return""}var m=h(this.hex,o.vidx);if(m.length%2!=0||m.length<=2){throw"malformed key usage value"}var l=parseInt(m.substr(0,2));var n=parseInt(m.substr(2),16).toString(2);return n.substr(0,n.length-l)};this.getExtKeyUsageString=function(){var n=this.getExtKeyUsageBin();var l=new Array();for(var m=0;m<n.length;m++){if(n.substr(m,1)=="1"){l.push(X509.KEYUSAGE_NAME[m]);}}return l.join(",")};this.getExtSubjectKeyIdentifier=function(){var l=this.getExtInfo("subjectKeyIdentifier");if(l===undefined){return l}return h(this.hex,l.vidx)};this.getExtAuthorityKeyIdentifier=function(){var p=this.getExtInfo("authorityKeyIdentifier");if(p===undefined){return p}var l={};var o=b(this.hex,p.vidx);var m=j(o,0);for(var n=0;n<m.length;n++){if(o.substr(m[n],2)==="80"){l.kid=h(o,m[n]);}}return l};this.getExtExtKeyUsageName=function(){var p=this.getExtInfo("extKeyUsage");if(p===undefined){return p}var l=new Array();var o=b(this.hex,p.vidx);if(o===""){return l}var m=j(o,0);for(var n=0;n<m.length;n++){l.push(i(h(o,m[n])));}return l};this.getExtSubjectAltName=function(){var m=this.getExtSubjectAltName2();var l=new Array();for(var n=0;n<m.length;n++){if(m[n][0]==="DNS"){l.push(m[n][1]);}}return l};this.getExtSubjectAltName2=function(){var p,s,r;var q=this.getExtInfo("subjectAltName");if(q===undefined){return q}var l=new Array();var o=b(this.hex,q.vidx);var m=j(o,0);for(var n=0;n<m.length;n++){r=o.substr(m[n],2);p=h(o,m[n]);if(r==="81"){s=hextoutf8(p);l.push(["MAIL",s]);}if(r==="82"){s=hextoutf8(p);l.push(["DNS",s]);}if(r==="84"){s=X509.hex2dn(p,0);l.push(["DN",s]);}if(r==="86"){s=hextoutf8(p);l.push(["URI",s]);}if(r==="87"){s=hextoip(p);l.push(["IP",s]);}}return l};this.getExtCRLDistributionPointsURI=function(){var q=this.getExtInfo("cRLDistributionPoints");if(q===undefined){return q}var l=new Array();var m=j(this.hex,q.vidx);for(var o=0;o<m.length;o++){try{var r=f(this.hex,m[o],[0,0,0],"86");var p=hextoutf8(r);l.push(p);}catch(n){}}return l};this.getExtAIAInfo=function(){var p=this.getExtInfo("authorityInfoAccess");if(p===undefined){return p}var l={ocsp:[],caissuer:[]};var m=j(this.hex,p.vidx);for(var n=0;n<m.length;n++){var q=f(this.hex,m[n],[0],"06");var o=f(this.hex,m[n],[1],"86");if(q==="2b06010505073001"){l.ocsp.push(hextoutf8(o));}if(q==="2b06010505073002"){l.caissuer.push(hextoutf8(o));}}return l};this.getExtCertificatePolicies=function(){var o=this.getExtInfo("certificatePolicies");if(o===undefined){return o}var l=b(this.hex,o.vidx);var u=[];var s=j(l,0);for(var r=0;r<s.length;r++){var t={};var n=j(l,s[r]);t.id=i(h(l,n[0]));if(n.length===2){var m=j(l,n[1]);for(var q=0;q<m.length;q++){var p=f(l,m[q],[0],"06");if(p==="2b06010505070201"){t.cps=hextoutf8(f(l,m[q],[1]));}else{if(p==="2b06010505070202"){t.unotice=hextoutf8(f(l,m[q],[1,0]));}}}}u.push(t);}return u};this.readCertPEM=function(l){this.readCertHex(e(l));};this.readCertHex=function(l){this.hex=l;this.getVersion();try{g(this.hex,0,[0,7],"a3");this.parseExt();}catch(m){}};this.getInfo=function(){var B,u,z;B="Basic Fields\n";B+="  serial number: "+this.getSerialNumberHex()+"\n";B+="  signature algorithm: "+this.getSignatureAlgorithmField()+"\n";B+="  issuer: "+this.getIssuerString()+"\n";B+="  notBefore: "+this.getNotBefore()+"\n";B+="  notAfter: "+this.getNotAfter()+"\n";B+="  subject: "+this.getSubjectString()+"\n";B+="  subject public key info: \n";u=this.getPublicKey();B+="    key algorithm: "+u.type+"\n";if(u.type==="RSA"){B+="    n="+hextoposhex(u.n.toString(16)).substr(0,16)+"...\n";B+="    e="+hextoposhex(u.e.toString(16))+"\n";}z=this.aExtInfo;if(z!==undefined&&z!==null){B+="X509v3 Extensions:\n";for(var r=0;r<z.length;r++){var n=z[r];var A=KJUR.asn1.x509.OID.oid2name(n.oid);if(A===""){A=n.oid;}var x="";if(n.critical===true){x="CRITICAL";}B+="  "+A+" "+x+":\n";if(A==="basicConstraints"){var v=this.getExtBasicConstraints();if(v.cA===undefined){B+="    {}\n";}else{B+="    cA=true";if(v.pathLen!==undefined){B+=", pathLen="+v.pathLen;}B+="\n";}}else{if(A==="keyUsage"){B+="    "+this.getExtKeyUsageString()+"\n";}else{if(A==="subjectKeyIdentifier"){B+="    "+this.getExtSubjectKeyIdentifier()+"\n";}else{if(A==="authorityKeyIdentifier"){var l=this.getExtAuthorityKeyIdentifier();if(l.kid!==undefined){B+="    kid="+l.kid+"\n";}}else{if(A==="extKeyUsage"){var w=this.getExtExtKeyUsageName();B+="    "+w.join(", ")+"\n";}else{if(A==="subjectAltName"){var t=this.getExtSubjectAltName2();B+="    "+t+"\n";}else{if(A==="cRLDistributionPoints"){var y=this.getExtCRLDistributionPointsURI();B+="    "+y+"\n";}else{if(A==="authorityInfoAccess"){var p=this.getExtAIAInfo();if(p.ocsp!==undefined){B+="    ocsp: "+p.ocsp.join(",")+"\n";}if(p.caissuer!==undefined){B+="    caissuer: "+p.caissuer.join(",")+"\n";}}else{if(A==="certificatePolicies"){var o=this.getExtCertificatePolicies();for(var q=0;q<o.length;q++){if(o[q].id!==undefined){B+="    policy oid: "+o[q].id+"\n";}if(o[q].cps!==undefined){B+="    cps: "+o[q].cps+"\n";}}}}}}}}}}}}}B+="signature algorithm: "+this.getSignatureAlgorithmName()+"\n";B+="signature: "+this.getSignatureValueHex().substr(0,16)+"...\n";return B};}X509.hex2dn=function(f,b){if(b===undefined){b=0;}if(f.substr(b,2)!=="30"){throw"malformed DN"}var c=new Array();var d=ASN1HEX.getChildIdx(f,b);for(var e=0;e<d.length;e++){c.push(X509.hex2rdn(f,d[e]));}c=c.map(function(a){return a.replace("/","\\/")});return"/"+c.join("/")};X509.hex2rdn=function(f,b){if(b===undefined){b=0;}if(f.substr(b,2)!=="31"){throw"malformed RDN"}var c=new Array();var d=ASN1HEX.getChildIdx(f,b);for(var e=0;e<d.length;e++){c.push(X509.hex2attrTypeValue(f,d[e]));}c=c.map(function(a){return a.replace("+","\\+")});return c.join("+")};X509.hex2attrTypeValue=function(d,i){var j=ASN1HEX;var h=j.getV;if(i===undefined){i=0;}if(d.substr(i,2)!=="30"){throw"malformed attribute type and value"}var g=j.getChildIdx(d,i);if(g.length!==2||d.substr(g[0],2)!=="06");var b=h(d,g[0]);var f=KJUR.asn1.ASN1Util.oidHexToInt(b);var e=KJUR.asn1.x509.OID.oid2atype(f);var a=h(d,g[1]);var c=hextorstr(a);return e+"="+c};X509.getPublicKeyFromCertHex=function(b){var a=new X509();a.readCertHex(b);return a.getPublicKey()};X509.getPublicKeyFromCertPEM=function(b){var a=new X509();a.readCertPEM(b);return a.getPublicKey()};X509.getPublicKeyInfoPropOfCertPEM=function(c){var e=ASN1HEX;var g=e.getVbyList;var b={};var a,f;b.algparam=null;a=new X509();a.readCertPEM(c);f=a.getPublicKeyHex();b.keyhex=g(f,0,[1],"03").substr(2);b.algoid=g(f,0,[0,0],"06");if(b.algoid==="2a8648ce3d0201"){b.algparam=g(f,0,[0,1],"06");}return b};X509.KEYUSAGE_NAME=["digitalSignature","nonRepudiation","keyEncipherment","dataEncipherment","keyAgreement","keyCertSign","cRLSign","encipherOnly","decipherOnly"];
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={};}KJUR.jws.JWS=function(){var b=KJUR,a=b.jws.JWS,c=a.isSafeJSONString;this.parseJWS=function(g,j){if((this.parsedJWS!==undefined)&&(j||(this.parsedJWS.sigvalH!==undefined))){return}var i=g.match(/^([^.]+)\.([^.]+)\.([^.]+)$/);if(i==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}var k=i[1];var e=i[2];var l=i[3];var n=k+"."+e;this.parsedJWS={};this.parsedJWS.headB64U=k;this.parsedJWS.payloadB64U=e;this.parsedJWS.sigvalB64U=l;this.parsedJWS.si=n;if(!j){var h=b64utohex(l);var f=parseBigInt(h,16);this.parsedJWS.sigvalH=h;this.parsedJWS.sigvalBI=f;}var d=b64utoutf8(k);var m=b64utoutf8(e);this.parsedJWS.headS=d;this.parsedJWS.payloadS=m;if(!c(d,this.parsedJWS,"headP")){throw"malformed JSON string for JWS Head: "+d}};};KJUR.jws.JWS.sign=function(i,v,y,z,a){var w=KJUR,m=w.jws,q=m.JWS,g=q.readSafeJSONString,p=q.isSafeJSONString,d=w.crypto,k=d.ECDSA,o=d.Mac,c=d.Signature,t=JSON;var s,j,n;if(typeof v!="string"&&typeof v!="object"){throw"spHeader must be JSON string or object: "+v}if(typeof v=="object"){j=v;s=t.stringify(j);}if(typeof v=="string"){s=v;if(!p(s)){throw"JWS Head is not safe JSON string: "+s}j=g(s);}n=y;if(typeof y=="object"){n=t.stringify(y);}if((i==""||i==null)&&j.alg!==undefined){i=j.alg;}if((i!=""&&i!=null)&&j.alg===undefined){j.alg=i;s=t.stringify(j);}if(i!==j.alg){throw"alg and sHeader.alg doesn't match: "+i+"!="+j.alg}var r=null;if(q.jwsalg2sigalg[i]===undefined){throw"unsupported alg name: "+i}else{r=q.jwsalg2sigalg[i];}var e=utf8tob64u(s);var l=utf8tob64u(n);var b=e+"."+l;var x="";if(r.substr(0,4)=="Hmac"){if(z===undefined){throw"mac key shall be specified for HS* alg"}var h=new o({alg:r,prov:"cryptojs",pass:z});h.updateString(b);x=h.doFinal();}else{if(r.indexOf("withECDSA")!=-1){var f=new c({alg:r});f.init(z,a);f.updateString(b);hASN1Sig=f.sign();x=KJUR.crypto.ECDSA.asn1SigToConcatSig(hASN1Sig);}else{if(r!="none"){var f=new c({alg:r});f.init(z,a);f.updateString(b);x=f.sign();}}}var u=hextob64u(x);return b+"."+u};KJUR.jws.JWS.verify=function(w,B,n){var x=KJUR,q=x.jws,t=q.JWS,i=t.readSafeJSONString,e=x.crypto,p=e.ECDSA,s=e.Mac,d=e.Signature,m;if(typeof RSAKey!==undefined){m=RSAKey;}var y=w.split(".");if(y.length!==3){return false}var f=y[0];var r=y[1];var c=f+"."+r;var A=b64utohex(y[2]);var l=i(b64utoutf8(y[0]));var k=null;var z=null;if(l.alg===undefined){throw"algorithm not specified in header"}else{k=l.alg;z=k.substr(0,2);}if(n!=null&&Object.prototype.toString.call(n)==="[object Array]"&&n.length>0){var b=":"+n.join(":")+":";if(b.indexOf(":"+k+":")==-1){throw"algorithm '"+k+"' not accepted in the list"}}if(k!="none"&&B===null){throw"key shall be specified to verify."}if(typeof B=="string"&&B.indexOf("-----BEGIN ")!=-1){B=KEYUTIL.getKey(B);}if(z=="RS"||z=="PS"){if(!(B instanceof m)){throw"key shall be a RSAKey obj for RS* and PS* algs"}}if(z=="ES"){if(!(B instanceof p)){throw"key shall be a ECDSA obj for ES* algs"}}var u=null;if(t.jwsalg2sigalg[l.alg]===undefined){throw"unsupported alg name: "+k}else{u=t.jwsalg2sigalg[k];}if(u=="none"){throw"not supported"}else{if(u.substr(0,4)=="Hmac"){var o=null;if(B===undefined){throw"hexadecimal key shall be specified for HMAC"}var j=new s({alg:u,pass:B});j.updateString(c);o=j.doFinal();return A==o}else{if(u.indexOf("withECDSA")!=-1){var h=null;try{h=p.concatSigToASN1Sig(A);}catch(v){return false}var g=new d({alg:u});g.init(B);g.updateString(c);return g.verify(h)}else{var g=new d({alg:u});g.init(B);g.updateString(c);return g.verify(A)}}}};KJUR.jws.JWS.parse=function(g){var c=g.split(".");var b={};var f,e,d;if(c.length!=2&&c.length!=3){throw"malformed sJWS: wrong number of '.' splitted elements"}f=c[0];e=c[1];if(c.length==3){d=c[2];}b.headerObj=KJUR.jws.JWS.readSafeJSONString(b64utoutf8(f));b.payloadObj=KJUR.jws.JWS.readSafeJSONString(b64utoutf8(e));b.headerPP=JSON.stringify(b.headerObj,null,"  ");if(b.payloadObj==null){b.payloadPP=b64utoutf8(e);}else{b.payloadPP=JSON.stringify(b.payloadObj,null,"  ");}if(d!==undefined){b.sigHex=b64utohex(d);}return b};KJUR.jws.JWS.verifyJWT=function(e,l,r){var d=KJUR,j=d.jws,o=j.JWS,n=o.readSafeJSONString,p=o.inArray,f=o.includedArray;var k=e.split(".");var c=k[0];var i=k[1];var m=b64utohex(k[2]);var h=n(b64utoutf8(c));var g=n(b64utoutf8(i));if(h.alg===undefined){return false}if(r.alg===undefined){throw"acceptField.alg shall be specified"}if(!p(h.alg,r.alg)){return false}if(g.iss!==undefined&&typeof r.iss==="object"){if(!p(g.iss,r.iss)){return false}}if(g.sub!==undefined&&typeof r.sub==="object"){if(!p(g.sub,r.sub)){return false}}if(g.aud!==undefined&&typeof r.aud==="object"){if(typeof g.aud=="string"){if(!p(g.aud,r.aud)){return false}}else{if(typeof g.aud=="object"){if(!f(g.aud,r.aud)){return false}}}}var b=j.IntDate.getNow();if(r.verifyAt!==undefined&&typeof r.verifyAt==="number"){b=r.verifyAt;}if(r.gracePeriod===undefined||typeof r.gracePeriod!=="number"){r.gracePeriod=0;}if(g.exp!==undefined&&typeof g.exp=="number"){if(g.exp+r.gracePeriod<b){return false}}if(g.nbf!==undefined&&typeof g.nbf=="number"){if(b<g.nbf-r.gracePeriod){return false}}if(g.iat!==undefined&&typeof g.iat=="number"){if(b<g.iat-r.gracePeriod){return false}}if(g.jti!==undefined&&r.jti!==undefined){if(g.jti!==r.jti){return false}}if(!o.verify(e,l,r.alg)){return false}return true};KJUR.jws.JWS.includedArray=function(b,a){var c=KJUR.jws.JWS.inArray;if(b===null){return false}if(typeof b!=="object"){return false}if(typeof b.length!=="number"){return false}for(var d=0;d<b.length;d++){if(!c(b[d],a)){return false}}return true};KJUR.jws.JWS.inArray=function(d,b){if(b===null){return false}if(typeof b!=="object"){return false}if(typeof b.length!=="number"){return false}for(var c=0;c<b.length;c++){if(b[c]==d){return true}}return false};KJUR.jws.JWS.jwsalg2sigalg={HS256:"HmacSHA256",HS384:"HmacSHA384",HS512:"HmacSHA512",RS256:"SHA256withRSA",RS384:"SHA384withRSA",RS512:"SHA512withRSA",ES256:"SHA256withECDSA",ES384:"SHA384withECDSA",PS256:"SHA256withRSAandMGF1",PS384:"SHA384withRSAandMGF1",PS512:"SHA512withRSAandMGF1",none:"none",};KJUR.jws.JWS.isSafeJSONString=function(c,b,d){var e=null;try{e=jsonParse(c);if(typeof e!="object"){return 0}if(e.constructor===Array){return 0}if(b){b[d]=e;}return 1}catch(a){return 0}};KJUR.jws.JWS.readSafeJSONString=function(b){var c=null;try{c=jsonParse(b);if(typeof c!="object"){return null}if(c.constructor===Array){return null}return c}catch(a){return null}};KJUR.jws.JWS.getEncodedSignatureValueFromJWS=function(b){var a=b.match(/^[^.]+\.[^.]+\.([^.]+)$/);if(a==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}return a[1]};KJUR.jws.JWS.getJWKthumbprint=function(d){if(d.kty!=="RSA"&&d.kty!=="EC"&&d.kty!=="oct"){throw"unsupported algorithm for JWK Thumprint"}var a="{";if(d.kty==="RSA"){if(typeof d.n!="string"||typeof d.e!="string"){throw"wrong n and e value for RSA key"}a+='"e":"'+d.e+'",';a+='"kty":"'+d.kty+'",';a+='"n":"'+d.n+'"}';}else{if(d.kty==="EC"){if(typeof d.crv!="string"||typeof d.x!="string"||typeof d.y!="string"){throw"wrong crv, x and y value for EC key"}a+='"crv":"'+d.crv+'",';a+='"kty":"'+d.kty+'",';a+='"x":"'+d.x+'",';a+='"y":"'+d.y+'"}';}else{if(d.kty==="oct"){if(typeof d.k!="string"){throw"wrong k value for oct(symmetric) key"}a+='"kty":"'+d.kty+'",';a+='"k":"'+d.k+'"}';}}}var b=rstrtohex(a);var c=KJUR.crypto.Util.hashHex(b,"sha256");var e=hextob64u(c);return e};KJUR.jws.IntDate={};KJUR.jws.IntDate.get=function(c){var b=KJUR.jws.IntDate,d=b.getNow,a=b.getZulu;if(c=="now"){return d()}else{if(c=="now + 1hour"){return d()+60*60}else{if(c=="now + 1day"){return d()+60*60*24}else{if(c=="now + 1month"){return d()+60*60*24*30}else{if(c=="now + 1year"){return d()+60*60*24*365}else{if(c.match(/Z$/)){return a(c)}else{if(c.match(/^[0-9]+$/)){return parseInt(c)}}}}}}}throw"unsupported format: "+c};KJUR.jws.IntDate.getZulu=function(a){return zulutosec(a)};KJUR.jws.IntDate.getNow=function(){var a=~~(new Date()/1000);return a};KJUR.jws.IntDate.intDate2UTCString=function(a){var b=new Date(a*1000);return b.toUTCString()};KJUR.jws.IntDate.intDate2Zulu=function(e){var i=new Date(e*1000),h=("0000"+i.getUTCFullYear()).slice(-4),g=("00"+(i.getUTCMonth()+1)).slice(-2),b=("00"+i.getUTCDate()).slice(-2),a=("00"+i.getUTCHours()).slice(-2),c=("00"+i.getUTCMinutes()).slice(-2),f=("00"+i.getUTCSeconds()).slice(-2);return h+g+b+a+c+f+"Z"};
  if(typeof KJUR=="undefined"||!KJUR){KJUR={};}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={};}KJUR.jws.JWSJS=function(){var c=KJUR,b=c.jws,a=b.JWS,d=a.readSafeJSONString;this.aHeader=[];this.sPayload="";this.aSignature=[];this.init=function(){this.aHeader=[];this.sPayload=undefined;this.aSignature=[];};this.initWithJWS=function(f){this.init();var e=f.split(".");if(e.length!=3){throw"malformed input JWS"}this.aHeader.push(e[0]);this.sPayload=e[1];this.aSignature.push(e[2]);};this.addSignature=function(e,h,m,k){if(this.sPayload===undefined||this.sPayload===null){throw"there's no JSON-JS signature to add."}var l=this.aHeader.length;if(this.aHeader.length!=this.aSignature.length){throw"aHeader.length != aSignature.length"}try{var f=KJUR.jws.JWS.sign(e,h,this.sPayload,m,k);var j=f.split(".");var n=j[0];var g=j[2];this.aHeader.push(j[0]);this.aSignature.push(j[2]);}catch(i){if(this.aHeader.length>l){this.aHeader.pop();}if(this.aSignature.length>l){this.aSignature.pop();}throw"addSignature failed: "+i}};this.verifyAll=function(h){if(this.aHeader.length!==h.length||this.aSignature.length!==h.length){return false}for(var g=0;g<h.length;g++){var f=h[g];if(f.length!==2){return false}var e=this.verifyNth(g,f[0],f[1]);if(e===false){return false}}return true};this.verifyNth=function(f,j,g){if(this.aHeader.length<=f||this.aSignature.length<=f){return false}var h=this.aHeader[f];var k=this.aSignature[f];var l=h+"."+this.sPayload+"."+k;var e=false;try{e=a.verify(l,j,g);}catch(i){return false}return e};this.readJWSJS=function(g){if(typeof g==="string"){var f=d(g);if(f==null){throw"argument is not safe JSON object string"}this.aHeader=f.headers;this.sPayload=f.payload;this.aSignature=f.signatures;}else{try{if(g.headers.length>0){this.aHeader=g.headers;}else{throw"malformed header"}if(typeof g.payload==="string"){this.sPayload=g.payload;}else{throw"malformed signatures"}if(g.signatures.length>0){this.aSignatures=g.signatures;}else{throw"malformed signatures"}}catch(e){throw"malformed JWS-JS JSON object: "+e}}};this.getJSON=function(){return{headers:this.aHeader,payload:this.sPayload,signatures:this.aSignature}};this.isEmpty=function(){if(this.aHeader.length==0){return 1}return 0};};
  var ECDSA = KJUR.crypto.ECDSA;
  var DSA = KJUR.crypto.DSA;
  var Signature = KJUR.crypto.Signature;
  var MessageDigest = KJUR.crypto.MessageDigest;
  var Mac = KJUR.crypto.Mac;
  var Cipher = KJUR.crypto.Cipher;

  // name spaces
  var KJUR_1 = KJUR;
  var crypto_1 = KJUR.crypto;
  var asn1 = KJUR.asn1;
  var jws = KJUR.jws;
  var lang = KJUR.lang;

  var FunctionSchemaData = {"start":"function","elements":{"function":{"name":"function","type":"element","attributes":{},"elements":{"name":"function","content":{"type":"~","blocks":["name",{"type":"?","block":"title"},{"type":"?","block":"summary"},{"type":"?","block":"description"},{"type":"?","block":"relateds"},{"type":"?","block":"params"},{"type":"?","block":"return"},"implems",{"type":"?","block":"examples"},{"type":"?","block":"tests"},{"type":"?","block":"authors"}]}}},"name":{"name":"name","type":"text","attributes":{},"elements":{"name":"name","content":"TEXT"}},"title":{"name":"title","type":"text","attributes":{},"elements":{"name":"title","content":"TEXT"}},"summary":{"name":"summary","type":"text","attributes":{},"elements":{"name":"summary","content":"TEXT"}},"description":{"name":"description","type":"text","attributes":{},"elements":{"name":"description","content":"TEXT"}},"relateds":{"name":"relateds","type":"element","attributes":{},"elements":{"name":"relateds","content":{"type":"*","block":"related"}}},"related":{"name":"related","type":"text","attributes":{},"elements":{"name":"related","content":"TEXT"}},"params":{"name":"params","type":"element","attributes":{},"elements":{"name":"params","content":{"type":"*","block":"param"}}},"param":{"name":"param","type":"element","attributes":{"name":{"name":"name"},"type":{"name":"type"}},"elements":{"name":"param","content":{"type":"~","blocks":[{"type":"?","block":"default"},{"type":"?","block":"description"}]}}},"default":{"name":"default","type":"text","attributes":{"type":{"name":"type"}},"elements":{"name":"default","content":"TEXT"}},"return":{"name":"return","type":"element","attributes":{"type":{"name":"type"}},"elements":{"name":"return","content":{"type":"?","block":"description"}}},"implems":{"name":"implems","type":"element","attributes":{},"elements":{"name":"implems","content":{"type":"*","block":"implem"}}},"implem":{"name":"implem","type":"element","attributes":{"language":{"name":"language"}},"elements":{"name":"implem","content":{"type":"~","blocks":[{"type":"?","block":"types"},{"type":"?","block":"requires"},"code"]}}},"types":{"name":"types","type":"element","attributes":{},"elements":{"name":"types","content":{"type":"*","block":"type"}}},"type":{"name":"type","type":"element","attributes":{"name":{"name":"name"},"type":{"name":"type"}},"elements":{"name":"type","content":{"type":",","blocks":[]}}},"requires":{"name":"requires","type":"text","attributes":{},"elements":{"name":"requires","content":"TEXT"}},"code":{"name":"code","type":"text","attributes":{"include":{"name":"include"}},"elements":{"name":"code","content":"TEXT"}},"examples":{"name":"examples","type":"element","attributes":{},"elements":{"name":"examples","content":{"type":"*","block":"example"}}},"example":{"name":"example","type":"element","attributes":{},"elements":{"name":"example","content":{"type":"~","blocks":[{"type":"?","block":"description"},{"type":"?","block":"usage"},{"type":"?","block":"result"}]}}},"usage":{"name":"usage","type":"text","attributes":{},"elements":{"name":"usage","content":"TEXT"}},"tests":{"name":"tests","type":"element","attributes":{},"elements":{"name":"tests","content":{"type":"*","block":"test"}}},"test":{"name":"test","type":"element","attributes":{},"elements":{"name":"test","content":{"type":"~","blocks":[{"type":"?","block":"description"},{"type":"?","block":"args"},"result"]}}},"authors":{"name":"authors","type":"element","attributes":{},"elements":{"name":"authors","content":{"type":"*","block":"author"}}},"author":{"name":"author","type":"text","attributes":{},"elements":{"name":"author","content":"TEXT"}},"args":{"name":"args","type":"element","attributes":{},"elements":{"name":"args","content":{"type":"*","block":"arg"}}},"arg":{"name":"arg","type":"text","attributes":{"type":{"name":"type"},"name":{"name":"name"}},"elements":{"name":"arg","content":"TEXT"}},"result":{"name":"result","type":"text","attributes":{"type":{"name":"type"}},"elements":{"name":"result","content":"TEXT"}}}}

  const FunctionSchema = substance.XMLSchema.fromJSON(FunctionSchemaData);

  FunctionSchema.getName = function() {
    return 'stencila-function'
  };

  FunctionSchema.getVersion = function() {
    return '1.0'
  };

  FunctionSchema.getDocTypeParams = function() {
    return ['function', 'Stencila Function 1.0', FunctionSchema.uri]
  };

  FunctionSchema.uri = 'http://stenci.la/Function-1.0.dtd';

  class FunctionDocument extends substance.XMLDocument {

    getDocTypeParams() {
      return FunctionSchema.getDocTypeParams()
    }

    getXMLSchema() {
      return FunctionSchema
    }

    getRootNode() {
      return this.get('function')
    }

    // Getter functions for retreiving function specifications
    // as plain old data (e.g. strings or objects). Using naming
    // and order as in FunctionSchema.rng for consisitency

    /**
     * Get the function's name
     */
    getName() {
      return this.get('name').text()
    }

    /**
     * Get the function's summary
     */
    getSummary() {
      let summaryEl = this.find('summary');
      return summaryEl ? summaryEl.text() : ''
    }

    /**
     * Get the function's parameters as an object
     *
     * e.g. params: [{
     *   name: 'value', 
     *   type: 'number', 
     *   description: 'The value', 
     *   default: {type: 'number', data: 42}
     * }]
     */
    getParams() {
      if (!this._params) {
        // Parameters are cached so that this does not need to be
        // done for every call of this function
        this._params = [];
        let paramEls = this.getRootNode().findAll('param');
        for (let paramEl of paramEls) {
          const name = paramEl.attr('name');
          const type = paramEl.attr('type');

          const descriptionEl = paramEl.find('description');
          let description = descriptionEl ? descriptionEl.text() : '';

          let defaultValue = null;
          const defaultEl = paramEl.find('default');
          if (defaultEl) {
            defaultValue = {
              type: defaultEl.attr('type'),
              data: defaultEl.text()
            };
          }

          this._params.push({
            name: name,
            type: type,
            description: description,
            default: defaultValue
          });
        }
      }
      return this._params
    }

    /**
     * Get the function's return type and description
     */
    getReturn() {
      let returnEl = this.getRootNode().find('return');
      if (returnEl) {
        let descriptionEl = returnEl.find('description');
        return {
          type: returnEl.attr('type'),
          description: descriptionEl ? descriptionEl.text() : ''
        }
      } else {
        return {
          type: 'any',
          description: ''
        }
      }
    }

    /**
     * Get a list of languages that this function is implemented in
     */
    getImplementations() {
      return this.getRootNode().findAll(`implem`).map((implem) => implem.language)
    }

    /**
     * Get the implementation for a language
     */
    getImplementation(language) {
      let implem = this.getRootNode().find(`implem[language=${language}]`);
      if (implem) {
        let code = implem.find('code');
        if (code) return code.text()
      } else {
        throw new Error(`An implementation is not available for language ${language}`)
      }
    }

    /**
    * Get examples
    */
    getExamples() {
      return this.getRootNode().findAll(`example`)
    }

    /**
    * Get basic usage examples (to be displayed in popover)
    */
    getUsageExamples() {
      return this.getExamples().map((example) => {
        let usageEl = example.find('usage');
        return usageEl ? usageEl.text() : ''
      })
    }

    /*
      Get a usage summary used to populate FunctionUsage Component

      {
        name: 'sum',
        summary: 'Returns the sum of a range',
        examples: [
          'sum(A1:A5)'
        ],
        params: [
          { name: 'range', type: 'range', description: 'A range (array of numbers) to be summed up' }
        ],
        return: { type: 'number', description: 'The sum of numbers in the given range'}
      }
    */
    getUsage() {
      return {
        name: this.getName(),
        summary: this.getSummary(),
        examples: this.getUsageExamples(),
        params: this.getParams(),
        return: this.getReturn()
      }
    }

  }

  class FunctionDocumentImporter extends substance.XMLDocumentImporter {

    /**
     * Compile an XML document from the main XML files and any other
     * sibling files that are "include"ed.
     *
     * @param  {String} xml A string of the XML of the main function definition file
     * @param  {Object} files A dictionary of sibling file names and content
     */
    compileDocument(xml, files) {
      let doc = substance.DefaultDOMElement.parseXML(xml);
      if (files) {
        for (let $code of doc.findAll('code[include]')) {
          let file = $code.attr('include');
          let code = files[file];
          if (!code) throw new Error(`File "${file}" to be included as in Function definition was not supplied`)
          $code.text(code);
        }
      }
      return doc
    }

    /*
      overridden to enforce some ids for singular elements
    */
    _getIdForElement(el, type) {
      switch (type) {
        case 'function':
        case 'name':
        case 'title':
        case 'summary':
        case 'params':
        case 'return':
        case 'implems':
        case 'tests':
        case 'examples':
          return type
        default:
      }
      return super._getIdForElement(el, type)
    }
  }

  var FunctionPackage = {
    name: 'Function',

    configure(config) {
      substance.registerSchema(config, FunctionSchema, FunctionDocument, {
        ImporterClass: FunctionDocumentImporter
      });

      config.import(substance.BasePackage);
    }
  }

  /*
    Provides a Javascript API to create, update and lookup functions.

    Think of this as an in-memory function library. It does not parse or
    run functions, only the data is stored here for reflection.

    FunctionManager is used by the cell engine to lookup function calls, pick the
    right implementation and runs it.
  */
  class FunctionManager {

    constructor(libraries = null) {
      // Maps function names to the library in which they have been defined
      this.functionMap = {};
      // Holds function instances scoped by libraryName and functionName
      this.functions = {};

      this.configurator = new substance.Configurator().import(FunctionPackage);

      if (libraries) this.importLibraries(libraries);
    }

    /*
      Import a function
    */
    importFunction(context, func, libraryName = 'local') {
      const record = this.functionMap[func.name];
      if (record && record.library !== libraryName) {
        throw new Error(`Function "${func.name}" is already defined in library "${record.library}"`)
      }
      this.functionMap[func.name] = { context, library: libraryName };
      if (!this.functions[libraryName]) this.functions[libraryName] = {};
      this.functions[libraryName][func.name] = func;
    }

    /*
      Import a function library
    */
    importLibrary(context, library) {
      for (let func of Object.values(library.funcs)) {
        this.importFunction(context, func, library.name);
      }
    }

    /**
     * Import a set of libraries
     * 
     * @param  {object} libraries An object of libraries like `{name:xml}`
     */
    importLibraries(context, libraries) {
      for (let library of Object.values(libraries)) {
        this.importLibrary(context, library);
      }
    }

    getContextLibrary(functionName) {
      return this.functionMap[functionName]
    }

    /*
      Get function instance by name
    */
    getFunction(functionName) {
      let record = this.functionMap[functionName];
      if (record) {
        return this.functions[record.library][functionName]
      }
    }

    /*
      Get a list of available function names
    */
    getFunctionNames() {
      return Object.keys(this.functionMap)
    }
  }

  class CellError extends Error {
    constructor(msg, details) {
      super(msg);
      this.details = details;
    }

    static cast(err) {
      if (err instanceof CellError) {
        return err
      } else {
        return new RuntimeError(err.message, err)
      }
    }
  }

  class ContextError extends CellError {
    get type() { return 'engine' }
    get name() { return 'context' }
  }

  class GraphError extends CellError {
    get type() { return 'graph' }
  }

  class SyntaxError$1 extends CellError {
    get type() { return 'engine' }
    get name() { return 'syntax' }
  }

  class UnresolvedInputError extends GraphError {
    get name() { return 'unresolved' }
  }

  class CyclicDependencyError extends GraphError {
    get trace() {
      return this.details.trace
    }
    get name() { return 'cyclic'}
  }

  class OutputCollisionError extends GraphError {
    get name() { return 'collision'}
  }

  class RuntimeError extends CellError {
    get type() { return 'runtime' }
    get name() { return 'runtime' }
  }

  // not yet analysed
  const UNKNOWN = Symbol('UNKNOWN');
  // analysed
  const ANALYSED = Symbol('ANALYSED');
  // syntax or graph errors
  const BROKEN = Symbol('BROKEN');
  // runtime or validation errors
  const FAILED = Symbol('FAILED');
  // one of the inputs is broken, failed, or blocked
  const BLOCKED = Symbol('BLOCKED');
  // all inputs are ready, running, or ok
  const WAITING = Symbol('WAITING');
  // all inputs are ok
  const READY = Symbol('READY');
  // evaluation is running (READY+evaluation triggered)
  // TODO: do we really need this on this level?
  const RUNNING = Symbol('RUNNING');
  // evaluation succeeded
  const OK = Symbol('OK');

  function toInteger(state) {
    switch (state) {
      case UNKNOWN: return -2
      case ANALYSED: return -1
      case BROKEN: return 1
      case FAILED: return 2
      case BLOCKED: return 3
      case WAITING: return 4
      case READY: return 5
      case RUNNING: return 6
      case OK: return 7
      default:
        throw new Error('Illegal state.')
    }
  }

  function toString(state) {
    switch (state) {
      case UNKNOWN: return 'unknown'
      case ANALYSED: return 'analysed'
      case BROKEN: return 'broken'
      case FAILED: return 'failed'
      case BLOCKED: return 'blocked'
      case WAITING: return 'waiting'
      case READY: return 'ready'
      case RUNNING: return 'running'
      case OK: return 'ok'
      default:
        throw new Error('Illegal state.')
    }
  }

  function getCellState(cell) {
    // FIXME: we should make sure that cellState is
    // initialized as early as possible
    return cell.state
  }

  function isExpression(source) {
    return /^\s*=/.exec(source)
  }

  function valueFromText(text, preferredType = 'any') {
    const data = _parseText(preferredType, text);
    const type_ = type(data);
    return { type: type_, data }
  }

  function _getSourceElement(cellNode) {
    if (cellNode.getDocument() instanceof substanceTexture.TextureDocument) {
      // ATTENTION: this caching would be problematic if the cell element
      // was changed structurally, e.g. the <source-code> element replaced.
      // But we do not do this, so this should be fine.
      if (!cellNode._sourceEl) {
        cellNode._sourceEl = cellNode.find('source-code');
      }
      return cellNode._sourceEl
    }
    return cellNode
  }

  function getSource(cellNode) {
    return _getSourceElement(cellNode).textContent
  }

  function setSource(cellNode, newSource) {
    let el = _getSourceElement(cellNode);
    el.text(newSource);
  }

  function getLang(cellNode) {
    return _getSourceElement(cellNode).getAttribute('language')
  }

  function _parseText(preferredType, text) {
    // guess value
    if (text === 'false') {
      return false
    } else if (text === 'true') {
      return true
    } else if (!isNaN(text)) {
      let _int = Number.parseInt(text, 10);
      if (_int == text) { // eslint-disable-line
        return _int
      } else {
        return Number.parseFloat(text)
      }
    } else {
      return text
    }
  }

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function getColumnLabel(colIdx) {
    if (!substance.isNumber(colIdx)) {
      throw new Error('Illegal argument.')
    }
    var label = "";
    while(true) { // eslint-disable-line
      var mod = colIdx % ALPHABET.length;
      colIdx = Math.floor(colIdx/ALPHABET.length);
      label = ALPHABET[mod] + label;
      if (colIdx > 0) colIdx--;
      else if (colIdx === 0) break
    }
    return label
  }

  function getCellLabel(rowIdx, colIdx) {
    let colLabel = getColumnLabel(colIdx);
    let rowLabel = rowIdx + 1;
    return colLabel + rowLabel
  }

  function getColumnIndex(colStr) {
    let index = 0;
    let rank = 1;
    for (let i = 0; i < colStr.length; i++) {
      let letter = colStr[i];
      index += rank * ALPHABET.indexOf(letter);
      rank++;
    }
    return index
  }

  function getRowCol(cellLabel) {
    var match = /^([A-Z]+)([1-9][0-9]*)$/.exec(cellLabel);
    return [
      parseInt(match[2], 10)-1,
      getColumnIndex(match[1])
    ]
  }

  function getError(cell) {
    let cellState = getCellState(cell);
    if (cellState && cellState.errors) {
      return cellState.errors[0]
    }
  }

  function getErrorMessage(error) {
    switch(error.name) {
      case 'unresolved': {
        return 'Unresolved inputs: ' + error.details.unresolved.map(s => {
          return s.origStr || s.name
        }).join(', ')
      }
      case 'cyclic': {
        let frags = [];
        let trace = error.details.trace;
        let symbols = error.details.symbols;
        trace.forEach(id => {
          let s = symbols[id];
          if (s) {
            frags.push(s.origStr || s);
          }
        });
        frags.push(frags[0]);
        return 'Cyclic Dependency: ' + frags.join(' -> ')
      }
      case 'syntax': {
        return 'Syntax Error'
      }
      default:
        return error.message
    }
  }

  function getValue(cell) {
    let cellState = getCellState(cell);
    if (cellState) {
      return cellState.value
    }
  }

  function getFrameSize(layout) {
    // WORKAROUND, this should be solved in libcore functions
    const defaultSizes = {
      'width': '400',
      'height': '400'
    };
    const sizes = layout.width ? layout : defaultSizes;
    return sizes
  }

  function getIndexesFromRange(start, end) {
    let [startRow, startCol] = getRowCol(start);
    let endRow, endCol;
    if (end) {
      ([endRow, endCol] = getRowCol(end));
      if (startRow > endRow) ([startRow, endRow] = [endRow, startRow]);
      if (startCol > endCol) ([startCol, endCol] = [endCol, startCol]);
    } else {
      ([endRow, endCol] = [startRow, startCol]);
    }
    return { startRow, startCol, endRow, endCol }
  }

  function getRangeFromMatrix(cells, startRow, startCol, endRow, endCol, force2D) {
    if (!force2D) {
      if (startRow === endRow && startCol === endCol) {
        let row = cells[startCol];
        if (row) return row[endCol]
        else return undefined
      }
      if (startRow === endRow) {
        let row = cells[startRow];
        if (row) return row.slice(startCol, endCol+1)
        else return []
      }
      if (startCol === endCol) {
        let res = [];
        for (let i = startRow; i <= endRow; i++) {
          let row = cells[i];
          if (row) res.push(row[startCol]);
        }
        return res
      }
    }
    let res = [];
    for (var i = startRow; i < endRow+1; i++) {
      let row = cells[i];
      if (row) res.push(row.slice(startCol, endCol+1));
    }
    return res
  }

  function qualifiedId(doc, cell) {
    let cellId = substance.isString(cell) ? cell : cell.id;
    if (doc) {
      let docId = substance.isString(doc) ? doc : doc.id;
      return `${docId}!${cellId}`
    } else {
      return cellId
    }
  }

  /*
   * A class representing symbols used in Stencila Cells to reference other cells, or ranges.
   *
   * Examples:
   *
   * - `x` or `'My Document'!x` (variable)
   * - `A1` or `'My Sheet'!A1` (cell)
   * - `A1:B10` or `'My Sheet'!A1:B10` (range)
   *
   */
  class CellSymbol {

    /*
     * @param {Symbol} s the parsed symbol
     * @param {string} docId id of the target document where the symbol can be resolved
     * @param {Cell} cell the owner cell which has this symbol as an input dependency
     */
    constructor({ type, scope, name, text, mangledStr, startPos, endPos}, targetDocId, cell) {
      this.type = type;
      this.scope = scope;
      this.name = name;
      this.docId = targetDocId;
      this.id = qualifiedId(targetDocId, name);
      this.origStr = text;
      this.mangledStr = mangledStr;
      this.startPos = startPos;
      this.endPos = endPos;
      this.cell = cell;

      // these are only set for 'cell' and 'range' symbols
      this.startRow = null;
      this.startCol = null;
      this.endRow = null;
      this.endCol = null;
      if (type === 'cell') {
        let { startRow, startCol } = getIndexesFromRange(name);
        this.startRow = this.endRow = startRow;
        this.startCol = this.endCol = startCol;
      } else if (type === 'range') {
        let [start, end] = name.split(':');
        let { startRow, startCol, endRow, endCol } = getIndexesFromRange(start, end);
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
      }
    }

    toString() {
      return this.id
    }
  }

  const MSG_UNRESOLVED_INPUT = 'Unresolved input.';

  class CellGraph {

    constructor() {
      // cell data by id
      this._cells = {};
      // symbols -> cell ids; which cell is depending on a symbol
      this._ins = {};
      // symbol -> cell id; which symbol is provided by which cell
      this._out = {};
      // to record which cells have been affected (batched update)
      // - 'stateChanged': an error has been added or the state has been updated otherwise
      // - 'structureChanged': cells that have changed w.r.t. inputs or output, and thus need to be checked for structural consistency
      // - 'valueUpdated': all cells that have a new value or a runtime error, i.e. the new state is OK or FAILED.
      // TODO: shouldn't be 'valueUpdated' just be the same as 'stateChanged'?
      this._stateChanged = new Set();
      this._structureChanged = new Set();
      this._valueUpdated = new Set();
    }

    needsUpdate() {
      return this._stateChanged.size > 0 || this._structureChanged.size > 0 || this._valueUpdated.size > 0
    }

    hasCell(id) {
      return this._cells.hasOwnProperty(id)
    }

    getCell(id) {
      return this._cells[id]
    }

    addCell(cell) {
      const id = cell.id;
      if (this._cells[id]) throw new Error(`Cell with ${id} already exists`)
      this._cells[id] = cell;
      this._structureChanged.add(id);
      if (cell.inputs && cell.inputs.size > 0) {
        this._registerInputs(id, new Set(), cell.inputs);
      }
      if (cell.output) {
        this._registerOutput(id, null, cell.output);
      }
    }

    removeCell(id) {
      const cell = this._cells[id];
      if (!cell) throw new Error('Internal error: cell does not exist.')
      cell.inputs.forEach(s => {
        if (this._ins[s]) {
          this._ins[s].delete(id);
        }
      });
      this._deregisterOutput(id, cell.output);
      delete this._cells[id];
      if (cell.prev) {
        this._setNext(cell.prev, cell.next);
      }
      if (cell.next) {
        this._setPrev(cell.next, cell.prev);
      }
      // remove the cell from all registered updates
      this._stateChanged.delete(cell.id);
      this._structureChanged.delete(cell.id);
      this._valueUpdated.delete(cell.id);
    }

    getValue(symbol) {
      let cellId = this._out[symbol];
      if (!cellId) return undefined
      // if there is a name collision return undefined
      // TODO: should we allow this at all?
      if (substance.isArray(cellId)) {
        throw new Error('Ambigous symbol: '+symbol)
      }

      const cell = this._cells[cellId];
      if (!cell) throw new Error('Internal error: cell does not exist.')
      // Note, that the cell value is actually not interpreted in any way by the graph
      // it is maintained by the engine.
      return cell.value
    }

    setInputsOutputs(id, newInputs, newOutput) {
      let cell = this._cells[id];
      if (!cell) throw new Error(`Unknown cell ${id}`)
      this._setInputs(cell, newInputs);
      this._setOutput(cell, newOutput);
      if (cell.status === UNKNOWN) {
        this._structureChanged.add(id);
        cell.status = ANALYSED;
      }
    }

    // Note: we use this for sheet cells
    setInputs(id, newInputs) {
      let cell = this._cells[id];
      if (!cell) throw new Error(`Unknown cell ${id}`)
      this._setInputs(cell, newInputs);
      if (cell.status === UNKNOWN) {
        this._structureChanged.add(id);
        cell.status = ANALYSED;
      }
    }

    // used to update sheet cell output symbols after structural
    // changes. In this case there are typically a lot of other changes, too
    setOutput(id, newOutput) {
      let cell = this._cells[id];
      if (!cell) throw new Error(`Unknown cell ${id}`)
      this._setOutput(cell, newOutput);
    }

    _setInputs(cell, newInputs) {
      newInputs = new Set(newInputs);
      if(this._registerInputs(cell.id, cell.inputs, newInputs)) {
        cell.inputs = newInputs;
        this._clearCyclicDependencyError(cell);
        cell.clearErrors(e => e instanceof UnresolvedInputError);
      }
    }

    _setOutput(cell, newOutput) {
      // TODO: if only the output of a cell changed, we could retain the runtime result
      // and leave the cell's state untouched
      let oldOutput = cell.output;
      if (this._registerOutput(cell.id, oldOutput, newOutput)) {
        cell.output = newOutput;
        // TODO: do we need to clear a potential old graph error
        // e.g. from a previous cyclic dependency
        this._clearCyclicDependencyError(cell);
      }
    }

    _setNext(id, nextId) {
      let cell = this._cells[id];
      cell.next = nextId;
      this._structureChanged.add(nextId);
    }

    _setPrev(id, prevId) {
      let cell = this._cells[id];
      cell.prev = prevId;
      this._structureChanged.add(id);
    }

    addError(id, error) {
      this.addErrors(id, [error]);
    }

    addErrors(id, errors) {
      let cell = this._cells[id];
      errors = errors.map(err => CellError.cast(err));
      cell.addErrors(errors);
      this._stateChanged.add(id);
    }

    clearErrors(id, type) {
      let cell = this._cells[id];
      if (type === 'graph' || !type) {
        this._clearCyclicDependencyError(cell);
      }
      if (type) {
        cell.clearErrors(type);
      } else {
        cell.errors = [];
      }
      this._stateChanged.add(id);
    }

    setValue(id, value) {
      let cell = this._cells[id];
      cell.value = value;
      if (cell.hasErrors()) {
        cell.status = FAILED;
      } else {
        cell.status = OK;
      }
      this._valueUpdated.add(id);
    }

    _registerInputs(id, oldInputs, newInputs) {
      let toAdd = new Set(newInputs);
      let toRemove = new Set();
      if (oldInputs) {
        oldInputs.forEach(s => {
          if (newInputs.has(s)) {
            toAdd.delete(s);
          } else {
            toRemove.add(s);
          }
        });
      }
      toRemove.forEach(s => {
        if (this._ins[s]) {
          this._ins[s].delete(id);
        }
      });
      toAdd.forEach(s => {
        let ins = this._ins[s];
        if (!ins) ins = this._ins[s] = new Set();
        ins.add(id);
      });
      if (toAdd.size > 0 || toRemove.size > 0) {
        this._structureChanged.add(id);
        return true
      } else {
        return false
      }
    }

    _registerOutput(id, oldOutput, newOutput) {
      // nothing to be done if no change
      if (oldOutput === newOutput) return false
      // deregister the old output first
      if (oldOutput) {
        this._deregisterOutput(id, oldOutput);
      }
      if (newOutput) {
        // TODO: detect collisions
        if (this._out[newOutput]) {
          let conflictingIds = this._out[newOutput];
          if (substance.isString(conflictingIds)) conflictingIds = [conflictingIds];
          conflictingIds = new Set(conflictingIds);
          conflictingIds.add(id);
          conflictingIds = Array.from(conflictingIds);
          this._out[newOutput] = conflictingIds;
          // consider every related id for re-examination
          conflictingIds.forEach(_id => this._structureChanged.add(_id));
        } else {
          this._out[newOutput] = id;
        }
        // mark new deps as affected
        let ids = this._ins[newOutput] || [];
        ids.forEach(_id => {
          let cell = this._cells[_id];
          if (cell.status === BROKEN) {
            // TODO: probably we do not want to clear all graph errors, but only specific ones
            cell.clearErrors('graph');
          }
          this._structureChanged.add(_id);
        });
      }
      return true
    }

    _deregisterOutput(id, output) {
      if (this._hasOutputCollision(output)) {
        this._resolveOutputCollision(output, id);
      } else {
        delete this._out[output];
        // mark old deps as affected
        let ids = this._ins[output] || [];
        ids.forEach(_id => {
          let cell = this._cells[_id];
          if (cell.status === BROKEN) {
            // TODO: probably we do not want to clear all graph errors, but only specific ones
            cell.clearErrors('graph');
          }
          this._structureChanged.add(_id);
        });
      }
    }

    update() {
      // a set of cell ids that have been updated
      let updated = new Set();
      let stateChanged = this._stateChanged;

      // examine the graph structure
      // Note: we should not need to update the whole graph, still, we can do an
      // exhaustive update, because this is not performance critical
      let levels = {};
      this._structureChanged.forEach(id => {
        // detect unresolvable inputs
        this._detectUnresolvableInputs(id);
        // detect output collisions
        this._detectOutputCollisions(id);
        // deterimine the dependency level and check for cyclic dependencies
        // Note: in case of a cyclic dependency we want to set all involved
        // cells into BROKEN state
        this._computeDependencyLevel(id, levels, updated);
        updated.add(id);
        // mark cells with structure changes for state update
        stateChanged.add(id);
      });

      if (this._valueUpdated.size > 0) {
        this._valueUpdated.forEach(id => {
          updated.add(id);
        });
        // mark all followers for a state update
        this._getFollowSet(this._valueUpdated).forEach(id => {
          let cell = this._cells[id];
          cell.clearErrors('runtime');
          stateChanged.add(id);
        });
      }

      if (stateChanged.size > 0) {
        // then propagate state updates for all structural changes
        this._updateStates(stateChanged, updated);
      }

      this._stateChanged.clear();
      this._structureChanged.clear();
      this._valueUpdated.clear();

      return updated
    }

    _detectUnresolvableInputs(id) {
      let cell = this._cells[id];
      // detect unresolvable inputs
      let inputs = Array.from(cell.inputs);
      let unresolved = inputs.filter(s => !this._resolve(s));
      if (unresolved.length > 0) {
        cell.clearErrors(e => e instanceof UnresolvedInputError);
        cell.addErrors([new UnresolvedInputError(MSG_UNRESOLVED_INPUT, { unresolved })]);
        cell.status = BROKEN;
      }
    }

    _detectOutputCollisions(id) {
      let cell = this._cells[id];
      let output = cell.output;
      if (!output) return
      let ids = this._out[output];
      if (substance.isArray(ids)) {
        // TODO: is there a more efficient way?
        cell.clearErrors(e => e instanceof OutputCollisionError);
        cell.addErrors([new OutputCollisionError('Competing output declarations.', { ids })]);
      }
    }

    _computeDependencyLevel(id, levels, updated, trace = new Set(), traceSymbols = {}) {
      let cell = this._cells[id];
      let inputs = Array.from(cell.inputs);
      trace = new Set(trace);
      trace.add(id);

      const _recursive = (id) => {
        if (trace.has(id)) {
          this._handleCycle(trace, traceSymbols, updated);
          return Infinity
        }
        if (levels.hasOwnProperty(id)) {
          return levels[id]
        } else {
          return this._computeDependencyLevel(id, levels, updated, trace, traceSymbols)
        }
      };

      let inputLevels = [];
      inputs.forEach(s => {
        let res = this._resolve(s);
        if (!res) return 0
        traceSymbols[id] = s;
        if (substance.isString(res)) {
          inputLevels.push(_recursive(res));
        } else {
          res.forEach(id => {
            inputLevels.push(_recursive(id));
          });
        }
      });
      // EXPERIMENTAL: considering an explicitly set predecessor to preserve natural order where appropriate
      if (cell.prev) {
        traceSymbols[id] = cell.id;
        inputLevels.push(_recursive(cell.prev));
      }
      let level = inputLevels.length > 0 ? Math.max(...inputLevels) + 1 : 0;
      levels[id] = level;
      cell.level = level;
      return level
    }

    _getAffectedCellsSorted(ids) {
      let cells = [];
      let visited = new Set();
      let q = Array.from(ids);
      while(q.length > 0) {
        let id = q.shift();
        if (visited.has(id)) continue
        visited.add(id);
        const cell = this._cells[id];
        const level = cell.level;
        if (!cells[level]) cells[level] = [];
        cells[level].push(cell);
        let affected = this._getAffected(cell);
        q = q.concat(affected.filter(id => !visited[id]));
      }
      // Note: remove bins for levels that are not affected
      return substance.flatten(cells.filter(Boolean))
    }

    _getAffected(cell) {
      let affected = [];
      if (this._cellProvidesOutput(cell)) {
        affected = Array.from(this._ins[cell.output] || []);
      }
      if (cell.hasSideEffects && cell.next) {
        // find next cell with side effects
        for (let nextId = cell.next; nextId; nextId = cell.next) {
          let nextCell = this._cells[nextId];
          if (nextCell && nextCell.hasSideEffects) {
            affected.push(nextId);
            break
          }
        }
      }
      return affected
    }

    _updateStates(ids, updated) {
      // get all affected cells, i.e. all cells that are depending
      // on the cells with given ids
      let cells = this._getAffectedCellsSorted(ids);
      // determine the cell state from the state of their inputs
      cells.forEach(cell => this._updateCellState(cell, updated));
    }

    _updateCellState(cell, updated) {
      // invariant detection of BROKEN state
      if (cell.hasError('engine') || cell.hasError('graph')) {
        if (cell.status === BROKEN) return
        cell.status = BROKEN;
        updated.add(cell.id);
        return
      }
      // skip cells which have not been registered yet
      if (cell.status === UNKNOWN) return
      // invariant detection of FAILED state
      if (cell.hasErrors()) {
        if (cell.status === FAILED) return
        cell.status = FAILED;
        updated.add(cell.id);
        return
      }
      let inputs = Array.from(cell.inputs);
      if (!cell.hasSideEffects && inputs.length === 0) {
        cell.status = READY;
        return
      }
      let inputStates = [];
      inputs.forEach(s => {
        let res = this._resolve(s);
        if (!res) return
        if (substance.isString(res)) {
          let _cell = this._cells[res];
          // NOTE: for development we kept the less performant but more readable
          // representation as symbols, instead of ints
          inputStates.push(toInteger(_cell.status));
        } else {
          res.forEach(id => {
            let _cell = this._cells[id];
            inputStates.push(toInteger(_cell.status));
          });
        }
      });
      if (cell.hasSideEffects && cell.prev) {
        let _cell = this._cells[cell.prev];
        if (_cell) {
          inputStates.push(toInteger(_cell.status));
        }
      }
      let inputState = Math.min(...inputStates);
      // Note: it is easier to do this in an arithmetic way
      // than in boolean logic
      let newState;
      if (inputState <= toInteger(BLOCKED)) {
        newState = BLOCKED;
      } else if (inputState <= toInteger(RUNNING)) {
        newState = WAITING;
      } else { // if (inputState === OK) {
        newState = READY;
      }
      if (newState && newState !== cell.status) {
        cell.status = newState;
        updated.add(cell.id);
      }
    }

    _resolve(symbol) {
      return this._out[symbol]
    }

    _cellProvidesOutput(cell) {
      return (cell.output && cell.id === this._out[cell.output])
    }

    // set of cell ids that depend on the given ones
    _getFollowSet(ids) {
      let followSet = new Set();
      ids.forEach(id => {
        const cell = this._cells[id];
        this._getAffected(cell).forEach(id => followSet.add(id));
      });
      return followSet
    }

    // get a set of all ids a cell is depending on (recursively)
    _getPredecessorSet(id, set) {
      if (!set) set = new Set();
      const _recursive = (id) => {
        if (!set.has(id)) {
          set.add(id);
          this._getPredecessorSet(id, set);
        }
      };

      let cell = this.getCell(id);
      cell.inputs.forEach(s => {
        let res = this._resolve(s);
        if (!res) return
        if (substance.isString(res)) {
          _recursive(res);
        } else {
          res.forEach(_recursive);
        }
      });
      if (cell.hasSideEffects && cell.prev) {
        _recursive(cell.prev);
      }
      return set
    }

    _handleCycle(trace, traceSymbols, updated) {
      let error = new CyclicDependencyError('Cyclic dependency', { trace, symbols: traceSymbols });
      trace.forEach(id => {
        let cell = this._cells[id];
        cell.status = BROKEN;
        cell.errors.push(error);
        cell.level = Infinity;
        updated.add(id);
      });
    }

    _clearCyclicDependencyError(cell) {
      let err = cell.errors.find(err => err instanceof CyclicDependencyError);
      if (err) {
        const trace = err.details.trace;
        trace.forEach(id => {
          let cell = this._cells[id];
          cell.clearErrors(err => (err instanceof CyclicDependencyError));
          this._structureChanged.add(id);
        });
      }
    }

    _hasOutputCollision(symbol) {
      return substance.isArray(this._out[symbol])
    }

    _removeOutputCollisionError(id) {
      let cell = this._cells[id];
      cell.clearErrors(e => e instanceof OutputCollisionError);
      this._structureChanged.add(id);
    }

    /*
      called whenever an output variable is changed
      Removes the cell id from the list of competing cells
      and removes errors if possible.
    */
    _resolveOutputCollision(symbol, id) {
      let out = this._out[symbol];
      // in case of collisions we store the competing cell ids as array
      if (substance.isArray(out)) {
        this._removeOutputCollisionError(id);
        let s = new Set(out);
        s.delete(id);
        s = Array.from(s);
        if (s.length > 1) {
          this._out[symbol] = s;
        } else {
          let _id = s[0];
          this._out[symbol] = _id;
          this._removeOutputCollisionError(_id);
        }
      }
    }
  }

  class EngineCellGraph extends CellGraph {
    constructor(engine) {
      super();

      this._engine = engine;
    }

    _getDoc(s) {
      return this._engine._docs[s.docId]
    }

    _setInputs(cell, newInputs) {
      let oldInputs = cell.inputs;
      super._setInputs(cell, newInputs);
      oldInputs.forEach(s => {
        if (s.type !== 'var') {
          let sheet = this._getDoc(s);
          if (sheet) {
            sheet._removeDep(s);
          }
        }
      });
      newInputs.forEach(s => {
        if (s.type !== 'var') {
          let sheet = this._getDoc(s);
          if (sheet) {
            sheet._addDep(s);
          }
        }
      });
    }

    _resolve(s) {
      switch(s.type) {
        case 'cell': {
          let sheet = this._getDoc(s);
          if (sheet) {
            let row = sheet.cells[s.startRow];
            if (row) {
              let cell = row[s.startCol];
              if (cell) return cell.id
            }
          }
          break
        }
        case 'range': {
          let sheet = this._getDoc(s);
          if (sheet) {
            let cells = getRangeFromMatrix(sheet.cells, s.startRow, s.startRow, s.endRow, s.endCol);
            return substance.flatten(cells).map(c => c.id)
          }
          break
        }
        default:
          return super._resolve(s)
      }
    }

    _getAffected(cell) {
      if (cell.isSheetCell()) {
        let affected = [];
        cell.deps.forEach(s => affected.push(s.cell.id));
        return affected
      } else {
        return super._getAffected(cell)
      }
    }
  }

  function getSyntaxTokens(path, tokens) {
    return tokens ? tokens.map((t) => {
      return {
        type: 'code-highlight',
        name: _getTokenType(t),
        start: { path, offset: t.start },
        end: { path, offset: t.end },
        on() {},
        off() {}
      }
    }) : []
  }

  function _getTokenType(t) {
    return t.type
  }


  /*
    Matchers for transclusions and cell references

    Examples:
    - A1
    - A1:B10
    - Foo!A1
    - doc1!x
    - 'My Sheet'!A1:B10
    - 'My Doc'.x
  */
  const ID = "([_A-Za-z][_A-Za-z0-9]*)";
  const NAME = "[']([^']+)[']";
  const CELL_ID = "([A-Z]+[1-9][0-9]*)";
  // These characters will be replaced. Add more if needed.
  const INVALID_ID_CHARACTERS = "[^A-Za-z0-9]";

  /*
    A reference can point to a variable, a cell, or a range inside the same document
    or another one. To avoid matches inside of other symbols, '\b' (word boundary) is used in the expression.
    `[']` can not be used in combination with '\b'.

    ```
     ( ( \b ID | ['].+['] )[!] | \b)( CELL_ID([:]CELL_ID)? | ID )
    ```
  */
  const REF = "(?:(?:(?:(?:\\b"+ID+"|"+NAME+"))[!])|\\b)(?:"+CELL_ID+"(?:[:]"+CELL_ID+")?|"+ID+")";
  /*
    Transpiles a piece of source code so that it does not contain
    Transclusion expressions anymore, which are usually not valid in common languages.

    @param {string} code
    @param {object} map storage for transpiled symbols so that they can be mapped back later on
    @result
  */
  function transpile(code, map = {}) {
    if (!code) return code
    let symbols = extractSymbols(code);
    // Note: we are transpiling without changing the length of the original source
    // i.e. `'My Sheet'!A1:B10` is transpiled into `_My_Sheet__A1_B10`
    // thus the symbol locations won't get invalid by this step
    for (let i = 0; i < symbols.length; i++) {
      const s = symbols[i];
      code = code.substring(0, s.startPos) + s.mangledStr + code.slice(s.endPos);
      let transpiledName = s.mangledStr;
      map[transpiledName] = s;
    }
    return code
  }

  function extractSymbols(code) {
    if (!code) return []
    let re = new RegExp(REF, 'g');
    let symbols = [];
    let m;
    while ((m = re.exec(code))) {
      symbols.push(_createSymbol(m));
    }
    return symbols
  }

  /*
    Replaces all characters that are invalid in a variable identifier.

    Note: replacing characters one-by-one retains the original length or the string
    which is desired as this does avoid source-mapping. E.g. when a runtime error
    occurs, the error location can be applied to the original source code without
    any transformation.
  */
  function toIdentifier(str, c = '_') {
    return str.replace(new RegExp(INVALID_ID_CHARACTERS,'g'), c)
  }

  function _createSymbol(m) {
    const text = m[0];
    const startPos = m.index;
    const endPos = text.length + startPos;
    const mangledStr = toIdentifier(text);
    const scope = m[1] || m[2];
    const anchor = m[3];
    const focus = m[4];
    const varName = m[5];
    let type, name;
    if (anchor) {
      if (focus && focus !== anchor) {
        type = 'range';
        name = anchor + ':' + focus;
      } else {
        type = 'cell';
        name = anchor;
      }
    } else if (varName) {
      type = 'var';
      name = varName;
    } else {
      throw new Error('Invalid symbol expression')
    }
    return { type, text, scope, name, mangledStr, startPos, endPos, anchor, focus }
  }

  const BROKEN_REF = '#BROKEN_REF';

  function recordTransformations(cell, dim, pos, count, affectedCells, visited) {
    affectedCells = affectedCells || new Set();
    visited = visited || new Set();
    cell.deps.forEach(s => {
      if (visited.has(s)) return
      visited.add(s);
      let start, end;
      if (dim === 0) {
        start = s.startRow;
        end = s.endRow;
      } else {
        start = s.startCol;
        end = s.endCol;
      }
      let res = transformRange(start, end, pos, count);
      if (!res) return
      if (res === -1) {
        s._update = { type: 'broken' };
      } else {
        let type = (count < 0 ? 'delete' : 'insert') + (dim === 0 ? 'Rows' : 'Cols');
        s._update = {
          type,
          start: res.start,
          end: res.end
        };
      }
      affectedCells.add(s.cell);
    });
  }

  function applyCellTransformations(cell) {
    let symbols = Array.from(cell.inputs).sort((a, b) => a.startPos - b.startPos);
    let source = cell._source;
    let offset = 0;
    for (let i = 0; i < symbols.length; i++) {
      let s = symbols[i];
      let update = s._update;
      if (!update) continue
      delete s._update;
      // compute derived content according to parameters
      let oldName = s.name;
      let oldScope = s.scope;
      let oldOrigStr = s.origStr;
      let oldMangledStr = s.mangledStr;
      let newName = oldName;
      let newScope = oldScope;
      let newOrigStr = oldOrigStr;
      let newMangledStr = oldMangledStr;
      switch (update.type) {
        case 'insertRows':
        case 'deleteRows': {
          s.startRow = update.start;
          s.endRow = update.end;
          newName = getCellSymbolName(s);
          newOrigStr = oldOrigStr.replace(oldName, newName);
          newMangledStr = oldMangledStr.replace(toIdentifier(oldName), toIdentifier(newName));
          break
        }
        case 'insertCols':
        case 'deleteCols': {
          s.startCol = update.start;
          s.endCol = update.end;
          newName = getCellSymbolName(s);
          newOrigStr = oldOrigStr.replace(oldName, newName);
          newMangledStr = oldMangledStr.replace(toIdentifier(oldName), toIdentifier(newName));
          break
        }
        case 'broken': {
          s.type = 'var';
          s.startRow = s.startCol = s.endRow = s.endCol = null;
          newName = BROKEN_REF;
          newOrigStr = BROKEN_REF;
          newMangledStr = BROKEN_REF;
          break
        }
        case 'rename': {
          if (oldScope) {
            newOrigStr = oldOrigStr.replace(oldScope, update.scope);
            newMangledStr = oldMangledStr.replace(toIdentifier(oldScope), toIdentifier(update.scope));
          }
          break
        }
        default:
          throw new Error('Illegal state')
      }
      let newStartPos = s.startPos + offset;
      let newEndPos = newStartPos + newOrigStr.length;
      let newSource = source.original.slice(0, s.startPos+offset) + newOrigStr + source.original.slice(s.endPos+offset);
      let newTranspiled = source.transpiled.slice(0, s.startPos+offset) + newMangledStr + source.transpiled.slice(s.endPos+offset);

      // finally write the updated values
      s.name = newName;
      s.id = qualifiedId(s.docId, newName);
      s.scope = newScope;
      s.origStr = newOrigStr;
      s.mangledStr = newMangledStr;
      s.startPos = newStartPos;
      s.endPos = newEndPos;
      source.original = newSource;
      source.transpiled = newTranspiled;
      source.symbolMapping[newMangledStr] = s;
      delete source.symbolMapping[oldMangledStr];
      // update the offset if the source is getting longer because of this change
      // this has an effect on all subsequent symbols
      offset += newOrigStr.length - oldOrigStr.length;
    }
  }

  function transformRange(start, end, pos, count) {
    if (!count) return false
    if(!substance.isNumber(pos) || !substance.isNumber(count)) throw new Error("pos and count must be integers")
    if(end < pos) return false
    if(count > 0) {
      if(pos <= start) {
        start += count;
      }
      if(pos <= end) {
        end += count;
      }
    } else {
      // for removal count < 0
      count = -count;
      // null means deleted
      if (start >= pos && end < pos + count) return -1
      const x1 = pos;
      const x2 = pos + count;
      if (x2 <= start) {
        start -= count;
        end -= count;
      } else {
        if (pos <= start) {
          start = start - Math.min(count, start-x1);
        }
        if (pos <= end) {
          end = end - Math.min(count, end-x1+1);
        }
      }
    }
    return { start, end }
  }

  function getCellSymbolName(s) {
    let newName = getCellLabel(s.startRow, s.startCol);
    if (s.type === 'range') {
      newName += ':' + getCellLabel(s.endRow, s.endCol);
    }
    return newName
  }

  class Cell {

    constructor(doc, cellData) {
      const { id, lang, source, status, inputs, output, value, errors, hasSideEffects, next, prev } = cellData;
      this.doc = doc;

      // Attention: the given cell id is not necessarily globally unique
      // thus, we derive a unique id using the document id and the node id
      // localId is used later to be able to map back to the associated node
      // TODO: I would rather go for only one id, and always have a doc
      if (doc) {
        let docId = this.docId = doc.id;
        // is the id already a qualified id?
        if (id.startsWith(docId)) {
          this.id = id;
          // ATTENTION: assuming that the qualified id is joining
          // the doc id and the node id with a single character (e.g. '!')
          this.unqualifiedId = id.slice(docId.length+1);
        } else {
          this.id = qualifiedId(doc, cellData);
          this.unqualifiedId = id;
        }
      } else {
        this.docId = null;
        this.id = id;
        this.unqualifiedId = id;
      }

      this.lang = lang;

      // the source code is transpiled to an object with
      // - (original) source
      // - transpiledSource
      // - symbolMapping
      // - isConstant
      this._source = this._transpile(source);

      // managed by CellGraph
      this.status = status || UNKNOWN;
      // a set of symbols ('x', 'A1', 'A1:B10', 'doc1!x', 'sheet1!A1', 'sheet1!A1:A10', 'sheet1!foo')
      this.inputs = new Set(inputs || []);
      // an output symbol (typically only used for document cells)
      this.output = output;
      // one or many CellErrors
      this.errors = errors || [];
      // the last computed value
      this.value = value;
      // for cells with side effects
      this.hasSideEffects = Boolean(hasSideEffects);
      // for cells in a linear model
      // this is particularly important for cells with side effects
      this.next = next;
      this.prev = prev;
      // used by CellGraph
      this.level = 0;
      // TODO: maybe we want to keep some stats, e.g. time of last evaluation, duration of last evaluation etc.
      this.stats = {};
    }

    clearErrors(filter) {
      if (substance.isString(filter)) {
        const type = filter;
        filter = (e) => {
          return e.type === type
        };
      }
      this.errors = this.errors.filter(e => !filter(e));
    }

    addErrors(errors) {
      this.errors = this.errors.concat(errors);
    }

    hasErrors() {
      return this.errors.length > 0
    }

    hasError(type) {
      for (let i = 0; i < this.errors.length; i++) {
        if (this.errors[i].type === type) return true
      }
      return false
    }

    get state() {
      console.warn('DEPRECATED: use cellState.status instead.');
      return this.status
    }

    hasOutput() {
      return Boolean(this.output)
    }

    hasValue() {
      return Boolean(this.value)
    }

    getValue() {
      return this.value
    }

    getLang() {
      return this.lang || (this.doc ? this.doc.lang : 'mini')
    }

    get source() {
      return this._source.original
    }

    set source(source) {
      this._source = this._transpile(source);
    }

    get transpiledSource() {
      return this._source.transpiled
    }

    get symbolMapping() {
      return this._source.symbolMapping
    }

    isConstant() {
      return this._source.isConstant
    }

    isSheetCell() {
      return false
    }

    toString() {
      // sheet1!A1 <- { ... source }
      let parts = [];
      if (this.output) {
        parts.push(this.output);
        parts.push(' <- ');
      } else {
        parts.push(this.id);
        parts.push(': ');
      }
      parts.push(this._source.original);
      return parts.join('')
    }

    _getStatusString() {
      return toString(this.status)
    }

    _transpile(source) {
      let original = source;
      let transpiled;
      let symbolMapping = {};
      let isConstant = false;
      if (this.isSheetCell()) {
        let m = isExpression(source);
        if (m) {
          let L = m[0].length;
          let prefix = new Array(L);
          prefix.fill(' ');
          source = prefix + source.slice(L);
          transpiled = transpile(source, symbolMapping);
        } else {
          isConstant = true;
        }
      } else {
        transpiled = transpile(source, symbolMapping);
      }
      return {
        original,
        transpiled,
        symbolMapping,
        isConstant
      }
    }
  }

  class SheetCell extends Cell {
    constructor(doc, cellData) {
      super(doc, cellData);

      // other cells that depend on this via cell or range expression
      this.deps = new Set();
    }

    isSheetCell() { return true }

    addDep(symbol) {
      this.deps.add(symbol);
    }

    removeDep(symbol) {
      this.deps.delete(symbol);
    }
  }

  /*
    Engine's internal model of a Spreadsheet.
  */
  class Sheet {

    constructor(engine, data) {
      this.engine = engine;
      const docId = data.id;
      if (!docId) throw new Error("'id' is required")
      this.id = docId;
      this.name = data.name;
      // default language
      const defaultLang = data.lang || 'mini';
      this.lang = defaultLang;
      if (data.hasOwnProperty('autorun')) {
        this.autorun = data.autorun;
      } else {
        // TODO: using auto/ cells automatically by default
        this.autorun = true;
      }
      // TODO: we can revise this as we move on
      // for now, data.cells must be present being a sequence of rows of cells.
      // data.columns is optional, but if present every data row have corresponding dimensions
      if (!data.cells) throw new Error("'cells' is mandatory")
      let ncols;
      if (data.columns) {
        this.columns = data.columns;
      } else {
        ncols = data.cells[0].length;
        let columns = [];
        for (let i = 0; i < ncols; i++) {
          columns.push({ type: 'auto' });
        }
        this.columns = columns;
      }
      ncols = this.columns.length;
      this.cells = data.cells.map((rowData) => {
        if (rowData.length !== ncols) throw new Error('Invalid data')
        return rowData.map(cellData => this._createCell(cellData))
      });

      if (data.onCellRegister) this.onCellRegister = data.onCellRegister;
    }

    get type() { return 'sheet' }

    setAutorun(val) {
      this.autorun = val;
    }

    getColumnName(colIdx) {
      let columnMeta = this.columns[colIdx];
      if (columnMeta && columnMeta.name) {
        return columnMeta.name
      } else {
        return getColumnLabel(colIdx)
      }
    }

    getCells() {
      return this.cells
    }

    updateCell(id, cellData) {
      let qualifiedId$$1 = qualifiedId(this.id, id);
      if (substance.isString(cellData)) {
        cellData = { source: cellData };
      }
      this.engine._updateCell(qualifiedId$$1, cellData);
    }

    insertRows(pos, dataBlock) {
      // TODO: what if all columns and all rows had been removed
      const count = dataBlock.length;
      if (count === 0) return
      const ncols = this.columns.length;
      let block = dataBlock.map((rowData) => {
        if (rowData.length !== ncols) throw new Error('Invalid data')
        return rowData.map(cellData => this._createCell(cellData))
      });
      let affectedCells = new Set();
      let spans = transformCells(this.engine, this.cells, 0, pos, count, affectedCells);
      // add the spanning symbols to the deps of the new cells
      for (let i = 0; i < block.length; i++) {
        let row = block[i];
        for (let j = 0; j < row.length; j++) {
          let cell = row[j];
          if (spans && spans[j]) cell.deps = new Set(spans[j]);
        }
      }
      // update sheet structure
      this.cells.splice(pos, 0, ...block);
      this._registerCells(block);
      this._sendSourceUpdate(affectedCells);
    }

    deleteRows(pos, count) {
      if (count === 0) return
      let affectedCells = new Set();
      let block = this.cells.slice(pos, pos+count);
      transformCells(this.engine, this.cells, 0, pos, -count, affectedCells);
      this.cells.splice(pos, count);
      this._unregisterCells(block);
      this._sendSourceUpdate(affectedCells);
    }

    insertCols(pos, dataBlock) {
      const nrows = this.cells.length;
      if (dataBlock.length !== nrows) throw new Error('Invalid dimensions')
      let count = dataBlock[0].length;
      if (count === 0) return
      let affectedCells = new Set();
      // transform cells
      let spans = transformCells(this.engine, this.cells, 1, pos, count, affectedCells);
      let block = dataBlock.map((rowData) => {
        if (rowData.length !== count) throw new Error('Invalid data')
        return rowData.map(cellData => this._createCell(cellData))
      });
      let cols = [];
      for (let i = 0; i < count; i++) {
        cols.push({ type: 'auto' });
      }
      this.columns.splice(pos, 0, ...cols);
      for (let i = 0; i < nrows; i++) {
        let row = this.cells[i];
        row.splice(pos, 0, ...block[i]);
      }
      // add the spanning symbols to the deps of the new cells
      for (let i = 0; i < block.length; i++) {
        let row = block[i];
        for (let j = 0; j < row.length; j++) {
          let cell = row[j];
          if (spans && spans[i]) cell.deps = new Set(spans[i]);
        }
      }
      this._registerCells(block);
      this._sendSourceUpdate(affectedCells);
    }

    deleteCols(pos, count) {
      if (count === 0) return
      let affectedCells = new Set();
      transformCells(this.engine, this.cells, 1, pos, -count, affectedCells);
      const N = this.cells.length;
      let block = [];
      this.columns.splice(pos, count);
      for (var i = 0; i < N; i++) {
        let row = this.cells[i];
        block.push(row.slice(pos, pos+count));
        row.splice(pos, count);
      }
      this._unregisterCells(block);
      this._sendSourceUpdate(affectedCells);
    }

    rename(newName) {
      if (newName === this.name) return
      let cells = this.cells;
      let affectedCells = new Set();
      for (let i = 0; i < cells.length; i++) {
        let row = cells[i];
        for (let j = 0; j < row.length; j++) {
          let cell = row[j];
          cell.deps.forEach(s => {
            s._update = { type: 'rename', scope: newName };
            affectedCells.add(s.cell);
          });
        }
      }
      affectedCells.forEach(applyCellTransformations);
      this.name = newName;
      this._sendSourceUpdate(affectedCells);
    }

    onCellRegister(cell) { // eslint-disable-line
    }

    _getCellSymbol(rowIdx, colIdx) {
      return `${this.id}!${getCellLabel(rowIdx, colIdx)}`
    }

    _createCell(cellData) {
      // simple format: just the expression
      if (substance.isString(cellData)) {
        let source = cellData;
        cellData = {
          id: substance.uuid(),
          docId: this.id,
          source,
        };
      }
      let cell = new SheetCell(this, cellData);
      return cell
    }

    _registerCell(cell) {
      const engine = this.engine;
      engine._registerCell(cell);
      this.onCellRegister(cell);
    }

    _unregisterCell(cell) {
      const engine = this.engine;
      engine._unregisterCell(cell);
    }

    _registerCells(block) {
      if (!block) block = this.cells;
      block.forEach(row => row.forEach(cell => this._registerCell(cell)));
    }

    _unregisterCells(block) {
      if (!block) block = this.cells;
      block.forEach(row => row.forEach(cell => this._unregisterCell(cell)));
    }

    _removeDep(s) {
      const cells = this.cells;
      for (let i = s.startRow; i <= s.endRow; i++) {
        let row = cells[i];
        for (let j = s.startCol; j <= s.endCol; j++) {
          let cell = row[j];
          cell.removeDep(s);
        }
      }
    }

    _addDep(s) {
      const cells = this.cells;
      for (let i = s.startRow; i <= s.endRow; i++) {
        let row = cells[i];
        for (let j = s.startCol; j <= s.endCol; j++) {
          let cell = row[j];
          cell.addDep(s);
        }
      }
    }

    _sendSourceUpdate(cells) {
      if (cells.size > 0) {
        this.engine._sendUpdate('source', cells);
      }
    }
  }

  function transformCells(engine, cells, dim, pos, count, affected) {
    if (count === 0) return
    // track updates for symbols and affected cells
    let startRow = 0;
    let startCol = 0;
    if (dim === 0) {
      startRow = pos;
    } else {
      startCol = pos;
    }
    let visited = new Set();
    for (let i = startRow; i < cells.length; i++) {
      let row = cells[i];
      for (let j = startCol; j < row.length; j++) {
        let cell = row[j];
        if (cell.deps.size > 0) {
          recordTransformations(cell, dim, pos, count, affected, visited);
        }
      }
    }
    let spans = _computeSpans(cells, dim, pos);
    // update the source for all affected cells
    affected.forEach(applyCellTransformations);
    // reset state of affected cells
    // TODO: let this be done by CellGraph, also making sure the cell state is reset properly
    if (engine) {
      affected.forEach(cell => {
        engine._graph._structureChanged.add(cell.id);
      });
    }
    return spans
  }

  // some symbols are spanning the insert position, and thus need to
  // be added to the deps of inserted cells
  function _computeSpans(cells, dim, pos) {
    let spans;
    if (pos > 0) {
      if (cells.length === 0 || cells[0].length === 0) return
      let size = [cells.length, cells[0].length];
      if (pos >= size[dim]) return
      // check cells along the other dimension
      let L = dim === 0 ? size[1] : size[0];
      for (let i = 0; i < L; i++) {
        let cell = dim === 0 ? cells[pos][i] : cells[i][pos];
        let deps = Array.from(cell.deps);
        for (let j = 0; j < deps.length; j++) {
          let s = deps[j];
          let update = s._update;
          if (update && update.start <= pos) {
            if (!spans) spans = [];
            if (!spans[i]) spans[i] = [];
            spans[i].push(s);
          }
        }
      }
    }
    return spans
  }

  /*
    Engine's internal model of a Document.
  */
  class Document {

    constructor(engine, data) {
      this.engine = engine;
      this.data = data;
      if (!data.id) throw new Error("'id' is required")
      this.id = data.id;
      this.name = data.name;
      this.lang = data.lang || 'mini';
      if (data.hasOwnProperty('autorun')) {
        this.autorun = data.autorun;
      } else {
        // TODO: using manual execution as a default for now
        this.autorun = false;
      }
      this.cells = data.cells.map(cellData => this._createCell(cellData));
      // registration hook used for propagating initial cell state to the application
      if (data.onCellRegister) this.onCellRegister = data.onCellRegister;
    }

    get type() { return 'document' }

    getCells() {
      return this.cells
    }

    setAutorun(val) {
      this.autorun = val;
    }

    insertCellAt(pos, cellData) {
      let cell = this._createCell(cellData);
      this._registerCell(cell);
      this.cells.splice(pos, 0, cell);
      return cell
    }

    removeCell(id) {
      const qualifiedId$$1 = qualifiedId(this.id, id);
      const cells = this.cells;
      let pos = cells.findIndex(cell => cell.id === qualifiedId$$1);
      if (pos >= 0) {
        let cell = cells[pos];
        this.cells.splice(pos,1);
        this.engine._unregisterCell(cell);
      } else {
        console.error('Unknown cell', id);
      }
    }

    updateCell(id, cellData) {
      let qualifiedId$$1 = qualifiedId(this.id, id);
      if (substance.isString(cellData)) {
        cellData = { source: cellData };
      }
      this.engine._updateCell(qualifiedId$$1, cellData);
    }

    rename(newName) {
      if (newName === this.name) return
      const docId = this.id;
      let graph = this.engine._graph;
      let cells = this.cells;
      let affectedCells = new Set();
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        if (graph._cellProvidesOutput(cell)) {
          let ids = graph._ins[cell.output];
          if (ids) {
            ids.forEach(cellId => {
              let cell = graph.getCell(cellId);
              cell.inputs.forEach(s => {
                if (s.docId === docId) {
                  s._update = { type: 'rename', scope: newName };
                }
              });
              affectedCells.add(cell);
            });
          }
        }
      }
      affectedCells.forEach(applyCellTransformations);
      this.name = newName;
      this._sendSourceUpdate(affectedCells);
    }

    onCellRegister(cell) { // eslint-disable-line
    }

    _createCell(cellData) {
      if (substance.isString(cellData)) {
        let source = cellData;
        cellData = {
          id: substance.uuid(),
          docId: this.id,
          source,
          lang: this.lang
        };
      }
      return new Cell(this, cellData)
    }

    _registerCell(cell) {
      const engine = this.engine;
      engine._registerCell(cell);
      this.onCellRegister(cell);
    }

    _registerCells(block) {
      if (!block) block = this.cells;
      block.forEach(cell => this._registerCell(cell));
    }

    _sendSourceUpdate(cells) {
      if (cells.size > 0) {
        this.engine._sendUpdate('source', cells);
      }
    }
  }

  /*
    WIP
    The Engine implements the Stencila Execution Model.

    As the Engine can be run independently, and thus has its own model.
    There are two types of resources containing cells, Documents and Sheets.
    Every document defines a variable scope. Variables are produced by cells.
    A document has an id but also a human readable name.
    Sheets have a tabular layout, while Documents have a sequential layout.

    Document cells can define variables which can be referenced within the same document,
    like in `x + 1`.

    Sheet cells can be referenced via cell- and range expressions, such as
    `A1`, or `A1:B10`.

    Across documents and sheets, cells are referenced using a transclusion syntax, prefixed with the document id or the document name, such as in
    `'My Document'!x` or `sheet1!A1:B10`.

    > TODO: ATM we do not support other type of sheet references, such as via column name
    > or defining custom ranges.

    > Idea: use the column name as a reference to the corresponding cell in the same row
    > I.e. instead of `= A1 * B1` write `= width * height`

    Engine API
    - register document (type, id)
    - update document/sheet meta data (name, column information)
    - add cell
    - remove cell
    - set breakpoint / pause a cell
    - update cell data
    - update cell order (documents)
    - insert rows/cols
    - remove rows/cols

    While most of the time it is enough to look at cells independent of their
    documnents topologoy, this is necessary for Sheets in general, and for
    document cells with side-effects (global variables)

    Sheet specifics:
    - columns have meta data (name and type)
    - cell type comes either from cell data, or from its column (necessary for type validation)
    - spanning cells are rather a visual aspect. E.g. in GSheets the app
      clears spanned cells, and thus cell references yield empty values

    Sheet Ranges:

    TODO: the former approach using special internal cells as proxy to
    cell ranges turned out to be cumbersome and error prone.
    Now I want to approach this differently, by adding a special means to lookup
    cell symbols and to propagate cell states for these.

    Open Questions:

    Should the Engine be run inside the Application/Render thread?

    On the one hand this could help to lower the load on the rendering thread.
    On the other hand, it is very usefule to have a more direct linking
    between the application and the engine: e.g. sharing the Host instance,
    and in the other direction.
    It is more important to run all contexts independently, so that
    code can be executed in multiple threads.

    How do structural changes of sheets affect the cell graph?

    Sheet cells produce variables that look like `sheet1!A1`.
    Changing the structure of a sheet means that all cells after
    that need to be re-assigned. Changing the output symbol name only should not lead to a re-evaluation
    of the cell.
    The current state propagation mechanism does probably lead to potentially
    unnecessary re-evaluations when structure has been changed.
    This is because any kind of structural change leads to a reset of cell state
    We should improve this at some point. For now, it is not
    critical, because structural changes in sheets do not happen often,
    and in documents re-evaluation is most often necessary anyways.

    Sheet: should we allow to use column names as alias?

    ATM, when using a 2D cell range, a table value is created
    using column names when present, otherwise using the classical
    column label (e.g. 'A'). This is somewhat inconsistent,
    as someone could write code that makes use of the default column
    labels, say `filter(data, 'A < 20')`, which breaks as soon that column
    gets an explicit name.
    If we wanted to still allow this, we would need some kind of an alias mechanism
    in the table type.


  */
  class Engine extends substance.EventEmitter {

    constructor(options = {}) {
      super();

      // needs to be connected to a host to be able to create contexts
      this._host = options.host;

      this._docs = {};
      this._graph = new EngineCellGraph(this);

      // for every (actionable) cell there is information what to do next
      // There are several steps that need to be done, to complete a cell:
      // - code analysis (context)
      // - registration of inputs/output (graph)
      // - cell evaluation (context)
      // - validation (engine)
      // - graph update
      this._nextActions = new Map();
      this._currentActions = new Map();
    }

    setHost(host) {
      this._host = host;
    }

    run /* istanbul ignore next */ (interval) {
      if (!this._host) throw new Error('Must call setHost() before starting the Engine')

      // TODO: does this only work in the browser?
      if (this._runner) {
        clearInterval(this._runner);
      }
      this._runner = setInterval(() => {
        if (this.needsUpdate()) {
          this.cycle();
        }
      }, interval);
    }

    /*
      Registers a document via id.

      @param {object} data
        - `type`: 'document' | 'sheet'
        - `name`: a human readable name used for transclusions
        - `columns`: (for sheets) initial column data
        - 'sequence': (for documents) initial order of cells
    */
    addDocument(data) {
      let doc = new Document(this, data);
      this._registerResource(doc);
      return doc
    }

    addSheet(data) {
      let sheet = new Sheet(this, data);
      this._registerResource(sheet);
      return sheet
    }

    hasResource(id) {
      return this._docs.hasOwnProperty(id)
    }

    getResource(id) {
      return this._docs[id]
    }

    needsUpdate() {
      return this._nextActions.size > 0 || this._graph.needsUpdate()
    }

    cycle() {
      let res = [];
      const graph = this._graph;
      const nextActions = this._nextActions;
      if (nextActions.size > 0) {
        // console.log('executing cycle')
        // clearing next actions so that we can record new next actions
        this._nextActions = new Map();

        // group actions by type
        let actions = {
          analyse: [],
          register: [],
          evaluate: [],
          update: []
        };
        nextActions.forEach(a => actions[a.type].push(a));
        actions.update.forEach(a => {
          if (a.errors && a.errors.length > 0) {
            graph.addErrors(a.id, a.errors);
          } else {
            graph.setValue(a.id, a.value);
          }
        });
        actions.register.forEach(a => {
          let cell = graph.getCell(a.id);
          if (cell.isSheetCell()) {
            graph.setInputs(cell.id, a.inputs);
          } else {
            graph.setInputsOutputs(cell.id, a.inputs, a.output);
          }
        });

        this._updateGraph();

        let A = actions.analyse.map(a => this._analyse(a));
        let B = actions.evaluate.map(a => {
          let cell = graph.getCell(a.id);
          // This is necessary because we make sure the cell still exists
          if (cell) {
            if (this._canRunCell(cell)) {
              return this._evaluate(a)
            } else {
              // otherwise keep this as a next action
              a.suspended = true;
              this._setAction(a.id, a);
              return false
            }
          } else {
            return false
          }
        });
        res = A.concat(B);
      } else if (graph.needsUpdate()) {
        this._updateGraph();
      }
      return res
    }

    getNextActions() {
      return this._nextActions
    }

    _registerResource(doc) {
      const id = doc.id;
      if (this._docs.hasOwnProperty(id)) throw new Error(`document with id ${id} already exists`)
      this._docs[id] = doc;
      doc._registerCells();
    }

    /*
      Registers a cell.

      A cell is registered independent from the topology it resides in.

      Cells are treated differently w.r.t. their parent document.

      For instance, in a document cells can be block expressions,
      and can define a variable. In a sheet every cell must be a simple expression
      and it is is assigned to a variable implicitly (such as `sheet1!A1`).
    */
    _registerCell(cell) {
      this._graph.addCell(cell);
      this._updateCell(cell.id, {});
    }

    /*
      Removes a cell from the engine.
    */
    _unregisterCell(cellOrId) { // eslint-disable-line
      let id = substance.isString(cellOrId) ? cellOrId : cellOrId.id;
      let cell = this._graph.getCell(id);
      if (cell) {
        this._graph.removeCell(id);
      }
    }

    _updateCell(id, cellData) {
      const graph = this._graph;
      let cell = graph.getCell(id);
      Object.assign(cell, cellData);
      cell.status = UNKNOWN;
      this._setAction(id, {
        id,
        type: 'analyse',
        cellData
      });
    }

    _sendUpdate(type$$1, cells) {
      let cellsByDocId = {};
      cells.forEach(cell => {
        let _cells = cellsByDocId[cell.docId];
        if (!_cells) _cells = cellsByDocId[cell.docId] = [];
        _cells.push(cell);
      });
      this.emit('update', type$$1, cellsByDocId);
    }

    _updateGraph() {
      const graph = this._graph;
      let updatedIds = graph.update();
      let cells = new Set();
      updatedIds.forEach(id => {
        let cell = graph.getCell(id);
        if (cell) {
          // WIP: adding support for RangeCells
          // Instead of registering an evaluation, we just update the graph.
          // TODO: this requires another cycle to propagate the result of the RangeCell,
          // which would not be necessary in theory
          if (cell.status === READY) {
            this._setAction(cell.id, {
              type: 'evaluate',
              id: cell.id
            });
          }
          cells.add(cell);
        }
      });
      if (cells.size > 0) {
        this._sendUpdate('state', cells);
      }
    }

    _analyse(action) {
      const graph = this._graph;
      const id = action.id;
      const cell = graph.getCell(id);
      // clear all errors which are not managed by the CellGraph
      cell.clearErrors(e => {
        return e.type !== 'graph'
      });
      // in case of constants, casting the string into a value,
      // updating the cell graph and returning without further evaluation
      if (cell.isConstant()) {
        // TODO: use the preferred type from the sheet
        let preferredType = 'any';
        let value = valueFromText(cell.source, preferredType);
        // constants can't have inputs, so deregister them
        if (cell.inputs && cell.inputs.size > 0) {
          graph.setInputs(id, new Set());
        }
        // constants can't have errors at this stage (later on maybe validation errors)
        if (cell.errors.length > 0) {
          graph.clearErrors(id);
        }
        graph.setValue(id, value);
        return
      }
      // TODO: we need to reset the cell status. Should we let CellGraph do this?
      cell.status = UNKNOWN;
      // leave a mark that we are currently running this action
      this._currentActions.set(id, action);
      // otherwise the cell source is assumed to be dynamic source code
      const transpiledSource = cell.transpiledSource;
      const lang = cell.getLang();
      return this._getContext(lang)
      .then(res => {
        // stop if this was aboreted or there is already a new action for this id
        if (this._isSuperseded(id, action)) {
          // console.log('action has been superseded')
          return
        }
        if (res instanceof Error) {
          const msg = `Could not get context for ${lang}`;
          console.error(msg);
          let err = new ContextError(msg, { lang });
          graph.addError(id, err);
        } else {
          const context = res;
          return context.analyseCode(transpiledSource)
        }
      })
      .then(res => {
        if (this._isSuperseded(id, action)) {
          // console.log('action has been superseded')
          return
        }
        this._currentActions.delete(id);
        // stop if this was aboreted or there is already a new action for this id
        if (!res) return
        // Note: treating all errors coming from analyseCode() as SyntaxErrors
        // TODO: we might want to be more specific here
        if (res.messages && res.messages.length > 0) {
          // TODO: we should not need to set this manually
          cell.status = ANALYSED;
          graph.addErrors(id, res.messages.map(err => {
            return new SyntaxError$1(err.message)
          }));
        }
        // console.log('analysed cell', cell, res)
        // transform the extracted symbols into fully-qualified symbols
        // e.g. in `x` in `sheet1` is compiled into `sheet1.x`
        // Note: to make the app more robust we are doing this in
        //   a try catch block, and create a rather unspecifc SyntaxError.
        //   This can happen when the transpiled code is not producing
        //   a syntax error but not producing expected input symbols.
        let inputs = new Set();
        let output = null;
        try {
          ( { inputs, output } = this._compile(res, cell) );
        } catch (error) {
          cell.status = ANALYSED;
          graph.addErrors(id, [new SyntaxError$1('Invalid syntax')]);
        }
        this._setAction(id, {
          type: 'register',
          id,
          // Note: these symbols are in plain-text analysed by the context
          // based on the transpiled source
          inputs,
          output
        });
      })
    }

    _evaluate(action) {
      const graph = this._graph;
      const id = action.id;
      const cell = graph.getCell(id);
      cell.clearErrors(e => {
        return e.type !== 'graph'
      });
      // console.log('evaluating cell', cell.toString())
      this._currentActions.set(id, action);

      const lang = cell.getLang();
      let transpiledSource = cell.transpiledSource;
      // EXPERIMENTAL: remove 'autorun'
      delete cell.autorun;
      return this._getContext(lang)
      .then(res => {
        if (this._isSuperseded(id, action)) {
          // console.log('action has been superseded')
          return
        }
        if (res instanceof Error) {
          const msg = `Could not get context for ${lang}`;
          console.error(msg);
          let err = new ContextError(msg, { lang });
          graph.addError(id, err);
        } else {
          const context = res;
          // console.log('EXECUTING cell', cell.id, transpiledSource)
          // Catching errors here and turn them into a runtime error
          try {
            let inputs = this._getInputValues(cell.inputs);
            return context.executeCode(transpiledSource, inputs)
          } catch (err) {
            graph.addError(id, new RuntimeError(err.message, err));
          }
        }
      })
      .then(res => {
        if (this._isSuperseded(id, action)) {
          // console.log('action has been superseded')
          return
        }
        this._currentActions.delete(id);
        // stop if this was aboreted or there is already a new action for this id
        if (res) {
          this._setAction(id, {
            type: 'update',
            id,
            errors: res.messages,
            value: res.value
          });
        }
      })
    }

    _compile(res, cell) {
      const symbolMapping = cell.symbolMapping;
      const docId = cell.docId;
      let inputs = new Set();
      // Note: the inputs here are given as mangledStr
      // typically we have detected these already during transpilation
      // Let's wait for it to happen where this is not the case
      res.inputs.forEach(str => {
        // Note: during transpilation we identify some more symbols
        // which are actually not real variables
        // e.g. for `sum(A1:B10)` would detect 'sum' as a potential variable
        // due to the lack of language reflection at this point.
        let s = symbolMapping[str];
        if (!s) throw new Error('FIXME: a symbol has been returned by analyseCode which has not been tracked before')
        // if there is a scope given explicily try to lookup the doc
        // otherwise it is a local reference, i.e. within the same document as the cell
        let targetDocId = s.scope ? this._lookupDocumentId(s.scope) : docId;
        inputs.add(new CellSymbol(s, targetDocId, cell));
      });
      // turn the output into a qualified id
      let output;
      if (res.output) output = qualifiedId(docId, res.output);
      return { inputs, output }
    }

    /*
      Provides packed values stored in a hash by their name.
      Ranges and transcluded symbols are stored via their mangled name.

      > Attention: this requires that cell code is being transpiled accordingly.

      ```
      $ graph._getInputValues(['x', 'sheet1!A1:B3'])
      {
        'x': ...,
        'sheet1_A1_B3': ...
      }
      ```
    */
    _getInputValues(inputs) {
      const graph = this._graph;
      let result = {};
      inputs.forEach(s => {
        let val;
        switch(s.type) {
          case 'cell': {
            let sheet = this._docs[s.docId];
            if (sheet) {
              let cell = sheet.cells[s.startRow][s.startCol];
              val = cell.value;
            }
            break
          }
          case 'range': {
            let sheet = this._docs[s.docId];
            if (sheet) {
              val = _getValueForRange(sheet, s.startRow, s.startCol, s.endRow, s.endCol);
            }
            break
          }
          default:
            val = graph.getValue(s);
        }
        // Note: the transpiled source code is used for evaluation
        // thus we expose values via transpiled/mangled names here
        result[s.mangledStr] = val;
      });
      return result
    }

    _getContext(lang) {
      return this._host.createContext(lang)
    }

    _lookupDocumentId(name) {
      for (var id in this._docs) { // eslint-disable-line guard-for-in
        let doc = this._docs[id];
        if (doc.name === name || id === name) {
          return doc.id
        }
      }
    }

    _lookupDocument(name) {
      let docId = this._lookupDocumentId(name);
      return this._docs[docId]
    }

    _canRunCell(cell) {
      if (cell.hasOwnProperty('autorun')) {
        return cell.autorun
      }
      return cell.doc.autorun
    }

    _allowRunningCellAndPredecessors(id) {
      const graph = this._graph;
      let predecessors = graph._getPredecessorSet(id);
      this._allowRunningCell(id, true);
      predecessors.forEach(_id => {
        this._allowRunningCell(_id);
      });
    }

    _allowRunningCell(id, reset) {
      const graph = this._graph;
      let cell = graph.getCell(id);
      cell.autorun = true;
      if (reset && toInteger(cell.status) > toInteger(ANALYSED)) {
        cell.status = ANALYSED;
        graph._structureChanged.add(id);
      }
      let action = this._nextActions.get(id);
      if (action) {
        delete action.suspended;
      }
    }

    _allowRunningAllCellsOfDocument(docId) {
      const graph = this._graph;
      let doc = this._docs[docId];
      let cells = doc.getCells();
      if (doc instanceof Sheet) {
        cells = substance.flatten(cells);
      }
      let ids = new Set();
      cells.forEach(cell => {
        ids.add(cell.id);
      });
      cells.forEach(cell => {
        graph._getPredecessorSet(cell.id, ids);
      });
      ids.forEach(id => {
        this._allowRunningCell(id);
      });
    }

    _setAction(id, action) {
      let currentAction = this._currentActions.get(id);
      if (!currentAction || currentAction.type !== action.type) {
        // console.log('Scheduling action', id, action)
        this._nextActions.set(id, action);
        // supersede the current action
        this._currentActions.delete(id);
      }
    }

    _isSuperseded(id, action) {
      return (this._currentActions.get(id) !== action)
    }

  }

  function getCellValue$1(cell) {
    return cell ? cell.value : undefined
  }

  function _getArrayValueForCells(cells) {
    // TODO: we should try to decouple this implementation from
    // the rest of the application.
    // this is related to the Stencila's type system
    // Either, the engine is strongly coupled to the type system
    // or we need to introduce an abstraction.
    return gather('array', cells.map(c => getCellValue$1(c)))
  }


  /*
    Gathers the value for a cell range
    - `A1:A1`: value
    - `A1:A10`: array
    - `A1:E1`: array
    - `A1:B10`: table

    TODO: we should try to avoid using specific coercion here
  */
  function _getValueForRange(sheet, startRow, startCol, endRow, endCol) {
    let matrix = sheet.getCells();
    let val;
    // range is a single cell
    // NOTE: with the current implementation of parseSymbol this should not happen
    /* istanbul ignore if */
    if (startRow === endRow && startCol === endCol) {
      val = getCellValue$1(matrix[startRow][startCol]);
    }
    // range is 1D
    else if (startRow === endRow) {
      let cells = matrix[startRow].slice(startCol, endCol+1);
      val = _getArrayValueForCells(cells);
    }
    else if (startCol === endCol) {
      let cells = [];
      for (let i = startRow; i <= endRow; i++) {
        cells.push(matrix[i][startCol]);
      }
      val = _getArrayValueForCells(cells);
    }
    // range is 2D (-> creating a table)
    else {
      let data = {};
      for (let j = startCol; j <= endCol; j++) {
        let name = sheet.getColumnName(j) || getColumnLabel(j);
        let cells = [];
        for (let i = startRow; i <= endRow; i++) {
          cells.push(matrix[i][j]);
        }
        // TODO: why is it necessary to extract the primitive value here, instead of just using getCellValue()?
        data[name] = cells.map(c => {
          let val = getCellValue$1(c);
          if (val) {
            return val.data
          } else {
            return undefined
          }
        });
      }
      val = {
        // Note: first 'type' is for packing
        // and second type for diambiguation against other complex types
        type: 'table',
        data: {
          type: 'table',
          data,
          columns: endCol-startCol+1,
          rows: endRow-startRow+1
        }
      };
    }
    return val
  }

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords = {
    5: ecma5AndLessKeywords,
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.
  // Generated by `bin/generate-identifier-regex.js`.

  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range. They were
  // generated by bin/generate-identifier-regex.js
  var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,785,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,25,391,63,32,0,449,56,264,8,2,36,18,0,50,29,881,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,65,0,32,6124,20,754,9486,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,10591,541];
  var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,10,2,4,9,83,11,7,0,161,11,6,9,7,3,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,87,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,423,9,838,7,2,7,17,9,57,21,2,13,19882,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) return false
      pos += set[i + 1];
      if (pos >= code) return true
    }
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) return code === 36
    if (code < 91) return true
    if (code < 97) return code === 95
    if (code < 123) return true
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code))
    if (astral === false) return false
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) return code === 36
    if (code < 58) return true
    if (code < 65) return false
    if (code < 91) return true
    if (code < 97) return code === 95
    if (code < 123) return true
    if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code))
    if (astral === false) return false
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true};
  var startsExpr = {startsExpr: true};
  // Map keyword names to token types.

  var keywordTypes = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywordTypes[name] = new TokenType(name, options)
  }

  var tt = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("prefix", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=", 6),
    relational: binop("</>", 7),
    bitShift: binop("<</>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class"),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import"),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  }

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]"
  }

  // Checks if an object has a property.

  function has(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName)
  }

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) this.source = p.sourceFile;
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      lineBreakG.lastIndex = cur;
      var match = lineBreakG.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else {
        return new Position(line, offset - cur)
      }
    }
  }

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must
    // be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
    // for strict mode, the set of reserved words, and support for
    // new syntax features. The default is 7.
    ecmaVersion: 7,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called
    // when a semicolon is automatically inserted. It will be passed
    // th position of the comma as an offset, and if `locations` is
    // enabled, it is given the location as a `{line, column}` object
    // as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program.
    allowImportExportEverywhere: false,
    // When enabled, hashbang directive in the beginning of file
    // is allowed and treated as a line comment.
    allowHashBang: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false,
    plugins: {}
  };

  // Interpret and default an options object

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];

    if (options.ecmaVersion >= 2015)
      options.ecmaVersion -= 2009;

    if (options.allowReserved == null)
      options.allowReserved = options.ecmaVersion < 5;

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      options.onComment = pushComment(options, options.onComment);

    return options
  }

  function pushComment(options, array) {
    return function (block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? 'Block' : 'Line',
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        comment.loc = new SourceLocation(this, startLoc, endLoc);
      if (options.ranges)
        comment.range = [start, end];
      array.push(comment);
    }
  }

  // Registered plugins
  var plugins = {};

  function keywordRegexp(words) {
    return new RegExp("^(" + words.replace(/ /g, "|") + ")$")
  }

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
    var reserved = "";
    if (!options.allowReserved) {
      for (var v = options.ecmaVersion;; v--)
        if (reserved = reservedWords[v]) break
      if (options.sourceType == "module") reserved += " await";
    }
    this.reservedWords = keywordRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = keywordRegexp(reservedStrict);
    this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Load plugins
    this.loadPlugins(options.plugins);

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = tt.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;

    // Flags to track whether we are in a function, a generator, an async function.
    this.inFunction = this.inGenerator = this.inAsync = false;
    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = 0;
    // Labels in scope.
    this.labels = [];

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!')
      this.skipLineComment(2);
  };

  // DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
  Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
  Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

  Parser.prototype.extend = function extend (name, f) {
    this[name] = f(this[name]);
  };

  Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
      var this$1 = this;

    for (var name in pluginConfigs) {
      var plugin = plugins[name];
      if (!plugin) throw new Error("Plugin '" + name + "' not found")
      plugin(this$1, pluginConfigs[name]);
    }
  };

  Parser.prototype.parse = function parse () {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node)
  };

  var pp = Parser.prototype;

  // ## Parser utilities

  var literal = /^(?:'((?:[^\']|\.)*)'|"((?:[^\"]|\.)*)"|;)/;
  pp.strictDirective = function(start) {
    var this$1 = this;

    for (;;) {
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this$1.input)[0].length;
      var match = literal.exec(this$1.input.slice(start));
      if (!match) return false
      if ((match[1] || match[2]) == "use strict") return true
      start += match[0].length;
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp.isContextual = function(name) {
    return this.type === tt.name && this.value === name
  };

  // Consumes contextual keyword if possible.

  pp.eatContextual = function(name) {
    return this.value === name && this.eat(tt.name)
  };

  // Asserts that following token is given contextual keyword.

  pp.expectContextual = function(name) {
    if (!this.eatContextual(name)) this.unexpected();
  };

  // Test whether a semicolon can be inserted at the current position.

  pp.canInsertSemicolon = function() {
    return this.type === tt.eof ||
      this.type === tt.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp.semicolon = function() {
    if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected();
  };

  pp.afterTrailingComma = function(tokType, notNext) {
    if (this.type == tokType) {
      if (this.options.onTrailingComma)
        this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
      if (!notNext)
        this.next();
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  var DestructuringErrors = function DestructuringErrors() {
    this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = -1;
  };

  pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) return
    if (refDestructuringErrors.trailingComma > -1)
      this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) this.raiseRecoverable(parens, "Parenthesized pattern");
  };

  pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    var pos = refDestructuringErrors ? refDestructuringErrors.shorthandAssign : -1;
    if (!andThrow) return pos >= 0
    if (pos > -1) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
  };

  pp.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      this.raise(this.yieldPos, "Yield expression cannot be a default value");
    if (this.awaitPos)
      this.raise(this.awaitPos, "Await expression cannot be a default value");
  };

  pp.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      return this.isSimpleAssignTarget(expr.expression)
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$1 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$1.parseTopLevel = function(node) {
    var this$1 = this;

    var exports = {};
    if (!node.body) node.body = [];
    while (this.type !== tt.eof) {
      var stmt = this$1.parseStatement(true, true, exports);
      node.body.push(stmt);
    }
    this.next();
    if (this.options.ecmaVersion >= 6) {
      node.sourceType = this.options.sourceType;
    }
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"};
  var switchLabel = {kind: "switch"};
  pp$1.isLet = function() {
    if (this.type !== tt.name || this.options.ecmaVersion < 6 || this.value != "let") return false
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    if (nextCh === 91 || nextCh == 123) return true // '{' and '['
    if (isIdentifierStart(nextCh, true)) {
      for (var pos = next + 1; isIdentifierChar(this.input.charCodeAt(pos), true); ++pos) {}
      var ident = this.input.slice(next, pos);
      if (!this.isKeyword(ident)) return true
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$1.isAsyncFunction = function() {
    if (this.type !== tt.name || this.options.ecmaVersion < 8 || this.value != "async")
      return false

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 == this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$1.parseStatement = function(declaration, topLevel, exports) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet()) {
      starttype = tt._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case tt._break: case tt._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case tt._debugger: return this.parseDebuggerStatement(node)
    case tt._do: return this.parseDoStatement(node)
    case tt._for: return this.parseForStatement(node)
    case tt._function:
      if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
      return this.parseFunctionStatement(node, false)
    case tt._class:
      if (!declaration) this.unexpected();
      return this.parseClass(node, true)
    case tt._if: return this.parseIfStatement(node)
    case tt._return: return this.parseReturnStatement(node)
    case tt._switch: return this.parseSwitchStatement(node)
    case tt._throw: return this.parseThrowStatement(node)
    case tt._try: return this.parseTryStatement(node)
    case tt._const: case tt._var:
      kind = kind || this.value;
      if (!declaration && kind != "var") this.unexpected();
      return this.parseVarStatement(node, kind)
    case tt._while: return this.parseWhileStatement(node)
    case tt._with: return this.parseWithStatement(node)
    case tt.braceL: return this.parseBlock()
    case tt.semi: return this.parseEmptyStatement(node)
    case tt._export:
    case tt._import:
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          this.raise(this.start, "'import' and 'export' may only appear at the top level");
        if (!this.inModule)
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
      }
      return starttype === tt._import ? this.parseImport(node) : this.parseExport(node, exports)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction() && declaration) {
        this.next();
        return this.parseFunctionStatement(node, true)
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
        return this.parseLabeledStatement(node, maybeName, expr)
      else return this.parseExpressionStatement(node, expr)
    }
  };

  pp$1.parseBreakContinueStatement = function(node, keyword) {
    var this$1 = this;

    var isBreak = keyword == "break";
    this.next();
    if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null;
    else if (this.type !== tt.name) this.unexpected();
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    for (var i = 0; i < this.labels.length; ++i) {
      var lab = this$1.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) break
        if (node.label && isBreak) break
      }
    }
    if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$1.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$1.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.labels.pop();
    this.expect(tt._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      this.eat(tt.semi);
    else
      this.semicolon();
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$1.parseForStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    this.expect(tt.parenL);
    if (this.type === tt.semi) return this.parseFor(node, null)
    var isLet = this.isLet();
    if (this.type === tt._var || this.type === tt._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      if ((this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
          !(kind !== "var" && init$1.declarations[0].init))
        return this.parseForIn(node, init$1)
      return this.parseFor(node, init$1)
    }
    var refDestructuringErrors = new DestructuringErrors;
    var init = this.parseExpression(true, refDestructuringErrors);
    if (this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.toAssignable(init);
      this.checkLVal(init);
      this.checkPatternErrors(refDestructuringErrors, true);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    return this.parseFor(node, init)
  };

  pp$1.parseFunctionStatement = function(node, isAsync) {
    this.next();
    return this.parseFunction(node, true, false, isAsync)
  };

  pp$1.isFunction = function() {
    return this.type === tt._function || this.isAsyncFunction()
  };

  pp$1.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement(!this.strict && this.isFunction());
    node.alternate = this.eat(tt._else) ? this.parseStatement(!this.strict && this.isFunction()) : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$1.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
      this.raise(this.start, "'return' outside of function");
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null;
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$1.parseSwitchStatement = function(node) {
    var this$1 = this;

    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(tt.braceL);
    this.labels.push(switchLabel);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    for (var cur, sawDefault = false; this.type != tt.braceR;) {
      if (this$1.type === tt._case || this$1.type === tt._default) {
        var isCase = this$1.type === tt._case;
        if (cur) this$1.finishNode(cur, "SwitchCase");
        node.cases.push(cur = this$1.startNode());
        cur.consequent = [];
        this$1.next();
        if (isCase) {
          cur.test = this$1.parseExpression();
        } else {
          if (sawDefault) this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses");
          sawDefault = true;
          cur.test = null;
        }
        this$1.expect(tt.colon);
      } else {
        if (!cur) this$1.unexpected();
        cur.consequent.push(this$1.parseStatement(true));
      }
    }
    if (cur) this.finishNode(cur, "SwitchCase");
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$1.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      this.raise(this.lastTokEnd, "Illegal newline after throw");
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  pp$1.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === tt._catch) {
      var clause = this.startNode();
      this.next();
      this.expect(tt.parenL);
      clause.param = this.parseBindingAtom();
      this.checkLVal(clause.param, true);
      this.expect(tt.parenR);
      clause.body = this.parseBlock();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      this.raise(node.start, "Missing catch or finally clause");
    return this.finishNode(node, "TryStatement")
  };

  pp$1.parseVarStatement = function(node, kind) {
    this.next();
    this.parseVar(node, false, kind);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$1.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$1.parseWithStatement = function(node) {
    if (this.strict) this.raise(this.start, "'with' in strict mode");
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement(false);
    return this.finishNode(node, "WithStatement")
  };

  pp$1.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$1.parseLabeledStatement = function(node, maybeName, expr) {
    var this$1 = this;

    for (var i = 0; i < this.labels.length; ++i)
      if (this$1.labels[i].name === maybeName) this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
    var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
    for (var i$1 = this.labels.length - 1; i$1 >= 0; i$1--) {
      var label = this$1.labels[i$1];
      if (label.statementStart == node.start) {
        label.statementStart = this$1.start;
        label.kind = kind;
      } else break
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(true);
    if (node.body.type == "ClassDeclaration" ||
        node.body.type == "VariableDeclaration" && (this.strict || node.body.kind != "var") ||
        node.body.type == "FunctionDeclaration" && (this.strict || node.body.generator))
      this.raiseRecoverable(node.body.start, "Invalid labeled declaration");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$1.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$1.parseBlock = function() {
    var this$1 = this;

    var node = this.startNode();
    node.body = [];
    this.expect(tt.braceL);
    while (!this.eat(tt.braceR)) {
      var stmt = this$1.parseStatement(true);
      node.body.push(stmt);
    }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$1.parseFor = function(node, init) {
    node.init = init;
    this.expect(tt.semi);
    node.test = this.type === tt.semi ? null : this.parseExpression();
    this.expect(tt.semi);
    node.update = this.type === tt.parenR ? null : this.parseExpression();
    this.expect(tt.parenR);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$1.parseForIn = function(node, init) {
    var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
    this.next();
    node.left = init;
    node.right = this.parseExpression();
    this.expect(tt.parenR);
    node.body = this.parseStatement(false);
    this.labels.pop();
    return this.finishNode(node, type)
  };

  // Parse a list of variable declarations.

  pp$1.parseVar = function(node, isFor, kind) {
    var this$1 = this;

    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this$1.startNode();
      this$1.parseVarId(decl);
      if (this$1.eat(tt.eq)) {
        decl.init = this$1.parseMaybeAssign(isFor);
      } else if (kind === "const" && !(this$1.type === tt._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
        this$1.unexpected();
      } else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === tt._in || this$1.isContextual("of")))) {
        this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
      if (!this$1.eat(tt.comma)) break
    }
    return node
  };

  pp$1.parseVarId = function(decl) {
    decl.id = this.parseBindingAtom();
    this.checkLVal(decl.id, true);
  };

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 6 && !isAsync)
      node.generator = this.eat(tt.star);
    if (this.options.ecmaVersion >= 8)
      node.async = !!isAsync;

    if (isStatement == null)
      isStatement = this.type == tt.name;
    if (isStatement)
      node.id = this.parseIdent();

    var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
        oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
    this.inGenerator = node.generator;
    this.inAsync = node.async;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.inFunction = true;

    if (!isStatement && this.type === tt.name)
      node.id = this.parseIdent();
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody);

    this.inGenerator = oldInGen;
    this.inAsync = oldInAsync;
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.inFunction = oldInFunc;
    return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$1.parseFunctionParams = function(node) {
    this.expect(tt.parenL);
    node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8, true);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$1.parseClass = function(node, isStatement) {
    var this$1 = this;

    this.next();
    if (isStatement == null) isStatement = this.type === tt.name;
    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(tt.braceL);
    while (!this.eat(tt.braceR)) {
      if (this$1.eat(tt.semi)) continue
      var method = this$1.startNode();
      var isGenerator = this$1.eat(tt.star);
      var isAsync = false;
      var isMaybeStatic = this$1.type === tt.name && this$1.value === "static";
      this$1.parsePropertyName(method);
      method.static = isMaybeStatic && this$1.type !== tt.parenL;
      if (method.static) {
        if (isGenerator) this$1.unexpected();
        isGenerator = this$1.eat(tt.star);
        this$1.parsePropertyName(method);
      }
      if (this$1.options.ecmaVersion >= 8 && !isGenerator && !method.computed &&
          method.key.type === "Identifier" && method.key.name === "async" && this$1.type !== tt.parenL &&
          !this$1.canInsertSemicolon()) {
        isAsync = true;
        this$1.parsePropertyName(method);
      }
      method.kind = "method";
      var isGetSet = false;
      if (!method.computed) {
        var key = method.key;
        if (!isGenerator && !isAsync && key.type === "Identifier" && this$1.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
          isGetSet = true;
          method.kind = key.name;
          key = this$1.parsePropertyName(method);
        }
        if (!method.static && (key.type === "Identifier" && key.name === "constructor" ||
            key.type === "Literal" && key.value === "constructor")) {
          if (hadConstructor) this$1.raise(key.start, "Duplicate constructor in the same class");
          if (isGetSet) this$1.raise(key.start, "Constructor can't have get/set modifier");
          if (isGenerator) this$1.raise(key.start, "Constructor can't be a generator");
          if (isAsync) this$1.raise(key.start, "Constructor can't be an async method");
          method.kind = "constructor";
          hadConstructor = true;
        }
      }
      this$1.parseClassMethod(classBody, method, isGenerator, isAsync);
      if (isGetSet) {
        var paramCount = method.kind === "get" ? 0 : 1;
        if (method.value.params.length !== paramCount) {
          var start = method.value.start;
          if (method.kind === "get")
            this$1.raiseRecoverable(start, "getter should have no params");
          else
            this$1.raiseRecoverable(start, "setter should have exactly one param");
        } else {
          if (method.kind === "set" && method.value.params[0].type === "RestElement")
            this$1.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params");
        }
      }
    }
    node.body = this.finishNode(classBody, "ClassBody");
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync) {
    method.value = this.parseMethod(isGenerator, isAsync);
    classBody.body.push(this.finishNode(method, "MethodDefinition"));
  };

  pp$1.parseClassId = function(node, isStatement) {
    node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
  };

  pp$1.parseClassSuper = function(node) {
    node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
  };

  // Parses module export declaration.

  pp$1.parseExport = function(node, exports) {
    var this$1 = this;

    this.next();
    // export * from '...'
    if (this.eat(tt.star)) {
      this.expectContextual("from");
      node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
      this.semicolon();
      return this.finishNode(node, "ExportAllDeclaration")
    }
    if (this.eat(tt._default)) { // export default ...
      this.checkExport(exports, "default", this.lastTokStart);
      var isAsync;
      if (this.type === tt._function || (isAsync = this.isAsyncFunction())) {
        var fNode = this.startNode();
        this.next();
        if (isAsync) this.next();
        node.declaration = this.parseFunction(fNode, null, false, isAsync);
      } else if (this.type === tt._class) {
        var cNode = this.startNode();
        node.declaration = this.parseClass(cNode, null);
      } else {
        node.declaration = this.parseMaybeAssign();
        this.semicolon();
      }
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseStatement(true);
      if (node.declaration.type === "VariableDeclaration")
        this.checkVariableExport(exports, node.declaration.declarations);
      else
        this.checkExport(exports, node.declaration.id.name, node.declaration.id.start);
      node.specifiers = [];
      node.source = null;
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports);
      if (this.eatContextual("from")) {
        node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
      } else {
        // check for keywords used as local names
        for (var i = 0; i < node.specifiers.length; i++) {
          if (this$1.keywords.test(node.specifiers[i].local.name) || this$1.reservedWords.test(node.specifiers[i].local.name)) {
            this$1.unexpected(node.specifiers[i].local.start);
          }
        }

        node.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$1.checkExport = function(exports, name, pos) {
    if (!exports) return
    if (Object.prototype.hasOwnProperty.call(exports, name))
      this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
    exports[name] = true;
  };

  pp$1.checkPatternExport = function(exports, pat) {
    var this$1 = this;

    var type = pat.type;
    if (type == "Identifier")
      this.checkExport(exports, pat.name, pat.start);
    else if (type == "ObjectPattern")
      for (var i = 0; i < pat.properties.length; ++i)
        this$1.checkPatternExport(exports, pat.properties[i].value);
    else if (type == "ArrayPattern")
      for (var i$1 = 0; i$1 < pat.elements.length; ++i$1) {
        var elt = pat.elements[i$1];
        if (elt) this$1.checkPatternExport(exports, elt);
      }
    else if (type == "AssignmentPattern")
      this.checkPatternExport(exports, pat.left);
    else if (type == "ParenthesizedExpression")
      this.checkPatternExport(exports, pat.expression);
  };

  pp$1.checkVariableExport = function(exports, decls) {
    var this$1 = this;

    if (!exports) return
    for (var i = 0; i < decls.length; i++)
      this$1.checkPatternExport(exports, decls[i].id);
  };

  pp$1.shouldParseExportStatement = function() {
    return this.type.keyword === "var"
      || this.type.keyword === "const"
      || this.type.keyword === "class"
      || this.type.keyword === "function"
      || this.isLet()
      || this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$1.parseExportSpecifiers = function(exports) {
    var this$1 = this;

    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(tt.braceL);
    while (!this.eat(tt.braceR)) {
      if (!first) {
        this$1.expect(tt.comma);
        if (this$1.afterTrailingComma(tt.braceR)) break
      } else first = false;

      var node = this$1.startNode();
      node.local = this$1.parseIdent(true);
      node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
      this$1.checkExport(exports, node.exported.name, node.exported.start);
      nodes.push(this$1.finishNode(node, "ExportSpecifier"));
    }
    return nodes
  };

  // Parses import declaration.

  pp$1.parseImport = function(node) {
    this.next();
    // import '...'
    if (this.type === tt.string) {
      node.specifiers = empty;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$1.parseImportSpecifiers = function() {
    var this$1 = this;

    var nodes = [], first = true;
    if (this.type === tt.name) {
      // import defaultObj, { x, y as z } from '...'
      var node = this.startNode();
      node.local = this.parseIdent();
      this.checkLVal(node.local, true);
      nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
      if (!this.eat(tt.comma)) return nodes
    }
    if (this.type === tt.star) {
      var node$1 = this.startNode();
      this.next();
      this.expectContextual("as");
      node$1.local = this.parseIdent();
      this.checkLVal(node$1.local, true);
      nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
      return nodes
    }
    this.expect(tt.braceL);
    while (!this.eat(tt.braceR)) {
      if (!first) {
        this$1.expect(tt.comma);
        if (this$1.afterTrailingComma(tt.braceR)) break
      } else first = false;

      var node$2 = this$1.startNode();
      node$2.imported = this$1.parseIdent(true);
      if (this$1.eatContextual("as")) {
        node$2.local = this$1.parseIdent();
      } else {
        node$2.local = node$2.imported;
        if (this$1.isKeyword(node$2.local.name)) this$1.unexpected(node$2.local.start);
        if (this$1.reservedWordsStrict.test(node$2.local.name)) this$1.raiseRecoverable(node$2.local.start, "The keyword '" + node$2.local.name + "' is reserved");
      }
      this$1.checkLVal(node$2.local, true);
      nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
    }
    return nodes
  };

  var pp$2 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$2.toAssignable = function(node, isBinding) {
    var this$1 = this;

    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
        if (this.inAsync && node.name === "await")
          this.raise(node.start, "Can not use 'await' as identifier inside an async function");
        break

      case "ObjectPattern":
      case "ArrayPattern":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        for (var i = 0; i < node.properties.length; i++) {
          var prop = node.properties[i];
          if (prop.kind !== "init") this$1.raise(prop.key.start, "Object pattern can't contain getter or setter");
          this$1.toAssignable(prop.value, isBinding);
        }
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        this.toAssignableList(node.elements, isBinding);
        break

      case "AssignmentExpression":
        if (node.operator === "=") {
          node.type = "AssignmentPattern";
          delete node.operator;
          this.toAssignable(node.left, isBinding);
          // falls through to AssignmentPattern
        } else {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
          break
        }

      case "AssignmentPattern":
        break

      case "ParenthesizedExpression":
        node.expression = this.toAssignable(node.expression, isBinding);
        break

      case "MemberExpression":
        if (!isBinding) break

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$2.toAssignableList = function(exprList, isBinding) {
    var this$1 = this;

    var end = exprList.length;
    if (end) {
      var last = exprList[end - 1];
      if (last && last.type == "RestElement") {
        --end;
      } else if (last && last.type == "SpreadElement") {
        last.type = "RestElement";
        var arg = last.argument;
        this.toAssignable(arg, isBinding);
        if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern")
          this.unexpected(arg.start);
        --end;
      }

      if (isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        this.unexpected(last.argument.start);
    }
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) this$1.toAssignable(elt, isBinding);
    }
    return exprList
  };

  // Parses spread element.

  pp$2.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$2.parseRest = function(allowNonIdent) {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (allowNonIdent) node.argument = this.type === tt.name ? this.parseIdent() : this.unexpected();
    else node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$2.parseBindingAtom = function() {
    if (this.options.ecmaVersion < 6) return this.parseIdent()
    switch (this.type) {
    case tt.name:
      return this.parseIdent()

    case tt.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(tt.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case tt.braceL:
      return this.parseObj(true)

    default:
      this.unexpected();
    }
  };

  pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowNonIdent) {
    var this$1 = this;

    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) first = false;
      else this$1.expect(tt.comma);
      if (allowEmpty && this$1.type === tt.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
        break
      } else if (this$1.type === tt.ellipsis) {
        var rest = this$1.parseRest(allowNonIdent);
        this$1.parseBindingListItem(rest);
        elts.push(rest);
        if (this$1.type === tt.comma) this$1.raise(this$1.start, "Comma is not permitted after the rest element");
        this$1.expect(close);
        break
      } else {
        var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
        this$1.parseBindingListItem(elem);
        elts.push(elem);
      }
    }
    return elts
  };

  pp$2.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) return left
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // Verify that a node is an lval — something that can be assigned
  // to.

  pp$2.checkLVal = function(expr, isBinding, checkClashes) {
    var this$1 = this;

    switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      if (checkClashes) {
        if (has(checkClashes, expr.name))
          this.raiseRecoverable(expr.start, "Argument name clash");
        checkClashes[expr.name] = true;
      }
      break

    case "MemberExpression":
      if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
      break

    case "ObjectPattern":
      for (var i = 0; i < expr.properties.length; i++)
        this$1.checkLVal(expr.properties[i].value, isBinding, checkClashes);
      break

    case "ArrayPattern":
      for (var i$1 = 0; i$1 < expr.elements.length; i$1++) {
        var elem = expr.elements[i$1];
        if (elem) this$1.checkLVal(elem, isBinding, checkClashes);
      }
      break

    case "AssignmentPattern":
      this.checkLVal(expr.left, isBinding, checkClashes);
      break

    case "RestElement":
      this.checkLVal(expr.argument, isBinding, checkClashes);
      break

    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, isBinding, checkClashes);
      break

    default:
      this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  var pp$3 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$3.checkPropClash = function(prop, propHash) {
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      return
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var isGetSet = kind !== "init";
      if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
        this.raiseRecoverable(key.start, "Redefinition of property");
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$3.parseExpression = function(noIn, refDestructuringErrors) {
    var this$1 = this;

    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
    if (this.type === tt.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(tt.comma)) node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors));
      return this.finishNode(node, "SequenceExpression")
    }
    return expr
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
    if (this.inGenerator && this.isContextual("yield")) return this.parseYield()

    var ownDestructuringErrors = false, oldParenAssign = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      refDestructuringErrors.parenthesizedAssign = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type == tt.parenL || this.type == tt.name)
      this.potentialArrowAt = this.start;
    var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
    if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
    if (this.type.isAssign) {
      this.checkPatternErrors(refDestructuringErrors, true);
      if (!ownDestructuringErrors) DestructuringErrors.call(refDestructuringErrors);
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.left = this.type === tt.eq ? this.toAssignable(left) : left;
      refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
      this.checkLVal(left);
      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (oldParenAssign > -1) refDestructuringErrors.parenthesizedAssign = oldParenAssign;
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(noIn, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr
    if (this.eat(tt.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(tt.colon);
      node.alternate = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr
    return this.parseExprOp(expr, startPos, startLoc, -1, noIn)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
    var prec = this.type.binop;
    if (prec != null && (!noIn || this.type !== tt._in)) {
      if (prec > minPrec) {
        var logical = this.type === tt.logicalOR || this.type === tt.logicalAND;
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
      }
    }
    return left
  };

  pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
    var this$1 = this;

    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.inAsync && this.isContextual("await")) {
      expr = this.parseAwait(refDestructuringErrors);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === tt.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) this.checkLVal(node.argument);
      else if (this.strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
      else sawUnary = true;
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors)) return expr
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this$1.startNodeAt(startPos, startLoc);
        node$1.operator = this$1.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this$1.checkLVal(expr);
        this$1.next();
        expr = this$1.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!sawUnary && this.eat(tt.starstar))
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false)
    else
      return expr
  };

  // Parse call, dot, and `[]`-subscript expressions.

  pp$3.parseExprSubscripts = function(refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors);
    var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
    if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr
    var result = this.parseSubscripts(expr, startPos, startLoc);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) refDestructuringErrors.parenthesizedAssign = -1;
      if (refDestructuringErrors.parenthesizedBind >= result.start) refDestructuringErrors.parenthesizedBind = -1;
    }
    return result
  };

  pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
    var this$1 = this;

    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd == base.end && !this.canInsertSemicolon();
    for (var computed;;) {
      if ((computed = this$1.eat(tt.bracketL)) || this$1.eat(tt.dot)) {
        var node = this$1.startNodeAt(startPos, startLoc);
        node.object = base;
        node.property = computed ? this$1.parseExpression() : this$1.parseIdent(true);
        node.computed = !!computed;
        if (computed) this$1.expect(tt.bracketR);
        base = this$1.finishNode(node, "MemberExpression");
      } else if (!noCalls && this$1.eat(tt.parenL)) {
        var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos;
        this$1.yieldPos = 0;
        this$1.awaitPos = 0;
        var exprList = this$1.parseExprList(tt.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors);
        if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(tt.arrow)) {
          this$1.checkPatternErrors(refDestructuringErrors, false);
          this$1.checkYieldAwaitInDefaultParams();
          this$1.yieldPos = oldYieldPos;
          this$1.awaitPos = oldAwaitPos;
          return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true)
        }
        this$1.checkExpressionErrors(refDestructuringErrors, true);
        this$1.yieldPos = oldYieldPos || this$1.yieldPos;
        this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
        var node$1 = this$1.startNodeAt(startPos, startLoc);
        node$1.callee = base;
        node$1.arguments = exprList;
        base = this$1.finishNode(node$1, "CallExpression");
      } else if (this$1.type === tt.backQuote) {
        var node$2 = this$1.startNodeAt(startPos, startLoc);
        node$2.tag = base;
        node$2.quasi = this$1.parseTemplate();
        base = this$1.finishNode(node$2, "TaggedTemplateExpression");
      } else {
        return base
      }
    }
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$3.parseExprAtom = function(refDestructuringErrors) {
    var node, canBeArrow = this.potentialArrowAt == this.start;
    switch (this.type) {
    case tt._super:
      if (!this.inFunction)
        this.raise(this.start, "'super' outside of function or class");

    case tt._this:
      var type = this.type === tt._this ? "ThisExpression" : "Super";
      node = this.startNode();
      this.next();
      return this.finishNode(node, type)

    case tt.name:
      var startPos = this.start, startLoc = this.startLoc;
      var id = this.parseIdent(this.type !== tt.name);
      if (this.options.ecmaVersion >= 8 && id.name === "async" && !this.canInsertSemicolon() && this.eat(tt._function))
        return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true)
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(tt.arrow))
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false)
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === tt.name) {
          id = this.parseIdent();
          if (this.canInsertSemicolon() || !this.eat(tt.arrow))
            this.unexpected();
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
        }
      }
      return id

    case tt.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case tt.num: case tt.string:
      return this.parseLiteral(this.value)

    case tt._null: case tt._true: case tt._false:
      node = this.startNode();
      node.value = this.type === tt._null ? null : this.type === tt._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case tt.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          refDestructuringErrors.parenthesizedAssign = start;
        if (refDestructuringErrors.parenthesizedBind < 0)
          refDestructuringErrors.parenthesizedBind = start;
      }
      return expr

    case tt.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case tt.braceL:
      return this.parseObj(false, refDestructuringErrors)

    case tt._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, false)

    case tt._class:
      return this.parseClass(this.startNode(), false)

    case tt._new:
      return this.parseNew()

    case tt.backQuote:
      return this.parseTemplate()

    default:
      this.unexpected();
    }
  };

  pp$3.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$3.parseParenExpression = function() {
    this.expect(tt.parenL);
    var val = this.parseExpression();
    this.expect(tt.parenR);
    return val
  };

  pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
    var this$1 = this;

    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart, innerParenStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      while (this.type !== tt.parenR) {
        first ? first = false : this$1.expect(tt.comma);
        if (allowTrailingComma && this$1.afterTrailingComma(tt.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this$1.type === tt.ellipsis) {
          spreadStart = this$1.start;
          exprList.push(this$1.parseParenItem(this$1.parseRest()));
          if (this$1.type === tt.comma) this$1.raise(this$1.start, "Comma is not permitted after the rest element");
          break
        } else {
          if (this$1.type === tt.parenL && !innerParenStart) {
            innerParenStart = this$1.start;
          }
          exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
        }
      }
      var innerEndPos = this.start, innerEndLoc = this.startLoc;
      this.expect(tt.parenR);

      if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (innerParenStart) this.unexpected(innerParenStart);
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList)
      }

      if (!exprList.length || lastIsComma) this.unexpected(this.lastTokStart);
      if (spreadStart) this.unexpected(spreadStart);
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$3.parseParenItem = function(item) {
    return item
  };

  pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty$1 = [];

  pp$3.parseNew = function() {
    var node = this.startNode();
    var meta = this.parseIdent(true);
    if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
      node.meta = meta;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target")
        this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target");
      if (!this.inFunction)
        this.raiseRecoverable(node.start, "new.target can only be used in functions");
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
    if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false);
    else node.arguments = empty$1;
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$3.parseTemplateElement = function() {
    var elem = this.startNode();
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
      cooked: this.value
    };
    this.next();
    elem.tail = this.type === tt.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$3.parseTemplate = function() {
    var this$1 = this;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement();
    node.quasis = [curElt];
    while (!curElt.tail) {
      this$1.expect(tt.dollarBraceL);
      node.expressions.push(this$1.parseExpression());
      this$1.expect(tt.braceR);
      node.quasis.push(curElt = this$1.parseTemplateElement());
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  // Parse an object literal or binding pattern.

  pp$3.parseObj = function(isPattern, refDestructuringErrors) {
    var this$1 = this;

    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(tt.braceR)) {
      if (!first) {
        this$1.expect(tt.comma);
        if (this$1.afterTrailingComma(tt.braceR)) break
      } else first = false;

      var prop = this$1.startNode(), isGenerator, isAsync, startPos, startLoc;
      if (this$1.options.ecmaVersion >= 6) {
        prop.method = false;
        prop.shorthand = false;
        if (isPattern || refDestructuringErrors) {
          startPos = this$1.start;
          startLoc = this$1.startLoc;
        }
        if (!isPattern)
          isGenerator = this$1.eat(tt.star);
      }
      this$1.parsePropertyName(prop);
      if (!isPattern && this$1.options.ecmaVersion >= 8 && !isGenerator && !prop.computed &&
          prop.key.type === "Identifier" && prop.key.name === "async" && this$1.type !== tt.parenL &&
          this$1.type !== tt.colon && !this$1.canInsertSemicolon()) {
        isAsync = true;
        this$1.parsePropertyName(prop, refDestructuringErrors);
      } else {
        isAsync = false;
      }
      this$1.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors);
      this$1.checkPropClash(prop, propHash);
      node.properties.push(this$1.finishNode(prop, "Property"));
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors) {
    if ((isGenerator || isAsync) && this.type === tt.colon)
      this.unexpected();

    if (this.eat(tt.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
      if (isPattern) this.unexpected();
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
    } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type != tt.comma && this.type != tt.braceR)) {
      if (isGenerator || isAsync || isPattern) this.unexpected();
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      prop.value = this.parseMethod(false);
      var paramCount = prop.kind === "get" ? 0 : 1;
      if (prop.value.params.length !== paramCount) {
        var start = prop.value.start;
        if (prop.kind === "get")
          this.raiseRecoverable(start, "getter should have no params");
        else
          this.raiseRecoverable(start, "setter should have exactly one param");
      } else {
        if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
          this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
      }
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (this.keywords.test(prop.key.name) ||
          (this.strict ? this.reservedWordsStrict : this.reservedWords).test(prop.key.name) ||
          (this.inGenerator && prop.key.name == "yield") ||
          (this.inAsync && prop.key.name == "await"))
        this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property");
      prop.kind = "init";
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else if (this.type === tt.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          refDestructuringErrors.shorthandAssign = this.start;
        prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
      } else {
        prop.value = prop.key;
      }
      prop.shorthand = true;
    } else this.unexpected();
  };

  pp$3.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(tt.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(tt.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true)
  };

  // Initialize empty function node.

  pp$3.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) {
      node.generator = false;
      node.expression = false;
    }
    if (this.options.ecmaVersion >= 8)
      node.async = false;
  };

  // Parse object or class method.

  pp$3.parseMethod = function(isGenerator, isAsync) {
    var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync,
        oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      node.generator = isGenerator;
    if (this.options.ecmaVersion >= 8)
      node.async = !!isAsync;

    this.inGenerator = node.generator;
    this.inAsync = node.async;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.inFunction = true;

    this.expect(tt.parenL);
    node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false);

    this.inGenerator = oldInGen;
    this.inAsync = oldInAsync;
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.inFunction = oldInFunc;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$3.parseArrowExpression = function(node, params, isAsync) {
    var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
        oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 8)
      node.async = !!isAsync;

    this.inGenerator = false;
    this.inAsync = node.async;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.inFunction = true;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true);

    this.inGenerator = oldInGen;
    this.inAsync = oldInAsync;
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.inFunction = oldInFunc;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$3.parseFunctionBody = function(node, isArrowFunction) {
    var isExpression = isArrowFunction && this.type !== tt.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign();
      node.expression = true;
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) this.strict = true;
      node.body = this.parseBlock(true);
      node.expression = false;
      this.labels = oldLabels;
    }

    if (oldStrict || useStrict) {
      this.strict = true;
      if (node.id)
        this.checkLVal(node.id, true);
      this.checkParams(node);
      this.strict = oldStrict;
    } else if (isArrowFunction || !this.isSimpleParamList(node.params)) {
      this.checkParams(node);
    }
  };

  pp$3.isSimpleParamList = function(params) {
    for (var i = 0; i < params.length; i++)
      if (params[i].type !== "Identifier") return false
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$3.checkParams = function(node) {
    var this$1 = this;

    var nameHash = {};
    for (var i = 0; i < node.params.length; i++) this$1.checkLVal(node.params[i], true, nameHash);
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var this$1 = this;

    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this$1.expect(tt.comma);
        if (allowTrailingComma && this$1.afterTrailingComma(close)) break
      } else first = false;

      var elt;
      if (allowEmpty && this$1.type === tt.comma)
        elt = null;
      else if (this$1.type === tt.ellipsis) {
        elt = this$1.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this$1.type === tt.comma && refDestructuringErrors.trailingComma < 0)
          refDestructuringErrors.trailingComma = this$1.start;
      } else {
        elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$3.parseIdent = function(liberal) {
    var node = this.startNode();
    if (liberal && this.options.allowReserved == "never") liberal = false;
    if (this.type === tt.name) {
      if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) &&
          (this.options.ecmaVersion >= 6 ||
           this.input.slice(this.start, this.end).indexOf("\\") == -1))
        this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved");
      if (this.inGenerator && this.value === "yield")
        this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator");
      if (this.inAsync && this.value === "await")
        this.raiseRecoverable(this.start, "Can not use 'await' as identifier inside an async function");
      node.name = this.value;
    } else if (liberal && this.type.keyword) {
      node.name = this.type.keyword;
    } else {
      this.unexpected();
    }
    this.next();
    return this.finishNode(node, "Identifier")
  };

  // Parses yield expression inside generator.

  pp$3.parseYield = function() {
    if (!this.yieldPos) this.yieldPos = this.start;

    var node = this.startNode();
    this.next();
    if (this.type == tt.semi || this.canInsertSemicolon() || (this.type != tt.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(tt.star);
      node.argument = this.parseMaybeAssign();
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$3.parseAwait = function() {
    if (!this.awaitPos) this.awaitPos = this.start;

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      this.loc = new SourceLocation(parser, loc);
    if (parser.options.directSourceFile)
      this.sourceFile = parser.options.directSourceFile;
    if (parser.options.ranges)
      this.range = [pos, 0];
  };

  // Start an AST node, attaching a start offset.

  var pp$5 = Parser.prototype;

  pp$5.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$5.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      node.loc.end = loc;
    if (this.options.ranges)
      node.range[1] = pos;
    return node
  }

  pp$5.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$5.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design

  var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
  };

  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", true),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.readTmplToken(); }),
    f_expr: new TokContext("function", true)
  };

  var pp$6 = Parser.prototype;

  pp$6.initialContext = function() {
    return [types.b_stat]
  };

  pp$6.braceIsBlock = function(prevType) {
    if (prevType === tt.colon) {
      var parent = this.curContext();
      if (parent === types.b_stat || parent === types.b_expr)
        return !parent.isExpr
    }
    if (prevType === tt._return)
      return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
    if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR)
      return true
    if (prevType == tt.braceL)
      return this.curContext() === types.b_stat
    return !this.exprAllowed
  };

  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType == tt.dot)
      this.exprAllowed = false;
    else if (update = type.updateContext)
      update.call(this, prevType);
    else
      this.exprAllowed = type.beforeExpr;
  };

  // Token-specific context update code

  tt.parenR.updateContext = tt.braceR.updateContext = function() {
    if (this.context.length == 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext() === types.f_expr) {
      this.context.pop();
      this.exprAllowed = false;
    } else if (out === types.b_tmpl) {
      this.exprAllowed = true;
    } else {
      this.exprAllowed = !out.isExpr;
    }
  };

  tt.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };

  tt.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };

  tt.parenL.updateContext = function(prevType) {
    var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };

  tt.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  tt._function.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== tt.semi && prevType !== tt._else &&
        !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat))
      this.context.push(types.f_expr);
    this.exprAllowed = false;
  };

  tt.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl)
      this.context.pop();
    else
      this.context.push(types.q_tmpl);
    this.exprAllowed = false;
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
    if (p.options.ranges)
      this.range = [p.start, p.end];
  };

  // ## Tokenizer

  var pp$7 = Parser.prototype;

  // Are we running under Rhino?
  var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";

  // Move to the next token

  pp$7.next = function() {
    if (this.options.onToken)
      this.options.onToken(new Token(this));

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp$7.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    pp$7[Symbol.iterator] = function () {
      var self = this;
      return {next: function () {
        var token = self.getToken();
        return {
          done: token.type === tt.eof,
          value: token
        }
      }}
    };

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  pp$7.curContext = function() {
    return this.context[this.context.length - 1]
  };

  // Read a single token, updating the parser object's token-related
  // properties.

  pp$7.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) this.skipSpace();

    this.start = this.pos;
    if (this.options.locations) this.startLoc = this.curPosition();
    if (this.pos >= this.input.length) return this.finishToken(tt.eof)

    if (curContext.override) return curContext.override(this)
    else this.readToken(this.fullCharCodeAtPos());
  };

  pp$7.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      return this.readWord()

    return this.getTokenFromCode(code)
  };

  pp$7.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xe000) return code
    var next = this.input.charCodeAt(this.pos + 1);
    return (code << 10) + next - 0x35fdc00
  };

  pp$7.skipBlockComment = function() {
    var this$1 = this;

    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
    this.pos = end + 2;
    if (this.options.locations) {
      lineBreakG.lastIndex = start;
      var match;
      while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
        ++this$1.curLine;
        this$1.lineStart = match.index + match[0].length;
      }
    }
    if (this.options.onComment)
      this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition());
  };

  pp$7.skipLineComment = function(startSkip) {
    var this$1 = this;

    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos+=startSkip);
    while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++this$1.pos;
      ch = this$1.input.charCodeAt(this$1.pos);
    }
    if (this.options.onComment)
      this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition());
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp$7.skipSpace = function() {
    var this$1 = this;

    loop: while (this.pos < this.input.length) {
      var ch = this$1.input.charCodeAt(this$1.pos);
      switch (ch) {
        case 32: case 160: // ' '
          ++this$1.pos;
          break
        case 13:
          if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
            ++this$1.pos;
          }
        case 10: case 8232: case 8233:
          ++this$1.pos;
          if (this$1.options.locations) {
            ++this$1.curLine;
            this$1.lineStart = this$1.pos;
          }
          break
        case 47: // '/'
          switch (this$1.input.charCodeAt(this$1.pos + 1)) {
            case 42: // '*'
              this$1.skipBlockComment();
              break
            case 47:
              this$1.skipLineComment(2);
              break
            default:
              break loop
          }
          break
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this$1.pos;
          } else {
            break loop
          }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp$7.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) this.endLoc = this.curPosition();
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp$7.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) return this.readNumber(true)
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(tt.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(tt.dot)
    }
  };

  pp$7.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) {++this.pos; return this.readRegexp()}
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.slash, 1)
  };

  pp$7.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? tt.star : tt.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && next === 42) {
      ++size;
      tokentype = tt.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) return this.finishOp(tt.assign, size + 1)
    return this.finishOp(tokentype, size)
  };

  pp$7.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2)
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1)
  };

  pp$7.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.bitwiseXOR, 1)
  };

  pp$7.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 &&
          lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(tt.incDec, 2)
    }
    if (next === 61) return this.finishOp(tt.assign, 2)
    return this.finishOp(tt.plusMin, 1)
  };

  pp$7.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1)
      return this.finishOp(tt.bitShift, size)
    }
    if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 &&
        this.input.charCodeAt(this.pos + 3) == 45) {
      if (this.inModule) this.unexpected();
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) size = 2;
    return this.finishOp(tt.relational, size)
  };

  pp$7.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2)
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(tt.arrow)
    }
    return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1)
  };

  pp$7.getTokenFromCode = function(code) {
    switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

      // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(tt.parenL)
    case 41: ++this.pos; return this.finishToken(tt.parenR)
    case 59: ++this.pos; return this.finishToken(tt.semi)
    case 44: ++this.pos; return this.finishToken(tt.comma)
    case 91: ++this.pos; return this.finishToken(tt.bracketL)
    case 93: ++this.pos; return this.finishToken(tt.bracketR)
    case 123: ++this.pos; return this.finishToken(tt.braceL)
    case 125: ++this.pos; return this.finishToken(tt.braceR)
    case 58: ++this.pos; return this.finishToken(tt.colon)
    case 63: ++this.pos; return this.finishToken(tt.question)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) break
      ++this.pos;
      return this.finishToken(tt.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) return this.readRadixNumber(16) // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return this.readRadixNumber(8) // '0o', '0O' - octal number
        if (next === 98 || next === 66) return this.readRadixNumber(2) // '0b', '0B' - binary number
      }
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

      // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 126: // '~'
      return this.finishOp(tt.prefix, 1)
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp$7.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  // Parse a regular expression. Some context-awareness is necessary,
  // since a '/' inside a '[]' set does not end the expression.

  function tryCreateRegexp(src, flags, throwErrorAt, parser) {
    try {
      return new RegExp(src, flags)
    } catch (e) {
      if (throwErrorAt !== undefined) {
        if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
        throw e
      }
    }
  }

  var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u");

  pp$7.readRegexp = function() {
    var this$1 = this;

    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this$1.pos >= this$1.input.length) this$1.raise(start, "Unterminated regular expression");
      var ch = this$1.input.charAt(this$1.pos);
      if (lineBreak.test(ch)) this$1.raise(start, "Unterminated regular expression");
      if (!escaped) {
        if (ch === "[") inClass = true;
        else if (ch === "]" && inClass) inClass = false;
        else if (ch === "/" && !inClass) break
        escaped = ch === "\\";
      } else escaped = false;
      ++this$1.pos;
    }
    var content = this.input.slice(start, this.pos);
    ++this.pos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = this.readWord1();
    var tmp = content, tmpFlags = "";
    if (mods) {
      var validFlags = /^[gim]*$/;
      if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/;
      if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
      if (mods.indexOf("u") >= 0) {
        if (regexpUnicodeSupport) {
          tmpFlags = "u";
        } else {
          // Replace each astral symbol and every Unicode escape sequence that
          // possibly represents an astral symbol or a paired surrogate with a
          // single ASCII symbol to avoid throwing on regular expressions that
          // are only valid in combination with the `/u` flag.
          // Note: replacing with the ASCII symbol `x` might cause false
          // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
          // perfectly valid pattern that is equivalent to `[a-b]`, but it would
          // be replaced by `[x-b]` which throws an error.
          tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
            code = Number("0x" + code);
            if (code > 0x10FFFF) this$1.raise(start + offset + 3, "Code point out of bounds");
            return "x"
          });
          tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
          tmpFlags = tmpFlags.replace("u", "");
        }
      }
    }
    // Detect invalid regular expressions.
    var value = null;
    // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
    // so don't do detection if we are running under Rhino
    if (!isRhino) {
      tryCreateRegexp(tmp, tmpFlags, start, this);
      // Get a regular expression object for this pattern-flag pair, or `null` in
      // case the current environment doesn't support the flags it uses.
      value = tryCreateRegexp(content, mods);
    }
    return this.finishToken(tt.regexp, {pattern: content, flags: mods, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp$7.readInt = function(radix, len) {
    var this$1 = this;

    var start = this.pos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = this$1.input.charCodeAt(this$1.pos), val;
      if (code >= 97) val = code - 97 + 10; // a
      else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
      else val = Infinity;
      if (val >= radix) break
      ++this$1.pos;
      total = total * radix + val;
    }
    if (this.pos === start || len != null && this.pos - start !== len) return null

    return total
  };

  pp$7.readRadixNumber = function(radix) {
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
    if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
    return this.finishToken(tt.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp$7.readNumber = function(startsWithDot) {
    var start = this.pos, isFloat = false, octal = this.input.charCodeAt(this.pos) === 48;
    if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
    if (octal && this.pos == start + 1) octal = false;
    var next = this.input.charCodeAt(this.pos);
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      isFloat = true;
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) ++this.pos; // '+-'
      if (this.readInt(10) === null) this.raise(start, "Invalid number");
      isFloat = true;
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

    var str = this.input.slice(start, this.pos), val;
    if (isFloat) val = parseFloat(str);
    else if (!octal || str.length === 1) val = parseInt(str, 10);
    else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");
    else val = parseInt(str, 8);
    return this.finishToken(tt.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp$7.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) {
      if (this.options.ecmaVersion < 6) this.unexpected();
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds");
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) return String.fromCharCode(code)
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  pp$7.readString = function(quote) {
    var this$1 = this;

    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated string constant");
      var ch = this$1.input.charCodeAt(this$1.pos);
      if (ch === quote) break
      if (ch === 92) { // '\'
        out += this$1.input.slice(chunkStart, this$1.pos);
        out += this$1.readEscapedChar(false);
        chunkStart = this$1.pos;
      } else {
        if (isNewLine(ch)) this$1.raise(this$1.start, "Unterminated string constant");
        ++this$1.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(tt.string, out)
  };

  // Reads template string tokens.

  pp$7.readTmplToken = function() {
    var this$1 = this;

    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated template");
      var ch = this$1.input.charCodeAt(this$1.pos);
      if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
        if (this$1.pos === this$1.start && this$1.type === tt.template) {
          if (ch === 36) {
            this$1.pos += 2;
            return this$1.finishToken(tt.dollarBraceL)
          } else {
            ++this$1.pos;
            return this$1.finishToken(tt.backQuote)
          }
        }
        out += this$1.input.slice(chunkStart, this$1.pos);
        return this$1.finishToken(tt.template, out)
      }
      if (ch === 92) { // '\'
        out += this$1.input.slice(chunkStart, this$1.pos);
        out += this$1.readEscapedChar(true);
        chunkStart = this$1.pos;
      } else if (isNewLine(ch)) {
        out += this$1.input.slice(chunkStart, this$1.pos);
        ++this$1.pos;
        switch (ch) {
          case 13:
            if (this$1.input.charCodeAt(this$1.pos) === 10) ++this$1.pos;
          case 10:
            out += "\n";
            break
          default:
            out += String.fromCharCode(ch);
            break
        }
        if (this$1.options.locations) {
          ++this$1.curLine;
          this$1.lineStart = this$1.pos;
        }
        chunkStart = this$1.pos;
      } else {
        ++this$1.pos;
      }
    }
  };

  // Used to read escaped characters

  pp$7.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        if (octalStr !== "0" && (this.strict || inTemplate)) {
          this.raise(this.pos - 2, "Octal literal in strict mode");
        }
        this.pos += octalStr.length - 1;
        return String.fromCharCode(octal)
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp$7.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) this.raise(codePos, "Bad character escape sequence");
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp$7.readWord1 = function() {
    var this$1 = this;

    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this$1.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this$1.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this$1.containsEsc = true;
        word += this$1.input.slice(chunkStart, this$1.pos);
        var escStart = this$1.pos;
        if (this$1.input.charCodeAt(++this$1.pos) != 117) // "u"
          this$1.raise(this$1.pos, "Expecting Unicode escape sequence \\uXXXX");
        ++this$1.pos;
        var esc = this$1.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          this$1.raise(escStart, "Invalid Unicode escape");
        word += codePointToString(esc);
        chunkStart = this$1.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp$7.readWord = function() {
    var word = this.readWord1();
    var type = tt.name;
    if (this.keywords.test(word)) {
      if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword " + word);
      type = keywordTypes[word];
    }
    return this.finishToken(type, word)
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api].
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  function parse(input, options) {
    return new Parser(options, input).parse()
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var walk = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    factory(exports);
  }(commonjsGlobal, (function (exports) {
  // AST walker module for Mozilla Parser API compatible trees

  // A simple walk is one where you simply specify callbacks to be
  // called on specific nodes. The last two arguments are optional. A
  // simple use would be
  //
  //     walk.simple(myTree, {
  //         Expression: function(node) { ... }
  //     });
  //
  // to do something with all expressions. All Parser API node types
  // can be used to identify node types, as well as Expression,
  // Statement, and ScopeBody, which denote categories of nodes.
  //
  // The base argument can be used to pass a custom (recursive)
  // walker, and state can be used to give this walked an initial
  // state.

  function simple(node, visitors, base, state, override) {
    if (!base) base = exports.base
    ;(function c(node, st, override) {
      var type = override || node.type, found = visitors[type];
      base[type](node, st, c);
      if (found) found(node, st);
    })(node, state, override);
  }

  // An ancestor walk keeps an array of ancestor nodes (including the
  // current node) and passes them to the callback as third parameter
  // (and also as state parameter when no other state is present).
  function ancestor(node, visitors, base, state) {
    if (!base) base = exports.base;
    var ancestors = []
    ;(function c(node, st, override) {
      var type = override || node.type, found = visitors[type];
      var isNew = node != ancestors[ancestors.length - 1];
      if (isNew) ancestors.push(node);
      base[type](node, st, c);
      if (found) found(node, st || ancestors, ancestors);
      if (isNew) ancestors.pop();
    })(node, state);
  }

  // A recursive walk is one where your functions override the default
  // walkers. They can modify and replace the state parameter that's
  // threaded through the walk, and can opt how and whether to walk
  // their child nodes (by calling their third argument on these
  // nodes).
  function recursive(node, state, funcs, base, override) {
    var visitor = funcs ? exports.make(funcs, base) : base
    ;(function c(node, st, override) {
      visitor[override || node.type](node, st, c);
    })(node, state, override);
  }

  function makeTest(test) {
    if (typeof test == "string")
      return function (type) { return type == test; }
    else if (!test)
      return function () { return true; }
    else
      return test
  }

  var Found = function Found(node, state) { this.node = node; this.state = state; };

  // Find a node with a given start, end, and type (all are optional,
  // null can be used as wildcard). Returns a {node, state} object, or
  // undefined when it doesn't find a matching node.
  function findNodeAt(node, start, end, test, base, state) {
    test = makeTest(test);
    if (!base) base = exports.base;
    try {
  (function c(node, st, override) {
        var type = override || node.type;
        if ((start == null || node.start <= start) &&
            (end == null || node.end >= end))
          base[type](node, st, c);
        if ((start == null || node.start == start) &&
            (end == null || node.end == end) &&
            test(type, node))
          throw new Found(node, st)
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e
      throw e
    }
  }

  // Find the innermost node of a given type that contains the given
  // position. Interface similar to findNodeAt.
  function findNodeAround(node, pos, test, base, state) {
    test = makeTest(test);
    if (!base) base = exports.base;
    try {
  (function c(node, st, override) {
        var type = override || node.type;
        if (node.start > pos || node.end < pos) return
        base[type](node, st, c);
        if (test(type, node)) throw new Found(node, st)
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e
      throw e
    }
  }

  // Find the outermost matching node after a given position.
  function findNodeAfter(node, pos, test, base, state) {
    test = makeTest(test);
    if (!base) base = exports.base;
    try {
  (function c(node, st, override) {
        if (node.end < pos) return
        var type = override || node.type;
        if (node.start >= pos && test(type, node)) throw new Found(node, st)
        base[type](node, st, c);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) return e
      throw e
    }
  }

  // Find the outermost matching node before a given position.
  function findNodeBefore(node, pos, test, base, state) {
    test = makeTest(test);
    if (!base) base = exports.base;
    var max
    ;(function c(node, st, override) {
      if (node.start > pos) return
      var type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node))
        max = new Found(node, st);
      base[type](node, st, c);
    })(node, state);
    return max
  }

  // Fallback to an Object.create polyfill for older environments.
  var create = Object.create || function(proto) {
    function Ctor() {}
    Ctor.prototype = proto;
    return new Ctor
  };

  // Used to create a custom walker. Will fill in all missing node
  // type properties with the defaults.
  function make(funcs, base) {
    if (!base) base = exports.base;
    var visitor = create(base);
    for (var type in funcs) visitor[type] = funcs[type];
    return visitor
  }

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(_node, _st, _c) {}

  // Node walkers.

  var base = {};

  base.Program = base.BlockStatement = function (node, st, c) {
    for (var i = 0; i < node.body.length; ++i)
      c(node.body[i], st, "Statement");
  };
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = base.ParenthesizedExpression =
    function (node, st, c) { return c(node.expression, st, "Expression"); };
  base.IfStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Statement");
    if (node.alternate) c(node.alternate, st, "Statement");
  };
  base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
  base.BreakStatement = base.ContinueStatement = ignore;
  base.WithStatement = function (node, st, c) {
    c(node.object, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.SwitchStatement = function (node, st, c) {
    c(node.discriminant, st, "Expression");
    for (var i = 0; i < node.cases.length; ++i) {
      var cs = node.cases[i];
      if (cs.test) c(cs.test, st, "Expression");
      for (var j = 0; j < cs.consequent.length; ++j)
        c(cs.consequent[j], st, "Statement");
    }
  };
  base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
    if (node.argument) c(node.argument, st, "Expression");
  };
  base.ThrowStatement = base.SpreadElement =
    function (node, st, c) { return c(node.argument, st, "Expression"); };
  base.TryStatement = function (node, st, c) {
    c(node.block, st, "Statement");
    if (node.handler) c(node.handler, st);
    if (node.finalizer) c(node.finalizer, st, "Statement");
  };
  base.CatchClause = function (node, st, c) {
    c(node.param, st, "Pattern");
    c(node.body, st, "ScopeBody");
  };
  base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForStatement = function (node, st, c) {
    if (node.init) c(node.init, st, "ForInit");
    if (node.test) c(node.test, st, "Expression");
    if (node.update) c(node.update, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInStatement = base.ForOfStatement = function (node, st, c) {
    c(node.left, st, "ForInit");
    c(node.right, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInit = function (node, st, c) {
    if (node.type == "VariableDeclaration") c(node, st);
    else c(node, st, "Expression");
  };
  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
  base.VariableDeclaration = function (node, st, c) {
    for (var i = 0; i < node.declarations.length; ++i)
      c(node.declarations[i], st);
  };
  base.VariableDeclarator = function (node, st, c) {
    c(node.id, st, "Pattern");
    if (node.init) c(node.init, st, "Expression");
  };

  base.Function = function (node, st, c) {
    if (node.id) c(node.id, st, "Pattern");
    for (var i = 0; i < node.params.length; i++)
      c(node.params[i], st, "Pattern");
    c(node.body, st, node.expression ? "ScopeExpression" : "ScopeBody");
  };
  // FIXME drop these node types in next major version
  // (They are awkward, and in ES6 every block can be a scope.)
  base.ScopeBody = function (node, st, c) { return c(node, st, "Statement"); };
  base.ScopeExpression = function (node, st, c) { return c(node, st, "Expression"); };

  base.Pattern = function (node, st, c) {
    if (node.type == "Identifier")
      c(node, st, "VariablePattern");
    else if (node.type == "MemberExpression")
      c(node, st, "MemberPattern");
    else
      c(node, st);
  };
  base.VariablePattern = ignore;
  base.MemberPattern = skipThrough;
  base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
  base.ArrayPattern =  function (node, st, c) {
    for (var i = 0; i < node.elements.length; ++i) {
      var elt = node.elements[i];
      if (elt) c(elt, st, "Pattern");
    }
  };
  base.ObjectPattern = function (node, st, c) {
    for (var i = 0; i < node.properties.length; ++i)
      c(node.properties[i].value, st, "Pattern");
  };

  base.Expression = skipThrough;
  base.ThisExpression = base.Super = base.MetaProperty = ignore;
  base.ArrayExpression = function (node, st, c) {
    for (var i = 0; i < node.elements.length; ++i) {
      var elt = node.elements[i];
      if (elt) c(elt, st, "Expression");
    }
  };
  base.ObjectExpression = function (node, st, c) {
    for (var i = 0; i < node.properties.length; ++i)
      c(node.properties[i], st);
  };
  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
  base.SequenceExpression = base.TemplateLiteral = function (node, st, c) {
    for (var i = 0; i < node.expressions.length; ++i)
      c(node.expressions[i], st, "Expression");
  };
  base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
    c(node.argument, st, "Expression");
  };
  base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
    c(node.left, st, "Expression");
    c(node.right, st, "Expression");
  };
  base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
    c(node.left, st, "Pattern");
    c(node.right, st, "Expression");
  };
  base.ConditionalExpression = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Expression");
    c(node.alternate, st, "Expression");
  };
  base.NewExpression = base.CallExpression = function (node, st, c) {
    c(node.callee, st, "Expression");
    if (node.arguments) for (var i = 0; i < node.arguments.length; ++i)
      c(node.arguments[i], st, "Expression");
  };
  base.MemberExpression = function (node, st, c) {
    c(node.object, st, "Expression");
    if (node.computed) c(node.property, st, "Expression");
  };
  base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
    if (node.declaration)
      c(node.declaration, st, node.type == "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
    if (node.source) c(node.source, st, "Expression");
  };
  base.ExportAllDeclaration = function (node, st, c) {
    c(node.source, st, "Expression");
  };
  base.ImportDeclaration = function (node, st, c) {
    for (var i = 0; i < node.specifiers.length; i++)
      c(node.specifiers[i], st);
    c(node.source, st, "Expression");
  };
  base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;

  base.TaggedTemplateExpression = function (node, st, c) {
    c(node.tag, st, "Expression");
    c(node.quasi, st);
  };
  base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
  base.Class = function (node, st, c) {
    if (node.id) c(node.id, st, "Pattern");
    if (node.superClass) c(node.superClass, st, "Expression");
    for (var i = 0; i < node.body.body.length; i++)
      c(node.body.body[i], st);
  };
  base.MethodDefinition = base.Property = function (node, st, c) {
    if (node.computed) c(node.key, st, "Expression");
    c(node.value, st, "Expression");
  };

  exports.simple = simple;
  exports.ancestor = ancestor;
  exports.recursive = recursive;
  exports.findNodeAt = findNodeAt;
  exports.findNodeAround = findNodeAround;
  exports.findNodeAfter = findNodeAfter;
  exports.findNodeBefore = findNodeBefore;
  exports.make = make;
  exports.base = base;

  Object.defineProperty(exports, '__esModule', { value: true });

  })));
  });

  unwrapExports(walk);
  var walk_1 = walk.simple;
  var walk_2 = walk.base;

  // Astring is a tiny and fast JavaScript code generator from an ESTree-compliant AST.
  //
  // Astring was written by David Bonnet and released under an MIT license.
  //
  // The Git repository for Astring is available at:
  // https://github.com/davidbonnet/astring.git
  //
  // Please use the GitHub bug tracker to report issues:
  // https://github.com/davidbonnet/astring/issues

  const { stringify } = JSON;

  /* istanbul ignore if */
  if (!String.prototype.repeat) {
    /* istanbul ignore next */
    throw new Error(
      'String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation'
    )
  }

  /* istanbul ignore if */
  if (!String.prototype.endsWith) {
    /* istanbul ignore next */
    throw new Error(
      'String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation'
    )
  }

  const OPERATOR_PRECEDENCE = {
    '||': 3,
    '&&': 4,
    '|': 5,
    '^': 6,
    '&': 7,
    '==': 8,
    '!=': 8,
    '===': 8,
    '!==': 8,
    '<': 9,
    '>': 9,
    '<=': 9,
    '>=': 9,
    in: 9,
    instanceof: 9,
    '<<': 10,
    '>>': 10,
    '>>>': 10,
    '+': 11,
    '-': 11,
    '*': 12,
    '%': 12,
    '/': 12,
    '**': 13,
  };

  // Enables parenthesis regardless of precedence
  const NEEDS_PARENTHESES = 17;

  const EXPRESSIONS_PRECEDENCE = {
    // Definitions
    ArrayExpression: 20,
    TaggedTemplateExpression: 20,
    ThisExpression: 20,
    Identifier: 20,
    Literal: 18,
    TemplateLiteral: 20,
    Super: 20,
    SequenceExpression: 20,
    // Operations
    MemberExpression: 19,
    CallExpression: 19,
    NewExpression: 19,
    // Other definitions
    ArrowFunctionExpression: NEEDS_PARENTHESES,
    ClassExpression: NEEDS_PARENTHESES,
    FunctionExpression: NEEDS_PARENTHESES,
    ObjectExpression: NEEDS_PARENTHESES,
    // Other operations
    UpdateExpression: 16,
    UnaryExpression: 15,
    BinaryExpression: 14,
    LogicalExpression: 13,
    ConditionalExpression: 4,
    AssignmentExpression: 3,
    AwaitExpression: 2,
    YieldExpression: 2,
    RestElement: 1,
  };

  function formatSequence(state, nodes) {
    /*
    Writes into `state` a sequence of `nodes`.
    */
    const { generator } = state;
    state.write('(');
    if (nodes != null && nodes.length > 0) {
      generator[nodes[0].type](nodes[0], state);
      const { length } = nodes;
      for (let i = 1; i < length; i++) {
        const param = nodes[i];
        state.write(', ');
        generator[param.type](param, state);
      }
    }
    state.write(')');
  }

  function expressionNeedsParenthesis(node, parentNode, isRightHand) {
    const nodePrecedence = EXPRESSIONS_PRECEDENCE[node.type];
    if (nodePrecedence === NEEDS_PARENTHESES) {
      return true
    }
    const parentNodePrecedence = EXPRESSIONS_PRECEDENCE[parentNode.type];
    if (nodePrecedence !== parentNodePrecedence) {
      // Different node types
      return nodePrecedence < parentNodePrecedence
    }
    if (nodePrecedence !== 13 && nodePrecedence !== 14) {
      // Not a `LogicalExpression` or `BinaryExpression`
      return false
    }
    if (node.operator === '**' && parentNode.operator === '**') {
      // Exponentiation operator has right-to-left associativity
      return !isRightHand
    }
    if (isRightHand) {
      // Parenthesis are used if both operators have the same precedence
      return (
        OPERATOR_PRECEDENCE[node.operator] <=
        OPERATOR_PRECEDENCE[parentNode.operator]
      )
    }
    return (
      OPERATOR_PRECEDENCE[node.operator] <
      OPERATOR_PRECEDENCE[parentNode.operator]
    )
  }

  function formatBinaryExpressionPart(state, node, parentNode, isRightHand) {
    /*
    Writes into `state` a left-hand or right-hand expression `node`
    from a binary expression applying the provided `operator`.
    The `isRightHand` parameter should be `true` if the `node` is a right-hand argument.
    */
    const { generator } = state;
    if (expressionNeedsParenthesis(node, parentNode, isRightHand)) {
      state.write('(');
      generator[node.type](node, state);
      state.write(')');
    } else {
      generator[node.type](node, state);
    }
  }

  function reindent(state, text, indent, lineEnd) {
    /*
    Writes into `state` the `text` string reindented with the provided `indent`.
    */
    const lines = text.split('\n');
    const end = lines.length - 1;
    state.write(lines[0].trim());
    if (end > 0) {
      state.write(lineEnd);
      for (let i = 1; i < end; i++) {
        state.write(indent + lines[i].trim() + lineEnd);
      }
      state.write(indent + lines[end].trim());
    }
  }

  function formatComments(state, comments, indent, lineEnd) {
    /*
    Writes into `state` the provided list of `comments`, with the given `indent` and `lineEnd` strings.
    Line comments will end with `"\n"` regardless of the value of `lineEnd`.
    Expects to start on a new unindented line.
    */
    const { length } = comments;
    for (let i = 0; i < length; i++) {
      const comment = comments[i];
      state.write(indent);
      if (comment.type[0] === 'L') {
        // Line comment
        state.write('// ' + comment.value.trim() + '\n');
      } else {
        // Block comment
        state.write('/*');
        reindent(state, comment.value, indent, lineEnd);
        state.write('*/' + lineEnd);
      }
    }
  }

  function hasCallExpression(node) {
    /*
    Returns `true` if the provided `node` contains a call expression and `false` otherwise.
    */
    let currentNode = node;
    while (currentNode != null) {
      const { type } = currentNode;
      if (type[0] === 'C' && type[1] === 'a') {
        // Is CallExpression
        return true
      } else if (type[0] === 'M' && type[1] === 'e' && type[2] === 'm') {
        // Is MemberExpression
        currentNode = currentNode.object;
      } else {
        return false
      }
    }
  }

  function formatVariableDeclaration(state, node) {
    /*
    Writes into `state` a variable declaration.
    */
    const { generator } = state;
    const { declarations } = node;
    state.write(node.kind + ' ');
    const { length } = declarations;
    if (length > 0) {
      generator.VariableDeclarator(declarations[0], state);
      for (let i = 1; i < length; i++) {
        state.write(', ');
        generator.VariableDeclarator(declarations[i], state);
      }
    }
  }

  let ForInStatement,
    FunctionDeclaration,
    RestElement,
    BinaryExpression,
    ArrayExpression,
    BlockStatement;

  const baseGenerator = {
    Program(node, state) {
      const indent = state.indent.repeat(state.indentLevel);
      const { lineEnd, writeComments } = state;
      if (writeComments && node.comments != null) {
        formatComments(state, node.comments, indent, lineEnd);
      }
      const statements = node.body;
      const { length } = statements;
      for (let i = 0; i < length; i++) {
        const statement = statements[i];
        if (writeComments && statement.comments != null) {
          formatComments(state, statement.comments, indent, lineEnd);
        }
        state.write(indent);
        this[statement.type](statement, state);
        state.write(lineEnd);
      }
      if (writeComments && node.trailingComments != null) {
        formatComments(state, node.trailingComments, indent, lineEnd);
      }
    },
    BlockStatement: (BlockStatement = function(node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      const statementIndent = indent + state.indent;
      state.write('{');
      const statements = node.body;
      if (statements != null && statements.length > 0) {
        state.write(lineEnd);
        if (writeComments && node.comments != null) {
          formatComments(state, node.comments, statementIndent, lineEnd);
        }
        const { length } = statements;
        for (let i = 0; i < length; i++) {
          const statement = statements[i];
          if (writeComments && statement.comments != null) {
            formatComments(state, statement.comments, statementIndent, lineEnd);
          }
          state.write(statementIndent);
          this[statement.type](statement, state);
          state.write(lineEnd);
        }
        state.write(indent);
      } else {
        if (writeComments && node.comments != null) {
          state.write(lineEnd);
          formatComments(state, node.comments, statementIndent, lineEnd);
          state.write(indent);
        }
      }
      if (writeComments && node.trailingComments != null) {
        formatComments(state, node.trailingComments, statementIndent, lineEnd);
      }
      state.write('}');
      state.indentLevel--;
    }),
    ClassBody: BlockStatement,
    EmptyStatement(node, state) {
      state.write(';');
    },
    ExpressionStatement(node, state) {
      const precedence = EXPRESSIONS_PRECEDENCE[node.expression.type];
      if (
        precedence === NEEDS_PARENTHESES ||
        (precedence === 3 && node.expression.left.type[0] === 'O')
      ) {
        // Should always have parentheses or is an AssignmentExpression to an ObjectPattern
        state.write('(');
        this[node.expression.type](node.expression, state);
        state.write(')');
      } else {
        this[node.expression.type](node.expression, state);
      }
      state.write(';');
    },
    IfStatement(node, state) {
      state.write('if (');
      this[node.test.type](node.test, state);
      state.write(') ');
      this[node.consequent.type](node.consequent, state);
      if (node.alternate != null) {
        state.write(' else ');
        this[node.alternate.type](node.alternate, state);
      }
    },
    LabeledStatement(node, state) {
      this[node.label.type](node.label, state);
      state.write(': ');
      this[node.body.type](node.body, state);
    },
    BreakStatement(node, state) {
      state.write('break');
      if (node.label != null) {
        state.write(' ');
        this[node.label.type](node.label, state);
      }
      state.write(';');
    },
    ContinueStatement(node, state) {
      state.write('continue');
      if (node.label != null) {
        state.write(' ');
        this[node.label.type](node.label, state);
      }
      state.write(';');
    },
    WithStatement(node, state) {
      state.write('with (');
      this[node.object.type](node.object, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    SwitchStatement(node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      state.indentLevel++;
      const caseIndent = indent + state.indent;
      const statementIndent = caseIndent + state.indent;
      state.write('switch (');
      this[node.discriminant.type](node.discriminant, state);
      state.write(') {' + lineEnd);
      const { cases: occurences } = node;
      const { length: occurencesCount } = occurences;
      for (let i = 0; i < occurencesCount; i++) {
        const occurence = occurences[i];
        if (writeComments && occurence.comments != null) {
          formatComments(state, occurence.comments, caseIndent, lineEnd);
        }
        if (occurence.test) {
          state.write(caseIndent + 'case ');
          this[occurence.test.type](occurence.test, state);
          state.write(':' + lineEnd);
        } else {
          state.write(caseIndent + 'default:' + lineEnd);
        }
        const { consequent } = occurence;
        const { length: consequentCount } = consequent;
        for (let i = 0; i < consequentCount; i++) {
          const statement = consequent[i];
          if (writeComments && statement.comments != null) {
            formatComments(state, statement.comments, statementIndent, lineEnd);
          }
          state.write(statementIndent);
          this[statement.type](statement, state);
          state.write(lineEnd);
        }
      }
      state.indentLevel -= 2;
      state.write(indent + '}');
    },
    ReturnStatement(node, state) {
      state.write('return');
      if (node.argument) {
        state.write(' ');
        this[node.argument.type](node.argument, state);
      }
      state.write(';');
    },
    ThrowStatement(node, state) {
      state.write('throw ');
      this[node.argument.type](node.argument, state);
      state.write(';');
    },
    TryStatement(node, state) {
      state.write('try ');
      this[node.block.type](node.block, state);
      if (node.handler) {
        const { handler } = node;
        state.write(' catch (');
        this[handler.param.type](handler.param, state);
        state.write(') ');
        this[handler.body.type](handler.body, state);
      }
      if (node.finalizer) {
        state.write(' finally ');
        this[node.finalizer.type](node.finalizer, state);
      }
    },
    WhileStatement(node, state) {
      state.write('while (');
      this[node.test.type](node.test, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    DoWhileStatement(node, state) {
      state.write('do ');
      this[node.body.type](node.body, state);
      state.write(' while (');
      this[node.test.type](node.test, state);
      state.write(');');
    },
    ForStatement(node, state) {
      state.write('for (');
      if (node.init != null) {
        const { init } = node;
        if (init.type[0] === 'V') {
          formatVariableDeclaration(state, init);
        } else {
          this[init.type](init, state);
        }
      }
      state.write('; ');
      if (node.test) {
        this[node.test.type](node.test, state);
      }
      state.write('; ');
      if (node.update) {
        this[node.update.type](node.update, state);
      }
      state.write(') ');
      this[node.body.type](node.body, state);
    },
    ForInStatement: (ForInStatement = function(node, state) {
      state.write('for (');
      const { left } = node;
      if (left.type[0] === 'V') {
        formatVariableDeclaration(state, left);
      } else {
        this[left.type](left, state);
      }
      // Identifying whether node.type is `ForInStatement` or `ForOfStatement`
      state.write(node.type[3] === 'I' ? ' in ' : ' of ');
      this[node.right.type](node.right, state);
      state.write(') ');
      this[node.body.type](node.body, state);
    }),
    ForOfStatement: ForInStatement,
    DebuggerStatement(node, state) {
      state.write('debugger;' + state.lineEnd);
    },
    FunctionDeclaration: (FunctionDeclaration = function(node, state) {
      state.write(
        (node.async ? 'async ' : '') +
          (node.generator ? 'function* ' : 'function ') +
          (node.id ? node.id.name : ''),
        node
      );
      formatSequence(state, node.params);
      state.write(' ');
      this[node.body.type](node.body, state);
    }),
    FunctionExpression: FunctionDeclaration,
    VariableDeclaration(node, state) {
      formatVariableDeclaration(state, node);
      state.write(';');
    },
    VariableDeclarator(node, state) {
      this[node.id.type](node.id, state);
      if (node.init != null) {
        state.write(' = ');
        this[node.init.type](node.init, state);
      }
    },
    ClassDeclaration(node, state) {
      state.write('class ' + (node.id ? `${node.id.name} ` : ''), node);
      if (node.superClass) {
        state.write('extends ');
        this[node.superClass.type](node.superClass, state);
        state.write(' ');
      }
      this.ClassBody(node.body, state);
    },
    ImportDeclaration(node, state) {
      state.write('import ');
      const { specifiers } = node;
      const { length } = specifiers;
      // NOTE: Once babili is fixed, put this after condition
      // https://github.com/babel/babili/issues/430
      let i = 0;
      if (length > 0) {
        for (; i < length; ) {
          if (i > 0) {
            state.write(', ');
          }
          const specifier = specifiers[i];
          const type = specifier.type[6];
          if (type === 'D') {
            // ImportDefaultSpecifier
            state.write(specifier.local.name, specifier);
            i++;
          } else if (type === 'N') {
            // ImportNamespaceSpecifier
            state.write('* as ' + specifier.local.name, specifier);
            i++;
          } else {
            // ImportSpecifier
            break
          }
        }
        if (i < length) {
          state.write('{');
          for (;;) {
            const specifier = specifiers[i];
            const { name } = specifier.imported;
            state.write(name, specifier);
            if (name !== specifier.local.name) {
              state.write(' as ' + specifier.local.name);
            }
            if (++i < length) {
              state.write(', ');
            } else {
              break
            }
          }
          state.write('}');
        }
        state.write(' from ');
      }
      this.Literal(node.source, state);
      state.write(';');
    },
    ExportDefaultDeclaration(node, state) {
      state.write('export default ');
      this[node.declaration.type](node.declaration, state);
      if (
        EXPRESSIONS_PRECEDENCE[node.declaration.type] &&
        node.declaration.type[0] !== 'F'
      ) {
        // All expression nodes except `FunctionExpression`
        state.write(';');
      }
    },
    ExportNamedDeclaration(node, state) {
      state.write('export ');
      if (node.declaration) {
        this[node.declaration.type](node.declaration, state);
      } else {
        state.write('{');
        const { specifiers } = node,
          { length } = specifiers;
        if (length > 0) {
          for (let i = 0; ; ) {
            const specifier = specifiers[i];
            const { name } = specifier.local;
            state.write(name, specifier);
            if (name !== specifier.exported.name) {
              state.write(' as ' + specifier.exported.name);
            }
            if (++i < length) {
              state.write(', ');
            } else {
              break
            }
          }
        }
        state.write('}');
        if (node.source) {
          state.write(' from ');
          this.Literal(node.source, state);
        }
        state.write(';');
      }
    },
    ExportAllDeclaration(node, state) {
      state.write('export * from ');
      this.Literal(node.source, state);
      state.write(';');
    },
    MethodDefinition(node, state) {
      if (node.static) {
        state.write('static ');
      }
      const kind = node.kind[0];
      if (kind === 'g' || kind === 's') {
        // Getter or setter
        state.write(node.kind + ' ');
      }
      if (node.value.async) {
        state.write('async ');
      }
      if (node.value.generator) {
        state.write('*');
      }
      if (node.computed) {
        state.write('[');
        this[node.key.type](node.key, state);
        state.write(']');
      } else {
        this[node.key.type](node.key, state);
      }
      formatSequence(state, node.value.params);
      state.write(' ');
      this[node.value.body.type](node.value.body, state);
    },
    ClassExpression(node, state) {
      this.ClassDeclaration(node, state);
    },
    ArrowFunctionExpression(node, state) {
      state.write(node.async ? 'async ' : '', node);
      const { params } = node;
      if (params != null) {
        // Omit parenthesis if only one named parameter
        if (params.length === 1 && params[0].type[0] === 'I') {
          // If params[0].type[0] starts with 'I', it can't be `ImportDeclaration` nor `IfStatement` and thus is `Identifier`
          state.write(params[0].name, params[0]);
        } else {
          formatSequence(state, node.params);
        }
      }
      state.write(' => ');
      if (node.body.type[0] === 'O') {
        // Body is an object expression
        state.write('(');
        this.ObjectExpression(node.body, state);
        state.write(')');
      } else {
        this[node.body.type](node.body, state);
      }
    },
    ThisExpression(node, state) {
      state.write('this', node);
    },
    Super(node, state) {
      state.write('super', node);
    },
    RestElement: (RestElement = function(node, state) {
      state.write('...');
      this[node.argument.type](node.argument, state);
    }),
    SpreadElement: RestElement,
    YieldExpression(node, state) {
      state.write(node.delegate ? 'yield*' : 'yield');
      if (node.argument) {
        state.write(' ');
        this[node.argument.type](node.argument, state);
      }
    },
    AwaitExpression(node, state) {
      state.write('await ');
      if (node.argument) {
        this[node.argument.type](node.argument, state);
      }
    },
    TemplateLiteral(node, state) {
      const { quasis, expressions } = node;
      state.write('`');
      const { length } = expressions;
      for (let i = 0; i < length; i++) {
        const expression = expressions[i];
        state.write(quasis[i].value.raw);
        state.write('${');
        this[expression.type](expression, state);
        state.write('}');
      }
      state.write(quasis[quasis.length - 1].value.raw);
      state.write('`');
    },
    TaggedTemplateExpression(node, state) {
      this[node.tag.type](node.tag, state);
      this[node.quasi.type](node.quasi, state);
    },
    ArrayExpression: (ArrayExpression = function(node, state) {
      state.write('[');
      if (node.elements.length > 0) {
        const { elements } = node,
          { length } = elements;
        for (let i = 0; ; ) {
          const element = elements[i];
          if (element != null) {
            this[element.type](element, state);
          }
          if (++i < length) {
            state.write(', ');
          } else {
            if (element == null) {
              state.write(', ');
            }
            break
          }
        }
      }
      state.write(']');
    }),
    ArrayPattern: ArrayExpression,
    ObjectExpression(node, state) {
      const indent = state.indent.repeat(state.indentLevel++);
      const { lineEnd, writeComments } = state;
      const propertyIndent = indent + state.indent;
      state.write('{');
      if (node.properties.length > 0) {
        state.write(lineEnd);
        if (writeComments && node.comments != null) {
          formatComments(state, node.comments, propertyIndent, lineEnd);
        }
        const comma = ',' + lineEnd;
        const { properties } = node,
          { length } = properties;
        for (let i = 0; ; ) {
          const property = properties[i];
          if (writeComments && property.comments != null) {
            formatComments(state, property.comments, propertyIndent, lineEnd);
          }
          state.write(propertyIndent);
          this.Property(property, state);
          if (++i < length) {
            state.write(comma);
          } else {
            break
          }
        }
        state.write(lineEnd);
        if (writeComments && node.trailingComments != null) {
          formatComments(state, node.trailingComments, propertyIndent, lineEnd);
        }
        state.write(indent + '}');
      } else if (writeComments) {
        if (node.comments != null) {
          state.write(lineEnd);
          formatComments(state, node.comments, propertyIndent, lineEnd);
          if (node.trailingComments != null) {
            formatComments(state, node.trailingComments, propertyIndent, lineEnd);
          }
          state.write(indent + '}');
        } else if (node.trailingComments != null) {
          state.write(lineEnd);
          formatComments(state, node.trailingComments, propertyIndent, lineEnd);
          state.write(indent + '}');
        } else {
          state.write('}');
        }
      } else {
        state.write('}');
      }
      state.indentLevel--;
    },
    Property(node, state) {
      if (node.method || node.kind[0] !== 'i') {
        // Either a method or of kind `set` or `get` (not `init`)
        this.MethodDefinition(node, state);
      } else {
        if (!node.shorthand) {
          if (node.computed) {
            state.write('[');
            this[node.key.type](node.key, state);
            state.write(']');
          } else {
            this[node.key.type](node.key, state);
          }
          state.write(': ');
        }
        this[node.value.type](node.value, state);
      }
    },
    ObjectPattern(node, state) {
      state.write('{');
      if (node.properties.length > 0) {
        const { properties } = node,
          { length } = properties;
        for (let i = 0; ; ) {
          this[properties[i].type](properties[i], state);
          if (++i < length) {
            state.write(', ');
          } else {
            break
          }
        }
      }
      state.write('}');
    },
    SequenceExpression(node, state) {
      formatSequence(state, node.expressions);
    },
    UnaryExpression(node, state) {
      if (node.prefix) {
        state.write(node.operator);
        if (node.operator.length > 1) {
          state.write(' ');
        }
        if (
          EXPRESSIONS_PRECEDENCE[node.argument.type] <
          EXPRESSIONS_PRECEDENCE.UnaryExpression
        ) {
          state.write('(');
          this[node.argument.type](node.argument, state);
          state.write(')');
        } else {
          this[node.argument.type](node.argument, state);
        }
      } else {
        // FIXME: This case never occurs
        this[node.argument.type](node.argument, state);
        state.write(node.operator);
      }
    },
    UpdateExpression(node, state) {
      // Always applied to identifiers or members, no parenthesis check needed
      if (node.prefix) {
        state.write(node.operator);
        this[node.argument.type](node.argument, state);
      } else {
        this[node.argument.type](node.argument, state);
        state.write(node.operator);
      }
    },
    AssignmentExpression(node, state) {
      this[node.left.type](node.left, state);
      state.write(' ' + node.operator + ' ');
      this[node.right.type](node.right, state);
    },
    AssignmentPattern(node, state) {
      this[node.left.type](node.left, state);
      state.write(' = ');
      this[node.right.type](node.right, state);
    },
    BinaryExpression: (BinaryExpression = function(node, state) {
      if (node.operator === 'in') {
        // Avoids confusion in `for` loops initializers
        state.write('(');
        formatBinaryExpressionPart(state, node.left, node, false);
        state.write(' ' + node.operator + ' ');
        formatBinaryExpressionPart(state, node.right, node, true);
        state.write(')');
      } else {
        formatBinaryExpressionPart(state, node.left, node, false);
        state.write(' ' + node.operator + ' ');
        formatBinaryExpressionPart(state, node.right, node, true);
      }
    }),
    LogicalExpression: BinaryExpression,
    ConditionalExpression(node, state) {
      if (
        EXPRESSIONS_PRECEDENCE[node.test.type] >
        EXPRESSIONS_PRECEDENCE.ConditionalExpression
      ) {
        this[node.test.type](node.test, state);
      } else {
        state.write('(');
        this[node.test.type](node.test, state);
        state.write(')');
      }
      state.write(' ? ');
      this[node.consequent.type](node.consequent, state);
      state.write(' : ');
      this[node.alternate.type](node.alternate, state);
    },
    NewExpression(node, state) {
      state.write('new ');
      if (
        EXPRESSIONS_PRECEDENCE[node.callee.type] <
          EXPRESSIONS_PRECEDENCE.CallExpression ||
        hasCallExpression(node.callee)
      ) {
        state.write('(');
        this[node.callee.type](node.callee, state);
        state.write(')');
      } else {
        this[node.callee.type](node.callee, state);
      }
      formatSequence(state, node['arguments']);
    },
    CallExpression(node, state) {
      if (
        EXPRESSIONS_PRECEDENCE[node.callee.type] <
        EXPRESSIONS_PRECEDENCE.CallExpression
      ) {
        state.write('(');
        this[node.callee.type](node.callee, state);
        state.write(')');
      } else {
        this[node.callee.type](node.callee, state);
      }
      formatSequence(state, node['arguments']);
    },
    MemberExpression(node, state) {
      if (
        EXPRESSIONS_PRECEDENCE[node.object.type] <
        EXPRESSIONS_PRECEDENCE.MemberExpression
      ) {
        state.write('(');
        this[node.object.type](node.object, state);
        state.write(')');
      } else {
        this[node.object.type](node.object, state);
      }
      if (node.computed) {
        state.write('[');
        this[node.property.type](node.property, state);
        state.write(']');
      } else {
        state.write('.');
        this[node.property.type](node.property, state);
      }
    },
    MetaProperty(node, state) {
      state.write(node.meta.name + '.' + node.property.name, node);
    },
    Identifier(node, state) {
      state.write(node.name, node);
    },
    Literal(node, state) {
      if (node.raw != null) {
        state.write(node.raw, node);
      } else if (node.regex != null) {
        this.RegExpLiteral(node, state);
      } else {
        state.write(stringify(node.value), node);
      }
    },
    RegExpLiteral(node, state) {
      const { regex } = node;
      state.write(`/${regex.pattern}/${regex.flags}`, node);
    },
  };

  const EMPTY_OBJECT = {};

  class State {
    constructor(options) {
      const setup = options == null ? EMPTY_OBJECT : options;
      this.output = '';
      // Functional options
      if (setup.output != null) {
        this.output = setup.output;
        this.write = this.writeToStream;
      } else {
        this.output = '';
      }
      this.generator = setup.generator != null ? setup.generator : baseGenerator;
      // Formating setup
      this.indent = setup.indent != null ? setup.indent : '  ';
      this.lineEnd = setup.lineEnd != null ? setup.lineEnd : '\n';
      this.indentLevel =
        setup.startingIndentLevel != null ? setup.startingIndentLevel : 0;
      this.writeComments = setup.comments ? setup.comments : false;
      // Source map
      if (setup.sourceMap != null) {
        this.write =
          setup.output == null ? this.writeAndMap : this.writeToStreamAndMap;
        this.sourceMap = setup.sourceMap;
        this.line = 1;
        this.column = 0;
        this.lineEndSize = this.lineEnd.split('\n').length - 1;
        this.mapping = {
          original: null,
          generated: this,
          name: undefined,
          source: setup.sourceMap.file || setup.sourceMap._file,
        };
      }
    }

    write(code) {
      this.output += code;
    }

    writeToStream(code) {
      this.output.write(code);
    }

    writeAndMap(code, node) {
      this.output += code;
      this.map(code, node);
    }

    writeToStreamAndMap(code, node) {
      this.output.write(code);
      this.map(code, node);
    }

    map(code, node) {
      if (node != null && node.loc != null) {
        const { mapping } = this;
        mapping.original = node.loc.start;
        mapping.name = node.name;
        this.sourceMap.addMapping(mapping);
      }
      if (code.length > 0) {
        if (this.lineEndSize > 0) {
          if (code.endsWith(this.lineEnd)) {
            this.line += this.lineEndSize;
            this.column = 0;
          } else if (code[code.length - 1] === '\n') {
            // Case of inline comment
            this.line++;
            this.column = 0;
          } else {
            this.column += code.length;
          }
        } else {
          if (code[code.length - 1] === '\n') {
            // Case of inline comment
            this.line++;
            this.column = 0;
          } else {
            this.column += code.length;
          }
        }
      }
    }

    toString() {
      return this.output
    }
  }

  function generate(node, options) {
    /*
    Returns a string representing the rendered code of the provided AST `node`.
    The `options` are:

    - `indent`: string to use for indentation (defaults to `␣␣`)
    - `lineEnd`: string to use for line endings (defaults to `\n`)
    - `startingIndentLevel`: indent level to start from (defaults to `0`)
    - `comments`: generate comments if `true` (defaults to `false`)
    - `output`: output stream to write the rendered code to (defaults to `null`)
    - `generator`: custom code generator (defaults to `baseGenerator`)
    */
    const state = new State(options);
    // Travel through the AST node and generate the code
    state.generator[node.type](node, state);
    return state.output
  }

  /**
   * Abstract base class for a Stencila execution context
   *
   * Defines the Stencila `Context` API. The same methods (names and arguments) will be
   * implemented for all contexts regardless of implementation language. Semantics should be
   * consistent, but may need to differ, among implmentations.
   *
   * This class should be extended for JavaScript implementations. All methods return a Promise.
   */
  class Context {

    /**
     * Get the list of supported programming languages
     *
     * @override
     */
    supportedLanguages () {
      return Promise.resolve(new Error('Not implemented'))
    }

    /**
     * Analyse code and return the names of inputs, output and
     * implicitly returned value expression
     *
     * @param {string} code - Code to execute
     * @param {object} exprOnly - Check that code is a simple expression only?
     */
    analyseCode (code, exprOnly = false) { // eslint-disable-line no-unused-vars
      return this._analyseCode(code, exprOnly)
    }

    /**
     * Execute code within the context
     *
     * @param {string} code - Code to execute
     * @param {object} inputs - Value of input variables
     * @param {object} exprOnly - Check that code is a simple expression only?
     */
    executeCode (code = '', inputs = {}, exprOnly = false) { // eslint-disable-line no-unused-vars
      return this._executeCode(code, inputs, exprOnly)
    }

    /**
     * Does the context provide a function?
     *
     * @param  {string} name - Function name e.g. 'sum'
     * @return {array<string>} - A Promise resolving to a boolean value
     */
    hasFunction (name) { // eslint-disable-line no-unused-vars
      return Promise.reject(new Error('Not implemented'))
    }

    /**
     * Call a function
     *
     *
     * @param  {string} name - Function name e.g. 'sum'
     * @param {array} args - An array of unnamed arguments
     * @param {namedArgs} args - An object of named arguments
     * @param {object} options - Any execution options
     * @return {array<string>} - A Promise resolving to an object with any `errors` (an object with line numbers as keys) and `outputs` (
     *                         a data package)
     */
    callFunction (name, args, namedArgs, options) { // eslint-disable-line no-unused-vars
      return Promise.reject(new Error('Not implemented'))
    }

    _analyseCode (code, exprOnly) { // eslint-disable-line
      return Promise.reject(new Error('Not implemented'))
    }

    _executeCode (code = '', inputs = {}, exprOnly = false) { // eslint-disable-line no-unused-vars
      return Promise.reject(new Error('Not implemented'))
    }
  }

  /**
   * A Javascript context
   *
   * Implements the Stencila `Context` API. All methods return a Promise.
   *
   * @extends Context
   */
  class JsContext extends Context {

    constructor () {
      super();

      // Global variable names that should be ignored when determining code input during `analyseCode()`
      this._globals = [
        // A list of ES6 globals obtained using:
        //   const globals = require('globals')
        //   JSON.stringify(Object.keys(globals.es6))
        "Array","ArrayBuffer","Boolean","constructor","DataView","Date","decodeURI","decodeURIComponent",
        "encodeURI","encodeURIComponent","Error","escape","eval","EvalError","Float32Array","Float64Array",
        "Function","hasOwnProperty","Infinity","Int16Array","Int32Array","Int8Array","isFinite","isNaN",
        "isPrototypeOf","JSON","Map","Math","NaN","Number","Object","parseFloat","parseInt","Promise",
        "propertyIsEnumerable","Proxy","RangeError","ReferenceError","Reflect","RegExp","Set","String",
        "Symbol","SyntaxError","System","toLocaleString","toString","TypeError","Uint16Array","Uint32Array",
        "Uint8Array","Uint8ClampedArray","undefined","unescape","URIError","valueOf","WeakMap","WeakSet"
      ];

      this._libs = {
        core: libcore
      };
    }

    /**
     * Get the list of supported programming languages
     *
     * @override
     */
    supportedLanguages () {
      return Promise.resolve(
        ['js']
      )
    }

    /**
     * Analyse code and return the names of inputs, output and
     * implicitly returned value expression
     *
     * @override
     */
    _analyseCode (code, exprOnly = false, valueExpr = false) {
      let inputs = [];
      let output = null;
      let value = null;
      let messages = [];

      // Parse the code
      let ast;
      try {
        ast = parse(code);
      } catch (error) {
        messages.push(this._packError(error));
      }

      if (messages.length === 0 && exprOnly) {
        // Check for single expression only
        let fail = false;
        if (ast.body.length > 1) fail = true;
        let first = ast.body[0];
        if (!fail && first) {
          let simpleExpr = false;
          if (first.type === 'ExpressionStatement') {
            // Only allow simple expressions
            // See http://esprima.readthedocs.io/en/latest/syntax-tree-format.html#expressions-and-patterns
            // for a list of expression types
            let dissallowed = ['AssignmentExpression', 'UpdateExpression', 'AwaitExpression', 'Super'];
            if (dissallowed.indexOf(first.expression.type) < 0) {
              simpleExpr = true;
            }
          }
          fail = !simpleExpr;
        }
        if (fail) messages.push(this._packError(new Error ('Code is not a single, simple expression')));
      }

      if (messages.length === 0) {
        // Determine which names are declared and which are used
        let declared = [];
        walk_1(ast, {
          VariableDeclarator: node => {
            declared.push(node.id.name);
          },
          Identifier: node => {
            let name = node.name;
            if (declared.indexOf(name) < 0 && this._globals.indexOf(name) < 0) inputs.push(name);
          }
        }, walk_2);

        // If the last top level node in the AST is a VariableDeclaration or Identifier then use
        // the variable name as the output name
        let last = ast.body.pop();
        if (last) {
          if (last.type === 'VariableDeclaration') {
            output = last.declarations[0].id.name;
            value = output;
          } else if (last.type === 'ExpressionStatement') {
            if(last.expression.type === 'Identifier') {
              output = last.expression.name;
            }
            value = generate(last);
            if (value.slice(-1) === ';') value = value.slice(0, -1);
          }
        }
      }

      let result = {
        inputs,
        output,
        messages
      };
      if (valueExpr) result.value = value;
      return Promise.resolve(result)
    }

    /**
     * Execute JavaScript code
     *
     * @override
     */
    _executeCode (code = '', inputs = {}, exprOnly = false) {
      return this._analyseCode(code, exprOnly, true).then(codeAnalysis => {
        let inputNames = codeAnalysis.inputs;
        let outputName = codeAnalysis.output;
        let valueExpr = codeAnalysis.value;
        let value;
        let messages = codeAnalysis.messages;
        let stdout = '';
        let stderr = '';

        let errors = messages.filter(message => message.type === 'error').length;
        if (errors === 0) {
          // Extract the names and values of inputs to be used as arguments
          // (some inputs may be global and so their value in accessed directly from the function)
          let argNames = [];
          let argValues = [];
          inputNames.forEach(name => {
            let value = inputs[name];
            if (typeof value === 'undefined') {
              messages.push({
                line: 0,
                column: 0,
                type: 'warn',
                message: `Input variable "${name}" is not managed`
              });
            }
            else {
              argNames.push(name);
              argValues.push(this._unpackValue(value));
            }
          });

          // Capture console output functions
          let captureConsole = {
            log: function (txt) { stdout += txt; },
            info: function (txt) { stdout += txt; },
            warn: function (txt) { stdout += txt; },
            error: function (txt) { stderr += txt; }
          };
          let nullConsole = {
            log: function () {},
            info: function () {},
            warn: function () {},
            error: function () {}
          };

          // Add the return value of function to the code
          // (i.e. simulate implicit return)
          // To prevent duplication of console output
          if (valueExpr) code += `;\nconsole=nullConsole;return ${valueExpr};`;

          // Execute the function with the unpacked inputs.
          try {
            const func = new Function(...argNames, 'console', 'nullConsole', code); // eslint-disable-line no-new-func
            value = func(...argValues, captureConsole, nullConsole);
          } catch (error) {
            messages.push(this._packError(error));
          }
        }

        let streams = null;
        if (stdout.length || stderr.length) {
          streams = {
            stdout: stdout,
            stderr: stderr
          };
        }

        return {
          inputs: inputNames,
          output: outputName,
          value: this._packValue(value),
          messages: messages,
          streams: streams
        }
      })
    }

    libraries() {
      return Promise.resolve(this._libs)
    }

    importLibrary(library) {
      this._libs[library.name] = library;
    }

    /**
     * Does the context provide a function?
     *
     * @override
     */
    hasFunction (libName, functionName) {
      let has = false;
      const lib = this._libs[libName];
      if (lib) {
        if (lib[functionName]) has = true;
      }
      return Promise.resolve(has)
    }

    /**
     * Call a function
     *
     * @override
     */
    callFunction (libName, functionName, args = []) {
      if (!functionName) throw new Error("'name' is mandatory")

      const lib = this._libs[libName];
      if (!lib) throw new Error('No library registered with name: ' + libName)

      let func = lib.funcs[functionName];
      if (!func) throw new Error('No function with name: ' + functionName)

      let funcBody = func.body;
      if (!substance.isFunction(funcBody)) throw new Error(`Registered function with name ${functionName} is invalid!`)

      let values = args.map(arg => this._unpackValue(arg));

      let messages = [];
      let value;
      try {
        value = funcBody(...values);
      } catch (error) {
        messages.push(this._packError(error));
      }

      return Promise.resolve({
        messages: messages,
        value: this._packValue(value)
      })
    }

    /**
     * Unpack a value passed from the `Engine` or another `Context`
     */
    _unpackValue(packed) {
      return packed ? packed.data : null
    }

    /**
     * Pack a value for passing to `Engine` or another `Context`
     */
    _packValue (value) {
      if (substance.isNil(value)) return null
      let type;
      if (Number.isInteger(value)) type = 'integer';
      else type = value.type || typeof value;
      return {
        type: type,
        data: value
      }
    }

    /**
     * Pack an error into a {line, column, type, message} record
     *
     * @param {Error} error - Error object
     * @return {Object} - Error record
     */
    _packError (error) {
      let line = 0;
      let column = 0;
      let message;

      if (error instanceof SyntaxError && error.loc) {
        // Get message, line and columns numbers
        line = error.loc.line;
        column = error.loc.column;
        message = 'SyntaxError: ' + error.message;
      } else if (error.stack) {
        // Parse the error stack to get message, line and columns numbers
        let lines = error.stack.split('\n');
        let match = lines[1].match(/<anonymous>:(\d+):(\d+)/);
        if (match) {
          line = parseInt(match[1], 10) - 2;
          column = parseInt(match[2], 10);
        }
        message = lines[0] || error.message;
      } else {
        message = error.message;
      }

      return {
        line: line,
        column: column,
        type: 'error',
        message: message
      }
    }

  }

  class MiniContext {

    constructor(host) {
      this._host = host;
      this._functionManager = host.functionManager;
    }

    supportsLanguage(language) {
      return Promise.resolve(language === 'mini')
    }

    analyseCode(code, exprOnly = false) {
      return Promise.resolve(this._analyseCode(code, exprOnly))
    }

    executeCode(code = '', inputs = {}, exprOnly = false) {
      let codeAnalysis = this._analyseCode(code, exprOnly);
      if (codeAnalysis.expr) {
        return this._evaluateExpression(codeAnalysis, inputs)
      }
      return Promise.resolve(codeAnalysis)
    }

    /*
      Call a Mini function

      This gets called when evaluating a function call node within a Mini expression

    */
    callFunction(funcCall) {
      // TODO: change the signature of this by doing all mini AST related preparations before-hand
      const functionName = funcCall.name;

      // Ensure the function exists
      let funcDoc = this._functionManager.getFunction(functionName);
      if (!funcDoc) {
        return _error(`Could not find function "${functionName}"`)
      }

      // Get a context for the implementation language
      let {context, library} = this._functionManager.getContextLibrary(functionName);
      // Call the function implementation in the context, capturing any
      // messages or returning the value
      let args = funcCall.args.map(arg => arg.getValue());
      let namedArgs = {};
      for (let namedArg of funcCall.namedArgs) {
        namedArgs[namedArg.name] = namedArg.getValue();
      }
      return context.callFunction(library, functionName, args, namedArgs).then((res) => {
        if (res.messages && res.messages.length > 0) {
          funcCall.addErrors(res.messages);
          return undefined
        }
        return res.value
      })

      function _error(msg) {
        console.error(msg);
        funcCall.addErrors([{
          type: 'error',
          message: msg
        }]);
        return new Error(msg)
      }
    }

    _analyseCode(code) {
      if (!code) {
        return {
          inputs: [],
          output: undefined,
          messages: [],
          tokens: [],
          nodes: []
        }
      }
      let expr = stencilaMini.parse(code);
      let inputs, output, tokens, nodes;
      let messages = [];
      if (expr.syntaxError) {
        messages.push({
          type: 'error',
          message: expr.syntaxError.msg
        });
      }
      if (expr.inputs) {
        inputs = expr.inputs.map(node => {
          // TODO: instead of interpreting the symbols
          // the mini parser should just return the symbol
          return node.name
        });
      }
      if (expr.name) {
        output = expr.name;
      }
      if (expr.tokens) {
        // some tokens are used for code highlighting
        // some for function documentation
        tokens = expr.tokens;
      }

      nodes = [];
      expr.nodes.forEach((n) => {
        if (n.type === 'call') {
          let args = n.args.map((a) => {
            return {
              start: a.start,
              end: a.end
            }
          }).concat(n.namedArgs.map((a) => {
            return {
              start: a.start,
              end: a.end,
              name: a.name
            }
          }));
          let node = {
            type: 'function',
            name: n.name,
            start: n.start,
            end: n.end,
            args
          };
          nodes.push(node);
        }
      });

      return {
        expr,
        inputs,
        output,
        messages,
        tokens,
        nodes
      }
    }

    _evaluateExpression(res, values) {
      let expr = res.expr;
      if (expr.syntaxError) {
        return Promise.resolve(res)
      }
      return new Promise((resolve) => {
        expr.on('evaluation:finished', (val) => {
          expr.off('evaluation:finished');
          let errors = expr.root.errors;
          if (errors && errors.length > 0) {
            res.messages = errors;
            res.value = undefined;
          } else {
            res.value = val;
          }
          resolve(res);
        });
        expr.context = new ExprContext(this, values);
        expr.propagate();
      })
    }

  }

  /*
    This is passed as a context to a MiniExpression to resolve external symbols
    and for marshalling.
  */
  class ExprContext {

    constructor(parentContext, values) {
      this.parentContext = parentContext;
      this.values = values;
    }

    lookup(symbol) {
      switch(symbol.type) {
        case 'var': {
          return this.values[symbol.name]
        }
        case 'cell': {
          // TODO: would be good to have the symbol name stored in the symbol
          let name = getCellLabel(symbol.row, symbol.col);
          return this.values[name]
        }
        case 'range': {
          // TODO: would be good to have the symbol name stored in the symbol
          let startName = getCellLabel(symbol.startRow, symbol.startCol);
          let endName = getCellLabel(symbol.endRow, symbol.endCol);
          return this.values[`${startName}_${endName}`]
        }
        default:
          throw new Error('Invalid state')
      }
    }

    // used to create Stencila Values
    // such as { type: 'number', data: 5 }
    // TODO: coerce arrays,
    marshal(type$$1, value) {
      // TODO: maybe there are more cases where we want to
      // cast the type according to the value
      switch (type$$1) {
        case 'number': {
          return {
            type: 'number',
            data: value
          }
        }
        case 'array': {
          return gather('array', value)
        }
        case 'range': {
          // TODO: the API is bit inconsistent here
          // range already have a correct type because
          // they are gathered by the engine
          return value
        }
        default:
          return {
            type: type$$1,
            data: value
          }
      }
    }

    unmarshal(val) {
      // TODO: better understand if it is ok to make this robust
      // by guarding undefined values, and not obfuscating an error occurring elsewhere
      // it happened whenever undefined is returned by a called function
      if (!val) return undefined
      return val.data
    }

    callFunction(funcCall) {
      return this.parentContext.callFunction(funcCall)
    }

  }

  /**
   * A HTTP client for a remote `Context`
   *
   * Implements the `Context` API by remote procedure calls (RPC) to a remote
   * context (e.g. a `RContext` running in a different process)
   *
   * @extends Context
   */
  class ContextHttpClient extends Context {

    constructor(host, url, name) {
      super();
      this._host = host;
      this._peer = url;
      this._name = name;
    }

    /**
     * Get a list of libraries
     */
    libraries () {
      return this._host._put(this._peer, '/' + this._name + '!libraries')
    }

    /**
     * Analyse code
     *
     * @override
     */
    _analyseCode (code, exprOnly = false) {
      let pre = {
        type: 'cell',
        source: {
          type: 'text',
          data: code
        },
        expr: exprOnly
      };
      return this._host._put(this._peer, '/' + this._name + '!compile', pre).then(post => {
        return {
          inputs: post.inputs && post.inputs.map(input => input.name),
          output: post.outputs && post.outputs[0] && post.outputs[0].name,
          messages: post.messages
        }      
      })
    }

    /**
     * Execute code
     *
     * @override
     */
    _executeCode (code, inputs, exprOnly = false) {
      let pre = {
        type: 'cell',
        source: {
          type: 'text',
          data: code
        },
        expr: exprOnly,
        inputs: Object.entries(inputs).map(([name, value]) => {
          return {name, value}
        })
      };
      return this._host._put(this._peer, '/' + this._name + '!execute', pre).then(post => {
        let output = post.outputs && post.outputs[0] && post.outputs[0].name;
        let value = post.outputs && post.outputs[0] && post.outputs[0].value;
        if (value) {
          if (value.type === 'library') {
            this._host._functionManager.importLibrary(this, value.data);
          } else if (value.type === 'function') {
            this._host._functionManager.importFunction(this, value.data);
          }
        }
        return {
          inputs: post.inputs && post.inputs.map(input => input.name),
          output: output,
          value: value,
          messages: post.messages
        }
      })
    }

    callFunction (library, name, args, namedArgs) {
      let call = {
        type: 'call',
        func: {type: 'get', name: name},
        args, namedArgs
      };
      return this._host._put(this._peer, '/' + this._name + '!evaluate', call)
    }
  }

  /**
   * Each Stencila process has a single instance of the `Host` class which
   * orchestrates instances of executions contexts, including those in 
   * in other processses.
   */
  class Host extends substance.EventEmitter {

    constructor (options = {}) {
      super();

      /**
       * The id of this host. Used by other Stencila
       * hosts to uniquely identify this host.
       * e.g for sequence numbers when authenticating requests
       */
      this._id = 'client-host-' + substance.uuid();

      /**
       * Options used to configure this host
       *
       * @type {object}
       */
      this._options = options;

      /**
       * Stencila hosts known to this host.
       * A `Map` of `url` to `key`
       * 
       * @type {Map}
       */
      this._hosts = new Map();

      /**
       * Execution environments provided by other hosts.
       * A `Map` of `url` to `[environ]`
       * 
       * @type {Map}
       */
      this._environs = new Map();


      this._environ = 'local';

      /**
       * Stencila hosts that are peers (i.e. within the same
       * execution environment). A `Map` of `url` to `manifest`.
       *
       * @type {Map}
       */
      this._peers = new Map();

      /**
       * Instances managed by this host
       *
       * @type {object}
       */
      this._instances = {};

      /**
       * Execution contexts are currently managed separately to
       * ensure that there is only one for each language
       *
       * @type {object}
       */
      this._contexts = {};

      /**
       * Counts of instances of each class.
       * Used for consecutive naming of instances
       *
       * @type {object}
       */
      this._counts = {};

      /**
       * Execution engine for scheduling execution across contexts
       *
       * @type {Engine}
       */
      this._engine = options.engine || new Engine({ host: this });

      /**
       * Manages functions imported from libraries
       *
       * @type {FunctionManager}
       */
      this._functionManager = new FunctionManager();

    }

    // For compatability with Stencila Host Manifest API (as is stored in this._peers)

    /**
     * The URL of this internal host
     */
    get url() {
      return 'internal'
    }

    /**
     * The resource types supported by this internal host
     */
    get types() {
      return {
        JsContext: { name: 'JsContext' },
        MiniContext: { name: 'MiniContext' }
      }
    }

    // Getters...

    /**
     * Get this host's configuration options
     */
    get options () {
      return this._options
    }

    /**
     * Get known hosts
     */
    get hosts () {
      return this._hosts
    }

    /**
     * Get the environments registered with this host
     */
    get environs () {
      return this._environs
    }

    /**
     * Get this host's peers
     */
    get peers () {
      return this._peers
    }

    /**
     * Get the resource instances (e.g. contexts, storers) managed by this host
     */
    get instances() {
      return this._instances
    }

    /**
     * Get the execution contexts managed by this host
     */
    get contexts() {
      return this._contexts
    }

    /**
     * Get this host's execution engine
     */
    get engine () {
      return this._engine
    }

    /**
     * Get this host's function manager
     */
    get functionManager() {
      return this._functionManager
    }

    /**
     * Initialize this host
     *
     * @return {Promise} Initialisation promise
     */
    initialize () {
      const options = this._options;

      let promises = [
        // Always create a Javascript execution context for
        // execution of core functions
        this.createContext('js')
      ];

      // Seed with specified hosts
      let hosts = options.hosts;
      if (hosts) {
        for (let url of hosts) {
          let key = null;
          if (url === 'origin') url = options.origin;
          else if (url.indexOf('|') > -1) {
            let parts = url.split('|');
            url = parts[0];
            key = parts[1];
          }
          let promise = this.registerHost(url, key);
          promises.push(promise);
        }
      }

      // Start discovery of other peers
      if (options.discover) {
        this.discoverHosts(options.discover);
      }

      return Promise.all(promises).then(() => {
        const urls = Array.from(this._hosts.keys());
        if (urls.length > 0) {
          const url = urls[0];
          const host = this._hosts.get(url);
          const environs = host.manifest.environs;
          if (environs.length > 0) {
            this.selectEnviron(environs[0].id);
            return this.selectHost(url)
          }
        }
      }).then(() => {
        // Run the engine after connecting to any peer hosts so that they are connected 
        // (and have registered functions) before the engine attempts
        // to create contexts for external languages like R, SQL etc
        this._engine.run(10); // Refresh interval of 10ms
      })
    }

    selectEnviron (environId) {
      if (environId !== this._environ) {
        this._environ = environId;
        this.emit('environ:changed');
      }
    }

    registerHost (url, key = null, optimistic = false) {
      return this._request('GET', url + '/manifest').then(manifest => {
        if (manifest.stencila) {
          const host = {
            key,
            manifest,
            sent: 0,
            messages: []
          };
          this._hosts.set(url, host);
          this.emit('hosts:changed');
        }
      }).catch((error) => {
        if (!optimistic) throw error
      })
    }

    deregisterHost (url) {
      this._hosts.delete(url);
      this.emit('hosts:changed');
    }

    selectHost (url) {
      this._hosts.get(url).selected = true;
      this.emit('hosts:changed');
      return this._post(url, '/environ/' + this._environ).then(location => {
        let peerUrl;
        if (location.url) peerUrl = location.url;
        else if (location.path) peerUrl = url + location.path;
        else peerUrl = url;
        return this._get(peerUrl, '/manifest').then(manifest => {
          this._peers.set(peerUrl, manifest);
          this.emit('peers:changed');
        })
      })
    }

    deselectHost (url) {
      if (this._hosts.has(url)) {
        this._hosts.get(url).selected = false;
        this.emit('hosts:changed');
        return this._delete(url, '/environ/' + this._environ).then(() => {
          this._peers.delete(url);
          this.emit('peers:changed');
        })
      }
    }

    /**
     * Discover peers
     *
     * Currently, this method just does a port scan on the localhost to find
     * peers. More sophisticated peer discovery mechanisms for remote peers
     * will be implemented later.
     *
     * Unfortunately if a port is not open then you'll get a console error like
     * `GET http://127.0.0.1:2040/ net::ERR_CONNECTION_REFUSED`. In Chrome, this can
     * not be avoided programatically (see http://stackoverflow.com/a/43056626/4625911).
     * The easiest approach is silence these errors in Chrome is to check the
     * 'Hide network' checkbox in the console filter.
     *
     * Set the `interval` parameter to a value greater than zero to trigger ongoing discovery and
     * to a negative number to turn off discovery.
     *
     * @param {number} interval - The interval (seconds) between discovery attempts
     */
    discoverHosts (interval=10) {
      this.options.discover = interval;
      if (interval >= 0) {
        for (let port=2000; port<=2100; port+=10) {
          this.registerHost(`http://127.0.0.1:${port}`, null, true);
        }
        if (interval > 0) {
          this.discoverHosts(-1); // Ensure any existing interval is turned off
          this._discoverHostsInterval = setInterval(() => this.discoverHosts(0), interval*1000);
        }
      } else {
        if (this._discoverHostsInterval) {
          clearInterval(this._discoverHostsInterval);
          this._discoverHostsInterval = null;
        }
      }
    }

    /**
     * Create a new instance of a resource
     *
     * @param  {string} type - Name of class of instance
     * @param  {string} name - Name for new instance
     * @return {Promise} Resolves to an instance
     */
    create (type, args) {
      // Register a created instance
      let _register = (id, host, type, instance) => {
        this._instances[id] = {host, type, instance};
        this.emit('instance:created');
      };

      // Look for type in peer hosts
      for (let [url, manifest] of this._peers) {
        for (let spec of Object.values(manifest.types)) {
          if (spec.name === type) {
            return this._post(url, '/' + type, args).then(id => {
              let Client;
              if (spec.client === 'ContextHttpClient') Client = ContextHttpClient;
              else throw new Error(`Unsupported type: ${spec.client}`)

              let instance = new Client(this, url, id);
              _register(id, url, type, instance);
              return {id, instance}
            })
          }
        }
      }

      // Fallback to providing an in-browser instances of resources where available
      let instance;
      if (type === 'JsContext') {
        instance = new JsContext();
      } else if (type === 'MiniContext') {
        // MiniContext requires a pointer to this host so that
        // it can obtain other contexts for executing functions
        instance = new MiniContext(this);
      } else {
        // Resolve an error so that this does not get caught in debugger during
        // development and instead handle error elsewhere
        return Promise.resolve(new Error(`No peers able to provide: ${type}`))
      }

      // Generate an id for the instance
      let number = (this._counts[type] || 0) + 1;
      this._counts[type] = number;
      let id = type[0].toLowerCase() + type.substring(1) + number;
      _register(id, this.url, type, instance);

      return Promise.resolve({id, instance})
    }

    /**
     * Create an execution context for a particular language
     */
    createContext(language) {
      const context = this._contexts[language];
      if (context) return context
      else {
        const type = {
          'js': 'JsContext',
          'mini': 'MiniContext',
          'node': 'NodeContext',
          'py': 'PythonContext',
          'pyjp': 'JupyterContext',
          'r': 'RContext',
          'sql': 'SqliteContext'
        }[language];

        const options = {
          'pyjp': {
            language: 'python'
          }
        }[language] || {};

        if (!type) {
          return Promise.reject(new Error(`Unable to create an execution context for language ${language}`))
        } else {
          const promise = this.create(type, options).then((result) => {
            if (result instanceof Error) {
              // Unable to create so set the cached context promise to null
              // so a retry is performed next time this method is called
              // (at which time another peer that provides the context may be available)
              this._contexts[language] = null;
              return result
            } else {
              // Get a list of fuctions from the context so that `FunctionManager` can
              // dispatch a `call` operation to the context if necessary. Implemented
              // optimistically i.e. will not fail if the context does not implement `libraries`
              const context = result.instance;
              if (typeof context.libraries === 'function') {
                return context.libraries().then((libraries) => {
                  this._functionManager.importLibraries(context, libraries);
                  return context
                }).catch((error) => {
                  console.log(error); // eslint-disable-line
                })
              } else {
                return context
              }
            }
          });
          this._contexts[language] = promise;
          return promise
        }
      }
    }

    _get(host, path) {
      const token = this._token(host);
      return this._request('GET', host + path, null, token)
    }

    _post(host, path, data) {
      const token = this._token(host);
      return this._request('POST', host + path, data, token)
    }

    _put(host, path, data) {
      const token = this._token(host);
      return this._request('PUT', host + path, data || {}, token)
    }

    _delete(host, path) {
      const token = this._token(host);
      return this._request('DELETE', host + path, null, token)
    }

    _token(url) {
      const host = this._hosts.get(url);
      if (!host) return
      const key = host.key;
      if (!key) return
      const iat = Math.round(Date.now() / 1000);
      const hid = this._id;
      const seq = host.sent + 1;
      host.sent = seq;
      const payload = { iat, hid, seq };
      const token = KJUR_1.jws.JWS.sign('HS256', '{"alg":"HS256","typ":"JWT"}', payload, {rstr: key});
      return token
    }

    _request (method, url, data, token) {
      var XMLHttpRequest;
      if (typeof window === 'undefined') XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
      else XMLHttpRequest = window.XMLHttpRequest;

      return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open(method, url, true);
        request.setRequestHeader('Accept', 'application/json');
        // Send any credentials (e.g. cookies) in request headers
        // (necessary for remote peers)
        request.withCredentials = true;

        if (token) {
          request.setRequestHeader('Authorization', 'Bearer ' + token);
        }

        request.onload = function () {
          let result;
          try {
            result = JSON.parse(request.responseText);
          } catch (error) {
            result = request.responseText;
          }
          if (request.status >= 200 && request.status < 400) {
            resolve(result);
          } else {
            reject({
              status: request.status,
              body: result
            });
          }
        };

        request.onerror = function () {
          reject(new Error('An error occurred with request "' + method + ' ' + url + '"'));
        };

        if (data) {
          request.setRequestHeader('Content-Type', 'application/json');
          request.send(JSON.stringify(data));
        } else {
          request.send();
        }
      })
    }
  }

  /*
    In-memory buffer (cmp. mini filesytem) for representing Substance together
    with assets

    TODO: This needs to be rethought
  */
  class MemoryBuffer {
    /*
      Takes a vfs with multiple publications, each in a folder.
      The publicationId is used as a scope
    */
    constructor(vfs, publicationId) {
      this.publicationId = publicationId;
      this.vfs = vfs;
    }

    /*
      File data must either be a utf8 string or a blob object
    */
    writeFile(/*path, mimeType, data*/) {
      throw new Error('Not yet implemented.')
    }

    readFile(path) {
      return new Promise((resolve, reject) => {
        let file = this.vfs.readFileSync(this.publicationId+"/"+path);
        if (file) {
          resolve(file);
        } else {
          reject(new Error('File not found'));
        }
      })
    }

  }

  class MemoryBackend {
    /*
      Takes an object with documentIds and HTML content
    */
    constructor(vfs) {
      this.vfs = vfs;
    }

    /*
      Returns a buffer object.

      Use MemoryBuffer implementation as an API reference
    */
    getBuffer(publicationId) {
      let buffer = new MemoryBuffer(this.vfs, `data/${publicationId}`);
      return Promise.resolve(buffer)
    }

    storeBuffer(/*buffer*/) {
      return Promise.resolve()
    }

    updateManifest(/* documentId, props */) {
      return Promise.resolve()
    }

  }

  class ReproFigComponent extends substance.NodeComponent {

    render($$) {
      const node = this.props.node;

      let el = $$('div')
        .addClass('sc-'+node.type)
        .attr('data-id', node.id);

      let label = substanceTexture.getLabel(node);
      let labelEl = $$('div').addClass('se-label').text(label);
      el.append(labelEl);

      const figType = this._getContentType();
      const content = node.findChild(figType);
      let contentEl;
      if (content) {
        contentEl = $$(this.getComponent(figType), {
          node: content,
          disabled: true // HACK: in reader we always want to disable
        });
        el.append(contentEl.ref('content'));
      }

      const title = node.findChild('title');
      let titleEl = $$(this.getComponent('text-property-editor'), {
        path: title.getPath(),
        disabled: true, // HACK: in reader we always want to disable
        placeholder: 'Enter Title'
      }).addClass('se-title').ref('title');
      el.append(titleEl);

      const caption = node.findChild('caption');
      let captionEl;
      if (caption) {
        captionEl = $$(this.getComponent('caption'), {
          node: caption,
          disabled: true // HACK: in reader we always want to disable
        });
      }
      el.append(captionEl.ref('caption'));
      return el
    }

    _getContentType() {
      return 'cell'
    }

    _onLabelsChanged(refType) {
      if (refType === this.props.node.type) {
        this.rerender();
      }
    }

  }

  /*
    Renders a keyboard-selectable reproducable figure target item
  */
  class ReproFigPreview extends substance.NodeComponent {

    render($$) {
      let node = this.props.node;
      let el = $$('div')
        .addClass('sc-repro-fig-preview')
        .attr({'data-id': node.id});

      if (this.props.selected) {
        el.addClass('sm-selected');
      }

      el.append(
        this._renderLabel($$)
      );
      return el
    }

    _renderLabel($$) {
      const node = this.props.node;
      const label = node && node.state ? this.getLabel(node.state.label) : '';

      return $$('div').addClass('se-label').append(label)
    }
  }

  class ValueComponent extends substance.Component {

    render($$) {
      const registry = this.context.componentRegistry;
      let el = $$('div').addClass('sc-cell-value');
      
      let valueType = this.props.type;
      let ValueDisplay = registry.get('value:'+valueType);
      // Use the `ObjectValueComponent` by default since most of the time
      // types without a registered component will be 'extended' types (i.e objects with a type property)
      if (!ValueDisplay) ValueDisplay = registry.get('value:object');

      let value = this.props;
      let pointer = false;
      if (!value.data && value.preview) {
        pointer = true;
        value = {
          type: value.type,
          data: value.preview
        };
      }

      let valueEl = $$(ValueDisplay, {value, pointer}).ref('value');
      el.append(valueEl);

      return el
    }

  }

  const _self = {};
  /** START prism-core.js **/
  var Prism = (function(){

  // Private helper vars
  var lang = /\blang(?:uage)?-(\w+)\b/i;
  var uniqueId = 0;

  var _ = _self.Prism = {
  	manual: _self.Prism && _self.Prism.manual,
  	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
  	util: {
  		encode: function (tokens) {
  			if (tokens instanceof Token) {
  				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
  			} else if (_.util.type(tokens) === 'Array') {
  				return tokens.map(_.util.encode);
  			} else {
  				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
  			}
  		},

  		type: function (o) {
  			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
  		},

  		objId: function (obj) {
  			if (!obj['__id']) {
  				Object.defineProperty(obj, '__id', { value: ++uniqueId });
  			}
  			return obj['__id'];
  		},

  		// Deep clone a language definition (e.g. to extend it)
  		clone: function (o) {
  			var type = _.util.type(o);

  			switch (type) {
  				case 'Object':
  					var clone = {};

  					for (var key in o) {
  						if (o.hasOwnProperty(key)) {
  							clone[key] = _.util.clone(o[key]);
  						}
  					}

  					return clone;

  				case 'Array':
  					return o.map(function(v) { return _.util.clone(v); });
  			}

  			return o;
  		}
  	},

  	languages: {
  		extend: function (id, redef) {
  			var lang = _.util.clone(_.languages[id]);

  			for (var key in redef) {
  				lang[key] = redef[key];
  			}

  			return lang;
  		},

  		/**
  		 * Insert a token before another token in a language literal
  		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
  		 * we cannot just provide an object, we need anobject and a key.
  		 * @param inside The key (or language id) of the parent
  		 * @param before The key to insert before. If not provided, the function appends instead.
  		 * @param insert Object with the key/value pairs to insert
  		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
  		 */
  		insertBefore: function (inside, before, insert, root) {
  			root = root || _.languages;
  			var grammar = root[inside];

  			if (arguments.length == 2) {
  				insert = arguments[1];

  				for (var newToken in insert) {
  					if (insert.hasOwnProperty(newToken)) {
  						grammar[newToken] = insert[newToken];
  					}
  				}

  				return grammar;
  			}

  			var ret = {};

  			for (var token in grammar) {

  				if (grammar.hasOwnProperty(token)) {

  					if (token == before) {

  						for (var newToken in insert) {

  							if (insert.hasOwnProperty(newToken)) {
  								ret[newToken] = insert[newToken];
  							}
  						}
  					}

  					ret[token] = grammar[token];
  				}
  			}

  			// Update references in other language definitions
  			_.languages.DFS(_.languages, function(key, value) {
  				if (value === root[inside] && key != inside) {
  					this[key] = ret;
  				}
  			});

  			return root[inside] = ret;
  		},

  		// Traverse a language definition with Depth First Search
  		DFS: function(o, callback, type, visited) {
  			visited = visited || {};
  			for (var i in o) {
  				if (o.hasOwnProperty(i)) {
  					callback.call(o, i, o[i], type || i);

  					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
  						visited[_.util.objId(o[i])] = true;
  						_.languages.DFS(o[i], callback, null, visited);
  					}
  					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
  						visited[_.util.objId(o[i])] = true;
  						_.languages.DFS(o[i], callback, i, visited);
  					}
  				}
  			}
  		}
  	},
  	plugins: {},

  	highlightAll: function(async, callback) {
  		_.highlightAllUnder(document, async, callback);
  	},

  	highlightAllUnder: function(container, async, callback) {
  		var env = {
  			callback: callback,
  			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
  		};

  		_.hooks.run("before-highlightall", env);

  		var elements = env.elements || container.querySelectorAll(env.selector);

  		for (var i=0, element; element = elements[i++];) {
  			_.highlightElement(element, async === true, env.callback);
  		}
  	},

  	highlightElement: function(element, async, callback) {
  		// Find language
  		var language, grammar, parent = element;

  		while (parent && !lang.test(parent.className)) {
  			parent = parent.parentNode;
  		}

  		if (parent) {
  			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
  			grammar = _.languages[language];
  		}

  		// Set language on the element, if not present
  		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

  		if (element.parentNode) {
  			// Set language on the parent, for styling
  			parent = element.parentNode;

  			if (/pre/i.test(parent.nodeName)) {
  				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
  			}
  		}

  		var code = element.textContent;

  		var env = {
  			element: element,
  			language: language,
  			grammar: grammar,
  			code: code
  		};

  		_.hooks.run('before-sanity-check', env);

  		if (!env.code || !env.grammar) {
  			if (env.code) {
  				_.hooks.run('before-highlight', env);
  				env.element.textContent = env.code;
  				_.hooks.run('after-highlight', env);
  			}
  			_.hooks.run('complete', env);
  			return;
  		}

  		_.hooks.run('before-highlight', env);

  		if (async && _self.Worker) {
  			var worker = new Worker(_.filename);

  			worker.onmessage = function(evt) {
  				env.highlightedCode = evt.data;

  				_.hooks.run('before-insert', env);

  				env.element.innerHTML = env.highlightedCode;

  				callback && callback.call(env.element);
  				_.hooks.run('after-highlight', env);
  				_.hooks.run('complete', env);
  			};

  			worker.postMessage(JSON.stringify({
  				language: env.language,
  				code: env.code,
  				immediateClose: true
  			}));
  		}
  		else {
  			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

  			_.hooks.run('before-insert', env);

  			env.element.innerHTML = env.highlightedCode;

  			callback && callback.call(element);

  			_.hooks.run('after-highlight', env);
  			_.hooks.run('complete', env);
  		}
  	},

  	highlight: function (text, grammar, language) {
  		var tokens = _.tokenize(text, grammar);
  		return Token.stringify(_.util.encode(tokens), language);
  	},

  	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
  		var Token = _.Token;

  		for (var token in grammar) {
  			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
  				continue;
  			}

  			if (token == target) {
  				return;
  			}

  			var patterns = grammar[token];
  			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

  			for (var j = 0; j < patterns.length; ++j) {
  				var pattern = patterns[j],
  					inside = pattern.inside,
  					lookbehind = !!pattern.lookbehind,
  					greedy = !!pattern.greedy,
  					lookbehindLength = 0,
  					alias = pattern.alias;

  				if (greedy && !pattern.pattern.global) {
  					// Without the global flag, lastIndex won't work
  					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
  					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
  				}

  				pattern = pattern.pattern || pattern;

  				// Don’t cache length as it changes during the loop
  				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

  					var str = strarr[i];

  					if (strarr.length > text.length) {
  						// Something went terribly wrong, ABORT, ABORT!
  						return;
  					}

  					if (str instanceof Token) {
  						continue;
  					}

  					pattern.lastIndex = 0;

  					var match = pattern.exec(str),
  					    delNum = 1;

  					// Greedy patterns can override/remove up to two previously matched tokens
  					if (!match && greedy && i != strarr.length - 1) {
  						pattern.lastIndex = pos;
  						match = pattern.exec(text);
  						if (!match) {
  							break;
  						}

  						var from = match.index + (lookbehind ? match[1].length : 0),
  						    to = match.index + match[0].length,
  						    k = i,
  						    p = pos;

  						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
  							p += strarr[k].length;
  							// Move the index i to the element in strarr that is closest to from
  							if (from >= p) {
  								++i;
  								pos = p;
  							}
  						}

  						/*
  						 * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
  						 * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
  						 */
  						if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
  							continue;
  						}

  						// Number of tokens to delete and replace with the new match
  						delNum = k - i;
  						str = text.slice(pos, p);
  						match.index -= pos;
  					}

  					if (!match) {
  						if (oneshot) {
  							break;
  						}

  						continue;
  					}

  					if(lookbehind) {
  						lookbehindLength = match[1].length;
  					}

  					var from = match.index + lookbehindLength,
  					    match = match[0].slice(lookbehindLength),
  					    to = from + match.length,
  					    before = str.slice(0, from),
  					    after = str.slice(to);

  					var args = [i, delNum];

  					if (before) {
  						++i;
  						pos += before.length;
  						args.push(before);
  					}

  					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

  					args.push(wrapped);

  					if (after) {
  						args.push(after);
  					}

  					Array.prototype.splice.apply(strarr, args);

  					if (delNum != 1)
  						_.matchGrammar(text, strarr, grammar, i, pos, true, token);

  					if (oneshot)
  						break;
  				}
  			}
  		}
  	},

  	tokenize: function(text, grammar, language) {
  		var strarr = [text];

  		var rest = grammar.rest;

  		if (rest) {
  			for (var token in rest) {
  				grammar[token] = rest[token];
  			}

  			delete grammar.rest;
  		}

  		_.matchGrammar(text, strarr, grammar, 0, 0, false);

  		return strarr;
  	},

  	hooks: {
  		all: {},

  		add: function (name, callback) {
  			var hooks = _.hooks.all;

  			hooks[name] = hooks[name] || [];

  			hooks[name].push(callback);
  		},

  		run: function (name, env) {
  			var callbacks = _.hooks.all[name];

  			if (!callbacks || !callbacks.length) {
  				return;
  			}

  			for (var i=0, callback; callback = callbacks[i++];) {
  				callback(env);
  			}
  		}
  	}
  };

  var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
  	this.type = type;
  	this.content = content;
  	this.alias = alias;
  	// Copy of the full string this token was created from
  	this.length = (matchedStr || "").length|0;
  	this.greedy = !!greedy;
  };

  Token.stringify = function(o, language, parent) {
  	if (typeof o == 'string') {
  		return o;
  	}

  	if (_.util.type(o) === 'Array') {
  		return o.map(function(element) {
  			return Token.stringify(element, language, o);
  		}).join('');
  	}

  	var env = {
  		type: o.type,
  		content: Token.stringify(o.content, language, parent),
  		tag: 'span',
  		classes: ['token', o.type],
  		attributes: {},
  		language: language,
  		parent: parent
  	};

  	if (o.alias) {
  		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
  		Array.prototype.push.apply(env.classes, aliases);
  	}

  	_.hooks.run('wrap', env);

  	var attributes = Object.keys(env.attributes).map(function(name) {
  		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
  	}).join(' ');

  	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

  };

  if (!_self.document) {
  	if (!_self.addEventListener) {
  		// in Node.js
  		return _self.Prism;
  	}

  	if (!_.disableWorkerMessageHandler) {
  		// In worker
  		_self.addEventListener('message', function (evt) {
  			var message = JSON.parse(evt.data),
  				lang = message.language,
  				code = message.code,
  				immediateClose = message.immediateClose;

  			_self.postMessage(_.highlight(code, _.languages[lang], lang));
  			if (immediateClose) {
  				_self.close();
  			}
  		}, false);
  	}

  	return _self.Prism;
  }

  //Get current script and highlight
  var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  if (script) {
  	_.filename = script.src;

  	if (!_.manual && !script.hasAttribute('data-manual')) {
  		if(document.readyState !== "loading") {
  			if (window.requestAnimationFrame) {
  				window.requestAnimationFrame(_.highlightAll);
  			} else {
  				window.setTimeout(_.highlightAll, 16);
  			}
  		}
  		else {
  			document.addEventListener('DOMContentLoaded', _.highlightAll);
  		}
  	}
  }

  return _self.Prism;

  })();
  /** END prism-core.js **/
  /** START prism-clike.js **/
  Prism.languages.clike = {
  	'comment': [
  		{
  			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
  			lookbehind: true
  		},
  		{
  			pattern: /(^|[^\\:])\/\/.*/,
  			lookbehind: true
  		}
  	],
  	'string': {
  		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
  		greedy: true
  	},
  	'class-name': {
  		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
  		lookbehind: true,
  		inside: {
  			punctuation: /[.\\]/
  		}
  	},
  	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  	'boolean': /\b(?:true|false)\b/,
  	'function': /[a-z0-9_]+(?=\()/i,
  	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
  	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
  	'punctuation': /[{}[\];(),.:]/
  };

  /** END prism-clike.js **/
  /** START prism-r.js **/
  Prism.languages.r = {
  	'comment': /#.*/,
  	'string': {
  		pattern: /(['"])(?:\\.|(?!\1)[^\\\r\n])*\1/,
  		greedy: true
  	},
  	'percent-operator': {
  		// Includes user-defined operators
  		// and %%, %*%, %/%, %in%, %o%, %x%
  		pattern: /%[^%\s]*%/,
  		alias: 'operator'
  	},
  	'boolean': /\b(?:TRUE|FALSE)\b/,
  	'ellipsis': /\.\.(?:\.|\d+)/,
  	'number': [
  		/\b(?:NaN|Inf)\b/,
  		/\b(?:0x[\dA-Fa-f]+(?:\.\d*)?|\d*\.?\d+)(?:[EePp][+-]?\d+)?[iL]?\b/
  	],
  	'keyword': /\b(?:if|else|repeat|while|function|for|in|next|break|NULL|NA|NA_integer_|NA_real_|NA_complex_|NA_character_)\b/,
  	'operator': /->?>?|<(?:=|<?-)?|[>=!]=?|::?|&&?|\|\|?|[+*\/^$@~]/,
  	'punctuation': /[(){}\[\],;]/
  };
  /** END prism-r.js **/
  /** START prism-python.js **/
  Prism.languages.python = {
  	'comment': {
  		pattern: /(^|[^\\])#.*/,
  		lookbehind: true
  	},
  	'triple-quoted-string': {
  		pattern: /("""|''')[\s\S]+?\1/,
  		greedy: true,
  		alias: 'string'
  	},
  	'string': {
  		pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
  		greedy: true
  	},
  	'function': {
  		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
  		lookbehind: true
  	},
  	'class-name': {
  		pattern: /(\bclass\s+)\w+/i,
  		lookbehind: true
  	},
  	'keyword': /\b(?:as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|pass|print|raise|return|try|while|with|yield)\b/,
  	'builtin':/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
  	'boolean': /\b(?:True|False|None)\b/,
  	'number': /\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,
  	'operator': /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,
  	'punctuation': /[{}[\];(),.:]/
  };

  /** END prism-python.js **/
  /** START prism-sql.js **/
  Prism.languages.sql= {
  	'comment': {
  		pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
  		lookbehind: true
  	},
  	'string' : {
  		pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\])*\2/,
  		greedy: true,
  		lookbehind: true
  	},
  	'variable': /@[\w.$]+|@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
  	'function': /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/i, // Should we highlight user defined functions too?
  	'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR VARYING|CHARACTER (?:SET|VARYING)|CHARSET|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|DATA(?:BASES?)?|DATE(?:TIME)?|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITER(?:S)?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE(?: PRECISION)?|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE(?:D BY)?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEYS?|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL(?: CHAR VARYING| CHARACTER(?: VARYING)?| VARCHAR)?|NATURAL|NCHAR(?: VARCHAR)?|NEXT|NO(?: SQL|CHECK|CYCLE)?|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READ(?:S SQL DATA|TEXT)?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START(?:ING BY)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED BY|TEXT(?:SIZE)?|THEN|TIMESTAMP|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNPIVOT|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?)\b/i,
  	'boolean': /\b(?:TRUE|FALSE|NULL)\b/i,
  	'number': /\b-?(?:0x)?\d*\.?[\da-f]+\b/,
  	'operator': /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|IN|LIKE|NOT|OR|IS|DIV|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
  	'punctuation': /[;[\]()`,.]/
  };
  /** END prism-sql.js **/
  /** START prism-javascript.js **/
  Prism.languages.javascript = Prism.languages.extend('clike', {
  	'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
  	'number': /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/,
  	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  	'function': /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i,
  	'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
  });

  Prism.languages.insertBefore('javascript', 'keyword', {
  	'regex': {
  		pattern: /(^|[^/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
  		lookbehind: true,
  		greedy: true
  	},
  	// This must be declared before keyword because we use "function" inside the look-forward
  	'function-variable': {
  		pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
  		alias: 'function'
  	}
  });

  Prism.languages.insertBefore('javascript', 'string', {
  	'template-string': {
  		pattern: /`(?:\\[\s\S]|[^\\`])*`/,
  		greedy: true,
  		inside: {
  			'interpolation': {
  				pattern: /\$\{[^}]+\}/,
  				inside: {
  					'interpolation-punctuation': {
  						pattern: /^\$\{|\}$/,
  						alias: 'punctuation'
  					},
  					rest: Prism.languages.javascript
  				}
  			},
  			'string': /[\s\S]+/
  		}
  	}
  });

  if (Prism.languages.markup) {
  	Prism.languages.insertBefore('markup', 'tag', {
  		'script': {
  			pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
  			lookbehind: true,
  			inside: Prism.languages.javascript,
  			alias: 'language-javascript',
  			greedy: true
  		}
  	});
  }

  Prism.languages.js = Prism.languages.javascript;

  const CELL = /\b([a-z0-9_]+[!])?([A-Z]{1,3}[1-9][0-9]*)(?:[:]([A-Z]{1,3}[1-9][0-9]*))?\b/;
  const DEF = /(^|\n)[a-zA-Z_$][a-zA-Z_$0-9]*(?=\s*[=])/;
  const KEY = /\b[a-zA-Z_$][a-zA-Z_$0-9]*(?=\s*[=:])/;
  const ID$1 = /\b[a-zA-Z_$][a-zA-Z_$0-9]*\b/;

  let languages = {};

  languages['mini'] = {
    // taken from Prism.languages.clike.string
    'string': {
      pattern: /(["])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      greedy: true
    },
    'boolean': /\b(?:true|false)\b/,
    'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
    'function': /[a-z0-9_]+(?=\()/i,
    'lparen': /[(]/,
    'rparen': /[)]/,
    'comma': /[,]/,
    'cell': CELL,
    'def': { pattern: DEF, greedy: true },
    'key': { pattern: KEY, greedy: true },
    'id': { pattern: ID$1, greedy: true }
  };

  Prism.languages.insertBefore('r', 'punctuation', {
    'function': /[a-z0-9_]+(?=\()/i,
    'lparen': /[(]/,
    'rparen': /[)]/,
    'comma': /[,]/,
    'cell': CELL,
    'def': { pattern: DEF, greedy: true },
    'key': { pattern: KEY, greedy: true },
    'id': { pattern: ID$1, greedy: true }
  });
  languages['r'] = Prism.languages.r;

  Prism.languages.insertBefore('python', 'punctuation', {
    'function': /[a-z0-9_]+(?=\()/i,
    'lparen': /[(]/,
    'rparen': /[)]/,
    'comma': /[,]/,
    'cell': CELL,
    'def': { pattern: DEF, greedy: true },
    'key': { pattern: KEY, greedy: true },
    'id': { pattern: ID$1, greedy: true }
  });
  languages['python'] = languages['py'] = languages['pyjp'] = Prism.languages.python;

  Prism.languages.insertBefore('javascript', 'punctuation', {
    'function': /[a-z0-9_]+(?=\()/i,
    'lparen': /[(]/,
    'rparen': /[)]/,
    'comma': /[,]/,
    'cell': CELL,
    'def': { pattern: DEF, greedy: true },
    'key': { pattern: KEY, greedy: true },
    'id': { pattern: ID$1, greedy: true }
  });
  languages['js'] = languages['node'] = languages['javascript'] = Prism.languages.javascript;

  Prism.languages.insertBefore('sql', 'punctuation', {
    'function': /[a-z0-9_]+(?=\()/i,
    'lparen': /[(]/,
    'rparen': /[)]/,
    'comma': /[,]/,
    'cell': CELL,
    'def': { pattern: DEF, greedy: true },
    'key': { pattern: KEY, greedy: true },
    'id': { pattern: ID$1, greedy: true }
  });
  languages['sql'] = Prism.languages.sql;

  function tokenize (code, lang) {
    let grammar = languages[lang];
    if (!grammar) {
      console.error(`No tokenizer registered for language ${lang}`);
      return []
    }
    let prismTokens = Prism.tokenize(code, grammar);
    let tokens = [];
    let pos = 0;
    for (let i = 0; i < prismTokens.length; i++) {
      let t = prismTokens[i];
      let start = pos;
      let end = pos + t.length;
      switch (typeof t) {
        case 'array':
        case 'string': {
          break
        }
        default:
          tokens.push({
            type: t.type,
            text: t.content,
            start,
            end
          });
      }
      pos = end;
    }
    return tokens
  }

  // pseudo-parsing to collect information about functions
  function analyseCode (code, lang = 'mini') {
    let tokens = tokenize(code, lang);
    let symbols = extractSymbols(code);
    let nodes = [];
    let calls = [];

    function _push (end) {
      let currentCall = calls[0];
      if (currentCall) {
        // tidy up
        delete currentCall.pos;
        delete currentCall.inArgs;
        currentCall.end = end;
        nodes.push(currentCall);
        calls.shift();
      }
    }

    for (let i = 0; i < tokens.length; i++) {
      const currentCall = calls[0];
      const t = tokens[i];
      switch (t.type) {
        case 'function': {
          let call = {
            type: 'function',
            name: t.text,
            start: t.start,
            // we want the end position of the closing paren here
            end: -1,
            args: [],
            // state used for extracting location of args
            pos: t.end,
            inArgs: false
          };
          calls.unshift(call);
          break
        }
        case 'lparen': {
          if (currentCall && !currentCall.inArgs) {
            currentCall.inArgs = true;
            currentCall.pos = t.end;
            tokens.splice(i--, 1);
          }
          break
        }
        case 'comma': {
          if (currentCall) {
            currentCall.args.push({
              start: currentCall.pos,
              end: t.start
            });
            currentCall.pos = t.end;
            tokens.splice(i--, 1);
          }
          break
        }
        case 'rparen': {
          if (currentCall) {
            if (t.start > currentCall.pos) {
              currentCall.args.push({
                start: currentCall.pos,
                end: t.start
              });
              currentCall.pos = t.end;
            }
          }
          _push(t.end);
          tokens.splice(i--, 1);
          break
        }
        default:
          //
      }
    }
    // also push incomplete function calls
    _push(code.length);

    return { tokens, symbols, nodes }
  }

  class CodeEditor extends substance.Component {

    didMount() {
      super.didMount();

      // this is used to run the code analysis
      this.context.editorSession.onUpdate('document', this._onCodeUpdate, this, {
        path: this.props.path
      });

      this._onCodeUpdate();
    }

    dispose() {
      super.dispose();

      this.context.editorSession.off(this);
    }

    render($$) {
      let el = $$('div').addClass('sc-code-editor');
      // the source code
      const path = this.props.path;
      const commands = this.props.commands;
      const excludedCommands = this.props.excludedCommands;
      let content = $$(substance.TextPropertyEditor, {
        // TextPropertyEditor props
        name: this.props.name,
        path,
        disabled: this.props.disabled,
        multiLine: this.props.multiline,
        // Surface props
        commands,
        excludedCommands,
        handleEnter: false,
        handleTab: false
      }).ref('contentEditor');
      if (this.props.multiline) {
        content.on('enter', this._onEnterKey);
        content.on('tab', this._onTabKey);
      }
      content.addClass('se-content');
      el.append(content);
      return el
    }

    getSurfaceId() {
      return this.refs.contentEditor.getId()
    }

    _onCodeUpdate() {
      let code = this._getCode();
      let shouldAnalyse = true;
      // TODO: how can we generalize this?
      // in spreadsheet cells there must be a leading '=' to be
      // considered as expression
      if (this.props.mode === 'cell') {
        shouldAnalyse = Boolean(/^\s*=/.exec(code));
      }
      // tokens for syntax-highlighting
      let tokens = [];
      // symbols such as 'var', 'cell', or 'range'
      let symbols = [];
      // detected complex nodes, such as function calls
      let nodes = [];
      if (shouldAnalyse) {
        ({tokens, symbols, nodes} = analyseCode(code, this.props.language));
      }
      this._setMarkers(tokens);
      // TODO: rethink - if there was a State API how would we do this?
      // want to share code analysis e.g. with Commands
      this._extendState({ tokens, symbols, nodes });
    }

    _getCode() {
      const path = this.props.path;
      return this.context.editorSession.getDocument().get(path)
    }

    _setMarkers(tokens) {
      const path = this.props.path;
      const markersManager = this.context.editorSession.markersManager;
      // TODO: renamve this helper to `getMarkersForTokens`
      let markers = getSyntaxTokens(path, tokens);
      markersManager.setMarkers(`code-analysis@${path.join('.')}`, markers);
    }

    _extendState(values) {
      // TODO: do we really want this?
      let state = this._getState();
      Object.assign(state, values);
    }

    _getState() {
      // TODO: this should be general, not tied to Stencila Cells
      const path = this.props.path;
      const nodeId = path[0];
      const node = this.context.editorSession.getDocument().get(nodeId);
      if (!node.state) {
        node.state = {};
      }
      return node.state
    }

    _onTabKey(e) {
      e.stopPropagation();
      const editorSession = this.context.editorSession;
      const head = this._getCurrentLineHead();
      // console.log('head', head)
      if (/^\s*$/.exec(head)) {
        editorSession.transaction((tx) => {
          tx.insertText('  ');
        });
      }
    }

    // only used if multiline=true
    _onEnterKey(e) {
      e.stopPropagation();
      this._insertNewLine();
    }

    _insertNewLine() {
      const editorSession = this.context.editorSession;
      const indent = this._getCurrentIndent();
      editorSession.transaction((tx) => {
        tx.insertText('\n' + indent);
      });
    }

    _getCurrentIndent() {
      const line = this._getCurrentLineHead();
      const match = /^(\s+)/.exec(line);
      if (match) {
        return match[1]
      } else {
        return ''
      }
    }

    _getCurrentLineHead() {
      const editorSession = this.context.editorSession;
      const doc = editorSession.getDocument();
      const sel = editorSession.getSelection();
      if (!sel || !sel.isPropertySelection() || !substance.isArrayEqual(sel.path, this.props.path)) {
        return
      }
      const offset = sel.start.offset;
      const exprStr = doc.get(this.props.path);
      const head = exprStr.slice(0, offset);
      const lastNL = head.lastIndexOf('\n');
      return head.slice(lastNL+1)
    }
  }

  const LANG_LABELS = {
    'mini': 'Formula',
    'js': 'Javascript',
    'node': 'Node.js',
    'sql': 'SQL',
    'py': 'Python',
    'pyjp': 'PyJp',
    'r': 'R Script',
  };


  const SHOW_ERROR_DELAY = 500;

  class CellComponent extends substance.NodeComponent {

    constructor(...args) {
      super(...args);

      this.handleActions({
        // triggered by CodeEditorComponent and MiniLangEditor
        'execute': this._onExecute,
        'break': this._onBreak
      });
    }

    getInitialState() {
      return {
        hideCode: true,
        forceOutput: true,
        hideCodeToggle: true
      }
    }

    _renderStatus($$) {
      const cellState = getCellState(this.props.node);
      let statusName = cellState ? toString(cellState.status) : 'unknown';
      let el = $$('div').addClass(`se-status sm-${statusName}`);
      let icon = this.state.hideCode ? 'fa-angle-right' : 'fa-angle-down';
      el.append(
        $$(substance.FontAwesomeIcon, {icon: icon })
      );
      return el
    }

    _renderStatusDescription($$) {
      const cellState = getCellState(this.props.node);
      // console.log('cellstate', cellState.status)
      let statusName = cellState ? toString(cellState.status) : 'unknown';
      let statusDescr = statusName;
      // if (statusName === 'ok') {
      //   statusDescr = 'ready'
      // }
      // if (statusName === 'ready') {
      //   statusDescr = 'pending'
      // }

      let el = $$('div').addClass(`se-status-description sm-${statusName}`).append(
        'status: ',
        $$('span').addClass('se-status-name').append(
          statusDescr
        )
      );
      if (statusDescr === 'ready') {
        el.append(' (run code with ⇧⏎)');
      }
      return el
    }

    _renderToggleLabel($$) {
      const cellState = getCellState(this.props.node);
      const lang = cellState.lang;
      
      let label = `${LANG_LABELS[lang]}`;

      if(cellState.value && cellState.value.type) {
        label += ` for: ${_capitalizeFirstLetter(cellState.value.type)}`;
        if (cellState.output) {
          let output = cellState.output;
          output = output.split('!')[1];
          label += `, ${output}`;
        }
      }

      
      let el = $$('div').addClass('se-toggle-label').append(label);
      return el
    }

    render($$) {
      const cell = this.props.node;
      const cellState = getCellState(cell);
      let el = $$('div').addClass('sc-cell');
      el.attr('data-id', cell.id);

      if (!this.state.hideCodeToggle) {
        el.append(
          $$('button').append(
            this._renderStatus($$),
            this._renderToggleLabel($$),
            this._renderStatusDescription($$)
          )
          .addClass('se-show-code')
          .attr('title', 'Show Code')
          .on('click', this._toggleCode)
        );
      }

      if (!this.state.hideCode) {
        let source = cell.find('source-code');
        let cellEditorContainer = $$('div').addClass('se-cell-editor-container');
        cellEditorContainer.append(
          this._renderStatus($$),
          $$('div').addClass('se-expression').append(
            $$(CodeEditor, {
              path: source.getPath(),
              excludedCommands: this._getBlackListedCommands(),
              language: source.attributes.language,
              multiline: true
            }).ref('expressionEditor')
              .on('escape', this._onEscapeFromCodeEditor)
          )
        );
        el.append(cellEditorContainer);
        // el.append(
        //   this._renderEllipsis($$)
        // )
        // el.append(
        //   $$('div').addClass('se-language').append(
        //     LANG_LABELS[source.attributes.language]
        //   )
        // )
      }



      if (cellState) {
        let valueDisplay = $$(ValueDisplay, {
          status: cellState.status,
          value: cellState.value,
          errors: cellState.errors,
          showOutput: this._showOutput(),
        }).ref('valueDisplay');
        el.append(valueDisplay);
      }
      return el
    }

    /*
      Move this into an overlay, shown depending on app state
    */
    // _renderEllipsis($$) {
    //   let Button = this.getComponent('button')
    //   let el = $$('div').addClass('se-ellipsis')
    //   let button = $$(Button, {
    //     icon: 'close',
    //     active: false,
    //     theme: 'light'
    //   }).on('click', this._hideCode)
    //   el.append(button)

    //   return el
    // }

    getExpression() {
      return this.refs.expressionEditor.getContent()
    }

    _renderMenu($$) {
      let menuEl = $$('div').addClass('se-menu');
      menuEl.append(
        this._renderToggleCode($$),
        this._renderToggleOutput($$)
      );
      return menuEl
    }

    _getBlackListedCommands() {
      const commandGroups = this.context.commandGroups;
      let result = []
      ;['annotations', 'insert', 'prompt', 'text-types'].forEach((name) => {
        if (commandGroups[name]) {
          result = result.concat(commandGroups[name]);
        }
      });
      return result
    }

    _toggleCode() {
      this.extendState({
        hideCode: !this.state.hideCode
      });
    } 

    /*
      Generally output is shown when cell is not a definition, however it can be
      enforced
    */
    _showOutput() {
      return (!this._isDefinition() || !this.state.hideCode)
    }

    _isDefinition() {
      const cellState = getCellState(this.props.node);
      return cellState && cellState.hasOutput()
    }

    _toggleMenu() {
      const containerEditor = this._getParentSurface();
      this.context.editorSession.setSelection({
        type: 'node',
        containerId: containerEditor.getContainerId(),
        surfaceId: containerEditor.getSurfaceId(),
        nodeId: this.props.node.id,
      });
    }

    _onExecute() {
      this.context.cellEngine.recompute(this.props.node.id);
    }

    _onBreak() {
      this.context.editorSession.transaction((tx) => {
        tx.selection = this._afterNode();
        tx.insertBlockNode({
          type: 'p'
        });
      });
    }

    _onEscapeFromCodeEditor(event) {
      event.stopPropagation();
      this.send('escape');
    }

    _afterNode() {
      // TODO: not too happy about how difficult it is to set the selection
      const node = this.props.node;
      const containerEditor = this._getParentSurface();
      return {
        type: 'node',
        nodeId: node.id,
        mode: 'after',
        containerId: containerEditor.getContainerId(),
        surfaceId: containerEditor.getSurfaceId()
      }
    }

    _getParentSurface() {
      const isolatedNode = this.context.isolatedNodeComponent;
      return isolatedNode.getParentSurface()
    }

  }

  class ValueDisplay extends substance.Component {

    shouldRerender(newProps) {
      return (
        (newProps.showOutput !== this.props.showOutput) ||
        (newProps.status !== this.props.status) ||
        (newProps.value !== this.props.value) ||
        (!substance.isEqual(newProps.errors, this.props.errors))
      )
    }

    willReceiveProps(newProps) {
      let newStatus = newProps.status;
      if (newStatus === OK) {
        this._cachedValue = newProps.value;
        // this._cachedError = null
      } else if (newStatus === BROKEN || newStatus === FAILED) {
        this._cachedError = newProps.errors[0];
        // this._cachedValue = null
      }
    }

    didUpdate() {
      const errors = this.props.errors;
      if (errors && errors.length > 0) {
        let token = this._token;
        setTimeout(() => {
          // if this is still the same update
          if (token === this._token) {
            if (this.refs.cachedValue) {
              this.refs.cachedValue.css('display', 'none');
            }
            if (this.refs.error) {
              this.refs.error.css('display', 'block');
            }
          }
        }, SHOW_ERROR_DELAY);
      }
    }

    render($$) {
      const status = this.props.status;
      const value = this.props.value;
      const showOutput = this.props.showOutput;
      const errors = this.props.errors;
      let el = $$('div');
      // whenever there are errors we will renew the token
      // so that an already triggered updater can be canceled
      this._token = Math.random();
      if(status === BROKEN || status === FAILED) {
        // rendering the last value as hidden to achieve a bit more resilient spacing
        if (this._cachedValue && showOutput) {
          el.append(
            $$(ValueComponent, this._cachedValue).ref('cachedValue').css('visibility', 'hidden')
          );
        }
        // alternatively if there is a cached error, use that to reserve the space
        else if (this._cachedError) {
          el.append(
            $$('div').addClass('se-error').append(
              getErrorMessage(this._cachedError)
            ).ref('cachedValue').css('visibility', 'hidden')
          );
        }
        // the error is not shown at first, but didUpdate() will show it after some delay
        // this way the error is a bit delayed, potentially becoming superseded by a new update in the meantime
        el.append(
          $$('div').addClass('se-error').append(
            getErrorMessage(errors[0])
          ).ref('error').css('display', 'none')
        );
      } else if (showOutput) {
        if (value && status === OK) {
          el.append(
            $$(ValueComponent, value).ref('value')
          );
        }
        // to have a less jumpy experience, we show the last valid value grey'd out
        else if (this._cachedValue) {
          el.append(
            $$(ValueComponent, this._cachedValue).ref('value')
            // HACK: Disable pending computation ...
            // .addClass('sm-pending')
          );
        }
      }
      return el
    }
  }



  function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  CellComponent.noBlocker = true;

  class CodeHighlightComponent extends substance.Component {

    render($$) {
      const node = this.props.node;
      let el = $$('span')
        .addClass('sc-code-highlight')
        .addClass('sm-'+node.name);
      el.append(this.props.children);
      return el
    }
  }

  class NullValueComponent extends substance.Component {
    render($$) {
      return $$('div').addClass('sc-null-value').text('null')
    }
  }

  class BooleanrValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('div').addClass('sc-boolean-value');
      el.append(value.data ? 'true' : 'false');
      return el
    }
  }

  class NumberValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('div').addClass('sc-number-value');
      // TODO: Better formatting of numbers (not always 6 digits)
      el.append(value.data.toFixed(6));
      return el
    }
  }

  class IntegerValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('div').addClass('sc-integer-value');
      el.append(value.data);
      return el
    }
  }

  class StringValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('div').addClass('sc-string-value');
      el.append(
        "'",
        value.data,
        "'"
      );
      return el
    }
  }

  class ArrayValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('div').addClass('sc-array-value');
      value.data.forEach((item) => {
        el.append(
          $$('div').addClass('se-array-item').append(item.toString())
        );
      });
      return el
    }
  }

  class ObjectValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('pre').addClass('sc-object-value');
      let json = JSON.stringify(value.data, null, ' ');
      if (json && json.length > 1000) json = json.slice(0, 1000) + '...';
      el.append(json);
      return el
    }
  }

  const MAX_ROWS = 10000;

  class TableValueComponent extends substance.Component {
    render($$) {
      const table = this.props.value.data;
      const data = table.data;
      const columnNames = Object.keys(data);
      const cols = table.columns || columnNames.length;
      const rows = table.rows || (cols > 0 && data[columnNames[0]] && data[columnNames[0]].length);

      let el = $$('div').addClass('sc-table-value');

      let tableEl = $$('table').addClass('sc-table-value');

      const thead = $$('thead');
      columnNames.forEach((name)=>{
        thead.append(
          $$('th').append(name)
        );
      });
      tableEl.append(thead);

      if (cols > 0) {
        const tbody = $$('tbody');
        for (let row = 0; row < rows && row < MAX_ROWS; row++) {
          let tr = $$('tr');
          columnNames.forEach((name)=>{
            tr.append(
              $$('td').text(data[name][row])
            );
          });
          tbody.append(tr);
        }
        if (this.props.pointer) {
          let tr = $$('tr');
          columnNames.forEach(()=>{
            tr.append(
              $$('td').text('...')
            );
          });
          tbody.append(tr);  
        }
        tableEl.append(tbody);
      }
      el.append(tableEl);

      if (rows > MAX_ROWS) {
        el.append(
          $$('div').addClass('se-more-records').append(
            `Showing ${MAX_ROWS} of ${rows} rows`
          )
        );
      }

      return el
    }
  }

  class TestValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value.data;
      let el = $$('div').addClass('sc-test-value');
      let result = value.passed ? 'test-passed' : 'test-failed';
      el.addClass(value.passed ? 'sm-' + result : 'sm-' + result);
      el.append(
        $$('div').addClass('se-icon').append(
          this.context.iconProvider.renderIcon($$, result)
        ),
        $$('div').addClass('se-message').text(value.message)
      );
      return el
    }
  }

  class ImageValueComponent extends substance.Component {
    render($$) {
      let value = this.props.value;
      let el = $$('img')
        .attr('src', value.src)
        .addClass('sc-image-value');
      return el
    }
  }

  class PlotlyValueComponent extends substance.Component {

    didMount() {
      this._renderPlotly();
    }

    didUpdate() {
      this._renderPlotly();
    }

    render($$) {
      let el = $$('div').addClass('sc-plotly-value');
      return el
    }

    _renderPlotly() {
      if (this.el) {
        let value = this.props.value;
        let spec = value.data;
        let options = {
          // Find button names at
          // https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js
          modeBarButtonsToRemove: [
            'sendDataToCloud',
            'autoScale2d',
            'hoverClosestCartesian', 'hoverCompareCartesian',
            'lasso2d', 'select2d'
          ],
          displaylogo: false,
          displayModeBar: false,
          showTips: true
        };
        // TODO: discuss. After some discussions, @integral and @oliver---
        // think that this component should not deal with sizes at all,
        // because it should come from the libcore function.
        // if the default values are not provided by the plot call
        // then we need to set default values here.
        // Note: in this call we make sure that there are default values set
        let size = getFrameSize(spec.layout);
        spec.layout.width = size.width;
        spec.layout.height = size.height;

        let el = this.el.getNativeElement();
        Plotly.purge(el);
        Plotly.plot(el, spec.traces, spec.layout, options);
      }
    }
  }

  function setCellLanguage(editorSession, cellId, newLanguage) {
    editorSession.transaction((tx) => {
      let cell = tx.get(cellId);
      let sourceCode = cell.find('source-code');
      sourceCode.attr({ language: newLanguage });
    }, { action: 'setCellLanguage'});
  }

  function insertCell(editorSession) {
    editorSession.transaction(tx => {
      let sel = tx.selection;
      let cell = tx.createElement('cell');
      let sourceCode = tx.createElement('source-code').attr('language', 'mini');
      let output = tx.createElement('output').attr('language', 'json');
      cell.append(
        sourceCode,
        output
      );
      tx.insertBlockNode(cell);
      tx.setSelection({
        type: 'property',
        path: sourceCode.getPath(),
        startOffset: 0,
        surfaceId: sel.surfaceId,
        containerId: sel.containerId
      });
    }, { action: 'insertCell' });
  }

  function insertReproFig(editorSession) {
    editorSession.transaction(tx => {
      let sel = tx.selection;
      let cell = tx.createElement('cell');
      let sourceCode = tx.createElement('source-code').attr('language', 'mini');
      let output = tx.createElement('output').attr('language', 'json');
      cell.append(
        sourceCode,
        output
      );
      let fig = tx.createElement('repro-fig');
      fig.append(
        tx.createElement('object-id').text(fig.id).attr({'pub-id-type': 'doi'}),
        tx.createElement('title'),
        tx.createElement('caption').append(
          tx.createElement('p')
        ),
        cell
      );
      tx.insertBlockNode(fig);
      tx.setSelection({
        type: 'property',
        path: sourceCode.getPath(),
        startOffset: 0,
        surfaceId: sel.surfaceId,
        containerId: sel.containerId
      });
    }, { action: 'insertReproFig' });
  }

  class SetLanguageCommand extends substance.Command {

    getCommandState({ selection, editorSession }) {
      let doc = editorSession.getDocument();
      if (selection.isNodeSelection()) {
        let nodeId = selection.getNodeId();
        let node = doc.get(nodeId);
        if (node.type === 'cell') {
          let language = node.find('source-code').attr('language');
          return {
            cellId: node.id,
            newLanguage: this.config.language,
            disabled: false,
            active: this.config.language === language
          }
        }
      }
      return { disabled: true }
    }

    execute({ editorSession, commandState }) {
      let { cellId, newLanguage, disabled } = commandState;
      if (!disabled) {
        setCellLanguage(editorSession, cellId, newLanguage);
      }
    }
  }

  class ToggleAllCodeCommand extends substance.Command {

    getCommandState() {
      // Note: this is always enabled
      return {
        disabled: false,
        active: false
      }
    }

    /*
      Returns all cell components found in the document
    */
    _getCellComponents(params) {
      let editor = params.editorSession.getEditor();
      return editor.findAll('.sc-cell')
    }

    execute(params) {
      let cellComponents = this._getCellComponents(params);
      let sel = params.editorSession.getSelection();
      cellComponents.forEach((cellComponent) => {
        cellComponent.extendState({
          hideCode: this.config.hideCode
        });
      });
      params.editorSession.setSelection(sel);
    }
  }


  class HideCellCodeCommand extends substance.Command {

    getCommandState({ selection, editorSession }) {
      let doc = editorSession.getDocument();
      if (selection.isNodeSelection()) {
        let nodeId = selection.getNodeId();
        let node = doc.get(nodeId);
        if (node.type === 'cell') {
          return {
            cellId: node.id,
            disabled: false
          }
        }
      }
      return { disabled: true }
    }

    execute({ commandState, editorSession }) {
      const { cellId } = commandState;
      let editor = editorSession.getEditor();
      let cellComponent = editor.find(`.sc-cell[data-id=${cellId}]`);
      cellComponent.extendState({
        hideCode: true
      });
    }
  }


  class ForceCellOutputCommand extends substance.Command {

    getCommandState({ selection, editorSession }) {
      let doc = editorSession.getDocument();
      if (selection.isNodeSelection()) {
        let nodeId = selection.getNodeId();
        let node = doc.get(nodeId);
        if (node.type === 'cell') {
          // TODO: we should use the node state instead
          let cellComponent = this._getCellComponent(editorSession, nodeId);
          if (cellComponent && cellComponent.state) {
            return {
              cellId: node.id,
              active: Boolean(cellComponent.state.forceOutput),
              disabled: false
            }
          }
        }
      }
      return { disabled: true }
    }

    _getCellComponent(editorSession, cellId) {
      let editor = editorSession.getEditor();
      if (editor) {
        return editor.find(`.sc-cell[data-id=${cellId}]`)
      }
    }

    execute({ commandState, editorSession }) {
      const { cellId } = commandState;
      let cellComponent = this._getCellComponent(editorSession, cellId);
      cellComponent.extendState({
        forceOutput: !cellComponent.state.forceOutput
      });
      editorSession.setSelection(null);
    }
  }

  class InsertCellCommand extends substanceTexture.InsertNodeCommand {

    execute({ editorSession, commandState }) {
      const { disabled } = commandState;
      if (!disabled) {
        insertCell(editorSession);
      }
    }
  }

  class InsertReproFigCommand extends substanceTexture.InsertNodeCommand {

    execute({ commandState, editorSession}) {
      const { disabled } = commandState;
      if (!disabled) {
        insertReproFig(editorSession);
      }
    }

  }

  class RunCellCommand extends substance.Command {

    getCommandState({ editorSession, selection }) {
      const doc = editorSession.getDocument();
      if (selection.isPropertySelection() || selection.isNodeSelection()) {
        let nodeId = selection.getNodeId();
        let node = doc.get(nodeId);
        if (node.type === 'source-code') {
          node = node.parentNode;
        }
        if (node.type === 'cell') {
          return {
            disabled: false,
            active: false,
            docId: doc.id,
            cellId: node.id
          }
        }
      }
      return {
        disabled: true
      }
    }

    execute(params, context) {
      const { docId, cellId } = params.commandState;
      const engine = context.host.engine;
      const id = qualifiedId(docId, cellId);
      engine._allowRunningCellAndPredecessors(id);
    }

    static get name() {
      return 'run-cell-code'
    }
  }

  class FunctionUsageCommand extends substance.Command {

    getCommandState({ selection, editorSession, surface }) {
      // TODO: disable this command if there is no functionManager
      const doc = editorSession.getDocument();
      const functionManager = surface ? surface.context.functionManager : null;
      // console.log('selection', selection)
      if (functionManager && selection.isPropertySelection()) {
        let nodeId = selection.getNodeId();
        let node = doc.get(nodeId);
        // TODO: how to generalized this? This should only
        // be active if the cursor is inside of a CodeEditor
        if (node.type === 'cell' || node.type === 'source-code') {
          let state = node.state || {};
          let cursorPos = selection.start.offset;
          let match = this._findFunction(state.nodes, cursorPos);
          if (match) {
            return {
              disabled: false,
              functionName: match.name,
              paramIndex: match.paramIndex,
            }
          }
        }
      }

      return {
        disabled: true
      }
    }

    _findFunction(nodes, cursorPos) {
      if (!nodes) return

      let candidate;
      nodes.forEach((node) => {
        // At the moment we don't want to show function helper for a function arguments
        // as we find it obtrusive, however this implementation contains function arguments
        // highlighting.
        // Currently we just restrict matching with a function name and the first bracket.
        if (node.type === 'function' && node.start <= cursorPos && node.start + node.name.length + 1 >= cursorPos) {
          let offset = cursorPos - node.start;
          if (!candidate || offset < candidate.offset ) {
            // Param index
            let paramIndex;
            node.args.forEach((arg, index) => {
              if (arg.start <= cursorPos && arg.end >= cursorPos) {
                paramIndex = index;
              }
            });
            candidate = {
              name: node.name,
              offset,
              paramIndex,
            };
          }
        }
      });
      return candidate
    }

    execute(params) { } // eslint-disable-line
  }

  class FunctionUsageComponent extends substance.Component {
    render($$) {
      let el = $$('div').addClass('sc-function-usage');
      let spec = this.props.spec;

      // TODO: Currently only using the first method, allow for 
      // multiple methods (ie. overloads with different parameter types)
      const params = Object.values(spec.methods)[0].params;
      let paramIndex = this.props.paramIndex;

      // Function signature
      let signatureEl = $$(FunctionSignature, {
        spec,
        paramIndex
      });

      // Parameter descriptions
      let paramsEl = $$('table').addClass('se-parameters');
      if (params) {
        params.forEach((param, i) => {
          let paramEl = $$('tr').addClass('se-param').append(
            $$('td').addClass('se-param-name').append(param.name),
            $$('td').addClass('se-param-descr').append(param.description)
          );
          if (i === this.props.paramIndex) {
            paramEl.addClass('sm-active');
          }
          paramsEl.append(paramEl);
        });
      }

      let documentationLink = $$('div').addClass('se-read-more').append(
        this.context.iconProvider.renderIcon($$, 'function-helper')
      ).on('mousedown', this._openDocumentation);

      // Documentation
      let docEl = $$('div').addClass('se-documentation');
      docEl.append(
        signatureEl,
        documentationLink
      );
      el.append(docEl);
      return el
    }

    _openDocumentation(e) {
      e.preventDefault();
      e.stopPropagation();
      const spec = this.props.spec;
      this.send('openHelp', `function/${spec.name}`);
    }
  }

  class FunctionSignature extends substance.Component {
    render($$) {
      let spec = this.props.spec;
      const params = Object.values(spec.methods)[0].params;

      let paramsEl = $$('span').addClass('se-signature-params');
      if (params) {
        params.forEach((param, i) => {
          let paramEl = $$('span').addClass('se-signature-param').append(param.name);
          if (i === this.props.paramIndex) {
            paramEl.addClass('sm-active');
          }
          paramsEl.append(paramEl);
          if (i < params.length - 1) {
            paramsEl.append(',');
          }
        });
      }

      return $$('div').addClass('se-signature').append(
        $$('span').addClass('se-name').append(spec.name),
        '(',
        $$('span').append(paramsEl),
        ')'
      )
    }
  }

  class FunctionUsageTool extends substance.ToggleTool {
    render($$) {
      let functionManager = this.context.functionManager;
      let functionName = this.props.commandState.functionName;
      let func = functionManager.getFunction(functionName);
      let el = $$('div').addClass('sc-function-usage-tool');
      if (func) {
        el.append(
          $$(FunctionUsageComponent, {
            spec: func,
            paramIndex: this.props.commandState.paramIndex
          })
        );
      }
      return el
    }
  }

  class RunAllCommand extends substance.Command {

    getCommandState({ editorSession }) {
      const doc = editorSession.getDocument();
      const autorun = doc.autorun;
      return {
        autoOrManual: autorun ? 'Manual' : 'Auto',
        disabled: false
      }
    }

    execute({ editorSession }) {
      let doc = editorSession.getDocument();
      const autorun = doc.autorun;
      doc.autorun = !autorun;
      editorSession.setSelection(null);
    }

  }

  class RunAllCommand$1 extends substance.Command {

    getCommandState({ editorSession }) {
      const doc = editorSession.getDocument();
      const autorun = doc.autorun;
      return {
        disabled: autorun
      }
    }

    execute(params, context) {
      const editorSession = params.editorSession;
      const engine = context.host.engine;
      const doc = editorSession.getDocument();
      engine._allowRunningAllCellsOfDocument(doc.id);
    }
  }

  var ArticleEditorPackage = {
    name: 'editor',
    configure(config) {
      config.import(substanceTexture.EditorPackage);
      config.addComponent('cell', CellComponent);
      config.addComponent('code-highlight', CodeHighlightComponent);

      config.addComponent('value:null', NullValueComponent);
      config.addComponent('value:boolean', BooleanrValueComponent);
      config.addComponent('value:integer', IntegerValueComponent);
      config.addComponent('value:number', NumberValueComponent);
      config.addComponent('value:string', StringValueComponent);
      config.addComponent('value:array', ArrayValueComponent);
      config.addComponent('value:object', ObjectValueComponent);
      config.addComponent('value:table', TableValueComponent);
      config.addComponent('value:test', TestValueComponent);
      config.addComponent('value:image', ImageValueComponent);
      config.addComponent('value:plotly', PlotlyValueComponent);

      config.addComponent('repro-fig', ReproFigComponent);
      config.addComponent('repro-fig-preview', ReproFigPreview);

      config.addCommand('insert-repro-fig', InsertReproFigCommand, {
        commandGroup: 'insert',
        nodeType: 'repro-fig'
      });
      config.addIcon('insert-repro-fig', { 'fontawesome': 'fa-area-chart' });
      config.addLabel('insert-repro-fig', 'Reproducible Figure');

      config.addCommand('insert-cell', InsertCellCommand, {
        nodeType: 'disp-quote',
        commandGroup: 'insert'
      });
      config.addLabel('insert-cell', 'Cell');
      config.addKeyboardShortcut('CommandOrControl+Enter', { command: 'insert-cell' });

      config.addCommand('function-usage', FunctionUsageCommand, {
        commandGroup: 'prompt'
      });
      config.addTool('function-usage', FunctionUsageTool);

      config.addIcon('function-helper', {'fontawesome': 'fa-question-circle' });

      config.addIcon('insert-cell', { 'fontawesome': 'fa-plus-square' });

      config.addLabel('function-examples', {
        en: 'Example Usage'
      });
      config.addLabel('function-usage', {
        en: 'Syntax'
      });

      config.addCommand('auto-run', RunAllCommand, {
        commandGroup: 'auto-run'
      });

      config.addCommand('run-all', RunAllCommand$1, {
        commandGroup: 'run-all'
      });
      config.addIcon('run-all', { 'fontawesome': 'fa-caret-square-o-right' });
      config.addLabel('run-all', 'Run All Code');
      config.addKeyboardShortcut('CommandOrControl+Shift+Enter', { command: 'run-all' });

      config.addToolPanel('toolbar', [
        {
          name: 'undo-redo',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['undo-redo']
        },
        {
          name: 'text-types',
          type: 'tool-dropdown',
          showDisabled: false,
          style: 'descriptive',
          commandGroups: ['text-types']
        },
        {
          name: 'list',
          type: 'tool-group',
          showDisabled: false,
          style: 'minimal',
          commandGroups: ['list']
        },
        {
          name: 'annotations',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['formatting']
        },
        {
          name: 'additinal-tools',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['insert']
        },
        {
          name: 'cell-execution',
          type: 'tool-group',
          showDisabled: false,
          style: 'minimal',
          commandGroups: ['run-all']
        },
        {
          name: 'cite',
          type: 'tool-dropdown',
          showDisabled: true,
          style: 'descriptive',
          commandGroups: ['insert-xref']
        },
        {
          name: 'view',
          type: 'tool-dropdown',
          showDisabled: false,
          style: 'descriptive',
          commandGroups: ['toggle-content-section', 'view']
        },
        {
          name: 'settings',
          type: 'tool-dropdown',
          showDisabled: true,
          style: 'descriptive',
          commandGroups: ['auto-run']
        }
      ]);

      config.addToolPanel('node-menu', [
        {
          name: 'cell-actions',
          type: 'tool-group',
          style: 'descriptive',
          showDisabled: false,
          commandGroups: ['cell-actions']
        }
      ]);

      /*
        Cell Actions
      */

      config.addCommand(RunCellCommand.name, RunCellCommand, { commandGroup: 'cell-actions' });
      config.addCommand('hide-cell-code', HideCellCodeCommand, { commandGroup: 'cell-actions' });
      config.addCommand('force-cell-output', ForceCellOutputCommand, { commandGroup: 'cell-actions' });
      config.addCommand('set-mini', SetLanguageCommand, { language: 'mini', commandGroup: 'cell-actions' });
      config.addCommand('set-js', SetLanguageCommand, { language: 'js', commandGroup: 'cell-actions' });
      config.addCommand('set-node', SetLanguageCommand, { language: 'node', commandGroup: 'cell-actions' });
      config.addCommand('set-py', SetLanguageCommand, { language: 'py', commandGroup: 'cell-actions' });
      config.addCommand('set-pyjp', SetLanguageCommand, { language: 'pyjp', commandGroup: 'cell-actions' });
      config.addCommand('set-r', SetLanguageCommand, { language: 'r', commandGroup: 'cell-actions' });
      config.addCommand('set-sql', SetLanguageCommand, { language: 'sql', commandGroup: 'cell-actions' });

      // Labels and icons
      config.addLabel('run-cell-code', 'Run cell');
      config.addLabel('hide-cell-code', 'Hide code');
      config.addLabel('force-cell-output', 'Force output');
      config.addLabel('set-mini', 'Mini');
      config.addLabel('set-js', 'Javascript');
      config.addLabel('set-node', 'Node.js');
      config.addLabel('set-py', 'Python');
      config.addLabel('set-pyjp', 'Python Jupyter');
      config.addLabel('set-r', 'R');
      config.addLabel('set-sql', 'SQL');

      config.addIcon('ellipsis', { 'fontawesome': 'fa-ellipsis-v' });
      config.addIcon('close', { 'fontawesome': 'fa-eye-slash' });
      config.addIcon('test-failed', {'fontawesome': 'fa-times' });
      config.addIcon('test-passed', {'fontawesome': 'fa-check' });


      config.addLabel('show-all-code', 'Show All Code');
      config.addLabel('hide-all-code', 'Hide All Code');

      config.addLabel('settings', 'Settings');
      config.addLabel('auto-run', '${autoOrManual} Execution');

      // View Commands
      config.addCommand('hide-all-code', ToggleAllCodeCommand, {
        hideCode: true,
        commandGroup: 'view'
      });
      config.addCommand('show-all-code', ToggleAllCodeCommand, {
        hideCode: false,
        commandGroup: 'view'
      });

      config.addKeyboardShortcut('CommandOrControl+Alt+L', { command: 'show-all-code' });
      config.addKeyboardShortcut('CommandOrControl+Alt+O', { command: 'hide-all-code' });
      config.addKeyboardShortcut('Shift+Enter', { command: 'run-cell-code' });

    }
  }

  function loadPersistedCellStates (doc) {
    let cells = doc.getIndex('type').get('cell');
    substance.forEach(cells, cell => {
      let output = cell.find('output');
      let value;
      if (output) {
        let json = output.textContent;
        if (json) {
          value = JSON.parse(json);
        }
      }
      let outputName = cell.attr('output-name');
      cell.state = new PseudoCellState(doc, cell, value, outputName);
    });
  }

  class PseudoCellState extends Cell {
    constructor (doc, cell, value, outputName) {
      super(doc, {
        id: cell.id,
        lang: getLang(cell),
        source: getSource(cell),
        value,
        status: !substance.isNil(value) ? OK : UNKNOWN,
        output: outputName
      });
    }
  }

  var ArticleLoader = {
    load(xml, context) {
      let configurator = new substanceTexture.TextureConfigurator();
      // TODO: it would make more sense to use a more generic configuration here (TextureJATSPackage)
      // But ATM EditorSession is owning all the managers. So we have to use the EditorPackage.
      configurator.import(ArticleEditorPackage);
      let jatsImporter = new substanceTexture.JATSImporter();
      let jats = jatsImporter.import(xml, context);

      if (jats.hasErrored) {
        let err = new Error();
        err.type = 'jats-import-error';
        err.detail = jats.errors;
        throw err
      }

      let importer = configurator.createImporter('texture-article');
      let doc = importer.importDocument(jats.dom);
      let editorSession = new substance.EditorSession(doc, { configurator, context });
      // EXPERIMENTAL: taking persisted cell outputs to initialize cell state
      loadPersistedCellStates(doc);

      return editorSession
    }
  }

  function persistCellStates (doc, dom) {
    let cells = doc.getIndex('type').get('cell');
    substance.forEach(cells, cell => {
      let el = dom.find(`#${cell.id}`);
      let state = cell.state;
      // store the cell output
      if (state.output) {
        el.attr('output-name', state.output);
      }
    });
  }

  var ArticleExporter = {
    export (session, { sessions }) {
      // FIXME: hard-coded, and thus bad
      // TODO: export only those resources which have been changed
      // Also we need to
      let jatsExporter = new substanceTexture.JATSExporter();
      let pubMetaDb = sessions['pub-meta'].getDocument();
      let doc = session.getDocument();
      let dom = doc.toXML();

      let res = jatsExporter.export(dom, { pubMetaDb, doc });
      persistCellStates(doc, res.dom);

      console.info('saving jats', res.dom.getNativeElement());
      // TODO: bring back pretty printing (currently messes up CDATA content)
      let xmlStr = substance.prettyPrintXML(res.dom);
      return xmlStr
    }
  }

  var SheetSchemaData = {"start":"sheet","elements":{"sheet":{"name":"sheet","type":"element","attributes":{},"elements":{"name":"sheet","content":{"type":",","blocks":["meta","data"]}}},"meta":{"name":"meta","type":"element","attributes":{},"elements":{"name":"meta","content":{"type":"~","blocks":["name","title","description","columns"]}}},"name":{"name":"name","type":"text","attributes":{},"elements":{"name":"name","content":"TEXT"}},"title":{"name":"title","type":"text","attributes":{},"elements":{"name":"title","content":"TEXT"}},"description":{"name":"description","type":"text","attributes":{},"elements":{"name":"description","content":"TEXT"}},"columns":{"name":"columns","type":"element","attributes":{},"elements":{"name":"columns","content":{"type":"*","block":"col"}}},"col":{"name":"col","type":"element","attributes":{"type":{"name":"type"},"width":{"name":"width"},"unit":{"name":"unit"}},"elements":{"name":"col","content":{"type":",","blocks":[]}}},"data":{"name":"data","type":"element","attributes":{},"elements":{"name":"data","content":{"type":"*","block":"row"}}},"row":{"name":"row","type":"element","attributes":{"height":{"name":"height"}},"elements":{"name":"row","content":{"type":"*","block":"cell"}}},"cell":{"name":"cell","type":"text","attributes":{"type":{"name":"type"},"language":{"name":"language"},"unit":{"name":"unit"}},"elements":{"name":"cell","content":"TEXT"}}}}

  const SheetSchema = substance.XMLSchema.fromJSON(SheetSchemaData);

  // TODO: this should come from compilation
  SheetSchema.getName = function() {
    return 'stencila-sheet'
  };

  SheetSchema.getVersion = function() {
    return '1.0'
  };

  SheetSchema.getDocTypeParams = function() {
    return ['sheet', 'Stencila Sheet 1.0', SheetSchema.uri]
  };

  SheetSchema.getDefaultTextType = function () {
    return 'cell'
  };

  SheetSchema.uri = 'http://stenci.la/Sheet-1.0.dtd';

  class SheetDocument extends substance.XMLDocument {

    constructor(...args) {
      super(...args);
      this.UUID = substance.uuid();

      // a cached random-access version of the sheet
      // this gets invalidated whenever the structure is changed (i.e. rows or cols changed)
      // TODO: we must invalidate the matrix whenever we detect structural changes
      this._matrix = null;
    }

    getDocTypeParams() {
      return SheetSchema.getDocTypeParams()
    }

    getXMLSchema() {
      return SheetSchema
    }

    getRootNode() {
      return this.get('sheet')
    }

    // EXPERIMENTAL
    invert(change) {
      let inverted = change.invert();
      let info = inverted.info || {};
      switch(change.info.action) {
        case 'insertRows': {
          info.action = 'deleteRows';
          break
        }
        case 'deleteRows': {
          info.action = 'insertRows';
          break
        }
        case 'insertCols': {
          info.action = 'deleteCols';
          break
        }
        case 'deleteCols': {
          info.action = 'insertCols';
          break
        }
        default:
          //
      }
      inverted.info = info;
      return inverted
    }

    getColumnForCell(cellId) {
      let cell = this.get(cellId);
      let row = cell.parentNode;
      let colIdx = row._childNodes.indexOf(cell.id);
      return this.getColumnMeta(colIdx)
    }

    getColumnMeta(colIdx) {
      let columns = this._getColumns();
      return columns.getChildAt(colIdx)
    }

    getCell(rowIdx, colIdx) {
      const data = this._getData();
      let row = data.getChildAt(rowIdx);
      if (row) {
        let cell = row.getChildAt(colIdx);
        return cell
      }
    }

    getCellMatrix() {
      if (!this._matrix) {
        this._matrix = this._getCellMatrix();
      }
      return this._matrix
    }

    getColumnCount() {
      const nrows = this.getRowCount();
      if (nrows > 0) {
        const data = this._getData();
        let firstRow = data.getFirstChild();
        return firstRow.getChildCount()
      } else {
        return 0
      }
    }

    getRowCount() {
      const data = this._getData();
      return data.getChildCount()
    }

    getDimensions() {
      let matrix = this.getCellMatrix();
      let nrows = matrix.length;
      let ncols = 0;
      if (nrows > 0) {
        ncols = matrix[0].length;
      }
      return [nrows, ncols]
    }

    _apply(change) {
      super._apply(change);
      // update the matrix on structural changes
      // TODO: we could be smarter by analysing the change
      switch (change.info.action) {
        case 'insertRows':
        case 'deleteRows':
        case 'insertCols':
        case 'deleteCols': {
          this._matrix = this._getCellMatrix();
          break
        }
        default:
          //
      }
    }

    _getData() {
      if (!this._dataNode) {
        this._dataNode = this.get('data');
      }
      return this._dataNode
    }

    _getColumns() {
      if (!this._columnsNode) {
        this._columnsNode = this.getRootNode().find('columns');
      }
      return this._columnsNode
    }

    _getCellMatrix() {
      const data = this._getData();
      let matrix = [];
      let rows = data.getChildren();
      let nrows = rows.length;
      if (nrows === 0) return matrix
      let ncols = rows[0].getChildCount();
      for (let i = 0; i < nrows; i++) {
        let row = rows[i];
        let cells = row.getChildren();
        let m = cells.length;
        if (m !== ncols) {
          throw new Error(`Invalid dimension: row ${i} has ${m} cells, expected ${ncols}.`)
        }
        matrix.push(cells);
      }
      return matrix
    }
  }

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return root.Date.now();
  };

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          result = wait - timeSinceLastCall;

      return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var lodash_throttle = throttle;

  function getSelection(editorSession) {
    let sel = editorSession.getSelection();
    if (sel.isCustomSelection() && sel.customType === 'sheet') {
      return sel.data
    } else {
      return null
    }
  }

  function getRange(editorSession) {
    const sel = getSelection(editorSession);
    if (!sel) return null
    const sheet = editorSession.getDocument();
    let startRow = Math.min(sel.anchorRow, sel.focusRow);
    let endRow = Math.max(sel.anchorRow, sel.focusRow);
    let startCol = Math.min(sel.anchorCol, sel.focusCol);
    let endCol = Math.max(sel.anchorCol, sel.focusCol);
    if (sel.type === 'columns') {
      startRow = 0;
      endRow = sheet.getRowCount() - 1;
    } else if (sel.type === 'rows') {
      startCol = 0;
      endCol = sheet.getColumnCount() - 1;
    }
    return {
      startRow, endRow, startCol, endCol
    }
  }

  const EMPTY_SHEET = `<?xml version="1.0"?>
<!DOCTYPE sheet PUBLIC "StencilaSheet 1.0" "StencilaSheet.dtd">
<sheet>
  <meta>
    <name></name>
    <title></title>
    <description></description>
    <columns>
    </columns>
  </meta>
  <data>
  </data>
</sheet>`;

  /*
    A generator for Sheet XML that can be configured with a simplified data structure

    @example
    ```
    {
      columns: [{ name: 'x' }, { name: 'y' }, { name: 'z' }],
      cells: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['10', '11', '12']
      ]
    }
    ```
  */
  function createSheetXMLFromSpec(spec) {
    let doc = substance.DefaultDOMElement.parseXML(EMPTY_SHEET);
    const $$ = doc.createElement.bind(doc);
    let ncols;
    if (spec.columns) {
      let columns = doc.find('columns');
      spec.columns.forEach(colSpec => {
        const { name, type } = colSpec;
        let col = $$('col');
        if (name) col.attr('name', name);
        if (type) col.attr('type', type);
        columns.append(col);
      });
      ncols = spec.columns.length;
    }
    if (spec.cells) {
      let data = doc.find('data');
      spec.cells.forEach(rowSpec => {
        if (!ncols) ncols = rowSpec.length;
        if (ncols !== rowSpec.length) throw new Error('Illegal number of cells.')
        let row = $$('row');
        rowSpec.forEach(cellSpec => {
          let cell = $$('cell');
          let source, id, type;
          if (substance.isString(cellSpec)) {
            source = cellSpec;
          } else {
            ({ id, type, source } = cellSpec);
          }
          if (id) cell.attr('id', id);
          if (type) cell.attr('type', type);
          cell.append(source);
          row.append(cell);
        });
        data.append(row);
      });
    }
    if (!spec.columns) {
      let columns = doc.find('columns');
      for (let i = 0; i < ncols; i++) {
        columns.append($$('col').attr('type', 'any'));
      }
    }
    return doc.serialize()
  }

  function generateEmptySheetXML(nrows, ncols) {
    let cells = [];
    for (let i = 0; i < nrows; i++) {
      let row = [];
      for (let j = 0; j < ncols; j++) {
        row.push('');
      }
      cells.push(row);
    }
    return createSheetXMLFromSpec({ cells })
  }

  const DEFAULT_COLUMN_WIDTH = 100;

  class SheetColumnHeader extends substance.NodeComponent {

    didMount() {
      super.didMount();
      const cell = this.props.node;
      cell.on('issue:changed', this.rerender, this);
    }

    dispose() {
      super.dispose();
      const cell = this.props.node;
      cell.off(this);
    }

    render($$) {
      const colIdx = this.props.colIdx;

      let th = $$('th')
        .attr('data-col', colIdx)
        .addClass('sc-column-header');

      let columnHeader = $$('div').addClass('se-column-title').append(
        $$('div').addClass('se-column-label').text(getColumnLabel(colIdx)),
        this.renderColumnName($$),
        this.renderColumnType($$)
      );

      th.append(
        columnHeader,
        $$('div').addClass('se-resize-handle')
          .on('mousedown', this._onMouseDown)
      ).css({ width: this.getWidth() }).ref('header');

      return th
    }

    getWidth() {
      // HACK: because XML importer does not convert to the right type
      // we need to do it here
      return Number.parseInt(this.props.node.attr('width'),10) || DEFAULT_COLUMN_WIDTH
    }

    renderIcon($$, icon) {
      let iconEl = this.context.iconProvider.renderIcon($$, icon);
      return iconEl
    }

    renderColumnName($$) {
      const node = this.props.node;
      let name = node.attr('name');
      if (!name) return

      let el = $$('div').addClass('se-column-name')
        .text(String(name));

      return el
    }

    renderColumnType($$) {
      // TODO: here we should discuss how to deal with units
      // we could introduce an extra type for different units
      // but IMO it is semantically more appropriate to have units
      // for number types, such as km, ms, MW
      // In that case we could rather display the unit than the type
      // 'km' instead of number
      // alternatively, we could introduce an extra row with the units
      const node = this.props.node;
      let coltype = node.attr('type');

      if(!coltype || coltype === 'any') return

      let el = $$('div').addClass('se-column-type').append(
        this.renderIcon($$, coltype + '-cell-type'),
        $$(substance.Tooltip, {
          text: this.getLabel(coltype)
        })
      );

      return el
    }

    _onMouseDown(e) {
      e.preventDefault();
      e.stopPropagation();

      this._mouseDown = true;
      this._startX = e.pageX;
      this._colWidth = this.refs.header.getWidth();
      let _window = substance.DefaultDOMElement.getBrowserWindow();
      _window.on('mousemove', this._onMouseMove, this);
      _window.on('mouseup', this._onMouseUp, this);
    }

    _onMouseMove(e) {
      if (this._mouseDown) {
        const width = this._colWidth + (e.pageX - this._startX);
        this.refs.header.css({ width: width });
        const editor = this.context.editor;
        editor.refs.sheet._positionSelection();
      }
    }

    _onMouseUp(e) {
      this._mouseDown = false;
      let _window = substance.DefaultDOMElement.getBrowserWindow();
      _window.off('mousemove', this._onMouseMove, this);
      _window.off('mouseup', this._onMouseUp, this);

      const node = this.props.node;
      const nodeId = node.id;
      const width = this._colWidth + (e.pageX - this._startX);
      const editorSession = this.context.editorSession;
      editorSession.transaction((tx) => {
        let node = tx.get(nodeId);
        node.attr({width: width});
      });
    }
  }

  class SheetRowHeader extends substance.Component {
    render($$) {
      const rowIdx = this.props.rowIdx;
      let th = $$('th')
        .attr('data-col', rowIdx)
        .addClass('sc-column-header')
        .text(String(rowIdx + 1));
      return th
    }
  }

  class SheetCellComponent extends substance.NodeComponent {

    didMount() {
      super.didMount();

      const cell = this.props.node;
      cell.on('issue:changed', this.rerender, this);
    }

    dispose() {
      super.dispose();

      const cell = this.props.node;
      cell.off(this);
    }

    render($$) {
      const cell = this.props.node;
      let el = $$('div').addClass('sc-sheet-cell');
      let error = getError(cell);

      if (error) {
        el.append(
          $$('div').addClass('se-error').append(
            getErrorMessage(getError(cell))
          )
        );
        el.addClass('sm-issue sm-error');
      } else {
        el.append(this._renderContent($$, cell));
      }

      return el
    }

    _renderContent($$, cell) {
      const text = cell.text();
      const isExpressionCell = isExpression(text);
      const value = getValue(cell);
      if(isExpressionCell) {
        const valueEl = $$(ValueComponent, value).ref('value');
        return $$('div').addClass('sc-text-content').append(valueEl)
      } else {
        return $$('div').addClass('sc-text-content').text(text)
      }
    }

    getContent() {
      return this.props.node.getText()
    }
  }

  function getBoundingRect(el) {
    let _rect = el.getNativeElement().getBoundingClientRect();
    return {
      top: _rect.top,
      left: _rect.left,
      height: _rect.height,
      width: _rect.width
    }
  }

  /*
   This Component renders a part of a sheet which is defined
   by a viewport.

   It is a pure renderer without any interaction (as opposed to SheetComponent).
   It provides an API to map from screen coordinates to column and row indexes.
  */
  class SheetView extends substance.Component {

    shouldRerender() {
      return false
    }

    didMount() {
      this.props.viewport.on('scroll', this._onScroll, this);
      this._updateViewport();
    }

    didUpdate() {
      this._updateViewport();
    }

    dispose() {
      this.props.viewport.off(this);
    }

    update() {
      this.rerender();
    }

    render($$) {
      const sheet = this.props.sheet;
      const viewport = this.props.viewport;
      const M = sheet.getColumnCount();

      let el = $$('table').addClass('sc-table-view');
      let head = $$('tr').addClass('se-head').ref('head');
      let corner = $$('th').addClass('se-corner').ref('corner')
        .on('click', this._selectAll);

      // ATTENTION: we have a slight problem here.
      // <table> with fixed layout needs the exact width
      // so that the column widths are correct.
      // To avoid that corrupting the layout we need
      // to make sure to set the correct value here
      // Unfortunately this means that we must set the corner width here
      let width = this.props.cornerWidth || 50;
      corner.css({ width });
      head.append(corner);
      for(let colIdx = 0; colIdx < M; colIdx++) {
        let columnMeta = sheet.getColumnMeta(colIdx);
        let th = $$(SheetColumnHeader, { node: columnMeta, colIdx }).ref(columnMeta.id);
        let w = th.getWidth();
        if (colIdx < viewport.startCol) {
          th.addClass('sm-hidden');
        } else {
          width += w;
        }
        head.append(th);
      }
      el.css({ width });
      el.append(head);
      el.append(
        $$(TableBody, { sheet, viewport }).ref('body')
      );
      return el
    }

    _updateViewport() {
      this._updateHeader();
      this._updateBody();
    }

    _updateHeader() {
      let viewport = this.props.viewport;
      // Note: in contrast to the render method
      // we can use the real width here
      viewport.width = this.refs.corner.el.getWidth();
      viewport.endCol = viewport.startCol;

      const W = viewport.getContainerWidth();

      let cols = this.refs.head.el.children;
      let i;
      for (i = 1; i < cols.length; i++) {
        let colIdx = i-1;
        let th = cols[i];
        if (colIdx < viewport.startCol) {
          th.addClass('sm-hidden');
        } else {
          th.removeClass('sm-hidden');
          let w = th.getWidth();
          viewport.width += w;
          if (viewport.width > W) {
            break
          }
          viewport.endCol++;
        }
      }
      for (i = i+1; i < cols.length; i++) {
        let th = cols[i];
        th.addClass('sm-hidden');
      }
      this.el.css({ width: viewport.width });
    }

    _updateBody() {
      let viewport = this.props.viewport;
      viewport.height = this.refs.corner.el.getHeight();
      viewport.endRow = viewport.startRow;

      const H = viewport.getContainerHeight();

      // show only cells which are inside the viewport
      let rowIt = this.refs.body.el.getChildNodeIterator();
      let rowIdx = viewport.startRow;
      while (rowIt.hasNext()) {
        let row = rowIt.next();
        let cols = row.children;
        for (let i = 1; i < cols.length; i++) {
          let td = cols[i];
          let colIdx = i-1;
          if (colIdx < viewport.startCol || colIdx > viewport.endCol) {
            td.addClass('sm-hidden');
          } else {
            td.removeClass('sm-hidden');
          }
        }
        let h = row.getHeight();
        viewport.height += h;
        if (viewport.height < H) {
          viewport.endRow = rowIdx;
        }
        rowIdx++;
      }
    }

    getBoundingRect(rowIdx, colIdx) {
      let top = 0, left = 0, height = 0, width = 0;
      // in header
      let rowComp;
      if (rowIdx === -1) {
        rowComp = this.refs.head;
      } else {
        rowComp = this.refs.body.getRowComponent(rowIdx);
      }
      if (rowComp) {
        let rect = substance.getRelativeBoundingRect(rowComp.el, this.el);
        top = rect.top;
        height = rect.height;
      }
      let colComp;
      if (colIdx === -1) {
        colComp = this.refs.corner;
      } else {
        colComp = this.refs.head.getChildAt(colIdx+1);
      }
      if (colComp) {
        let rect = substance.getRelativeBoundingRect(colComp.el, this.el);
        left = rect.left;
        width = rect.width;
      }
      return { top, left, width, height }
    }

    getCellComponent(rowIdx, colIdx) {
      if (rowIdx === -1) {
        // retrieve a header cell
        return this.refs.head.getChildAt(colIdx+1)
      } else {
        let tr = this.refs.body.getRowComponent(rowIdx);
        if (tr) {
          return tr.getCellComponent(colIdx)
        }
      }
      // otherwise
      return null
    }

    getCellComponentForCell(cell) {
      // TODO: need to revisit this for a better implementation
      return this.refs.body.find(`td[data-cell-id="${cell.id}"]`)
    }

    getCornerComponent() {
      return this.refs.corner
    }

    /*
     * Tries to resolve row and column index, and type of cell
     * for a given event
     */
    getTargetForEvent(e) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      let colIdx = this.getColumnIndexForClientX(clientX);
      let rowIdx = this.getRowIndexForClientY(clientY);
      let type;
      if (colIdx >= 0 && rowIdx >= 0) {
        type = 'cell';
      } else if (colIdx === -1 && rowIdx >= 0) {
        type = 'row';
      } else if (colIdx >= 0 && rowIdx === -1) {
        type = 'column';
      } else if (colIdx === -1 && rowIdx === -1) {
        type = 'corner';
      } else {
        type = 'outside';
      }
      return { type, rowIdx, colIdx }
    }

    // TODO: rename this to indicate usage: map clientX to column
    getColumnIndexForClientX(x) {
      const headEl = this.refs.head.el;
      const children = headEl.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (_isXInside(x, getBoundingRect(child))) {
          return i-1
        }
      }
      return undefined
    }

    // TODO: rename this to indicate usage: map clientY to row
    getRowIndexForClientY(y) {
      const headEl = this.refs.head.el;
      if (_isYInside(y, getBoundingRect(headEl))) {
        return -1
      }
      const bodyEl = this.refs.body.el;
      const children = bodyEl.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (_isYInside(y, getBoundingRect(child))) {
          return parseInt(child.getAttribute('data-row'), 10)
        }
      }
      return undefined
    }

    _onScroll(dr, dc) {
      if (dc && !dr) {
        this._updateViewport();
      } else if (dr && !dc) {
        this.refs.body.update();
        this._updateViewport();
      } else {
        this.refs.body.update();
        this._updateViewport();
      }
    }

    _selectAll() {
      this.send('selectAll');
    }
  }

  function _isXInside(x, rect) {
    return x >= rect.left && x <= rect.left+rect.width
  }

  function _isYInside(y, rect) {
    return y >= rect.top && y <= rect.top+rect.height
  }

  class TableBody extends substance.Component {

    getInitialState() {
      return {}
    }

    render($$) {
      let el = $$('tbody');
      let sheet = this.props.sheet;
      let viewport = this.props.viewport;
      let N = sheet.getRowCount();
      let n = Math.min(viewport.startRow+viewport.P, N);
      for (let rowIdx = viewport.startRow; rowIdx < n; rowIdx++) {
        el.append(
          $$(TableRow, {
            sheet, viewport, rowIdx
          }).ref(String(rowIdx))
        );
      }
      this._startRow = viewport.startRow;
      this._nextRow = n;
      return el
    }

    update() {
      const viewport = this.props.viewport;
      let dr = viewport.startRow - this._startRow;
      // doing an incremental render if scrolling
      // in steps smaller than the viewport size, i.e. 'prefetching' rows
      // otherwise just a full rerender because everything changes
      if (dr > 0 && dr < viewport.P) {
        this._append(dr);
      } else if (dr < 0 && dr > -viewport.P) {
        this._prepend(dr);
      } else {
        this.rerender();
      }
    }

    getRowComponent(rowIdx) {
      return this.refs[rowIdx]
    }

    _append(dr) {
      let renderContext = substance.RenderingEngine.createContext(this);
      let $$ = renderContext.$$;
      let sheet = this.props.sheet;
      let viewport = this.props.viewport;
      const N = sheet.getRowCount();
      for(let i=0; i<dr; i++) {
        // Note: to be able to scroll to the very end
        // we stop appending rows when hitting the bottom of the sheet
        // but still removing the first row
        let rowIndex = this._nextRow++;
        if (rowIndex < N) {
          this.append(
            $$(TableRow, {
              sheet, viewport,
              rowIdx: rowIndex
            }).ref(String(rowIndex))
          );
        }
        this.removeChild(this.getChildAt(0));
        this._startRow++;
      }
    }

    _prepend(dr) {
      let renderContext = substance.RenderingEngine.createContext(this);
      let $$ = renderContext.$$;
      let sheet = this.props.sheet;
      let viewport = this.props.viewport;
      for(let i=0; i>dr; i--) {
        this._startRow--;
        let rowIndex = this._startRow;
        this.insertAt(0,
          $$(TableRow, {
            sheet, viewport,
            rowIdx: rowIndex
          }).ref(String(rowIndex))
        );
        // only remove the trailing row if there are enough
        // rows present already
        if (this.getChildCount() > viewport.P) {
          this.removeChild(this.getChildAt(this.getChildCount()-1));
        }
        this._nextRow--;
      }
    }

  }

  class TableRow extends substance.Component {

    render($$) {
      let sheet = this.props.sheet;
      let rowIdx = this.props.rowIdx;
      let viewport = this.props.viewport;
      let height = 30;
      let el = $$('tr');

      let M = sheet.getColumnCount();
      el.append(
        $$(SheetRowHeader, { rowIdx: rowIdx })
        // within a row, the header is referenced as '-1'
        .ref(String(-1))
      );
      for (let j = 0; j < M; j++) {
        const cell = sheet.getCell(rowIdx, j);
        let td = $$('td').ref(String(j))
          .append(
            $$(SheetCellComponent, { node: cell }).ref(cell.id)
          ).attr({
            'data-row': rowIdx,
            'data-col': j,
            'data-cell-id': cell.id
          });
        if (j < viewport.startCol || j > viewport.endCol) {
          td.addClass('sm-hidden');
        }

        el.append(td);
      }
      el.attr('data-row', rowIdx);
      el.css({
        "height": height
      });
      return el
    }

    hide() {
      this.setState('hidden');
    }

    getCellComponent(colIdx) {
      return this.refs[colIdx]
    }
  }

  class SheetViewport extends substance.EventEmitter {

    constructor(sheet, container) {
      super();

      this._sheet = sheet;
      this._container = container;

      // fictive scroll position: instead of real scroll
      // coordinates we apply a simple heuristic,
      // using a fixed height and width for every column
      // and a fictive position within this model
      this.x = 0;
      this.y = 0;

      // this is always the cell in the top-left corner
      this.startRow = 0;
      this.startCol = 0;
      // this is always the cell in the bottom-right corner
      // which is fully visible
      this.endRow = 0;
      this.endCol = 0;
      // size of a cell
      this.D = 30;
      // number of rows to be rendered (regardless of actual container size)
      this.P = 50;
    }

    getContainerWidth() {
      let el = this._container.el;
      return el ? el.getWidth() : 0
    }

    getContainerHeight() {
      let el = this._container.el;
      return el ? el.getHeight() : 0
    }

    getContainerRect() {
      let el = this._container.el;
      return el ? getBoundingRect(el) : {}
    }

    // scrolling in a virtual grid of squares
    update(viewport) {
      let { startRow, startCol } = viewport;
      let dr = startRow - this.startRow;
      let dc = startCol - this.startCol;
      this.startRow = startRow;
      this.startCol = startCol;
      this.x = startCol * this.D;
      this.y = startRow * this.D;
      this.emit('scroll', dr, dc);
    }

    // scrolling in a virtual grid of squares
    scroll(dx, dy) {
      const N = this.N;
      const M = this.M;
      let oldX = this.x;
      let oldY = this.y;
      let oldC = Math.floor(oldX/this.D);
      let oldR = Math.floor(oldY/this.D);
      let newX = Math.max(0, Math.min(M*this.D, oldX+dx));
      let newY = Math.max(0, Math.min(N*this.D, oldY+dy));
      this.x = newX;
      this.y = newY;
      let newC = Math.floor(newX/this.D);
      let newR = Math.floor(newY/this.D);
      let dr = newR - oldR;
      let dc = newC - oldC;
      // stop if there is no change
      if (!dr && !dc) return
      const oldStartRow = this.startRow;
      const oldStartCol = this.startCol;
      const newStartRow = Math.max(0, Math.min(N-1, oldStartRow+dr));
      const newStartCol = Math.max(0, Math.min(M-1, oldStartCol+dc));
      dr = newStartRow - oldStartRow;
      dc = newStartCol - oldStartCol;
      if (dr || dc) {
        this.startCol = newStartCol;
        this.startRow = newStartRow;
        this.emit('scroll', dr, dc);
      }
    }

    shift(dr, dc) {
      // just make sure that these are integers
      dr = Math.floor(dr);
      dc = Math.floor(dc);
      const sheet = this._sheet;
      let M = sheet.getColumnCount();
      let N = sheet.getRowCount();
      let oldStartRow = this.startRow;
      let oldStartCol = this.startCol;
      let newStartRow = Math.max(0, Math.min(oldStartRow+dr, N-1));
      let newStartCol = Math.max(0, Math.min(oldStartCol+dc, M-1));
      dr = newStartRow - oldStartRow;
      dc = newStartCol - oldStartCol;
      if (dr || dc) {
        this.startCol = newStartCol;
        this.startRow = newStartRow;
        this.x = newStartCol*this.D;
        this.y = newStartRow*this.D;
        this.emit('scroll', dr, dc);
      }
    }

    getTotalHeight() {
      return this.N*this.D
    }

    getTotalWidth() {
      return this.M*this.D
    }

    get N() {
      return this._sheet.getRowCount()
    }

    get M() {
      return this._sheet.getColumnCount()
    }

    toJSON() {
      return {
        startRow: this.startRow,
        startCol: this.startCol
      }
    }

  }

  class SheetScrollbar extends substance.Component {

    didMount() {
      this._updatePositions();
      this.props.viewport.on('scroll', this._onScroll, this);
    }

    dispose() {
      this.props.viewport.off(this);
    }

    didUpdate() {
      this._updatePositions();
    }

    render($$) {
      const horizontal = this._isHorizontal();
      let el = $$('div')
        .addClass('sc-sheet-scrollbar')
        .addClass(horizontal ? 'sm-horizontal' : 'sm-vertical');

      el.append(
        $$('div').addClass('se-lspace'),
        this._renderScrollArea($$),
        this._renderButtons($$),
        $$('div').addClass('se-rspace')
      );
      return el
    }

    _renderScrollArea($$) {
      let scrollArea = $$('div').ref('scrollArea').addClass('se-scroll-area');
      let thumb = $$('div').ref('thumb').addClass('se-thumb')
        .on('mousedown', this._onMousedownThumb);
      scrollArea.append(thumb);
      scrollArea.on('mousedown', this._onMousedownScrollArea);
      return scrollArea
    }

    _renderButtons($$) {
      const iconProvider = this.context.iconProvider;
      const horizontal = this._isHorizontal();
      let buttons = $$('div').addClass('se-buttons');
      let prev = $$('button').ref('prev').addClass('se-prev').addClass('se-button')
        .on('mousedown', this._onMousedownPrev);
      let next = $$('button').ref('next').addClass('se-next').addClass('se-button')
        .on('mousedown', this._onMousedownNext);
      if (horizontal) {
        prev.append(iconProvider.renderIcon($$, 'sheet-scroll-left'));
        next.append(iconProvider.renderIcon($$, 'sheet-scroll-right'));
      } else {
        prev.append(iconProvider.renderIcon($$, 'sheet-scroll-up'));
        next.append(iconProvider.renderIcon($$, 'sheet-scroll-down'));
      }
      buttons.append(prev, next);
      return buttons
    }

    _isHorizontal() {
      return this.props.axis === 'x'
    }

    _updatePositions() {
      const sheet = this.props.sheet;
      const viewport = this.props.viewport;
      const horizontal = this._isHorizontal();
      let factor, scrollFactor, scrollbarSize;
      if (horizontal) {
        factor = (viewport.endCol-viewport.startCol+1)/sheet.getColumnCount();
        scrollFactor = viewport.startCol/sheet.getColumnCount();
        scrollbarSize = this.refs.scrollArea.el.getWidth();
      } else {
        factor = (viewport.endRow-viewport.startRow+1)/sheet.getRowCount();
        scrollFactor = viewport.startRow/sheet.getRowCount();
        scrollbarSize = this.refs.scrollArea.el.getHeight();
      }
      let thumbSize = factor * scrollbarSize;
      let pos = scrollFactor * scrollbarSize;
      if (horizontal) {
        this.refs.thumb.css({
          left: pos,
          width: thumbSize
        });
      } else {
        this.refs.thumb.css({
          top: pos,
          height: thumbSize
        });
      }
    }

    _onResize() {
      // do a full rerender when window gets resized
      this.rerender();
    }

    _onMousedownThumb(e) {
      e.stopPropagation();
      e.preventDefault();
      // console.log('_onMouseDownThumb', e)
      if (substance.platform.inBrowser) {
        // temporarily, we bind to events on window level
        // because could leave the this element's area while dragging
        let _window = substance.DefaultDOMElement.wrap(window);
        _window.on('mousemove', this._onMoveThumb, this);
        _window.on('mouseup', this._onMouseUp, this);
      }
    }

    _onMousedownScrollArea(e) {
      // same as when mousedowning in the thumb
      this._onMousedownThumb(e);
      // plus moving the thumb to the start position
      this._onMoveThumb(e);
    }

    _onMousedownPrev(e) {
      e.stopPropagation();
      e.preventDefault();
      const viewport = this.props.viewport;
      if (this._isHorizontal()) {
        viewport.shift(0, -1);
      } else {
        viewport.shift(-1, 0);
      }
    }

    _onMousedownNext(e) {
      e.stopPropagation();
      e.preventDefault();
      const viewport = this.props.viewport;
      if (this._isHorizontal()) {
        viewport.shift(0, 1);
      } else {
        viewport.shift(1, 0);
      }
    }

    _onMouseUp(e) {
      e.stopPropagation();
      e.preventDefault();
      this._relax();
    }

    _onMoveThumb(e) {
      e.stopPropagation();
      e.preventDefault();
      const viewport = this.props.viewport;
      const rect = getBoundingRect(this.refs.scrollArea.el);
      // TODO: we should consider at which position the user started
      // dragging the thumb instead of always using 0.5
      if (this._isHorizontal()) {
        let thumbSize = this.refs.thumb.el.getWidth();
        let clientPos = e.clientX - 0.5*thumbSize;
        let size = rect.width;
        let pos = Math.max(0, Math.min(size, clientPos - rect.left));
        let factor = pos / size;
        let newCol = Math.floor(factor*viewport.M);
        viewport.shift(0, newCol-viewport.startCol);
      } else {
        let thumbSize = this.refs.thumb.el.getHeight();
        let clientPos = e.clientY - 0.5*thumbSize;
        let size = rect.height;
        let pos = Math.max(0, Math.min(size, clientPos - rect.top));
        let factor = pos / size;
        let newRow = Math.floor(factor*viewport.N);
        viewport.shift(newRow-viewport.startRow, 0);
      }
    }

    _relax() {
      if (substance.platform.inBrowser) {
        let _window = substance.DefaultDOMElement.wrap(window);
        _window.off(this);
      }
    }

    _onScroll() {
      this._updatePositions();
    }

  }

  class SheetContextMenu extends substance.ToolPanel {

    getEntryTypeComponents() {
      return {
        'tool-group': this.getComponent('menu-group'),
        'tool-dropdown': this.getComponent('menu-group')
      }
    }

    render($$) {
      let el = $$('div').addClass('sc-sheet-context-menu');
      el.append(this.renderEntries($$));
      return el
    }

  }

  function insertRows(editorSession, pos, count) {
    editorSession.transaction((tx) => {
      _createRowsAt(tx.getDocument(), pos, count);
    }, { action: 'insertRows', pos, count });
  }

  function insertCols(editorSession, pos, count) {
    editorSession.transaction((tx) => {
      _createColumnsAt(tx.getDocument(), pos, count);
    }, { action: 'insertCols', pos, count });
  }

  function deleteRows(editorSession, pos, count) {
    editorSession.transaction((tx) => {
      _deleteRows(tx.getDocument(), pos, pos+count-1);
    }, { action: 'deleteRows', pos, count });
  }

  function deleteCols(editorSession, pos, count) {
    editorSession.transaction((tx) => {
      _deleteCols(tx.getDocument(), pos, pos+count-1);
    }, { action: 'deleteCols', pos, count });
  }

  function setValues(editorSession, startRow, startCol, vals) {
    let n = vals.length;
    let m = vals[0].length;
    ensureSize(editorSession, startRow+n, startCol+m);
    editorSession.transaction(tx => {
      let sheet = tx.getDocument();
      _setValues(sheet, startRow, startCol, vals);
      tx.setSelection({
        type: 'custom',
        customType: 'sheet',
        data: {
          type: 'range',
          anchorRow: startRow,
          anchorCol: startCol,
          focusRow: startRow+n-1,
          focusCol: startCol+m-1
        }
      });
    }, { action: 'setValues' });
  }

  function clearValues(editorSession, startRow, startCol, endRow, endCol) {
    editorSession.transaction(tx => {
      // Note: the selection remains the same
      _clearValues(tx.getDocument(), startRow, startCol, endRow, endCol);
    });
  }

  function ensureSize(editorSession, nrows, ncols) {
    let sheet = editorSession.getDocument();
    let [_nrows, _ncols] = sheet.getDimensions();
    if (_ncols < ncols) {
      insertCols(editorSession, _ncols, ncols-_ncols);
    }
    if (_nrows < nrows) {
      insertRows(editorSession, _nrows, nrows-_nrows);
    }
  }

  function _setValues(sheet, startRow, startCol, vals) {
    for (let i = 0; i < vals.length; i++) {
      let row = vals[i];
      for (let j = 0; j < row.length; j++) {
        let val = row[j];
        let cell = sheet.getCell(startRow+i, startCol+j);
        if (cell) {
          cell.textContent = val;
        }
      }
    }
  }

  function _clearValues(sheet, startRow, startCol, endRow, endCol) {
    for (let rowIdx = startRow; rowIdx <= endRow; rowIdx++) {
      for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
        let cell = sheet.getCell(rowIdx, colIdx);
        cell.textContent = '';
      }
    }
  }

  function _createRowsAt(sheet, rowIdx, n) {
    let $$ = sheet.createElement.bind(sheet);
    const M = sheet.getColumnCount();
    let data = sheet._getData();
    let rowAfter = data.getChildAt(rowIdx);
    for (let i = 0; i < n; i++) {
      let row = $$('row');
      for (let j = 0; j < M; j++) {
        let cell = $$('cell');
        // TODO: maybe insert default value?
        row.append(cell);
      }
      data.insertBefore(row, rowAfter);
    }
  }

  function _deleteRows(sheet, startRow, endRow) {
    let data = sheet._getData();
    for (let rowIdx = endRow; rowIdx >= startRow; rowIdx--) {
      let row = data.getChildAt(rowIdx);
      // TODO: add a helper to delete recursively
      row._childNodes.forEach((id) => {
        sheet.delete(id);
      });
      data.removeChild(row);
    }
  }

  function _deleteCols(sheet, startCol, endCol) {
    let data = sheet._getData();
    let N = sheet.getRowCount();
    let columns = sheet._getColumns();
    for (let colIdx = endCol; colIdx >= startCol; colIdx--) {
      columns.removeAt(colIdx);
    }
    for (let rowIdx = N-1; rowIdx >= 0; rowIdx--) {
      let row = data.getChildAt(rowIdx);
      for (let colIdx = endCol; colIdx >= startCol; colIdx--) {
        const cellId = row.getChildAt(colIdx).id;
        row.removeAt(colIdx);
        sheet.delete(cellId);
      }
    }
  }

  function _createColumnsAt(sheet, colIdx, n) {
    // TODO: we need to add columns' meta, too
    // for each existing row insert new cells
    let $$ = sheet.createElement.bind(sheet);
    let data = sheet._getData();
    let it = data.getChildNodeIterator();
    let columns = sheet._getColumns();
    let colAfter = columns.getChildAt(colIdx);
    for (let j = 0; j < n; j++) {
      let col = $$('col').attr('type', 'any');
      columns.insertBefore(col, colAfter);
    }
    while(it.hasNext()) {
      let row = it.next();
      let cellAfter = row.getChildAt(colIdx);
      for (let j = 0; j < n; j++) {
        let cell = $$('cell');
        row.insertBefore(cell, cellAfter);
      }
    }
  }

  class SheetClipboard {

    constructor(editorSession) {
      this.editorSession = editorSession;
    }

    onCopy(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.clipboardData) {
        let data = this._copy();
        if (data) {
          // store as plain text and html
          e.clipboardData.setData('text/plain', data.text);
          try {
            e.clipboardData.setData('text/html', data.html);
          } catch(err) {
            // fails under some browsers
          }
        }
      }
    }

    onCut(e) {
      this.onCopy(e);
      this._cut();
    }

    onPaste(event) {
      let clipboardData = event.clipboardData;
      let types = {};
      for (let i = 0; i < clipboardData.types.length; i++) {
        types[clipboardData.types[i]] = true;
      }
      event.preventDefault();
      event.stopPropagation();
      let plainText;
      let html;
      if (types['text/plain']) {
        plainText = clipboardData.getData('text/plain');
      }
      if (types['text/html']) {
        html = clipboardData.getData('text/html');
      }
      // WORKAROUND: FF does not provide HTML coming in from other applications
      // so fall back to pasting plain text
      if (substance.platform.isFF && !html) {
        this._pastePlainText(plainText);
        return
      }
      // if we have content given as HTML we let the importer assess the quality first
      // and fallback to plain text import if it's bad
      if (html) {
        this._pasteHtml(html, plainText);
      } else {
        this._pastePlainText(plainText);
      }
    }

    _pasteHtml(html, plainText) {
      let vals = this._htmlToVals(html);
      if (vals && vals.length > 0) {
        let { startRow, startCol } = this._getRange();
        setValues(this.editorSession, startRow, startCol, vals);
      } else {
        this._pastePlainText(plainText);
      }
    }

    _pastePlainText(plainText) {
      let sel = this._getSelection();
      if (!sel) return
      const rowIdx = sel.anchorRow;
      const colIdx = sel.anchorCol;
      this.editorSession.transaction((tx) => {
        let sheet = tx.getDocument();
        let cell = sheet.getCell(rowIdx, colIdx);
        cell.textContent = plainText;
        tx.setSelection({
          type: 'custom',
          customType: 'sheet',
          data: {
            type: 'range',
            anchorRow: rowIdx,
            anchorCol: colIdx,
            focusRow: rowIdx,
            focusCol: colIdx
          }
        });
      });
    }

    _getSelection() {
      return getSelection(this.editorSession)
    }

    _getRange() {
      return getRange(this.editorSession)
    }

    _copy() {
      const sheet = this.editorSession.getDocument();
      const range = this._getRange();
      if (!range) return null
      let rows = getRangeFromMatrix(sheet.getCellMatrix(), range.startRow, range.startCol, range.endRow, range.endCol, true);
      let vals = rows.map(row => {
        return row.map(cell => {
          return cell.textContent
        })
      });
      let text = this._valsToPlainText(vals);
      let html = this._valsToHTML(vals);
      return { text, html }
    }

    _cut() {
      const range = this._getRange();
      if (!range) return
      clearValues(this.editorSession, range.startRow, range.startCol, range.endRow, range.endCol);
    }

    _valsToHTML(vals) {
      let bodyHTML = vals.map((rowVals) => {
        const rowHTML = rowVals.map((val) => {
          return `<td>${val}</td>`
        }).join('');
        return `<tr>${rowHTML}</tr>`
      }).join('\n');
      return `<table>${bodyHTML}</table>`
    }

    _valsToPlainText(vals) {
      return vals.map((rowVals) => {
        return rowVals.join('\t')
      }).join('\n')
    }

    _htmlToVals(html) {
      let doc = substance.DefaultDOMElement.parseHTML(html);
      let table = doc.find('table');
      if (table) {
        let rowEls = table.findAll('tr');
        let vals = rowEls.map((rowEl) => {
          return rowEl.children.map((cell) => {
            return cell.textContent
          })
        });
        return vals
      }
    }
  }

  class SheetComponent extends substance.CustomSurface {

    constructor(...args) {
      super(...args);
      this._nav = lodash_throttle(this._nav.bind(this), 50, { leading: true });
    }

    // TODO: we should think about using Component state instead
    getInitialState() {
      const sheet = this.props.sheet;
      this._clipboard = new SheetClipboard(this.context.editorSession);
      this._viewport = new SheetViewport(sheet, this);
      this._viewport.on('scroll', this._onViewportScroll, this);
      // internal state used during cell editing
      this._cell = null;
      // internal state used during selection
      this._isSelecting = false;
      this._selectionData = {
        type: 'range',
        anchorRow: -1,
        anchorCol: -1,
        focusRow: -1,
        focusCol: -1
      };
      // TODO: we could shift the dialog up into SheetEditor
      // treating it as an overlay
      // state used to ignore events when dialog is open
      this._isShowingDialog = false;
      return {}
    }

    didMount() {
      super.didMount();
      const editorSession = this.context.editorSession;
      editorSession.on('render', this._onSelectionChange, this, {
        resource: 'selection'
      });
      editorSession.on('render', this._onDocumentChange, this, {
        resource: 'document'
      });
      // rerender the table view as soon the real element height is known
      this.refs.sheetView.update();
      // position selection overlays to reflect an initial selection
      this._positionOverlays();
    }

    dispose() {
      super.dispose();
      this.context.editorSession.off(this);
    }

    didUpdate() {
      this._positionOverlays();
    }

    render($$) {
      const sheet = this._getSheet();
      const viewport = this._viewport;
      let el = $$('div').addClass('sc-sheet');
      let contentEl = $$('div').addClass('se-content').append(
        $$(SheetView, {
          sheet,
          viewport
        }).ref('sheetView')
      )
        .on('wheel', this._onWheel, this)
        .on('mousedown', this._onMousedown)
        .on('mousemove', this._onMousemove)
        .on('dblclick', this._onDblclick)
        .on('contextmenu', this._onContextMenu)
        .on('contextmenuitemclick', this._hideMenus);

      el.append(
        $$('textarea').addClass('se-keytrap').ref('keytrap')
          .css({ position: 'absolute', width: 0, height: 0 })
          .on('keydown', this._onKeyDown)
          .on('input', this._onInput)
          .on('copy', this._onCopy)
          .on('paste', this._onPaste)
          .on('cut', this._onCut),
        contentEl,
        this._renderUnclickableOverlays($$),
        this._renderClickableOverlays($$),
        this._renderRowContextMenu($$),
        this._renderColumnContextMenu($$),
        $$(DialogPanel).ref('dialog').addClass('sm-hidden'),
        $$(SheetScrollbar, {
          sheet, viewport,
          axis: 'x'
        }).ref('scrollX'),
        $$(SheetScrollbar, {
          sheet, viewport,
          axis: 'y'
        }).ref('scrollY')
      );
      return el
    }

    getSheet() {
      return this.props.sheet
    }

    getSheetView() {
      return this.refs.sheetView
    }

    // data: {anchorRow, anchorCol, focusRow, focusCol}
    getRectangleForRange(data) {
      const rects = this._computeSelectionRects(data, 'range');
      return rects.selRect
    }

    forceUpdate() {
      this.refs.sheetView.update();
      this.refs.scrollX.rerender();
      this.refs.scrollY.rerender();
      this._positionOverlays();
    }

    // called by SurfaceManager to render the selection plus setting the
    // DOM selection into a proper state
    rerenderDOMSelection() {
      // console.log('SheetComponent.rerenderDOMSelection()')
      this._positionSelection();
      // put the native focus into the keytrap so that we
      // receive keyboard events
      this.refs.keytrap.el.focus();
    }

    openColumnSettings(params) {
      this._showDialog('column-settings-dialog', params);
    }

    _renderUnclickableOverlays($$) {
      let el = $$('div').addClass('se-unclickable-overlays');
      el.append(
        this._renderSelectionOverlay($$)
      );
      el.append(
        this.props.unclickableOverlays
      );
      return el
    }

    _renderClickableOverlays($$) {
      let el = $$('div').addClass('se-clickable-overlays');
      el.append(
        this.props.overlays
      );
      return el
    }

    _renderSelectionOverlay($$) {
      let el = $$('div').addClass('se-selection-overlay');
      el.append(
        $$('div').addClass('se-selection-anchor').ref('selAnchor').css('visibility', 'hidden'),
        $$('div').addClass('se-selection-range').ref('selRange').css('visibility', 'hidden'),
        $$('div').addClass('se-selection-columns').ref('selColumns').css('visibility', 'hidden'),
        $$('div').addClass('se-selection-rows').ref('selRows').css('visibility', 'hidden')
      );
      return el
    }

    _renderRowContextMenu($$) {
      const configurator = this.context.configurator;
      let rowMenu = $$(SheetContextMenu, {
        toolPanel: configurator.getToolPanel('row-context-menu')
      }).ref('rowMenu')
        .addClass('se-context-menu')
        .css({ display: 'none' });
      return rowMenu
    }

    _renderColumnContextMenu($$) {
      const configurator = this.context.configurator;
      let colMenu = $$(SheetContextMenu, {
        toolPanel: configurator.getToolPanel('column-context-menu')
      }).ref('columnMenu')
        .addClass('se-context-menu')
        .css({
          display: 'none'
        });
      return colMenu
    }

    /*
      NOTE: sheet.UUID is set in SheetDocument's constructor and is also used
            by SheetEngineAdapter
    */
    _getCustomResourceId() {
      let sheet = this._getSheet();
      return sheet.UUID
    }

    _getBoundingRect(rowIdx, colIdx) {
      return this.refs.sheetView.getBoundingRect(rowIdx, colIdx)
    }

    _getCellComponent(rowIdx, colIdx) {
      return this.refs.sheetView.getCellComponent(rowIdx, colIdx)
    }

    _positionOverlays() {
      this._positionSelection();
    }

    _positionSelection() {
      const sel = this.context.editorSession.getSelection();
      if (sel.surfaceId === this.getId()) {
        const data = sel.data;
        let rects = this._computeSelectionRects(data, data.type);
        let styles = this._computeSelectionStyles(data, rects);
        this.refs.selAnchor.css(styles.anchor);
        this.refs.selRange.css(styles.range);
        this.refs.selColumns.css(styles.columns);
        this.refs.selRows.css(styles.rows);
      }
    }

    _positionRangeSelection(sel) {
      const data = sel.data;
      const rects = this._computeSelectionRects(data, data.type);
      const styles = this._computeSelectionStyles(sel, rects);
      this.refs.selRange.css(styles.range);
    }

    _computeSelectionRects(data, type) {
      const viewport = this._getViewport();
      let styles = {
        anchor: { visibility: 'hidden' },
        range: { visibility: 'hidden' },
        columns: { visibility: 'hidden' },
        rows: { visibility: 'hidden' },
      };
      let anchorRow, anchorCol;
      let ulRow, ulCol, lrRow, lrCol;
      switch(type) {
        case 'range': {
          anchorRow = data.anchorRow;
          anchorCol = data.anchorCol;
          let focusRow = data.focusRow;
          let focusCol = data.focusCol;
          let startRow = anchorRow;
          let startCol = anchorCol;
          let endRow = focusRow;
          let endCol = focusCol;
          if (startRow > endRow) {
            [startRow, endRow] = [endRow, startRow];
          }
          if (startCol > endCol) {
            [startCol, endCol] = [endCol, startCol];
          }
          // don't render the selection if it is completely outside of the viewport
          if (endRow < viewport.startRow || startRow > viewport.endRow ||
              endCol < viewport.startCol || startCol > viewport.endCol ) {
            break
          }
          [ulRow, ulCol] = [Math.max(startRow, viewport.startRow), Math.max(startCol, viewport.startCol)]
          ;[lrRow, lrCol] = [Math.min(endRow, viewport.endRow), Math.min(endCol, viewport.endCol)];
          break
        }
        case 'columns': {
          anchorCol = data.anchorCol;
          anchorRow = viewport.startRow;
          let focusCol = data.focusCol;
          let startCol = anchorCol;
          let endCol = focusCol;
          if (startCol > endCol) {
            [startCol, endCol] = [endCol, startCol];
          }
          [ulRow, ulCol] = [viewport.startRow, Math.max(startCol, viewport.startCol)]
          ;[lrRow, lrCol] = [viewport.endRow, Math.min(endCol, viewport.endCol)];
          break
        }
        case 'rows': {
          anchorRow = data.anchorRow;
          anchorCol = viewport.startCol;
          let focusRow = data.focusRow;
          let startRow = anchorRow;
          let endRow = focusRow;
          if (startRow > endRow) {
            [startRow, endRow] = [endRow, startRow];
          }
          [ulRow, ulCol] = [Math.max(startRow, viewport.startRow), viewport.startCol]
          ;[lrRow, lrCol] = [Math.min(endRow, viewport.endRow), viewport.endCol];
          break
        }
        default:
          return styles
      }
      // TODO: We need to improve rendering for range selections
      // that are outside of the viewport
      let anchorRect = this._getBoundingRect(anchorRow, anchorCol);
      let ulRect = this._getBoundingRect(ulRow, ulCol);
      let lrRect = this._getBoundingRect(lrRow, lrCol);
      let selRect;
      if (ulRect&&lrRect) {
        selRect = this._computeSelectionRectangle(ulRect, lrRect);
      }
      return { anchorRect, selRect, ulRect, lrRect}
    }

    _computeSelectionStyles(data, { anchorRect, ulRect, lrRect }) {
      let styles = {
        range: { visibility: 'hidden' },
        columns: { visibility: 'hidden' },
        rows: { visibility: 'hidden' },
        anchor: { visibility: 'hidden' }
      };
      if (anchorRect && anchorRect.width && anchorRect.height) {
        Object.assign(styles, this._computeAnchorStyles(anchorRect));
      }
      if (ulRect && lrRect) {
        Object.assign(
          styles,
          this._computeRangeStyles(ulRect, lrRect, data.type)
        );
      }
      return styles
    }

    _computeAnchorStyles(anchorRect) {
      let styles = {
        anchor: { visibility: 'hidden' }
      };
      if (anchorRect) {
        Object.assign(styles.anchor, anchorRect);
        if (
          isFinite(anchorRect.top) &&
          isFinite(anchorRect.left) &&
          isFinite(anchorRect.width) &&
          isFinite(anchorRect.height)
        ) {
          styles.anchor.visibility = 'visible';
        }
      }
      return styles
    }

    _computeSelectionRectangle(ulRect, lrRect) {
      let selRect = {};
      selRect.top = ulRect.top;
      selRect.left = ulRect.left;
      selRect.width = lrRect.left + lrRect.width - selRect.left;
      selRect.height = lrRect.top + lrRect.height - selRect.top;
      return selRect
    }

    _computeRangeStyles(ulRect, lrRect, mode) {
      let styles = {
        range: { visibility: 'hidden' },
        columns: { visibility: 'hidden' },
        rows: { visibility: 'hidden' }
      };

      styles.range.top = ulRect.top;
      styles.range.left = ulRect.left;
      styles.range.width = lrRect.left + lrRect.width - styles.range.left;
      styles.range.height = lrRect.top + lrRect.height - styles.range.top;
      styles.range.visibility = 'visible';

      let cornerRect = substance.getRelativeBoundingRect(this.refs.sheetView.getCornerComponent().el, this.el);

      if (mode === 'range' || mode === 'columns') {
        styles.columns.left = ulRect.left;
        styles.columns.top = cornerRect.top;
        styles.columns.height = cornerRect.height;
        styles.columns.width = lrRect.left + lrRect.width - styles.columns.left;
        styles.columns.visibility = 'visible';
      }

      if (mode === 'range' || mode === 'rows') {
        styles.rows.top = ulRect.top;
        styles.rows.left = cornerRect.left;
        styles.rows.width = cornerRect.width;
        styles.rows.height = lrRect.top + lrRect.height - styles.rows.top;
        styles.rows.visibility = 'visible';
      }

      return styles
    }

    _hideSelection() {
      this.refs.selAnchor.css('visibility', 'hidden');
      this.refs.selRange.css('visibility', 'hidden');
      this.refs.selColumns.css('visibility', 'hidden');
      this.refs.selRows.css('visibility', 'hidden');
    }

    _getSelection() {
      return this.context.editorSession.getSelection().data || {}
    }

    _scroll(deltaX, deltaY) {
      return this._viewport.scroll(deltaX, deltaY)
    }

    shiftSelection(dr, dc, shift) {
      let data = substance.clone(this._getSelection());
      // TODO: move viewport if necessary
      let newFocusRow, newFocusCol;
      if (!shift) {
        [newFocusRow, newFocusCol] = this._clamped(data.anchorRow+dr, data.anchorCol+dc);
        data.anchorRow = data.focusRow = newFocusRow;
        data.anchorCol = data.focusCol = newFocusCol;
      } else {
        [newFocusRow, newFocusCol] = this._clamped(data.focusRow+dr, data.focusCol+dc);
        data.focusRow = newFocusRow;
        data.focusCol = newFocusCol;
      }
      return this._createSelection(data)
    }

    selectFirstCell() {
      return this._createSelection({
        type: 'range',
        anchorRow: 0, anchorCol: 0,
        focusRow: 0, focusCol: 0
      })
    }

    _createSelection(data) {
      return {
        type: 'custom',
        customType: 'sheet',
        data: data,
        surfaceId: this.getSurfaceId()
      }
    }

    _ensureFocusInView(newFocusRow, newFocusCol) {
      const viewport = this._viewport;
      let dr = 0;
      let dc = 0;
      if (newFocusRow < viewport.startRow) {
        dr = newFocusRow - viewport.startRow;
      } else if (newFocusRow > viewport.endRow) {
        dr = newFocusRow - viewport.endRow;
      }
      if(newFocusCol < viewport.startCol) {
        dc = newFocusCol - viewport.startCol;
      } else if (newFocusCol > viewport.endCol) {
        dc = newFocusCol - viewport.endCol;
      }
      if (dr || dc) {
        viewport.shift(dr, dc);
      }
    }

    _nav(dr, dc, shift) {
      let newSel = this.shiftSelection(dr, dc, shift);
      // HACK: Now that the rows get rendered asynchronously
      // we need to wait with rendering the selection
      // TODO: we could also show the selection only
      // when the rows are ready
      setTimeout(() => {
        this.send('requestSelectionChange', newSel);
      }, 0);
    }

    _clamped(rowIdx, colIdx) {
      const sheet = this._getSheet();
      const N = sheet.getRowCount();
      const M = sheet.getColumnCount();
      return [
        Math.max(0, Math.min(N-1, rowIdx)),
        Math.max(0, Math.min(M-1, colIdx)),
      ]
    }

    _requestSelectionChange() {
      let sel = this._createSelection(substance.clone(this._selectionData));
      this.send('requestSelectionChange', sel);
    }

    _getSheet() {
      return this.props.sheet
    }

    _getViewport() {
      return this._viewport
    }

    _getTargetForEvent(e) {
      return this.refs.sheetView.getTargetForEvent(e)
    }

    /*
      Get bounding rectangle. This is useful for controlling positioning
      of overlays, which happens outside of SheetComponent
    */
    getCellRect(rowIdx, colIdx) {
      let td = this._getCellComponent(rowIdx, colIdx);
      if (td) {
        return substance.getRelativeBoundingRect(td.el, this.el)
      }
    }

    _showRowMenu(e) {
      this._hideMenus();
      const rowMenu = this.refs.rowMenu;
      let offset = this.el.getOffset();
      rowMenu.css({
        display: 'block',
        top: e.clientY - offset.top,
        left: e.clientX - offset.left
      });
    }

    _showColumnMenu(e) {
      this._hideMenus();
      const columnMenu = this.refs.columnMenu;
      let offset = this.el.getOffset();
      columnMenu.css({
        display: 'block',
        top: e.clientY - offset.top,
        left: e.clientX - offset.left
      });
    }

    _hideMenus() {
      this.refs.rowMenu.css('display', 'none');
      this.refs.columnMenu.css('display', 'none');
    }

    _clearSelection() {
      const editorSession = this.context.editorSession;
      let { startRow, startCol, endRow, endCol } = getRange(editorSession);
      clearValues(editorSession, startRow, startCol, endRow, endCol);
    }

    _showDialog(dialogId, params) {
      // TODO: as this component should potentially be embedded
      // we need to be able to use a
      this.refs.dialog.setProps({
        dialogId, params
      });
      this.refs.dialog.removeClass('sm-hidden');
    }

    _hideDialog() {
      this.refs.dialog.addClass('sm-hidden');
    }

    /* Event Handlers */

    _onViewportScroll() {
      this._hideMenus();
      this._hideDialog();
      setTimeout(() => {
        this._positionOverlays();
      });
    }

    _onSelectionChange(sel) {
      if (sel.surfaceId !== this.getId()) {
        this._hideSelection();
      } else {
        // ensure that the view port is showing
        const sel = this._getSelection();
        // NOTE: not scrolling to focusCell for select-all
        // which would be uncommon behavior
        if (sel.type === 'range' && !sel.all) {
          this._ensureFocusInView(sel.focusRow, sel.focusCol);
        }
      }
    }

    _onDocumentChange(change) {
      if (change.hasUpdated('data') || change.hasUpdated('columns')) {
        this.refs.sheetView.update();
      }
    }

    _onWheel(e) {
      e.stopPropagation();
      e.preventDefault();
      this._scroll(e.deltaX, e.deltaY);
    }

    _onMousedown(e) {
      // console.log('_onMousedown', e)
      e.stopPropagation();
      e.preventDefault();

      // close context menus
      this._hideMenus();

      // TODO: do not update the selection if right-clicked and already having a selection
      if (substance.platform.inBrowser) {
        substance.DefaultDOMElement.wrap(window.document).on('mouseup', this._onMouseup, this, {
          once: true
        });
      }
      const sel = this._getSelection();
      const selData = this._selectionData;

      // console.log('_onMousedown', e)
      let target = this._getTargetForEvent(e);
      // console.log('... target', target)

      // TODO: move this into substance helper
      let isRightButton = false;
      if ("which" in e) {
        isRightButton = (e.which === 3);
      } else if ("button" in e) {
        isRightButton = (e.button === 2);
      }
      if (isRightButton) {
        // update the selection if not right-clicking into
        // an existing selection
        if (target.type === 'column') {
          let _needSetSelection = true;
          if (sel.type === 'columns') {
            let startCol = Math.min(selData.anchorCol, selData.focusCol);
            let endCol = Math.max(selData.anchorCol, selData.focusCol);
            _needSetSelection = (target.colIdx < startCol || target.colIdx > endCol);
          }
          if (_needSetSelection) {
            this._isSelecting = true;
            selData.type = 'columns';
            selData.anchorCol = target.colIdx;
            selData.focusCol = target.colIdx;
            this._requestSelectionChange();
          }
        } else if (target.type === 'row') {
          let _needSetSelection = true;
          if (sel.type === 'rows') {
            let startRow = Math.min(selData.anchorRow, selData.focusRow);
            let endRow = Math.max(selData.anchorRow, selData.focusRow);
            _needSetSelection = (target.rowIdx < startRow || target.rowIdx > endRow);
          }
          if (_needSetSelection) {
            this._isSelecting = true;
            selData.type = 'rows';
            selData.anchorRow = target.rowIdx;
            selData.focusRow = target.rowIdx;
            this._requestSelectionChange();
          }
        } else if (target.type === 'cell') {
          let _needSetSelection = true;
          if (sel.type === 'range') {
            let startRow = Math.min(selData.anchorRow, selData.focusRow);
            let endRow = Math.max(selData.anchorRow, selData.focusRow);
            let startCol = Math.min(selData.anchorCol, selData.focusCol);
            let endCol = Math.max(selData.anchorCol, selData.focusCol);
            _needSetSelection = (
              target.colIdx < startCol || target.colIdx > endCol ||
              target.rowIdx < startRow || target.rowIdx > endRow
            );
          }
          if (_needSetSelection) {
            this._isSelecting = true;
            selData.type = 'range';
            selData.anchorRow = target.rowIdx;
            selData.focusRow = target.rowIdx;
            selData.anchorCol = target.colIdx;
            selData.focusCol = target.colIdx;
            this._requestSelectionChange();
          }
        }
      } else {
        switch(target.type) {
          case 'cell': {
            this._isSelecting = true;
            selData.type = 'range';
            selData.focusRow = target.rowIdx;
            selData.focusCol = target.colIdx;
            if (!e.shiftKey) {
              selData.anchorRow = selData.focusRow;
              selData.anchorCol = selData.focusCol;
            }
            this._requestSelectionChange();
            break
          }
          case 'column': {
            this._isSelecting = true;
            selData.type = 'columns';
            selData.focusCol = target.colIdx;
            if (!e.shiftKey) {
              selData.anchorCol = selData.focusCol;
            }
            this._requestSelectionChange();
            break
          }
          case 'row': {
            this._isSelecting = true;
            selData.type = 'rows';
            selData.focusRow = target.rowIdx;
            if (!e.shiftKey) {
              selData.anchorRow = selData.focusRow;
            }
            this._requestSelectionChange();
            break
          }
          default:
            //
        }
      }
    }

    _onMouseup(e) {
      e.stopPropagation();
      e.preventDefault();
      this._isSelecting = false;
    }

    _onMousemove(e) {
      if (this._isSelecting) {
        const sheetView = this.refs.sheetView;
        const sel = this._selectionData;
        switch (sel.type) {
          case 'range': {
            let rowIdx = sheetView.getRowIndexForClientY(e.clientY);
            let colIdx = sheetView.getColumnIndexForClientX(e.clientX);
            if (rowIdx !== sel.focusRow || colIdx !== sel.focusCol) {
              sel.focusRow = rowIdx > 0 ? rowIdx : 0;
              sel.focusCol = colIdx > 0 ? colIdx : 0;
              this._requestSelectionChange();
            }
            break
          }
          case 'columns': {
            let colIdx = sheetView.getColumnIndexForClientX(e.clientX);
            if (colIdx !== sel.focusCol) {
              sel.focusCol = colIdx;
              this._requestSelectionChange();
            }
            break
          }
          case 'rows': {
            let rowIdx = sheetView.getRowIndexForClientY(e.clientY);
            if (rowIdx !== sel.focusRow) {
              sel.focusRow = rowIdx;
              this._requestSelectionChange();
            }
            break
          }
          default:
            // should not happen
        }
      }
    }

    _onDblclick(e) {
      const sheetView = this.refs.sheetView;
      let rowIdx = sheetView.getRowIndexForClientY(e.clientY);
      let colIdx = sheetView.getColumnIndexForClientX(e.clientX);
      if (rowIdx > -1 && colIdx > -1) {
        this.send('editCell');
      }
    }

    _onContextMenu(e) {
      // console.log('_onContextMenu()', e)
      e.preventDefault();
      e.stopPropagation();

      let target = this._getTargetForEvent(e);
      switch(target.type) {
        case 'cell': {
          console.info('TODO: implement cell context menu?');
          break
        }
        case 'row': {
          this._showRowMenu(e);
          break
        }
        case 'column': {
          this._showColumnMenu(e);
          break
        }
        default:
          //
      }
    }

    /*
      Type into cell (replacing the existing content)
    */
    _onInput() {
      const value = this.refs.keytrap.val();
      this.send('editCell', value);
      // Clear keytrap after sending an action
      this.refs.keytrap.val('');
    }

    _onKeyDown(e) {
      let handled = false;
      switch (e.keyCode) {
        case substance.keys.LEFT:
          this._nav(0, -1, e.shiftKey);
          handled = true;
          break
        case substance.keys.RIGHT:
          this._nav(0, 1, e.shiftKey);
          handled = true;
          break
        case substance.keys.UP:
          this._nav(-1, 0, e.shiftKey);
          handled = true;
          break
        case substance.keys.DOWN:
          this._nav(1, 0, e.shiftKey);
          handled = true;
          break
        case substance.keys.ENTER: {
          this.send('editCell');
          handled = true;
          break
        }
        case substance.keys.DELETE:
        case substance.keys.BACKSPACE: {
          this._clearSelection();
          handled = true;
          break
        }
        default:
          //
      }
      // let an optional keyboard manager handle the key
      if (!handled) {
        const keyboardManager = this.context.keyboardManager;
        if (keyboardManager) {
          handled = keyboardManager.onKeydown(e);
        }
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    _onCopy(e) {
      this._clipboard.onCopy(e);
    }

    _onPaste(e) {
      this._clipboard.onPaste(e);
    }

    _onCut(e) {
      this._clipboard.onCut(e);
    }

  }

  class DialogPanel extends substance.Component {
    render($$) {
      let el = $$('div').addClass('sc-dialog-panel');
      if (this.props.dialogId) {
        let DialogClass = this.getComponent(this.props.dialogId);
        el.append(
          $$('div').addClass('se-wrapper').append(
            $$(DialogClass, { params: this.props.params })
              .addClass('se-dialog')
          )
        );
      }
      el.on('mousedown', this._onMousedown);
      return el
    }

    _onMousedown() {
      this.el.addClass('sm-hidden');
    }
  }

  class RowsCommand extends substance.Command {
    getCommandState(params) {
      const sel = params.selection;
      if (sel && sel.isCustomSelection() && sel.customType === 'sheet') {
        let data = sel.data;
        if (data.type === 'rows') {
          let startRow = Math.min(data.anchorRow, data.focusRow);
          let endRow = Math.max(data.anchorRow, data.focusRow);
          let nrows = endRow-startRow+1;
          return {
            disabled: false,
            startRow, endRow, nrows
          }
        }
      }
      // otherwise
      return {
        disabled: true
      }
    }
  }

  class ColsCommand extends substance.Command {
    getCommandState(params) {
      const sel = params.selection;
      if (sel && sel.isCustomSelection() && sel.customType === 'sheet') {
        let data = sel.data;
        if (data.type === 'columns') {
          let startCol = Math.min(data.anchorCol, data.focusCol);
          let endCol = Math.max(data.anchorCol, data.focusCol);
          let ncolumns = endCol-startCol+1;
          return {
            disabled: false,
            startCol, endCol, ncolumns
          }
        }
      }
      // otherwise
      return {
        disabled: true
      }
    }
  }

  class ColumnMetaCommand extends substance.Command {

    getCommandState(params) {
      const sel = params.selection;
      if (sel && sel.isCustomSelection() && sel.customType === 'sheet') {
        let data = sel.data;
        if (data.type === 'columns') {
          let startCol = Math.min(data.anchorCol, data.focusCol);
          let endCol = Math.max(data.anchorCol, data.focusCol);
          let ncolumns = endCol-startCol+1;
          if (ncolumns === 1) {
            let colIdx = startCol;
            let node = params.surface.getSheet().getColumnMeta(colIdx);
            return {
              disabled: false,
              colIdx, node
            }
          }
        }
      }
      // otherwise
      return {
        disabled: true
      }
    }

  }

  class InsertRowsAbove extends RowsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const pos = commandState.startRow;
      const count = commandState.nrows;
      insertRows(editorSession, pos, count);
    }
  }

  class InsertRowsBelow extends RowsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const pos = commandState.endRow + 1;
      const count = commandState.nrows;
      insertRows(editorSession, pos, count);
    }
  }

  class DeleteRows extends RowsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const start = commandState.startRow;
      const end = commandState.endRow;
      const pos = start;
      const count = end - start + 1;
      deleteRows(editorSession, pos, count);
    }
  }

  class InsertColumnsLeft extends ColsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const pos = commandState.startCol;
      const count = commandState.ncolumns;
      insertCols(editorSession, pos, count);
    }
  }

  class InsertColumnsRight extends ColsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const pos = commandState.endCol + 1;
      const count = commandState.ncolumns;
      insertCols(editorSession, pos, count);
    }
  }

  class DeleteColumns extends ColsCommand {
    execute(params) {
      const editorSession = params.editorSession;
      const commandState = params.commandState;
      const start = commandState.startCol;
      const end = commandState.endCol;
      const pos = start;
      const count = end - start + 1;
      deleteCols(editorSession, pos, count);
    }
  }

  class OpenColumnSettings extends ColumnMetaCommand {
    execute(params) {
      // NOTE: when the OpenColumnSettings command is active
      // params.surface is the corresponding SheetComponent
      params.surface.openColumnSettings(params);
      params.editorSession._setDirty('commandStates');
      params.editorSession.performFlow();
    }
  }

  class SetLanguageCommand$1 extends substance.Command {

    getCommandState({ selection, editorSession }) {
      if (selection.isNull() || !(selection.isCustomSelection() && selection.customType === 'sheet')) {
        return { disabled: true }
      }
      let doc = editorSession.getDocument();
      const { anchorRow, anchorCol } = selection.data;
      if(anchorRow === -1 || anchorCol === -1) {
        return { disabled: true }
      }
      let anchorCell = doc.getCell(anchorRow, anchorCol);
      let language = anchorCell.attr('language');
      let state = {
        cellId: anchorCell.id,
        newLanguage: this.config.language,
        disabled: false,
        active: this.config.language === language
      };
      return state
    }

    execute({ editorSession, commandState }) {
      let { cellId, newLanguage, disabled } = commandState;
      if (!disabled) {
        editorSession.transaction((tx) => {
          let cell = tx.get(cellId);
          cell.attr({ language: newLanguage });
        });
      }
    }
  }

  class SelectAllCommand extends substance.Command {

    getCommandState(params) {
      let sel = params.selection;
      if (sel.isNull() || !sel.isCustomSelection() || sel.customType !== 'sheet') {
        return { disabled: true }
      }
      return { disabled: false }
    }

    execute(params) {
      const editorSession = params.editorSession;
      const sheet = editorSession.getDocument();
      const sel = params.selection;
      let selData = {
        type: 'range',
        anchorRow: 0,
        focusRow: sheet.getRowCount() - 1,
        anchorCol: 0,
        focusCol: sheet.getColumnCount() - 1,
        all: true
      };
      editorSession.setSelection({
        type: 'custom',
        customType: 'sheet',
        data: selData,
        surfaceId: sel.surfaceId
      });
    }
  }

  class SheetDocumentImporter extends substance.XMLDocumentImporter {

    /*
      overridden to enforce some ids for singular elements, such as
      the root element, or its data element
    */
    _getIdForElement(el, type) {
      switch (type) {
        case 'sheet':
        case 'data':
        case 'columns':
          return type
        default:
      }
      return super._getIdForElement(el, type)
    }
  }

  class ColumnSettingsDialog extends substance.Component {

    didMount() {
      this._position();
    }

    render($$) {
      let el = $$('div')
        .addClass('sc-dialog')
        .addClass('sc-column-settings-dialog');
      el.append(this._renderHead($$))
        .append(this._renderBody($$))
        .append(this._renderFoot($$))
        .addClass('sm-hidden')
        .on('mousedown', substance.domHelpers.stop)
        .on('keydown', this._onKeyDown);
      return el
    }

    _renderHead($$) {
      let head = $$('div').addClass('se-head');
      let title = $$('div').addClass('se-title').text(this.getTitle());
      head.append(title);
      return head
    }

    _renderBody($$) {
      const node = this._getNode();
      // const type = node.attr('type')
      let body = $$('div').addClass('se-body');
      body.append($$('div').addClass('se-item').append(
        $$('div').addClass('se-label').text(this.getLabel('name')),
        $$('input').ref('name')
          .addClass('se-input sm-name')
          .attr('type', 'text')
          .val(node.attr('name'))
      ));

      // TODO: Bring back typed cells
      // let typeSelect = $$('select').ref('type')
      //   .addClass('se-input sm-type')
      //   .val(node.attr('type'))
      // // TODO: get types from schema
      // ;['any', 'number', 'integer', 'string', 'boolean'].forEach((t) => {
      //   let option = $$('option')
      //     .attr('value', t)
      //     .text(this.getLabel(t))
      //   if (t === type) {
      //     option.attr('selected', true)
      //   }
      //   typeSelect.append(option)
      // })
      // body.append($$('div').addClass('se-item').append(
      //   $$('div').addClass('se-label').text(this.getLabel('type')),
      //   typeSelect
      // ))

      return body
    }

    _renderFoot($$) {
      let foot = $$('div').addClass('se-foot');
      foot.append(
        $$('button').addClass('se-confirm').text(this.getLabel('ok'))
          .on('click', this._onConfirm)
      );
      foot.append(
        $$('button').addClass('se-cancel').text(this.getLabel('cancel'))
          .on('click', this._onCancel)
      );
      return foot
    }

    getTitle() {
      return this.getLabel('title:column-settings')
    }

    _position() {
      let sheetComponent = this._getSheetComponent();
      let cellComponent = this._getCellComponent();
      if (cellComponent) {
        let rect = substance.getRelativeBoundingRect(cellComponent.el, sheetComponent.el);
        this.el.css({
          top: rect.top,
          left: rect.left
        });
        this.el.removeClass('sm-hidden');
      }
    }

    _getSheetComponent() {
      return this.props.params.surface
    }

    _getCommandState() {
      return this.props.params.commandState
    }

    _getCellComponent() {
      let commandState = this._getCommandState();
      let sheetComponent = this._getSheetComponent();
      return sheetComponent._getCellComponent(-1, commandState.colIdx)
    }

    _getNode() {
      let commandState = this._getCommandState();
      return commandState.node
    }

    _getEditorSession() {
      return this.props.params.editorSession
    }

    _hide() {
      this._getSheetComponent()._hideDialog();
    }

    _onConfirm() {
      // hide the dialog
      this._hide();
      // and update the model
      const node = this._getNode();
      let oldAttr = {
        name: node.attr('name'),
        // type: node.attr('type')
      };
      let newAttr = {
        name: this.refs.name.val(),
        // type: this.refs.type.val()
      };
      if (!substance.isEqual(oldAttr, newAttr)) {
        let editorSession = this._getEditorSession();
        let nodeId = node.id;
        editorSession.transaction((tx) => {
          let node = tx.get(nodeId);
          node.attr(newAttr);
        });
      }
    }

    _onCancel() {
      this._hide();
    }

    _onKeyDown(e) {
      if(e.keyCode === 13) {
        this._onConfirm();
      } else if (e.keyCode === 27) {
        this._hide();
      }
    }

  }

  var SheetPackage = {
    name: 'Sheet',

    configure(config) {
      // registers model nodes and a converter
      substance.registerSchema(config, SheetSchema, SheetDocument, {
        ImporterClass: SheetDocumentImporter
      });

      config.addEditorOption({key: 'forcePlainTextPaste', value: true});

      config.import(substance.BasePackage);

      config.addToolPanel('toolbar', [
        {
          name: 'edit-cell-expression',
          type: 'tool-group',
          showDisabled: false,
          style: 'descriptive',
          commandGroups: ['edit-cell-expression']
        },
        {
          name: 'annotations',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['annotations']
        },
        {
          name: 'sheet-inspector',
          type: 'tool-group',
          showDisabled: false,
          style: 'minimal',
          commandGroups: ['sheet-inspector']
        },
        {
          name: 'cell-types',
          type: 'tool-dropdown',
          style: 'descriptive',
          showDisabled: false,
          commandGroups: ['cell-types']
        },
        {
          name: 'cell-languages',
          type: 'tool-dropdown',
          style: 'descriptive',
          showDisabled: false,
          commandGroups: ['cell-languages']
        },
        {
          name: 'undo-redo',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['undo-redo']
        }
      ]);

      config.addToolPanel('statusbar', [
        {
          name: 'metrics',
          type: 'tool-group',
          showDisabled: true,
          style: 'minimal',
          commandGroups: ['sheet-issues']
        }
      ]);

      config.addToolPanel('row-context-menu', [
        {
          name: 'row-context-menu',
          type: 'tool-group',
          style: 'descriptive',
          showDisabled: true,
          commandGroups: ['table-row-commands']
        }
      ]);

      config.addToolPanel('column-context-menu', [
        {
          name: 'column-context-menu',
          type: 'tool-group',
          style: 'descriptive',
          showDisabled: true,
          commandGroups: ['table-column-commands']
        }
      ]);

      config.addToolPanel('cell-context-menu', [
        // TODO: Bring back typed cells
        // {
        //   name: 'cell-types',
        //   type: 'tool-group',
        //   style: 'descriptive',
        //   showDisabled: true,
        //   commandGroups: ['cell-types']
        // },
        {
          name: 'cell-languages',
          type: 'tool-group',
          style: 'descriptive',
          showDisabled: true,
          commandGroups: ['cell-languages']
        }
      ]);

      // Cell Languages
      config.addCommand('set-mini', SetLanguageCommand$1, { language: undefined, commandGroup: 'cell-languages' });
      config.addCommand('set-js', SetLanguageCommand$1, { language: 'js', commandGroup: 'cell-languages' });
      config.addCommand('set-node', SetLanguageCommand$1, { language: 'node', commandGroup: 'cell-languages' });
      config.addCommand('set-py', SetLanguageCommand$1, { language: 'py', commandGroup: 'cell-languages' });
      config.addCommand('set-pyjp', SetLanguageCommand$1, { language: 'pyjp', commandGroup: 'cell-languages' });
      config.addCommand('set-r', SetLanguageCommand$1, { language: 'r', commandGroup: 'cell-languages' });
      config.addCommand('set-sql', SetLanguageCommand$1, { language: 'sql', commandGroup: 'cell-languages' });

      config.addLabel('cell-languages', 'Choose Language');
      config.addLabel('set-mini', 'Mini');
      config.addLabel('set-js', 'Javascript');
      config.addLabel('set-node', 'Node.js');
      config.addLabel('set-py', 'Python');
      config.addLabel('set-pyjp', 'Python Jupyter');
      config.addLabel('set-r', 'R');
      config.addLabel('set-sql', 'SQL');

      // TODO: Bring back typed cells
      // // Cell Types
      // config.addCommand('set-inherit', SetTypeCommand, { type: undefined, commandGroup: 'cell-types' })
      // config.addCommand('set-any', SetTypeCommand, { type: 'any', commandGroup: 'cell-types' })
      // config.addCommand('set-string', SetTypeCommand, { type: 'string', commandGroup: 'cell-types' })
      // config.addCommand('set-number', SetTypeCommand, { type: 'number', commandGroup: 'cell-types' })
      // config.addCommand('set-integer', SetTypeCommand, { type: 'integer', commandGroup: 'cell-types' })
      // config.addCommand('set-boolean', SetTypeCommand, { type: 'boolean', commandGroup: 'cell-types' })
      //
      // config.addLabel('cell-types', 'Choose Cell Type')
      // config.addLabel('set-inherit', 'Inherited (${columnType})')
      // config.addLabel('set-any', 'Any')
      // config.addLabel('set-string', 'String')
      // config.addLabel('set-number', 'Number')
      // config.addLabel('set-integer', 'Integer')
      // config.addLabel('set-boolean', 'Boolean')
      //
      // // Labels for types
      // config.addLabel('any', 'Any')
      // config.addLabel('string', 'String')
      // config.addLabel('number', 'Number')
      // config.addLabel('integer', 'Integer')
      // config.addLabel('boolean', 'Boolean')

      // Cell values
      config.addComponent('value:null', NullValueComponent);
      config.addComponent('value:boolean', BooleanrValueComponent);
      config.addComponent('value:integer', IntegerValueComponent);
      config.addComponent('value:number', NumberValueComponent);
      config.addComponent('value:string', StringValueComponent);
      config.addComponent('value:array', ArrayValueComponent);
      config.addComponent('value:object', ObjectValueComponent);
      config.addComponent('value:table', TableValueComponent);
      config.addComponent('value:test', TestValueComponent);
      config.addComponent('value:image', ImageValueComponent);
      config.addComponent('value:plotly', PlotlyValueComponent);

      config.addComponent('code-highlight', CodeHighlightComponent);

      config.addComponent('sheet', SheetComponent);

      config.addCommand('sheet:select-all', SelectAllCommand);
      config.addKeyboardShortcut('CommandOrControl+a', { command: 'sheet:select-all' });

      config.addCommand('insert-rows-above', InsertRowsAbove, {
        commandGroup: 'table-row-commands'
      });
      config.addLabel('insert-rows-above', {
        en: 'Insert ${nrows} above'
      });

      config.addCommand('insert-rows-below', InsertRowsBelow, {
        commandGroup: 'table-row-commands'
      });
      config.addLabel('insert-rows-below', {
        en: 'Insert ${nrows} below'
      });
      config.addCommand('delete-rows', DeleteRows, {
        commandGroup: 'table-row-commands'
      });
      config.addLabel('delete-row', {
        en: 'Delete row'
      });
      config.addLabel('delete-rows', {
        en: 'Delete rows ${startRow} - ${endRow}'
      });

      config.addCommand('open-column-settings', OpenColumnSettings, {
        commandGroup: 'table-column-commands'
      });
      config.addLabel('open-column-settings', {
        en: 'Column Settings...'
      });

      config.addCommand('insert-columns-left', InsertColumnsLeft, {
        commandGroup: 'table-column-commands'
      });
      config.addLabel('insert-columns-left', {
        en: 'Insert ${ncolumns} left'
      });

      config.addCommand('insert-columns-right', InsertColumnsRight, {
        commandGroup: 'table-column-commands'
      });
      config.addLabel('insert-columns-right', {
        en: 'Insert ${ncolumns} right'
      });
      config.addCommand('delete-columns', DeleteColumns, {
        commandGroup: 'table-column-commands'
      });
      config.addLabel('delete-column', {
        en: 'Delete column'
      });
      config.addLabel('delete-columns', {
        en: 'Delete columns ${startCol} - ${endCol}'
      });

      config.addIcon('sheet-scroll-left', { 'fontawesome': 'fa-angle-left' });
      config.addIcon('sheet-scroll-right', { 'fontawesome': 'fa-angle-right' });
      config.addIcon('sheet-scroll-up', { 'fontawesome': 'fa-angle-up' });
      config.addIcon('sheet-scroll-down', { 'fontawesome': 'fa-angle-down' });

      config.addComponent('column-settings-dialog', ColumnSettingsDialog);
      config.addLabel('title:column-settings', {
        en: 'Column Settings'
      });

      config.addIcon('toggle-errors', {'fontawesome': 'fa-times-circle' });
      config.addIcon('toggle-warnings', {'fontawesome': 'fa-warning' });
      config.addIcon('toggle-info', {'fontawesome': 'fa-info-circle' });
      config.addIcon('toggle-failed', {'fontawesome': 'fa-times' });
      config.addIcon('toggle-passed', {'fontawesome': 'fa-check' });

      config.addLabel('toggle-errors', 'Errors');
      config.addLabel('toggle-warnings', 'Warnings');
      config.addLabel('toggle-info', 'Info');
      config.addLabel('toggle-failed', 'Test: failed');
      config.addLabel('toggle-passed', 'Test: passed');

      config.addIcon('string-cell-type', {'fontawesome': 'fa-align-left' });
      config.addIcon('number-cell-type', {'fontawesome': 'fa-hashtag' });
      config.addIcon('integer-cell-type', {'fontawesome': 'fa-hashtag' });
      config.addIcon('boolean-cell-type', {'fontawesome': 'fa-check-square-o' });

      config.addLabel('function-reference',' Function Reference');

      config.addLabel('title:error', {
        en: 'Error'
      });
      config.addLabel('title:warning', {
        en: 'Warning'
      });
      config.addLabel('title:info', {
        en: 'Info'
      });

      config.addIcon('test-failed', {'fontawesome': 'fa-times' });
      config.addIcon('test-passed', {'fontawesome': 'fa-check' });

      config.addIcon('context-close', {'fontawesome': 'fa-times' });

      config.addIcon('function-helper', {'fontawesome': 'fa-question-circle' });
      config.addLabel('function-examples', {
        en: 'Example Usage'
      });
      config.addLabel('function-usage', {
        en: 'Syntax'
      });
    }
  }

  var SheetLoader = {
    load(xml, context) {
      let configurator = new substance.Configurator();
      configurator.import(SheetPackage);
      let importer = configurator.createImporter(SheetSchema.getName());

      let doc = importer.importDocument(xml);
      let editorSession = new substance.EditorSession(doc, {
        configurator,
        context
      });
      return editorSession
    }
  }

  class StencilaArchive extends substanceTexture.TextureArchive {

    constructor(storage, buffer, context) {
      super(storage, buffer);
      this._context = context;
    }

    load(archiveId) {
      return super.load(archiveId)
        .then(() => {
          this._fixNameCollisions();
          return this
        })
    }

    _loadDocument(type, record, sessions) {
      let context = this._context;
      let editorSession;
      switch (type) {
        case 'article': {
          context = Object.assign({}, this._context, {
            pubMetaDb: sessions['pub-meta'].getDocument(),
            archive: this
          });
          editorSession = ArticleLoader.load(record.data, context);
          break
        }
        case 'sheet': {
          editorSession = SheetLoader.load(record.data, context);
          break
        }
        default:
          throw new Error('Unsupported document type')
      }
      let doc = editorSession.getDocument();
      doc.documentType = type;
      return editorSession
    }

    _fixNameCollisions() {
      let manifestSession = this._sessions['manifest'];
      let entries = manifestSession.getDocument().getDocumentEntries();
      // TODO: this should also be done in DAR in general
      let names = new Set();
      entries.forEach(entry => {
        let name = entry.name;
        // fixup the name as long there are collisions
        while (name && names.has(name)) {
          name = name + '(duplicate)';
        }
        if (entry.name !== name) {
          manifestSession.transaction(tx => {
            let docEntry = tx.get(entry.id);
            docEntry.attr({name});
          }, { action: 'renameDocument' });
        }
        names.add(entry.name);
      });
    }

    _exportDocument(type, session, sessions) {
      switch (type) {
        case 'article': {
          return ArticleExporter.export(session, { sessions })
        }
        case 'sheet': {
          let dom = session.getDocument().toXML();
          let xmlStr = substance.prettyPrintXML(dom);
          return xmlStr
        }
        default:
          throw new Error('Unsupported document type')
      }
    }

    /*
      We use the name of the first document
    */
    getTitle() {
      let entries = this.getDocumentEntries();
      let firstEntry = entries[0];
      return firstEntry.name || firstEntry.id
    }

    getDocumentType(documentId) {
      let editorSession = this.getEditorSession(documentId);
      let doc = editorSession.getDocument();
      return doc.documentType
    }

    // added `info.action = 'addDocument'`
    // TODO: this should go into substance.PersistedDocumentArchive
    _addDocumentRecord(documentId, type, name, path) {
      this._sessions.manifest.transaction(tx => {
        let documents = tx.find('documents');
        let docEntry = tx.createElement('document', { id: documentId }).attr({
          name: name,
          path: path,
          type: type
        });
        documents.appendChild(docEntry);
      }, { action: 'addDocument' });
    }

    // added `info.action = 'renameDocument'`
    // TODO: this should go into substance.PersistedDocumentArchive
    renameDocument(documentId, name) {
      this._sessions.manifest.transaction(tx => {
        let docEntry = tx.find(`#${documentId}`);
        docEntry.attr({name});
      }, { action: 'renameDocument' });
    }
  }

  const { BodyScrollPane } = substance.BodyScrollPanePackage;

  class FormulaEditor extends substance.Component {

    render($$) {
      let el = $$('div').addClass('sc-formula-editor');
      el.append(this._renderCodeEditor($$, 'formula-editor'));
      return el
    }

    _renderCodeEditor($$, editorId) {
      const node = this.props.context.node;
      const configurator = this.props.context.configurator;
      let scrollPane = this._renderScrollPane($$);
      return scrollPane.append(
        $$(CodeEditor, {
          name: editorId,
          path: node.getPath(),
          multiline: false,
          mode: 'cell',
          language: this.props.language
        }).ref('cellEditor'),
        $$(substance.Overlay, {
          toolPanel: configurator.getToolPanel('prompt'),
          theme: 'dark'
        }).ref('overlay')
      )
    }

    _renderScrollPane($$) {
      return $$(BodyScrollPaneForSheetComponent).ref('scrollPane')
    }

    getChildContext() {
      return this.props.context
    }

    getSurfaceId() {
      return this.refs.cellEditor.getSurfaceId()
    }

  }

  class BodyScrollPaneForSheetComponent extends BodyScrollPane {

    getContentElement() {
      return this.getElement()
    }

  }

  const { BodyScrollPane: BodyScrollPane$1 } = substance.BodyScrollPanePackage;

  class FormulaBar extends FormulaEditor {

    render($$) {
      let el = $$('div').addClass('sc-formula-bar').append(
        $$('div').addClass('se-function-icon').append(
          $$('em').append(
            'ƒ',
            $$('sub').append('x')
          )
        ),
        this._renderCodeEditor($$, 'formula-bar')
      );
      return el
    }

    _renderScrollPane($$) {
      return $$(BodyScrollPane$1)
    }

  }

  var CodeEditorPackage = {
    name: 'CodeEditor',
    configure(config) {
      // TODO this should be better reusable
      // this configurations are necessary
      config.defineSchema({
        name: 'code-editor',
        version: '1.0',
        defaultTextType: 'cell',
        DocumentClass: substance.Document
      });
      class CellNode extends substance.TextNode {}
      CellNode.type = 'cell';
      config.addNode(CellNode);
      config.addEditorOption({key: 'forcePlainTextPaste', value: true});
      config.import(substance.BasePackage);
    }
  }

  /*
    Used to render one ore multiple cell ranges
    which would be positioned relative to a SheetComponent.
  */
  class CellRangesOverlay extends substance.Component {

    render($$) {
      let el = $$('div').addClass('sc-cell-ranges-overlay');
      // Note: this is already anticipating a scenario with multiple ranges
      // rendered at one time
      if (this.props.ranges) {
        this.props.ranges.forEach((rect) => {
          el.append(
            $$('div').addClass('se-range').css(rect)
          );
        });
      }
      return el
    }

  }

  class SheetEditor extends substance.AbstractEditor {

    _initialize(props) {
      super._initialize(props);

      // a context for FormulaBar and FormulaEditor
      this._formulaEditorContext = this._createFormulaEditorContext();
      // true when the cursor is either in the FormularBar or the FormulaEditor
      this._isEditing = false;

      const editorSession = props.editorSession;
      if (substance.platform.inBrowser) {
        substance.DefaultDOMElement.wrap(window).on('resize', this._onResize, this);
      }
      editorSession.onUpdate('selection', this._onSelectionChange, this);
      this._formulaEditorContext.editorSession.onRender('selection', this._onCellEditorSelectionChange, this);
    }

    didMount() {
      super.didMount();
      this._postRender();

      this.handleActions({
        'editCell': this._editCell,
        'requestSelectionChange': this._requestSelectionChange,
        'selectAll': this._selectAll,
        'executeCommand': this._executeCommand
      });

      this._updateViewport();
    }


    _updateViewport() {
      let viewport = this.props.viewport;
      if (viewport) {
        this.refs.sheet._viewport.update(viewport);
      }
    }

    getViewport() {
      return this.refs.sheet._viewport.toJSON()
    }

    /*
      An extra render cycle, once we know the sheet's dimensions
    */
    _postRender() {
      this._postrendering = true;
      this.rerender();
      this._postrendering = false;
      this._selectFirstCell();
    }

    /*
      Like in didMount we need to call _postRender when the component has been
      updated (e.g. new props). But we need to guard it, as the explicit in
      rerender also triggers a didUpdate call.
    */
    didUpdate() {
      if (!this._postrendering) {
        this._postRender();
        this._updateViewport();
      }
    }

    _selectFirstCell() {
      const editorSession = this.props.editorSession;
      let sel = editorSession.getSelection().toJSON();

      if (!sel) {
        // Set the selection into the first cell
        // Doing this delayed to be in a new flow
        setTimeout(() => {
          editorSession.setSelection(
            this.getSheetComponent().selectFirstCell()
          );
        }, 0);
      } else {
        this.refs.sheet.rerenderDOMSelection();
      }

    }

    getChildContext() {
      const editorSession = this.props.editorSession;
      const keyboardManager = this.keyboardManager;
      const configurator = editorSession.getConfigurator();
      const issueManager = editorSession.getManager('issue-manager');
      const host = this.context.host;
      return Object.assign({}, super.getChildContext(), {
        configurator,
        host,
        issueManager,
        keyboardManager
      })
    }

    getInitialState() {
      return {
        showContext: false,
        contextId: null,
        cellId: null
      }
    }

    _dispose() {
      super._dispose();
      const editorSession = this.props.editorSession;
      if (substance.platform.inBrowser) {
        substance.DefaultDOMElement.wrap(window).off(this);
      }
      editorSession.off(this);
      this._formulaEditorContext.editorSession.off(this);
    }

    render($$) {
      let el = $$('div').addClass('sc-sheet-editor');
      el.on('keydown', super.onKeyDown);
      el.append(
        $$('div').addClass('se-main-section').append(
          this._renderToolpane($$),
          this._renderContent($$)
        )
      );

      if (this.props.contextComponent) {
        el.append(
          $$('div').addClass('se-context-pane').append(
            $$('div').addClass('se-context-pane-content').append(
              this.props.contextComponent
            )
          )
        );
      }
      return el
    }

    _renderToolpane($$) {
      const configurator = this.getConfigurator();
      let el = $$('div').addClass('se-tool-pane');
      el.append(
        $$(FormulaBar, {
          node: this._formulaEditorContext.node,
          context: this._formulaEditorContext
        }).ref('formulaBar')
          .on('enter', this._onFormulaBarEnter)
          .on('escape', this._cancelCellEditing),
        $$(substance.Toolbar, {
          toolPanel: configurator.getToolPanel('toolbar')
        }).ref('toolbar')
      );
      return el
    }

    _renderContent($$) {
      let el = $$('div').addClass('se-body');
      el.append(
        this._renderSheet($$)
      );
      return el
    }

    _renderSheet($$) {
      const sheet = this.getDocument();
      const viewport = this.props.viewport;
      const formulaEditorContext = this._formulaEditorContext;
      // only rendering the sheet when mounted
      // so that we have real width and height
      if (this.isMounted()) {
        const SheetComponent = this.getComponent('sheet');
        return $$(SheetComponent, {
          viewport,
          sheet,
          overlays: [
            $$(FormulaEditor, {
              context: formulaEditorContext
            }).ref('formulaEditor')
              .css({
                position: 'absolute',
                display: 'none'
              })
              .on('enter', this._onFormulaEditorEnter)
              .on('escape', this._cancelCellEditing)
              .on('tab', this._onFormulaEditorTab),
          ],
          unclickableOverlays: [
            // a component that we use to highlight cell ranges
            // e.g. while editing a formula
            $$(CellRangesOverlay).ref('cellRanges')
          ],
        }).ref('sheet')
      } else {
        return $$('div')
      }
    }

    getWidth() {
      if (this.el) {
        return this.el.getWidth()
      } else {
        return 1000
      }
    }

    getHeight() {
      if (this.el) {
        return this.el.getHeight()
      } else {
        return 750
      }
    }

    getSheetComponent() {
      return this.refs.sheet
    }

    setSelectionOnCell(cellId) {
      const sheet = this.getDocument();
      const sheetComp = this.refs.sheet;
      let cell = sheet.get(cellId);
      let row = cell.parentNode;
      let colIdx = row._childNodes.indexOf(cell.id);
      let rowIdx = row.parentNode._childNodes.indexOf(row.id);
      let selData = {
        type: 'range',
        anchorRow: rowIdx,
        focusRow: rowIdx,
        anchorCol: colIdx,
        focusCol: colIdx
      };
      this.props.editorSession.setSelection({
        type: 'custom',
        customType: 'sheet',
        data: selData,
        surfaceId: sheetComp.getSurfaceId()
      });
    }

    toggleContext(contextId, cellId) {
      if(cellId === null && !this.state.showContext) return
      if (this.state.showContext && this.state.contextId === contextId && cellId === undefined) {
        this.setState({
          showContext: false
        });
      } else {
        this.setState({
          showContext: true,
          contextId,
          cellId
        });
      }
    }

    // a context propagated by FormulaBar and FormulaEditor
    _createFormulaEditorContext() {
      const configurator = new substance.Configurator();
      configurator.import(CodeEditorPackage);
      // TODO: let's see if we can generalize this, so that it can
      // go into the CodeEditorPackage
      configurator.addCommand('function-usage', FunctionUsageCommand, {
        commandGroup: 'prompt'
      });
      configurator.addTool('function-usage', FunctionUsageTool);
      configurator.addToolPanel('prompt', [
        {
          name: 'prompt',
          type: 'tool-group',
          showDisabled: false,
          commandGroups: ['prompt']
        }
      ]);

      // a document with only one node used by cell editors
      // i.e. expression bar, or popover editor on enter
      let cellEditorDoc = configurator.createDocument();
      let node = cellEditorDoc.create({
        id: 'cell',
        type: 'cell',
        content: ''
      });
      let editorSession = new substance.EditorSession(cellEditorDoc, { configurator });
      const self = this;
      // provide an adapter for DOMSelection
      // TODO: either use a helper to create the DOMSelection or change DOMSelection's ctor to be better usable
      let domSelection = new substance.DOMSelection({
        getDocument() { return cellEditorDoc },
        getSurfaceManager() { return editorSession.surfaceManager },
        getElement() { return self.getElement() }
      });
      return {
        configurator,
        editorSession,
        domSelection,
        node,
        markersManager: editorSession.markersManager,
        surfaceManager: editorSession.surfaceManager,
        commandManager: editorSession.commandManager,
        commandGroups: configurator.getCommandGroups(),
        tools: configurator.getTools(),
        functionManager: this.context.host.functionManager
      }
    }

    _onResize() {
      if (substance.platform.inBrowser) {
        if (!this._rafId) {
          this._rafId = window.requestAnimationFrame(() => {
            this._rafId = null;
            this.refs.sheet.forceUpdate();
          });
        }
      }
    }

    _getSheetSelection() {
      return this.getEditorSession().getSelection().data || {}
    }

    _onSelectionChange(sel) {
      // TODO: what to do if the sheet seleciton is null?
      if (!sel) return

      let formulaEditorSession = this._formulaEditorContext.editorSession;
      let cell = this._getAnchorCell();

      if (cell) {
        this._setFormula(cell.textContent);
      }
      if (this._isEditing) {
        this._isEditing = false;
        this._hideOverlays();
        formulaEditorSession.setSelection(null);
      }
    }

    _setReferenceSelection(referenceSymbol) {
      const from = referenceSymbol.anchor;
      const to = referenceSymbol.focus;
      const [startRow, startCol] = getRowCol(from);
      const [endRow, endCol] = to ? getRowCol(to) : [startRow, startCol];
      const sheetComp = this.getSheetComponent();
      let rect = sheetComp.getRectangleForRange({
        anchorRow: startRow,
        focusRow: endRow ? endRow : startRow,
        anchorCol: startCol,
        focusCol: endCol ? endCol: startCol
      });
      this.refs.cellRanges.setProps({ ranges: [rect] });
    }

    _onCellEditorSelectionChange(sel) {
      let sheetSel = this._getSheetSelection();
      let formulaEditorSession = this._formulaEditorContext.editorSession;
      if (!sel.isNull() && !this._isEditing) {
        this._isEditing = true;
        this._currentSelection = this.getEditorSession().getSelection();
        this._showFormulaEditor(sheetSel.anchorRow, sheetSel.anchorCol);
        formulaEditorSession.resetHistory();
      }
      const formulaSelection = formulaEditorSession.getSelection();
      if(formulaSelection && !formulaSelection.isNull()) {
        const cursorOffset = formulaSelection.start.offset;
        const cell = formulaEditorSession.getDocument().get('cell');
        const cellState = getCellState(cell);
        const symbols = cellState.symbols || [];
        const activeSymbol = symbols.find(s => {
          return cursorOffset >= s.startPos && cursorOffset <= s.endPos
        });
        if(activeSymbol) {
          // show a reference selection if the current symbol is pointing
          // to a cell or range within the same sheet
          if ((activeSymbol.type === 'cell' || activeSymbol.type === 'range') && !activeSymbol.scope) {
            this._setReferenceSelection(activeSymbol);
          } else {
            this._hideCellRanges();
          }
        } else {
          const sheetComp = this.getSheetComponent();
          sheetComp._hideSelection();
          this._hideCellRanges();
        }
      }
    }

    /*
      This gets called when the user starts editing a cell
      At this time it should be sure that the table cell
      is already rendered.
    */
    _showFormulaEditor(rowIdx, colIdx) {
      const formulaEditor = this.refs.formulaEditor;
      const sheetComponent = this.getSheetComponent();
      // only show if we actually get a rectangle
      // e.g. this is null if the cell is not in the
      // viewport
      let rect = sheetComponent.getCellRect(rowIdx, colIdx);
      if (rect) {
        formulaEditor.css({
          display: 'block',
          position: 'absolute',
          top: rect.top,
          left: rect.left,
          "min-width": rect.width+'px',
          "min-height": rect.height+'px'
        });
      } else {
        formulaEditor.css({
          display: 'none'
        });
      }
    }

    _hideOverlays() {
      this._hideFormulaEditor();
      this._hideCellRanges();
    }

    _hideCellRanges() {
      this.refs.cellRanges.css({ display: 'none' });
    }

    _hideFormulaEditor() {
      const formulaEditor = this.refs.formulaEditor;
      formulaEditor.css({
        display: 'none',
        top: 0, left: 0
      });
    }

    _setFormula(val, sel) {
      let context = this._formulaEditorContext;
      let node = context.node;
      let formulaEditorSession = this._formulaEditorContext.editorSession;
      formulaEditorSession.transaction(tx => {
        tx.set(node.getPath(), val);
        tx.setSelection(sel);
      });
    }

    _cancelCellEditing() {
      // just renew the the selection
      let editorSession = this.getEditorSession();
      editorSession.setSelection(editorSession.getSelection());
    }

    /*
      Request inline editor
    */
    _editCell(initialValue) {
      const formulaEditor = this.refs.formulaEditor;
      const formulaEditorSession = this._formulaEditorContext.editorSession;
      const formulaNode = this._formulaEditorContext.node;
      if (initialValue) {
        this._setFormula(initialValue);
      }
      const path = formulaNode.getPath();
      const text = formulaNode.getText();
      const startOffset = text.length;
      formulaEditorSession.setSelection({
        type: 'property',
        path,
        startOffset,
        surfaceId: formulaEditor.getSurfaceId()
      });
    }

    _replaceEditorToken(from, to) {
      const formulaEditorSession = this._formulaEditorContext.editorSession;
      const selection = formulaEditorSession.getSelection().toJSON();

      const cellState = formulaEditorSession.getDocument().get(['cell','state']);
      const tokens = cellState.tokens;
      const activeToken = tokens.find(token => {
        return token.type === 'cell' && selection.startOffset >= token.start && selection.startOffset <= token.end
      });
      formulaEditorSession.transaction(tx => {
        if(activeToken) {
          selection.startOffset = activeToken.start;
          selection.endOffset = activeToken.end;
          tx.setSelection(selection);
        }
        const symbol = (from === to) ? from : from + ':' + to;
        tx.insertText(symbol);
        if(!activeToken) {
          if(selection.startOffset === selection.endOffset) {
            selection.endOffset += symbol.length;
          }
          tx.setSelection(selection);
        }
      });
    }

    _requestSelectionChange(newSelection) {
      const formulaEditorSession = this._formulaEditorContext.editorSession;
      const cell = formulaEditorSession.getDocument().get('cell');
      const _isExpression = isExpression(cell.content);
      if (this._isEditing && _isExpression) {
        const selection = formulaEditorSession.getSelection().toJSON();
        const _insideExpression = selection.startOffset > 0;
        if(_insideExpression) {
          const selData = newSelection.data;
          const fromCell = getCellLabel(selData.anchorRow, selData.anchorCol);
          const toCell = getCellLabel(selData.focusRow, selData.focusCol);
          const sheetComp = this.getSheetComponent();
          this._replaceEditorToken(fromCell, toCell);
          let rect = sheetComp.getRectangleForRange(selData);
          this.refs.cellRanges.setProps({ ranges: [rect] });
        }
      } else {
        const editorSession = this.getEditorSession();
        editorSession.setSelection(newSelection);
      }
    }

    _updateCell(dir) {
      let editorSession = this.getEditorSession();
      let cell = this._getAnchorCell();
      let oldValue = cell.getText();
      let newValue = this._formulaEditorContext.node.getText();

      // this controls in which direction the selection is moved
      // either to the next row, or to the next column
      let dr = 0;
      let dc = 0;
      if (dir === 'row') {
        dr = 1;
      } else if (dir === 'col') {
        dc = 1;
      }

      let newSel = this.refs.sheet.shiftSelection(dr, dc, false);
      // skip if there is no change
      if (oldValue !== newValue) {
        // collapsing the selection to the anchor cell
        // so that on undo/redo only the change cell is selected
        let selBefore = this._currentSelection;
        selBefore.data.focusRow = selBefore.data.anchorRow;
        selBefore.data.focusCol = selBefore.data.anchorCol;
        // HACK: need to set the selection 'silently' so that
        // this works fine with undo/redo (-> before state)
        editorSession._setSelection(selBefore);
        editorSession.transaction(tx => {
          tx.set(cell.getPath(), newValue);
        });
      }
      // setting the selection in the transaction
      // leads to an inintuitiv undo/redo behavior
      // thus we are updating the selection in an extra update here
      editorSession.setSelection(newSel);
    }

    _getAnchorCell() {
      let sel = this._getSheetSelection();
      return this.getDocument().getCell(sel.anchorRow, sel.anchorCol)
    }

    _selectAll() {
      this._executeCommand('sheet:select-all');
    }

    _executeCommand(commandName, params) {
      // TODO: soon we will pull out CommandManager from EditorSession
      let commandManager = this.commandManager;
      commandManager.executeCommand(commandName, params);
    }

    _onFormulaBarEnter() {
      this._updateCell();
    }

    _onFormulaEditorEnter() {
      this._updateCell('row');
    }

    _onFormulaEditorTab() {
      this._updateCell('col');
    }
  }

  // TODO: Replace fake tutorials with real documents
  /*const tutorials = [
    {title: 'Five-Minute introduction', link: '/tutorials.html?archive=1'},
    {title: 'Introduction to Stencila Articles', link: '/tutorials.html?archive=2'},
    {title: 'Introduction to Stencila Sheets', link: '/tutorials.html?archive=3'},
    {title: 'Polyglot Programming', link: '/tutorials.html?archive=4'},
    {title: 'Big Data', link: '/tutorials.html?archive=5'}
  ]*/


  /*
    TODO: This code is really in a bad shape. We should implement this properly soon.
  */

  class FunctionHelpComponent extends substance.Component {
    render($$) {
      const functionManager = this.context.host.functionManager;
      const func = functionManager.getFunction(this.props.functionName);

      let el = $$('div').addClass('sc-function-help');

      if (func) {
        el.append(
          $$('div').addClass('se-name').append(func.name),
          $$('div').addClass('se-description').append(func.description)
        );

        // TODO: Currently only using the first method, allow for 
        // multiple methods (ie. overloads with different parameter types)
        let method = Object.values(func.methods)[0];
        let params = method.params;
        
        let syntaxEl = $$('div').addClass('se-syntax').append(
          $$('span').addClass('se-name').append(func.name),
          '('
        );
        if (params) {
          params.forEach((param, i) => {
            let paramEl = $$('span').addClass('se-signature-param').append(param.name);

            syntaxEl.append(paramEl);
            if (i < params.length - 1) {
              syntaxEl.append(',');
            }
          });
        }
        syntaxEl.append(')');

        el.append(
          $$('div').addClass('se-section-title').append('Signature'),
          syntaxEl
        );

        if (params) {
          params.forEach(param => {
            el.append(
              $$('div').addClass('se-param').append(
                $$('span').addClass('se-name').append(param.name),
                ' - ',
                $$('span').addClass('se-description').append(param.description)
              )
            );
          });
        }

        // Examples

        if(method.examples && method.examples.length > 0) {
          el.append(
            $$('div').addClass('se-section-title').append('Examples')
          );

          method.examples.forEach(example => {
            el.append(
              // $$('div').addClass('se-example-caption').append(example.caption),
              $$('pre').addClass('se-example-usage').append(example.usage)
            );
          });
        }

        el.append(
          $$('div').addClass('se-function-index').append(
            $$('a').attr({href: '#'}).append('← Function Index')
              .on('click', this._openFunctionHelp.bind(this, 'index'))
          )
        );

      } else {

        /*
        TODO: Write tutorials. Until they are done, not including these dead links

        const tutorialListEl = tutorials.map(t => $$('li').addClass('se-item').append(
          $$('a').attr('href',t.link).append(t.title)
        ))
        let tutorialsSection = $$('div').addClass('se-tutorials').append(
          $$('div').addClass('se-title').append('Getting started with Stencila'),
          $$('div').addClass('se-subtitle').append('Please read the following tutorials'),
          $$('div').addClass('se-tutorials-list').append(tutorialListEl)
        )
        */

        const functionList = functionManager.getFunctionNames();
        const functionListEl = functionList.map(func => $$('div').addClass('se-item').append(
          $$('a').attr({href: '#'})
            .append(func)
            .on('click', this._openFunctionHelp.bind(this, func))
        ));
        let functionsSection = $$('div').addClass('se-functions').append(
          $$('div').addClass('se-title').append('Functions'),
          $$('div').addClass('se-subtitle').append('Use these built-in functions'),
          $$('div').addClass('se-functions-list').append(functionListEl)
        );

        el.append(
          // tutorialsSection,
          functionsSection
        );
      }
      return el
    }

    _openFunctionHelp(funcName) {
      this.send('openHelp', `function/${funcName}`);
    }
  }

  class HelpComponent extends substance.Component {

    render($$) {
      const page = this.props.page;
      const [section, name] = page.split('/');

      let el = $$('div').addClass('sc-help');

      // Do a little routing
      if (section === 'function') {
        el.append(
          $$(FunctionHelpComponent, {
            functionName: name
          })
        );
      } else {
        el.append('No page found for ', page);
      }
      return el
    }

    _closeContext() {
      this.send('toggleHelp');
    }
  }

  class HostsComponent extends substance.Component {

    constructor(...args) {
      super(...args);

      let host = this.context.host;
      host.on('environ:changed', () => this.rerender());
      host.on('hosts:changed', () => this.rerender());
      host.on('peers:changed', () => this.rerender());
    }

    getInitialState() {
      let host = this.context.host;
      return {
        hostAddShow: false,
        discover: host.options.discover >= 0
      }
    }

    render($$) {
      let host = this.context.host;
      
      // Generate a list of available enviroments from the
      // registered hosts
      let availableEnvirons = {};
      for (let otherHost of host.hosts.values()) {
        for (let environ of otherHost.manifest.environs) {
          availableEnvirons[environ.id] = environ;
        }
      }

      let selectedEnviron = host._environ || Object.keys(availableEnvirons)[0];

      let el = $$('div').addClass('sc-hosts');

      let environEl = $$('div').addClass('se-environ').append(
        $$('div').addClass('se-label').append('Select an execution environment:')
      );
      if (Object.keys(availableEnvirons).length) {
        let environSelect = $$('select').addClass('se-environ-select')
          .ref('environSelect')
          .on('change', this._onEnvironChange);
        Object.keys(availableEnvirons).sort().forEach(environ => {
          let option = $$('option').attr('value', environ).text(environ);
          if (selectedEnviron === environ) option.attr('selected', 'true');
          environSelect.append(option);
        });
        environEl.append(environSelect);
      } else {
        environEl.append(
          $$('div').addClass('se-message').text('No execution environments have been registered. Please add an execution host first.')
        );
      }

      let hostsEl = $$('div').addClass('se-hosts').append(
        $$('span').addClass('se-label').append('Select a host for environment:')
      );
      if (host.hosts.size) {
        let hostList = $$('div').addClass('se-host-list');
        for (let [url, otherHost] of host.hosts) {
          let name = url;
          let match = url.match(/^https?:\/\/([^:]+)(:(\d+))?/);
          if (match) {
            let domain = match[1];
            if (domain === '127.0.0.1') domain = 'localhost';
            name = domain;
            let port = match[3];
            if(port) name += ':' + port;
          }
          let nameEl = $$('div').addClass('se-name').append(name);

          let environsEl = $$('div').addClass('se-host-environs');
          for (let environ of otherHost.manifest.environs) {
            environsEl.append($$('span').addClass('se-host-environ').append(environ.id));
          }

          let hostItem = $$('div').addClass('se-host-item').append(
            nameEl, environsEl
          ).on('click', this._onHostClick.bind(this, url, otherHost));
          if (otherHost.selected) hostItem.addClass('sm-selected');
          hostList.append(hostItem);
        }
        hostsEl.append(hostList);
      } else {
        hostsEl.append(
          $$('div').addClass('se-message').text(`No registered hosts provide ${selectedEnviron}`)
        );
      }
      
      /*
      hostsEl.append(
        $$('div').addClass('se-host-add').append(
          $$('div').append(
            $$('span').addClass('se-label').append('Add a host'),
            $$('input').addClass('se-input').attr({'placeholder': 'URL e.g. http://127.0.0.1:2100'})
              .ref('urlInput'),
            $$('input').addClass('se-input').attr({'placeholder': 'Key'})
              .ref('keyInput'),
            $$('button').addClass('se-button')
              .text('Add')
              .on('click', this._onHostAdd)
          ),
          $$('div').append(
            $$('span').addClass('se-label').append('Auto-discover hosts'),
            $$('input').attr({type: 'checkbox'}).addClass('se-checkbox')
              .attr(this.state.discover ? 'checked' : 'unchecked', true)
              .on('change', this._onDiscoverToggle)
          )
        )
      )
      */
     
      let peersEl = $$('div').addClass('se-peers').append(
        $$('span').addClass('se-label').append('Connected execution environments:')
      );
      if (host.peers.size) {
        let peerList = $$('div').addClass('se-peer-list');
        for (let [url, manifest] of host.peers) {
          let name = url;
          let match = url.match(/^https?:\/\/([^:]+)(:(\d+))?/);
          if (match) {
            let domain = match[1];
            if (domain === '127.0.0.1') domain = 'localhost';
            name = domain;
            let port = match[3];
            if(port) name += ':' + port;
          }
          name += '/' + (manifest.environs && manifest.environs[0] && manifest.environs[0].id);
          let nameEl = $$('div').addClass('se-name').append(name);

          let contextsEl = $$('div').addClass('se-peer-contexts');
          for (let name of Object.keys(manifest.types)) {
            contextsEl.append($$('span').addClass('se-peer-context').append(name));
          }

          peerList.append($$('div').addClass('se-peer-item').append(
            nameEl, contextsEl
          ));
        }
        peersEl.append(peerList);
      } else {
        peersEl.append(
          $$('div').addClass('se-message').text('No external execution environments connected')
        );
      }

      el.append(environEl, hostsEl, peersEl);
      return el
    }

    _onEnvironChange() {
      let host = this.context.host;
      const environSelect = this.refs.environSelect;
      const environ = environSelect.val();
      host.selectEnviron(environ);
    }

    _onHostClick(url, otherHost) {
      let host = this.context.host;
      if (!otherHost.selected) host.selectHost(url);
      else host.deselectHost(url);
    }

    _onHostAdd() {
      const urlInput = this.refs.urlInput;
      const url = urlInput.val();
      const keyInput = this.refs.keyInput;
      const key = keyInput.val();
      let host = this.context.host;
      host.registerHost(url, key);
    }

    _onDiscoverToggle() {
      let host = this.context.host;
      if (this.state.discover) {
        host.discoverHosts(-1);
        this.setState({discover: false});
      } else {
        host.discoverHosts(10);
        this.setState({discover: true});
      }
    }

  }

  const LABELS = {
    'help': 'Help',
    'hosts': 'Hosts'
  };

  class ContextPane extends substance.Component {

    render($$) {
      let el = $$('div').addClass('sc-context-pane');
      if (this.props.contextId) {
        el.append(
          $$('div').addClass('se-header').append(
            LABELS[this.props.contextId],
            $$('button').addClass('se-icon').append(
              $$(substance.FontAwesomeIcon, { icon: 'fa-times-circle' })
            ).on('click', this._closeContext)
          ),
          this._renderContextContent($$)
        );
      } else {
        el.addClass('sm-hidden');
      }
      return el
    }

    _renderContextContent($$) {
      let el = $$('div').addClass('se-content');
      if (this.props.contextId === 'help') {
        el.append(
          $$(HelpComponent, this.props.contextProps)
        );
      } else if (this.props.contextId === 'hosts') {
        el.append(
          $$(HostsComponent, this.props.contextProps)
        );
      } else {
        el.append(`Unknown context ${this.props.contextId}`);
      }
      return el
    }

    _closeContext() {
      this.send('closeContext');
    }



  }

  // TODO: this should go into Texture land
  const EMPTY_ARTICLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Archiving and Interchange DTD v1.1d3 20150301//EN"  "JATS-archivearticle1.dtd">
<article xmlns:xlink="http://www.w3.org/1999/xlink">
  <front>
    <article-meta>
      <title-group>
        <article-title></article-title>
      </title-group>
      <abstract>
      </abstract>
    </article-meta>
  </front>
  <body>
  </body>
  <back>
  </back>
</article>`;

  function addNewDocument(archive, type) {
    let entries = archive.getDocumentEntries();
    let name;
    let xml;
    if (type === 'sheet') {
      let existingNames = new Set();
      entries.forEach(e => {
        if (e.type === 'sheet') {
          existingNames.add(e.name);
        }
      });
      name = `Sheet${existingNames.size+1}`;
      xml = generateEmptySheetXML(100, 26);
    } else if (type === 'article') {
      let existingNames = new Set();
      entries.forEach(e => {
        if (e.type === 'article') {
          existingNames.add(e.name);
        }
      });
      name = `Article${existingNames.size+1}`;
      xml = EMPTY_ARTICLE_XML;
    }
    return archive.addDocument(type, name, xml)
  }

  /*
    Base-Class for adapters between document and engine.
  */
  class DocumentAdapter {

    // TODO: dicuss ownership of 'name'
    // It seems that this is a property inside the manifest,
    // and not part of the JATS file
    constructor(engine, editorSession, id, name) {
      this.engine = engine;
      this.editorSession = editorSession;
      this.doc = editorSession.getDocument();
      this.id = id || substance.uuid();
      this.name = name;
      // a unique id to identify documents (e.g. used as for variable scopes and transclusions)
      // WORKAROND: because Substance Document does not provide a setter
      // for `id` we are setting the underlying property directly
      if (!this.doc.id) this.doc.__id__ = this.id;

      this._initialize();
    }

    _initialize() {
      throw new Error('This method is abstract')
    }

    /*
      Called after each Engine cycle.

      @param {Set<Cell>} updates updated cells.
    */
    _onEngineUpdate(type, cellsByDocId) {
      // Note: for now we are sharing the cell states with the engine
      // thus, we can just notify the session about the changed cells
      const docId = this.doc.id;
      const editorSession = this.editorSession;
      let cells = cellsByDocId[docId];
      if (!cells || cells.length === 0) return
      if (type === 'state') {
        let nodeIds = cells.map(cell => cell.unqualifiedId);
        // TODO: there should be a built in means to trigger a reflow
        // after updates of node states
        editorSession._setDirty('document');
        let change = new substance.DocumentChange([], {}, {});
        change._extractInformation();
        nodeIds.forEach(nodeId => {
          change.updated[nodeId] = true;
        });
        // TODO: what is this for?
        change.updated['setState'] = nodeIds;
        editorSession._change = change;
        editorSession._info = {};
        editorSession.startFlow();
      } else if (type === 'source') {
        // TODO: this should be easier after our EditorSession / AppState refactor in Substance
        const _update = () => {
          // TODO: we are probably messing up the undo history
          // to fix this, we need to to some 'rebasing' of changes in the history
          // as if this change was one of a collaborator.
          editorSession.transaction(tx => {
            cells.forEach(cell => {
              let cellNode = tx.get(cell.unqualifiedId);
              if (cellNode) {
                setSource(cellNode, cell.source);
              }
            });
          }, { action: 'setCellSource', history: false });
        };
        if (editorSession._flowing) {
          editorSession.postpone(_update);
        } else {
          _update();
        }
      }
    }
  }

  function mapCellState(doc, cellState) {
    // TODO: we need to be careful with this
    // The node state should be something general, document specific
    // Instead we take all necessary parts of the engine's cell state
    // and use the document's node state API (future)
    // For now, we just share the state
    let node = doc.get(cellState.unqualifiedId);
    node.state = cellState;
  }

  /*
    Connects Engine and Sheet.
  */
  class SheetAdapter extends DocumentAdapter {

    _initialize() {
      const doc = this.doc;
      const engine = this.engine;
      // TODO: also provide column data
      let model = engine.addSheet({
        id: doc.id,
        name: this.name,
        lang: 'mini',
        columns: this._getColumnNodes().map(_getColumnData),
        cells: this._getCellNodes().map(row => {
          return row.map(_getCellData)
        }),
        onCellRegister: mapCellState.bind(null, doc)
      });
      this.model = model;

      this.editorSession.on('render', this._onDocumentChange, this, { resource: 'document' });
      this.engine.on('update', this._onEngineUpdate, this);
    }

    _onDocumentChange(change) {
      const doc = this.doc;
      const model = this.model;

      let action = change.info.action;
      let matrix, cellData;
      switch(action) {
        case 'insertRows': {
          const { pos, count } = change.info;
          matrix = doc.getCellMatrix();
          cellData = [];
          for (let i = pos; i < pos + count; i++) {
            cellData.push(matrix[i].map(_getCellData));
          }
          model.insertRows(pos, cellData);
          break
        }
        case 'deleteRows': {
          const { pos, count } = change.info;
          model.deleteRows(pos, count);
          break
        }
        case 'insertCols': {
          const { pos, count } = change.info;
          matrix = doc.getCellMatrix();
          cellData = [];
          const N = matrix.length;
          for (let i = 0; i < N; i++) {
            cellData.push(matrix[i].slice(pos, pos+count).map(_getCellData));
          }
          model.insertCols(pos, cellData);
          break
        }
        case 'deleteCols': {
          const { pos, count } = change.info;
          model.deleteCols(pos, count);
          break
        }
        default: {
          // Note: only detecting updates on operation level
          // structural changes (insert/remove row/column) are special type of changes
          // TODO: deal with updates to columns (name, types)
          let updated;
          const ops = change.ops;
          for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            switch (op.type) {
              case 'set':
              case 'update': {
                let node = doc.get(op.path[0]);
                // null if node is deleted within the same change
                if (!node) continue
                if (this._isCell(node)) {
                  if (!updated) updated = new Set();
                  updated.add(node.id);
                }
                break
              }
              default:
                //
            }
          }
          if (updated) {
            updated.forEach(id => {
              const cell = this.doc.get(id);
              const cellData = {
                source: getSource(cell),
                lang: getLang(cell)
              };
              model.updateCell(id, cellData);
            });
          }
        }
      }
    }

    _getCellNodes() {
      return this.doc.getCellMatrix()
    }

    _getColumnNodes() {
      return this.doc.findAll('columns > col')
    }

    _isCell(node) {
      return node.type === 'cell'
    }

    static connect(engine, editorSession, id, name) {
      return new SheetAdapter(engine, editorSession, id, name)
    }
  }

  function _getCellData(cell) {
    return {
      id: cell.id,
      lang: getLang(cell),
      source: getSource(cell)
    }
  }

  function _getColumnName(column) {
    return column.getAttribute('name')
  }

  function _getColumnType(column) {
    return column.getAttribute('type')
  }

  function _getColumnData(column) {
    return {
      name: _getColumnName(column),
      type: _getColumnType(column)
    }
  }

  /*
    Connects Engine and Article.
  */
  class ArticleAdapter extends DocumentAdapter {

    _initialize() {
      const doc = this.doc;
      const engine = this.engine;

      // hack: monkey patching the instance to register a setter that updates this adapter
      _addAutorunFeature(doc, this);

      let model = engine.addDocument({
        id: doc.id,
        name: this.name,
        lang: 'mini',
        cells: this._getCellNodes().map(_getCellData$1),
        autorun: doc.autorun,
        onCellRegister: mapCellState.bind(null, doc)
      });
      this.model = model;

      // TODO: do this somewhere else
      doc.autorun = false;

      this.editorSession.on('update', this._onDocumentChange, this, { resource: 'document' });
      this.engine.on('update', this._onEngineUpdate, this);
    }

    _getCellNodes() {
      return this.doc.findAll('cell')
    }

    /*
      Call on every document change detecting updates to cells that
      are used to keep the Engine's model in sync.
    */
    _onDocumentChange(change) {
      const doc = this.doc;
      const model = this.model;
      // inspecting ops to detect structural changes and updates
      // Cell removals are applied directly to the engine model
      // while insertions are applied at the end
      // 1. removes, 2. creates, 3. updates, 3. creates
      let created, updated;
      const ops = change.ops;
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        switch (op.type) {
          case 'create': {
            let node = doc.get(op.path[0]);
            if (this._isCell(node)) {
              if (!created) created = new Set();
              created.add(node.id);
            }
            break
          }
          case 'delete': {
            // TODO: would be good to still have the node instance
            let nodeData = op.val;
            if (this._isCell(nodeData)) {
              model.removeCell(nodeData.id);
            }
            break
          }
          case 'set':
          case 'update': {
            let node = doc.get(op.path[0]);
            // null if node is deleted within the same change
            if (!node) continue
            if (node.type === 'source-code') {
              node = node.parentNode;
            }
            if (this._isCell(node)) {
              if (!updated) updated = new Set();
              updated.add(node.id);
            }
            break
          }
          default:
            throw new Error('Invalid state')
        }
      }
      if (created) {
        let cellNodes = this._getCellNodes();
        for (let i = 0; i < cellNodes.length; i++) {
          const cellNode = cellNodes[i];
          if (created.has(cellNode.id)) {
            model.insertCellAt(i, _getCellData$1(cellNode));
          }
        }
      }
      if (updated) {
        updated.forEach(id => {
          const cell = this.doc.get(id);
          const cellData = {
            source: getSource(cell),
            lang: getLang(cell)
          };
          model.updateCell(id, cellData);
        });
      }
    }

    /*
      Used internally to filter cells.
    */
    _isCell(node) {
      return node.type === 'cell'
    }


    static connect(engine, editorSession, id, name) {
      return new ArticleAdapter(engine, editorSession, id, name)
    }
  }

  function _getCellData$1(cell) {
    return {
      id: cell.id,
      lang: getLang(cell),
      source: getSource(cell)
    }
  }

  function _addAutorunFeature(doc, adapter) {
    Object.defineProperty(doc, 'autorun', {
      set(val) {
        doc._autorun = val;
        adapter.model.setAutorun(val);
      },
      get() {
        return doc._autorun
      }
    });
  }

  // Connects documents with the Cell Engine
  // and registers hooks to update transclusions.
  function _connectDocumentToEngine (engine, archive, documentId) {
    let manifest = archive.getEditorSession('manifest').getDocument();
    let docEntry = manifest.get(documentId);
    let editorSession = archive.getEditorSession(documentId);
    let docType = docEntry.attr('type');
    let name = docEntry.attr('name');
    let docId = docEntry.id;
    let Adapter;
    switch (docType) {
      case 'article': {
        Adapter = ArticleAdapter;
        break
      }
      case 'sheet': {
        Adapter = SheetAdapter;
        break
      }
      default:
        //
    }
    if (Adapter) {
      Adapter.connect(engine, editorSession, docId, name);
    }
  }

  function _initStencilaArchive (archive, context) {
    const engine = context.host && context.host.engine;
    if (engine) {
      // when a document is renamed, transclusions must be updated
      _listenForDocumentRecordUpdates(archive, engine);
      // documents and sheets must be registered with the engine
      // and hooks for structural sheet updates must be established
      // to update transclusions.
      let entries = archive.getDocumentEntries();
      substance.forEach(entries, entry => {
        _connectDocumentToEngine(engine, archive, entry.id);
      });
    }
    return Promise.resolve(archive)
  }

  function _listenForDocumentRecordUpdates (archive, engine) {
    let editorSession = archive.getEditorSession('manifest');
    editorSession.on('update', _onManifestChange.bind(null, archive, engine), null, { resource: 'document' });
  }

  function _onManifestChange (archive, engine, change) {
    let action = change.info.action;
    switch (action) {
      case 'renameDocument': {
        // extracting document id, old name and the new name
        // TODO: maybe we can create an API to access such documentChange informations
        let op = change.ops[0];
        let docId = op.path[0];
        let oldName = op.original;
        let newName = op.val;
        if (oldName !== newName) {
          // TODO: it would be nice, if this could be done by the respective
          // document/sheet adapter. However, ATM renaming is done on manifest only,
          // so there is no document level notion of the name.
          let resource = engine.getResource(docId);
          resource.rename(newName);
        }
        break
      }
      case 'addDocument': {
        let op = change.ops[0];
        let docId = op.path[0];
        _connectDocumentToEngine(engine, archive, docId);
        break
      }
      default:
        //
    }
  }

  class Project extends substance.Component {

    constructor(...args) {
      super(...args);

      // Store the viewports, so we can restore scroll positions
      this._viewports = {};

      this.appState = {
        reproduce: false,
        engineRunning: false
      };
    }

    didMount() {
      this.handleActions({
        'addDocument': this._addDocument,
        'openDocument': this._openDocument,
        'removeDocument': this._removeDocument,
        'updateDocumentName': this._updateDocumentName,
        'closeContext': this._closeContext,
        'openHelp': this._openHelp,
        'toggleHelp': this._toggleHelp,
        'toggleHosts': this._toggleHosts,
        'toggleReproduce': this._toggleReproduce
      });

      if (substance.platform.inBrowser) {
        this.documentEl = substance.DefaultDOMElement.wrapNativeElement(document);
        this.documentEl.on('keydown', this.onKeyDown, this);
      }

      // HACK: we enable reproduce mode by default
      this._toggleReproduce();
    }

    willUpdateState() {
      let oldDocumentId = this.state.documentId;
      this._viewports[oldDocumentId] = this.refs.editor.getViewport();
    }

    _dispose() {
      if (substance.platform.inBrowser) {
        this.documentEl.off(this);
      }
    }

    getInitialState() {
      let activeDocument = this._getActiveDocument();
      return {
        documentId: activeDocument.id
      }
    }

    getChildContext() {
      // ATTENTION: we should be careful with adding things here.
      // If something is missing, we likely should fix it somewhere else.
      // Add only project related things here.
      // One example for what better not to add: 'pubMetaDbSession'.
      // This is passed to Texture as prop which in turn exposes it via childContext.
      return {
        documentArchive: this.props.documentArchive,
        urlResolver: this.props.documentArchive,
        appState: this.appState
      }
    }

    render($$) {
      let el = $$('div').addClass('sc-project');
      el.append(
        $$('div').addClass('se-main-pane').append(
          this._renderEditorPane($$),
          $$(ContextPane, {
            contextId: this._contextId,
            contextProps: this._contextProps
          }).ref('contextPane')
        )
        // $$(ProjectBar, {
        //   contextId: this._contextId,
        //   documentId: this.state.documentId,
        //   archive: this.props.documentArchive
        // }).ref('projectBar')
      );
      return el
    }

    _getPubMetaDbSession() {
      return this._getDocumentArchive().getEditorSession('pub-meta')
    }

    _getActiveDocument() {
      let archive = this._getDocumentArchive();
      let firstEntry = archive.getDocumentEntries()[0];
      return firstEntry
    }

    _getActiveEditorSession() {
      let documentId = this.state.documentId;
      return this.props.documentArchive.getEditorSession(documentId)
    }

    _getDocumentArchive() {
      return this.props.documentArchive
    }

    _getDocumentRecordById(id) {
      let dc = this._getDocumentArchive();
      let entries = dc.getDocumentEntries();
      return entries.find(e => e.id === id)
    }

    _renderEditorPane($$) {
      let el = $$('div').addClass('se-editor-pane');
      let documentId = this.state.documentId;
      let documentRecord = this._getDocumentRecordById(documentId);
      let documentType = documentRecord.type;
      let viewport = this._viewports[documentId];
      let da = this._getDocumentArchive();
      let editorSession = da.getEditorSession(documentId);

      if (documentType === 'article') {
        el.append(
          $$(substanceTexture.EditorPackage.Editor, {
            viewport,
            editorSession,
            pubMetaDbSession: this._getPubMetaDbSession(),
            disabled: true
          }).ref('editor')
            .addClass('sc-article-editor')
        );
      } else if (documentType === 'sheet') {
        el.append(
          $$(SheetEditor, {
            viewport,
            editorSession
          }).ref('editor')
        );
      }
      return el
    }

    _addDocument(type) {
      let archive = this._getDocumentArchive();
      let newDocumentId = addNewDocument(archive, type);
      this._openDocument(newDocumentId);
    }

    _openDocument(documentId) {
      this.extendState({
        documentId: documentId
      });
    }

    _updateDocumentName(documentId, name) { // eslint-disable-line no-unused-vars
      let archive = this._getDocumentArchive();
      archive.renameDocument(documentId, name);
      this.refs.projectBar.rerender();
    }

    _removeDocument(documentId) { // eslint-disable-line no-unused-vars
      let archive = this._getDocumentArchive();
      let documentEntries = archive.getDocumentEntries();
      if (documentEntries.length > 1) {
        archive.removeDocument(documentId);
        let firstDocument = this._getActiveDocument();
        this.extendState({
          documentId: firstDocument.id
        });
      } else {
        console.warn('Not allowed to delete the last document in the archive. Skipping.');
      }
    }

    /*
      E.g. _openHelp('function/sum')
    */
    _openHelp(page) {
      this._contextId = 'help';
      this._contextProps = { page };
      this.refs.contextPane.extendProps({
        contextId: this._contextId,
        contextProps: this._contextProps
      });
      this.refs.projectBar.extendProps({
        contextId: this._contextId
      });
    }

    _closeContext() {
      this._contextId = undefined;
      this._contextProps = undefined;
      this.refs.contextPane.extendProps({
        contextId: this._contextId,
        contextProps: this._contextProps
      });
      this.refs.projectBar.extendProps({
        contextId: this._contextId
      });
    }

    /*
      Either hide help or show function index
    */
    _toggleHelp() {
      let contextId = this._contextId;
      if (contextId === 'help') {
        this._contextId = undefined;
        this._contextProps = undefined;
      } else {
        this._contextId = 'help';
        this._contextProps = { page: 'function/index'};
      }
      this.refs.contextPane.extendProps({
        contextId: this._contextId,
        contextProps: this._contextProps
      });
      this.refs.projectBar.extendProps({
        contextId: this._contextId
      });
    }

    _toggleReproduce () {
      // TODO: we should update the state after the engine has been
      // started successfully
      let reproduce = !this.appState.reproduce;
      this.appState.reproduce = reproduce;
      if (reproduce && !this.appState.engineRunning) {
        this._launchExecutionEngine().then(running => {
          if (!running) {
            this._toggleReproduce();
          }
        });
      }
      this._updateCellComponents();
    }

    _launchExecutionEngine () {
      return new Promise((resolve) => {
        // resolve(window.confirm('Start the Engine?'))
        resolve(true);
      }).then(yesPlease => {
        if (yesPlease) {
          const archive = this.props.documentArchive;
          return _initStencilaArchive(archive, this.context).then(() => {
            this.appState.engineRunning = true;
            return true
          })
        }
        return false
      })
    }

    _updateCellComponents () {
      // Update all cell nodes in the document
      let cellComps = this.findAll('.sc-cell');
      cellComps.forEach((cellComponent) => {
        cellComponent.extendState({
          hideCodeToggle: !this.appState.reproduce,
          hideCode: true
        });
      });
    }

    /*
      Either open or hide hosts connection information
    */
    _toggleHosts() {
      let contextId = this._contextId;
      if (contextId === 'hosts') {
        this._contextId = undefined;
        this._contextProps = undefined;
      } else {
        this._contextId = 'hosts';
        this._contextProps = { page: 'hosts' };
      }

      this.refs.contextPane.extendProps({
        contextId: this._contextId,
        contextProps: this._contextProps
      });
      this.refs.projectBar.extendProps({
        contextId: this._contextId
      });
    }

    onKeyDown(event) {
      // ignore fake IME events (emitted in IE and Chromium)
      if ( event.key === 'Dead' ) return
      // Handle custom keyboard shortcuts globally
      let editorSession = this._getActiveEditorSession();
      let custom = editorSession.keyboardManager.onKeydown(event);
      return custom
    }

  }

  /**
   * Get the value of a querystring parameter
   * @param  {String} param The field to get the value of
   * @param  {String} url   The URL to get the value from (optional)
   * @return {String}       The param value
   */
  function getQueryStringParam(param, url) {
    if (typeof window === 'undefined') return null

    let href = url ? url : window.location.href;
    let reg = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let string = reg.exec(href);
    return string ? decodeURIComponent(string[1]) : null;
  }

  function setupStencilaContext() {
    // Stencila hosts (for requesting external execution contexts etc)
    let hosts = [];
    // Use the origin as a remote Stencila Host?
    if (window.STENCILA_ORIGIN_HOST) {
      hosts.push(window.location.origin);
    }
    // List of any other remote Stencila Hosts
    // Deprecated `peers` configuration option (hosts seems like a less confusing name)
    const hostsExtra = (
      getQueryStringParam('hosts') || window.STENCILA_HOSTS ||
      getQueryStringParam('peers') || window.STENCILA_PEERS
    );
    if (hostsExtra) hosts = hosts.concat(hostsExtra.split(','));
    // Try to discover hosts on http://127.0.0.1?
    const discover = parseFloat(getQueryStringParam('discover') || window.STENCILA_DISCOVER || '-1');
    // Instantiate and initialise the host
    const host = new Host({ hosts, discover });
    return {
      host, 
      functionManager: host.functionManager
    }
  }

  function _renderStencilaApp ($$, app) {
    let el = $$('div').addClass('sc-app');
    let { archive, error } = app.state;
    if (archive) {
      el.append(
        $$(Project, {
          documentArchive: archive
        })
      );
    } else if (error) {
      if (error.type === 'jats-import-error') {
        el.append(
          $$(substanceTexture.JATSImportDialog, { errors: error.detail })
        );
      } else {
        el.append(
          'ERROR:',
          error.message
        );
      }
    } else {
      // LOADING...
      el.append(
        $$(Loading, {
          message: 'Providing runtime environment. This may take up to a few minutes.'
        })
      );
    }
    return el
  }

  class Loading extends substance.Component {
    render($$) {
      let el = $$('div').addClass('sc-loading');
      el.append(
        $$('div').addClass('se-spinner').append(
          $$('div'),
          $$('div'),
          $$('div'),
          $$('div'),
          $$('div'),
          $$('div')
        ),
        $$('div').addClass('se-message').append(
          this.props.message
        )
      );
      return el
    }
  }



  function _setupStencilaChildContext (originalContext) {
    const context = setupStencilaContext();
    return Object.assign({}, originalContext, context)
  }

  function _initStencilaContext (context) {
    return context.host.initialize()
  }

  /* eslint-disable no-unused-vars */

  class StencilaWebApp extends substanceTexture.WebAppChrome {

    render($$) {
      return _renderStencilaApp($$, this)
    }

    _setupChildContext() {
      return _setupStencilaChildContext(this.context)
    }

    _initContext(context) {
      return _initStencilaContext(context)
    }

    _getArchiveClass() {
      return StencilaArchive
    }

    _getDefaultDataFolder() {
      return './examples/'
    }

    _initArchive(archive, context) {
      // return _initStencilaArchive(archive, context)
      // HACK: do not connect the archive with the engine right away
      // we gonna do this when the user asks to switch to reproducible mode
      return Promise.resolve(archive)
    }
  }

  class StencilaDesktopApp extends substanceTexture.DesktopAppChrome {

    render($$) {
      return _renderStencilaApp($$, this)
    }

    _setupChildContext() {
      return _setupStencilaChildContext(this.context)
    }

    _initContext(context) {
      return _initStencilaContext(context)
    }

    _loadArchive(archiveId, context) {
      let storage = new this.props.FSStorageClient();
      let buffer = new substance.InMemoryDarBuffer();
      let archive = new StencilaArchive(storage, buffer, context);
      // HACK: this should be done earlier in the lifecycle (after first didMount)
      // and later disposed properly. However we can accept this for now as
      // the app lives as a singleton atm.
      // NOTE: _archiveChanged is implemented by DesktopAppChrome
      archive.on('archive:changed', this._archiveChanged, this);
      return archive.load(archiveId)
    }

    _initArchive(archive, context) {
      return _initStencilaArchive(archive, context)
    }
  }

  substance.substanceGlobals.DEBUG_RENDERING = substance.platform.devtools;

  // This uses a monkey-patched VfsStorageClient that checks immediately
  // if the stored data could be loaded again, or if there is a bug in
  // Textures exporter
  class DevWebApp extends StencilaWebApp {
    _getStorage(storageType) {
      let storage = super._getStorage(storageType);
      if (storageType === 'vfs') {
        substanceTexture.vfsSaveHook(storage, StencilaArchive);
      }
      return storage
    }
  }

  /*
    Component that can be embedded in journal pages.

    RDSReader.mount({
      archiveId: 'e24351',
      storageUrl: 'https://dar-archives.elifesciences.org'
    })
  */
  class TextureReader extends substance.Component {
    render($$) {
      let el = $$('div').addClass('sc-texture-reader');
      el.append(
        $$(DevWebApp, {
          archiveId: this.props.archiveId,
          storageType: this.props.storageUrl ? 'fs' : 'vfs',
          storageUrl: this.props.storageUrl
        })
      );
      return el
    }
  }

  window.TextureReader = TextureReader;

  const Editor = substanceTexture.EditorPackage.Editor;

  function importFunctionDocument (main, files) {
    let configurator = new substance.Configurator();
    configurator.import(FunctionPackage);
    const importer = configurator.createImporter(FunctionSchema.getName());
    const xml = importer.compileDocument(main, files);
    const func = importer.importDocument(xml);
    return func
  }

  exports.address = address;
  exports.value = value;
  exports.uuid = uuid;
  exports.Host = Host;
  exports.MemoryBackend = MemoryBackend;
  exports.MemoryBuffer = MemoryBuffer;
  exports.StencilaArchive = StencilaArchive;
  exports.StencilaWebApp = StencilaWebApp;
  exports.StencilaDesktopApp = StencilaDesktopApp;
  exports.TextureReader = TextureReader;
  exports.JsContext = JsContext;
  exports.getQueryStringParam = getQueryStringParam;
  exports.setupStencilaContext = setupStencilaContext;
  exports.ArticleEditor = Editor;
  exports.ArticleEditorPackage = ArticleEditorPackage;
  exports.ArticleLoader = ArticleLoader;
  exports.ArticleAdapter = ArticleAdapter;
  exports.Project = Project;
  exports.FunctionPackage = FunctionPackage;
  exports.FunctionSchema = FunctionSchema;
  exports.FunctionManager = FunctionManager;
  exports.importFunctionDocument = importFunctionDocument;
  exports.SheetPackage = SheetPackage;
  exports.SheetEditor = SheetEditor;
  exports.SheetSchema = SheetSchema;
  exports.SheetLoader = SheetLoader;
  exports.SheetAdapter = SheetAdapter;
  exports.CellGraph = CellGraph;
  exports.Engine = Engine;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=./stencila.js.map