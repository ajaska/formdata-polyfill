/* 
 * Loosely based off of
 * https://github.com/inexorabletash/polyfill/blob/master/xhr.js
*/

(function(global) {
  if (!('window' in global && 'document' in global))
    return;

  (function() {
    if ('FormData' in global && 'set' in global.FormData.prototype)
      return;

    function FormData(form) {
      this._data = [];
      if (!form) return;
      for (var i = 0; i < form.elements.length; ++i) {
        var element = form.elements[i];
        if (element.name !== '')
          this.append(element.name, element.value);
      }
    }

    FormData.prototype = {
      append: function(name, value /*, filename */) {
        if ('Blob' in global && value instanceof global.Blob)
          throw TypeError("Blob not supported");
        name = String(name);
        this._data.push([name, value]);
      },

      toString: function() {
        return this._data.map(function(pair) {
          return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);
        }).join('&');
      }
    };

    /* TODO:
     * get(), getAll(), has() 
     * entries(), keys(), values(), and support of for...of
     */

    FormData.prototype.set = function(name, value) {
      var didSet = false;

      for (var i = 0; i < this._data.length; ++i) {
        if (this._data[i][0] === name) {
          if (didSet) {
            this._data.splice(i, 1);
            --i;
          } else {
            this._data[i][1] = value;
            didSet = true;
          }
        }
      }

      if (!didSet) {
        this.append(name, value);
      }
    }

    FormData.prototype.delete = function(name) {
      for (var i = 0; i < this._data.length; ++i) {
        if (this._data[i][0] === name) {
          this._data.splice(i, 1);
          --i;
        }
      }
    }

    global.FormData = FormData;
    var send = global.XMLHttpRequest.prototype.send;
    global.XMLHttpRequest.prototype.send = function(body) {
      if (body instanceof FormData) {
        this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        arguments[0] = body.toString();
      }
      return send.apply(this, arguments);
    };
  }());

}(self));
