import Ember from 'ember';

var FileUploadComponent = Ember.FileField.extend({
  uploaders: function () {
    return Ember.A();
  }.property().readOnly(),

  inProgress: Ember.computed.filterBy('uploaders', 'isUploading', true),
  inError:    Ember.computed.filterBy('uploaders', 'error'),
  inSuccess:  Ember.computed.filterBy('uploaders', 'data'),
  inComplete: Ember.computed.filterBy('uploaders', 'done', true),

  progress: function () {
    var all = this.get('inProgress');
    return all.reduce(function (total, item) {
      return total + item.get('progress');
    }, 0) / all.length;
  }.property('inProgress.@each.progress').readOnly(),

  url: '',

  requestType: 'POST',

  namespace: undefined,

  paramName: 'file',

  filesDidChange: (function () {
    var uploadUrl = this.get('url');
    var files = this.get('files');
    if (Ember.isEmpty(files)) {
      return;
    }

    var uploader = Ember.Uploader.create({
      url:            uploadUrl,
      paramNamespace: this.get('namespace'),
      type:           this.get('requestType'),
      paramName:      this.get('paramName')
    });

    uploader.on('progress', function (e) {
      uploader.set('progress', e.percent);
    });

    uploader.upload(files[0])
      .then(function (data) {
        uploader.set('progress', 100);
        uploader.set('done', true);
        uploader.set('data', data);
      })
      .catch(function (error) {
        uploader.set('error', error);
        uploader.set('done', true);
      });
  }).observes('files')
});

export default FileUploadComponent;
