/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', '../Directives/map', 'controllers'], function(app, mapDirective){
    console.log('directives');
    app.directive('googleMap', mapDirective);
});