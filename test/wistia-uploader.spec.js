/* global describe, it, beforeEach, expect, angular */

describe('wistia-uploader', function(){

  beforeEach(function(){
    angular.mock.module('wistia.uploader');
  });

  describe('directive', function(){

    var $compile, $rootScope, $log;

    beforeEach(angular.mock.inject(function(_$compile_, _$rootScope_, _$log_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $log = _$log_;
    }));


    it('Should log error if directive is rendered without wistia api key', function(){
      var element = $compile('<wistia-uploader></wistia-uploader>')($rootScope);
      $rootScope.$digest();
      expect($log.error.logs[0]).toEqual(['API password for Wistia is required. Please create one by https://wistia.com/doc/account-setup#api_access']);
    });

    it('Should render the directive succesfully', function(){

      var template = '<div class="wistia-uploader">';
          template += '<button class="wistia-upload-btn "><span class="ng-binding">Upload</span>';
          template += '<input type="file"><div class="wistia-upload-progress-bar ng-hide" ng-show="isUploading" ng-style="{width:progressbarWidth}" style="width: 0%;">';
          template += '</div></button><div ng-show="hasVideo" class="wistia-player-wrapper ng-hide"></div></div>';

      var element = $compile('<wistia-uploader api-key="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"></wistia-uploader>')($rootScope);
      $log.reset();
      $rootScope.$digest();
      expect($log.assertEmpty).not.toThrow();
      expect(element.html()).toEqual(template);

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
