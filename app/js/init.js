/**
 * Created by iashin on 11/13/2014.
 */
'use strict';
requirejs.config({
    paths: {
        angular: '_lib/angular.min.1.3.2',
        bootstrap: '_lib/bootstrap',
        ngRoute: '_lib/angular-route.min.1.3.2',
        ngModalService: '_lib/ng-modal-service',
        underscore: '_lib/underscore.min',
        jquery: '_lib/jquery',
        googleMapsApi: 'https://maps.googleapis.com/maps/api/js?v=3&callback=isNaN&language=ru',
        async: '_lib/require-async',
        ngAnimate: '_lib/angular-animate',
        jqueryUI: '_lib/jquery-ui-1.11.2/jquery-ui',
        ngTouch: '_lib/angular-touch'
    },
    shim: {
        angular: {
            deps: ['jquery', 'underscore'],
            exports: 'angular'
        },
        ngAnimate: {
            deps: ['angular']
        },
        ngRoute: {
            deps: ['angular']
        },
        ngModalService: {
            deps: ['angular']
        },
        bootstrap: {
            deps: ['jquery', 'underscore']
        },
        googleMapsApi: {
            exports: 'google'
        },
        jqueryUI: {
            deps: ['jquery']
        },
        ngTouch: {
            deps: ['angular']
        }
    }
});

require(['routes'], function(){
    console.log('init');
    angular.bootstrap(document.body, ['TaxiHelper']);
    $('.hidden').removeClass('hidden');
});