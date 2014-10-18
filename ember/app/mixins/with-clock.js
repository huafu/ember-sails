import Ember from 'ember';

var DAYS_IN_YEAR = 365.25;
var DAYS_IN_MONTH = DAYS_IN_YEAR / 12;
var MILLISECONDS_IN = {
  millisecond: 1,
  second:      1000,
  minute:      1000 * 60,
  hour:        1000 * 60 * 60,
  day:         1000 * 60 * 60 * 24,
  week:        1000 * 60 * 60 * 24 * 7,
  month:       1000 * 60 * 60 * 24 * DAYS_IN_MONTH,
  year:        1000 * 60 * 60 * 24 * DAYS_IN_YEAR
};

function parseUnit(unit) {
  var res = (/s$/i.test(unit) ? unit.substr(0, -1) : unit).toLowerCase();
  if (!MILLISECONDS_IN[res]) {
    throw new ReferenceError('Invalid unit `' + unit + '`');
  }
  return res;
}
function toMilliseconds(value, unit) {
  return value * MILLISECONDS_IN[parseUnit(unit)];
}

export default Ember.Mixin.create({
  tickStep:     1,
  tickUnit:     Ember.required(),
  tickProperty: Ember.required(),

  _initWithClock: function () {
    var meta = this._withClock = {
      property: this.get('tickProperty'),
      step:     toMilliseconds(this.get('tickStep'), this.get('tickUnit')),
      current:  function () {
        return Math.floor(Date.now() / this.step) * this.step;
      },
      check:    function (obj) {
        if (!obj || obj.isDestroying || obj.isDestroyed) {
          this.cancel();
          return;
        }
        var c = this.current();
        if (this.last !== c) {
          this.last = c;
          Ember.run.next(this, function () {
            obj.set(this.property, c);
            this.schedule(obj);
          });
        }
        else {
          this.schedule(obj);
        }
      },
      schedule: function (obj) {
        var self = this;
        this.cancel();
        this._tiemr = setTimeout(function () {
          self._timer = null;
          self.check(obj);
        }, this.step / 3);
      },
      cancel:   function () {
        if (this._timer) {
          clearTimeout(this._timer);
          this._timer = null;
        }
      }
    };
    meta.check(this);
  }.on('init'),

  _destroyWithClock: function () {
    if (this._withClock) {
      this._withClock.cancel();
      delete this._withClock;
    }
  }.on('destroy')
});
