;(function(angular, $){
  'use strict';
  if(!angular && !$) return;

  angular.module('wistia.uploader', [])
  .service('wistiaService', ['$document', function wistiaService($document){

    var WISTIA_SCRIPT = '//fast.wistia.com/assets/external/E-v1.js',
        WISTIA_EMBED_SCRIPT = '//fast.wistia.com/embed/medias/<hashed_id>.jsonp';

    this.wistiaScriptInjected = false; // script already injected on DOM?
    /**
     * Injects scripts on DOM
     * @param  {String} scriptSrc URl of the script to loaded
     */
    function injectScript(scriptSrc){
      var script = $document[0].getElementsByTagName('script')[0];
      var js = $document[0].createElement('script');
      js.src = scriptSrc;
      js.setAttribute('async', '');
      script.parentNode.insertBefore(js, script);
    }

    /**
     * Injects the Wistia script for the player
     */
    this.injectWistiaScript = function(){
      // check if wistia scripts already injected
      if(!this.scriptsInjected) {
        injectScript(WISTIA_SCRIPT);
        this.wistiaScriptInjected = true;
      }
    };

    /**
     * Creates a template for the wistia video player
     * @param  {String} videoHash hashed id of the video to load
     * @return {String}           template for video player
     */
    this.getWistiaEmbedTemplate = function(videoHash){
      return '<div class="wistia_embed wistia_async_'+videoHash+'" style="height:360px;width:640px">&nbsp;</div>';
    };

    /**
     * Manages the full cycle to show a video player based on a video hash
     * It injects script of wistia, loads the jsonp data and returns the template
     * @param  {String} videoHash hashed id of the video to load
     * @return {String}           template for video player
     */
    this.getVideoPlayer = function(videoHash){
      this.injectWistiaScript();
      // inject jsonp data
      injectScript(WISTIA_EMBED_SCRIPT.replace('<hashed_id>', videoHash));
      return this.getWistiaEmbedTemplate(videoHash);
    };

  }])
  .directive('wistiaUploader', ['$log', 'wistiaService', function wistiaUploaderDirective($log, wistiaService){

    var defaultOpts = {
      url: 'https://upload.wistia.com',
      apiPassword: '',
      btnValue: 'Upload',
      cssClasses : ''
    };

    var template =  '<div class="wistia-uploader">';
        template += '<button class="{{cssClasses}}">';
        template += '<span>{{btnValue}}</span>';
        template += '<input type="file"/>';
        template += '<div class="wistia-upload-progress-bar" ng-show="isUploading" ng-style="{width:progressbarWidth}"/>';
        template += '</button>';
        template += '<div ng-show="hasVideo" class="wistia-player-wrapper">';
        template += '</div></div>';

    return {
      restrict: 'E',
      scope: true,
      template: template,
      link: function(scope, el, attrs){

        var opts = angular.extend(defaultOpts, attrs);

        // set btn value
        scope.btnValue = opts.btnValue;
        // set class
        var classes = ['wistia-upload-btn'];
        scope.cssClasses = classes.concat(opts.cssClasses.split(',')).join(' ');
        scope.hasVideo = false;

        scope.progressbarWidth = '0%'; // Initial progressbar width
        scope.isUploading = false; // flag to show progressbar if is uploading

        // API password is mandatory when uploading videos to wistia
        if(!opts.apiPassword) {
          $log.error('API password for Wistia is required. Please create one by https://wistia.com/doc/account-setup#api_access');
          return;
        }

        var btnUpload = el.find('input[type="file"]');
        btnUpload.fileupload({
          dataType: 'json',
          url: opts.url,
          formData: {
            api_password: opts.apiPassword
          },
          acceptFileTypes: /^video\/.*$/,
          submit: function(){
            if(!opts.apiPassword) return false;
          },
          start: function(){
            scope.isUploading = true;
            scope.$digest();
          },
          done: function (e, data) {
            scope.progressbarWidth = '%';
            scope.isUploading = false;
            scope.btnValue = opts.btnValue; // reset button value
            var playerHtml = wistiaService.getVideoPlayer(data.result.hashed_id);
            el[0].getElementsByClassName('wistia-player-wrapper')[0].innerHTML = playerHtml;
            scope.hasVideo = true;
            scope.$digest();
          },
          fail: function(e, data){
            //TODO much better error handling scenario
            $log.error('Upload failed!');
          },
          progress: function(e, data){
            var percentage = parseInt(data.loaded / data.total * 100, 10),
                percentageLabel = percentage + '%';
            scope.progressbarWidth = percentageLabel;
            scope.btnValue = percentageLabel;
            scope.$digest();
          }
        });

      }
    };

  }]);

})(angular, jQuery);
