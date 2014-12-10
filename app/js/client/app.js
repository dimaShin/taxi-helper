/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['ngAnimate', 'swipe'], function(){
    console.log('app');
    var taxiClient = angular.module('taxiClient', ['swipe', 'ngAnimate']);

    return taxiClient;
});