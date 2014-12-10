/**
 * Created by iashind on 08.12.14.
 */
'use strict';
requirejs.config({
    paths: {
        angular: '../_lib/angular.min.1.3.2',
        bootstrap: '../_lib/bootstrap',
        //ngRoute: '_lib/angular-route.min.1.3.2',
        //ngModalService: '_lib/ng-modal-service',
        underscore: '../_lib/underscore.min',
        jquery: '../_lib/jquery',
        googleMapsApi: 'https://maps.googleapis.com/maps/api/js?v=3&callback=isNaN&language=ru',
        async: '../_lib/require-async',
        ngAnimate: '../_lib/angular-animate',
        //jqueryUI: '_lib/jquery-ui-1.11.2/jquery-ui',
        //'jqueryUI-touch' : '_lib/jquery-ui-1.11.2/jquery.ui.touch-punch.min',
        ngTouch: '../_lib/angular-touch',
        swipe: '../_lib//angular-swipe.min',
        'socket.io-client': 'https://cdn.socket.io/socket.io-1.2.1',
        Constructors: '../Constructors',
        Services: '../Services',
        root: '../'
    },
    shim: {
        angular: {
            deps: ['jquery', 'underscore'],
            exports: 'angular'
        },
        swipe: {
            deps: ['angular']
        },
        //ngAnimate: {
        //    deps: ['angular']
        //},
        //ngRoute: {
        //    deps: ['angular']
        //},
        //ngModalService: {
        //    deps: ['angular']
        //},
        bootstrap: {
            deps: ['jquery', 'underscore']
        },
        googleMapsApi: {
            exports: 'google'
        },
        //jqueryUI: {
        //    deps: ['jquery']
        //},
        //'jqueryUI-touch': {
        //    deps: ['jqueryUI']
        //},
        ngTouch: {
            deps: ['angular']
        },
        'socket.io-client': {
            exports: 'socket'
        }
    },
    waitSeconds: 0
});

require(['directives'], function(){
    console.log('init');
    angular.bootstrap(document.body, ['taxiClient']);
    //$('.hidden').removeClass('hidden');
    $('div.app-container').css({opacity: 1});
    $('div.loading-bar-container').remove();
});