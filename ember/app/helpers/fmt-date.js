import Ember from 'ember';
import config from '../config/environment';

function hasOwn(o, p) {
  return {}.hasOwnProperty.call(o, p);
}

function fmtDate(value, options) {
  var m, res, invFmt, nullFmt, fmt, opt = (options || {hash: {}}).hash;
  fmt = opt.format || config.defaults.date.format;
  nullFmt = hasOwn(opt, 'nullFormat') ? opt.nullFormat : config.defaults.date.nullFormat;
  invFmt = hasOwn(opt, 'invalidFormat') ? opt.invalidFormat : config.defaults.date.invalidFormat;
  if (value === null || value === undefined) {
    res = nullFmt;
  }
  else if ((m = moment(value)) && m.isValid()) {
    switch (fmt) {
      case '$calendar$':
      {
        res = m.calendar();
        break;
      }
      default:
      {
        res = m.format(fmt);
      }
    }
  }
  else {
    res = invFmt;
  }
  if (typeof res !== "string") {
    res = '';
  }
  return res.htmlSafe();
}

export {
    fmtDate
    };

export default Ember.Handlebars.makeBoundHelper(fmtDate);
