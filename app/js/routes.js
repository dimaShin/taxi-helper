/**
 * Created by iashind on 19.11.14.
 */
'use strict';
define(['app', 'directives'], function(app){
    console.log('routes');
    app.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/map',{
            templateUrl: '/templates/map.html',
            controller: 'mapController',
            reloadOnSearch: false
        });
        $routeProvider.when('/routes',{
            templateUrl: '/templates/routes.html',
            controller: 'routesController',
            reloadOnSearch: false
        });
        $routeProvider.when('/routes',{
            templateUrl: '/templates/routes.html',
            controller: 'routesController',
            reloadOnSearch: false
        });

        $routeProvider.otherwise({redirectTo: '/map'});
        $locationProvider.html5Mode(true);
    });

})
