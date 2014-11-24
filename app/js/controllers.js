/**
 * Created by iashind on 19.11.14.
 */
'use strict';
define(['app', 'Controllers/mapController', 'Controllers/routesController', 'operatorService'], function(app, mapController, routesController){
    console.log('controllers');
    app.controller('mapController', mapController)
        .controller('routesController', routesController);

})