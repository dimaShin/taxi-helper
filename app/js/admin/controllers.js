/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', 'orderBldCtrl', 'routingService'], function(app, orderBldCtrl){
    console.log('controllers');
    app.controller('orderBldCtrl', orderBldCtrl);
})