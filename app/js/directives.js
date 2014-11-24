/**
 * Created by iashind on 19.11.14.
 */
'use strict'
define(['app', 'Directives/currentRoute',
    'Directives/newRoutes',
    'Directives/map',
    'Directives/selector',
    'Directives/results',
    'controllers'], function(app, currentRouteDirective, newRoutesDirective, mapDirective, selectorDirective, resultsDiresctive){
    console.log('directives');
    app.directive('currentRoute', currentRouteDirective)
        .directive('newRoutes', newRoutesDirective)
        .directive('googleMap', mapDirective)
        .directive('selector', selectorDirective)
        .directive('results', resultsDiresctive)
});