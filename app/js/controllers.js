/**
 * Created by iashind on 19.11.14.
 */
'use strict';
define(['app', 'Controllers/mapController',
    'Controllers/routesController',
    'Controllers/driverController',
    'operatorService'], function(app, mapController, routesController, driverController){
    app.controller('mapController', mapController)
        .controller('routesController', routesController)
        .controller('driverController', driverController);

});