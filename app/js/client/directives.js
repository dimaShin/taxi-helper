/**
 * Created by iashind on 08.12.14.
 */
'use strict';
define(['app',
    'Directives/mapCanvasDirective',
    'Directives/orderCompilerDirective',
    'Directives/ordersContainerDirective','clientController'],
    function(app, mapCanvas, orderCompiler, ordersContainer){
    console.log('directives');
    app.directive('mapCanvas', mapCanvas)
    .directive('orderCompiler', orderCompiler)
    .directive('ordersContainer', ordersContainer);

});