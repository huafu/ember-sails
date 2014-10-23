import Ember from 'ember';
import WithStyleMixin from 'with-style-mixin/mixins/with-style';


// TODO: move this in config? in the model?
var TYPE_CODE_ICON = {
  facebook: 'social-facebook',
  twitter:  'social-twitter',
  google:   'social-google-plus',
  github:   'social-github'
};

/**
 * @class PassportIconComponent
 * @constructor
 */
var PassportIconComponent = Ember.Component.extend(WithStyleMixin, {
  tagName:           'i',
  attributeBindings: ['title'],
  classNames:        ['passport-icon'],
  classNameBindings: ['iconClass', 'typeCode'],
  styleBindings:     ['color', 'fontSize:font-size[em]'],

  /**
   * @property subject
   * @type Passport|PassportType|String
   */
  subject: null,

  /**
   * @property fontSize
   * @type String|Number
   */
  fontSize:        function (key, value) {
    if (arguments.length < 2) {
      value = 2;
    }
    return value;
  }.property(),

  // TODO: move this into the config
  /**
   * @property defaultIconName
   * @type String
   */
  defaultIconName: 'prohibited',

  /**
   * @property typeCode
   * @type String
   */
  typeCode: function () {
    var subject = this.get('subject'), code;
    if (subject && !(code = subject.get('type.code')) && !(code = subject.get('code'))) {
      code = subject;
    }
    return Ember.typeOf(code) === 'string' ? code : undefined;
  }.property('subject', 'subject.code', 'subject.type.code').readOnly(),

  /**
   * @property iconClass
   * @type String
   * @readonly
   */
  iconClass: function () {
    var code = this.get('typeCode'), name;
    if (!code || !(name = TYPE_CODE_ICON[code])) {
      name = this.get('defaultIconName');
    }
    return 'fi-' + name;
  }.property('typeCode').readOnly(),

  /**
   * @property title
   * @type String
   */
  title: function (key, value) {
    if (arguments.length < 2) {
      value = this.get('subject.type.label') || this.get('subject.label');
    }
    return value;
  }.property('subject.type.label', 'subject.label')
});

export default PassportIconComponent;
