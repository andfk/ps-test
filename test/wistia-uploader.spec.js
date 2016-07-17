/* global describe, it, beforeEach, expect, angular */

describe('wistia-uploader', function(){

  beforeEach(function(){
    angular.mock.module('wistia.uploader');
  });

  describe('directive', function(){

    var $compile, $rootScope, $log, templates;

    templates = {
      'directive-with-api' : '<wistia-uploader api-key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"></wistia-uploader>',
      'directive-without-api' : '<wistia-uploader></wistia-uploader>',
      'directive-with-classes' : '<wistia-uploader css-classes="pretty-btn" api-key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"></wistia-uploader>',
      'directive-with-btn-value' : '<wistia-uploader api-key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" btn-value="Upload now!"></wistia-uploader>'
    };

    function renderDir(template, scope) {
      var el = $compile(templates[template])(scope);
      scope.$digest();
      return el;
    }

    beforeEach(angular.mock.inject(function(_$compile_, _$rootScope_, _$log_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $log = _$log_;
    }));


    it('Should log error if directive is rendered without wistia api key', function(){
      renderDir('directive-without-api', $rootScope);
      expect($log.error.logs[0]).toEqual(['API password for Wistia is required. Please create one by https://wistia.com/doc/account-setup#api_access']);
    });

    it('Should render the directive succesfully', function(){

      var template = '<div class="wistia-uploader">';
          template += '<button class="wistia-upload-btn "><span class="ng-binding">Upload</span>';
          template += '<input type="file"><div class="wistia-upload-progress-bar ng-hide" ng-show="isUploading" ng-style="{width:progressbarWidth}" style="width: 0%;">';
          template += '</div></button><div ng-show="hasVideo" class="wistia-player-wrapper ng-hide"></div></div>';

      var element = renderDir('directive-with-api', $rootScope);
      $log.reset();
      expect($log.assertEmpty).not.toThrow();
      expect(element.html()).toEqual(template);

    });

    it('Should check if classes are attached when set as attr', function(){
      var el = renderDir('directive-with-classes', $rootScope);
      expect(el.scope().cssClasses).toEqual('wistia-upload-btn pretty-btn');
      var btn = el.find('button');
      expect(btn.attr('class')).toEqual('wistia-upload-btn pretty-btn');
    });

    it('Should check if btnValue changes when set as attr', function(){
      var el = renderDir('directive-with-btn-value', $rootScope);
      expect(el.scope().btnValue).toEqual('Upload now!');
      var btnValue = el.find('button span');
      expect(btnValue.text()).toEqual('Upload now!');
    });

  });

  describe('service', function(){

    var wistiaService;

    beforeEach(angular.mock.inject(function(_wistiaService_){
      wistiaService = _wistiaService_;
    }));

    it('Should inject scripts on DOM', function(){
      expect(wistiaService.wistiaScriptInjected).toBeFalsy();
      wistiaService.injectWistiaScript();
      expect(wistiaService.wistiaScriptInjected).toBeTruthy();
    });

    it('Should return wistia video player by video hash', function(){
      var videoHash = 'abcdefghi';
      var template = '<div class="wistia_embed wistia_async_'+videoHash+'" style="height:360px;width:640px">&nbsp;</div>';
      expect(wistiaService.getWistiaEmbedTemplate(videoHash)).toEqual(template);
    });

  });


});
