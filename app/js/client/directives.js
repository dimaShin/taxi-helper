/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['app',
    'Directives/mapCanvasDirective',
    'Directives/orderCompilerDirective',
    'Directives/ordersContainerDirective',
    '../Directives/clickAnimation',
    '../Directives/verticalSwipe','clientController'],
    function(app, mapCanvas, orderCompiler, ordersContainer, clickAnimation, verticalSwipe){
    console.log('directives');
    app.directive('mapCanvas', mapCanvas)
    .directive('orderCompiler', orderCompiler)
    .directive('ordersContainer', ordersContainer)
    .directive('clickAnimation', clickAnimation)
    .directive('verticalSwipe', verticalSwipe);

});