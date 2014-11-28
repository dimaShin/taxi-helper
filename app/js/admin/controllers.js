/**
 * Created by iashind on 26.11.14.
 */
'use strict';
define(['app', 'orderBldCtrl', 'addressService', '../Services/regionService'], function(app, orderBldCtrl){
    console.log('controllers');
    app.controller('orderBldCtrl', orderBldCtrl);
})